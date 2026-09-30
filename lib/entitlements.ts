import { catalogueById } from "./catalogue";
import type {
  EntitlementBundle,
  EntitlementGrant,
  Subscription,
} from "./types";

export const DEMO_SIGNING_KEY_ID = "gos-demo-2026-01";
const DEMO_SIGNING_KEY = "static-prototype-key-not-for-production";

type UnsignedBundle = Omit<EntitlementBundle, "signature">;

function canonicalBundle(bundle: UnsignedBundle): string {
  return JSON.stringify({
    version: bundle.version,
    tenantId: bundle.tenantId,
    issuedAt: bundle.issuedAt,
    validUntil: bundle.validUntil,
    keyId: bundle.keyId,
    grants: bundle.grants,
  });
}

/** Browser-safe deterministic MAC for the static prototype, not production crypto. */
function demoMac(value: string): string {
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;
  const input = `${DEMO_SIGNING_KEY}:${value}`;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193) >>> 0;
    right = Math.imul(right ^ code, 0x85ebca6b) >>> 0;
  }
  return `${left.toString(16).padStart(8, "0")}${right.toString(16).padStart(8, "0")}`;
}

export function issueEntitlementBundle(
  tenantId: string,
  subscriptions: Subscription[],
  now = new Date(),
): EntitlementBundle {
  const active = subscriptions.filter(
    (subscription) =>
      subscription.status !== "cancelled" &&
      new Date(subscription.validUntil).getTime() > now.getTime(),
  );
  const grants: EntitlementGrant[] = active.flatMap((subscription) => {
    const item = catalogueById[subscription.moduleId];
    const selectedPlan = item?.plans.find((plan) => plan.id === subscription.planId);
    if (!item || !selectedPlan) return [];
    return [
      {
        moduleId: item.id,
        planId: selectedPlan.id,
        features: [...(subscription.selectedFeatures ?? selectedPlan.features)],
        services: [item.service],
        limits: { ...selectedPlan.limits },
      },
    ];
  });
  const furthestSubscription = active.reduce(
    (latest, subscription) => Math.max(latest, new Date(subscription.validUntil).getTime()),
    now.getTime() + 60 * 60 * 1000,
  );
  const unsigned: UnsignedBundle = {
    version: 1,
    tenantId,
    issuedAt: now.toISOString(),
    validUntil: new Date(furthestSubscription).toISOString(),
    keyId: DEMO_SIGNING_KEY_ID,
    grants,
  };
  return { ...unsigned, signature: demoMac(canonicalBundle(unsigned)) };
}

export function verifyEntitlementBundle(
  bundle: EntitlementBundle,
  tenantId: string,
  now = new Date(),
): { valid: boolean; reason: string } {
  if (bundle.tenantId !== tenantId) return { valid: false, reason: "tenant-mismatch" };
  if (bundle.keyId !== DEMO_SIGNING_KEY_ID) return { valid: false, reason: "unknown-key" };
  if (new Date(bundle.validUntil).getTime() <= now.getTime()) {
    return { valid: false, reason: "bundle-expired" };
  }
  const { signature, ...unsigned } = bundle;
  if (signature !== demoMac(canonicalBundle(unsigned))) {
    return { valid: false, reason: "invalid-signature" };
  }
  return { valid: true, reason: "verified" };
}

export type AccessRequest = {
  tenantId: string;
  moduleId: string;
  feature?: string;
  identity: {
    authenticated: boolean;
    tenantId: string;
    principalType: "tenant-user" | "vendor-user";
  };
  permissionGranted: boolean;
  resourcePolicyGranted: boolean;
};

export type AccessDecision = {
  allowed: boolean;
  reason:
    | "allowed"
    | "invalid-entitlement"
    | "not-entitled"
    | "identity-denied"
    | "permission-denied"
    | "resource-policy-denied";
};

export function evaluateAccess(
  bundle: EntitlementBundle,
  request: AccessRequest,
  now = new Date(),
): AccessDecision {
  if (!verifyEntitlementBundle(bundle, request.tenantId, now).valid) {
    return { allowed: false, reason: "invalid-entitlement" };
  }
  const grant = bundle.grants.find((item) => item.moduleId === request.moduleId);
  if (!grant || (request.feature && !grant.features.includes(request.feature))) {
    return { allowed: false, reason: "not-entitled" };
  }
  if (!request.identity.authenticated || request.identity.tenantId !== request.tenantId) {
    return { allowed: false, reason: "identity-denied" };
  }
  if (!request.permissionGranted) return { allowed: false, reason: "permission-denied" };
  if (!request.resourcePolicyGranted) {
    return { allowed: false, reason: "resource-policy-denied" };
  }
  return { allowed: true, reason: "allowed" };
}
