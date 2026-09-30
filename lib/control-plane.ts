import type { AuditEvent, PlanTier, Subscription, SubscriptionStatus, Tenant } from "./types";
import { catalogueById } from "./catalogue";

const SEED_START = "2026-01-01T00:00:00.000Z";
const SEED_END = "2027-12-31T23:59:59.999Z";

export function seedSubscriptions(tenants: Tenant[]): Record<string, Subscription[]> {
  return Object.fromEntries(
    tenants.map((tenant) => [
      tenant.id,
      tenant.apps.map((moduleId) => ({
        moduleId,
        planId: tenant.id === "gic" ? "enterprise" : tenant.id === "kalahari" ? "professional" : "standard",
        status: "active",
        selectedFeatures:
          catalogueById[moduleId]?.plans.find(
            (plan) =>
              plan.id ===
              (tenant.id === "gic"
                ? "enterprise"
                : tenant.id === "kalahari"
                  ? "professional"
                  : "standard"),
          )?.features ?? [],
        startedAt: SEED_START,
        validUntil: SEED_END,
      })),
    ]),
  );
}

export function upsertSubscription(
  subscriptions: Subscription[],
  moduleId: string,
  planId: PlanTier,
  status: Exclude<SubscriptionStatus, "cancelled">,
  now = new Date(),
  selectedFeatures?: string[],
): Subscription[] {
  const selected = validateFeatureSelection(moduleId, planId, selectedFeatures);
  const durationDays = status === "trial" ? 14 : 365;
  const next: Subscription = {
    moduleId,
    planId,
    status,
    selectedFeatures: selected,
    startedAt: now.toISOString(),
    validUntil: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
  };
  return [...subscriptions.filter((item) => item.moduleId !== moduleId), next];
}

export function validateFeatureSelection(
  moduleId: string,
  planId: PlanTier,
  selectedFeatures?: string[],
): string[] {
  const module = catalogueById[moduleId];
  if (!module) throw new Error(`Unknown module: ${moduleId}`);
  const plan = module.plans.find((candidate) => candidate.id === planId);
  if (!plan) throw new Error(`Unknown ${moduleId} plan: ${planId}`);
  const selected = [...new Set(selectedFeatures ?? plan.features)];
  if (selected.length === 0) throw new Error("Select at least one feature.");
  const unavailable = selected.filter((featureId) => !plan.features.includes(featureId));
  if (unavailable.length > 0) {
    throw new Error(`Features are not available in this plan: ${unavailable.join(", ")}`);
  }
  for (const featureId of selected) {
    const definition = module.featureDefinitions.find((feature) => feature.id === featureId);
    const missing = definition?.dependsOn.filter((dependency) => !selected.includes(dependency)) ?? [];
    if (missing.length > 0) {
      throw new Error(`${featureId} requires: ${missing.join(", ")}`);
    }
  }
  return selected;
}

export function cancelSubscription(
  subscriptions: Subscription[],
  moduleId: string,
  now = new Date(),
): Subscription[] {
  return subscriptions.map((subscription) =>
    subscription.moduleId === moduleId
      ? { ...subscription, status: "cancelled", validUntil: now.toISOString() }
      : subscription,
  );
}

export function auditEvent(
  tenantId: string,
  actor: string,
  action: string,
  target: string,
  detail: string,
  outcome: AuditEvent["outcome"] = "success",
  now = new Date(),
): AuditEvent {
  return {
    id: `${now.getTime()}-${tenantId}-${action}-${target}`,
    tenantId,
    occurredAt: now.toISOString(),
    actor,
    action,
    target,
    outcome,
    detail,
  };
}
