export type Tenant = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  location: string;
  deployment: string;
  /** Initial demo subscriptions. Runtime access is derived from entitlements. */
  apps: string[];
};

export type User = {
  name: string;
  email: string;
  tenants: Tenant[];
};

export type PlanTier = "standard" | "professional" | "enterprise";
export type SubscriptionStatus = "trial" | "active" | "cancelled";

export type ModulePlan = {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  features: string[];
  limits: Record<string, number>;
};

export type FeatureDefinition = {
  id: string;
  name: string;
  description: string;
  dependsOn: string[];
};

export type CatalogueModule = {
  id: string;
  name: string;
  category: string;
  description: string;
  service: string;
  tone: "orange" | "purple" | "blue" | "green" | "slate";
  featureDefinitions: FeatureDefinition[];
  plans: ModulePlan[];
};

export type Subscription = {
  moduleId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  selectedFeatures: string[];
  startedAt: string;
  validUntil: string;
};

export type EntitlementGrant = {
  moduleId: string;
  planId: PlanTier;
  features: string[];
  services: string[];
  limits: Record<string, number>;
};

export type EntitlementBundle = {
  version: 1;
  tenantId: string;
  issuedAt: string;
  validUntil: string;
  keyId: string;
  grants: EntitlementGrant[];
  signature: string;
};

export type AuditEvent = {
  id: string;
  tenantId: string;
  occurredAt: string;
  actor: string;
  action: string;
  target: string;
  outcome: "success" | "denied";
  detail: string;
};
