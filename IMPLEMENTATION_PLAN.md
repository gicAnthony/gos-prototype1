# GOS prototype implementation plan

This plan translates the control-plane and tenant-domain architecture in
`Architecture/` into incremental, testable product slices. The repository is a
browser-hosted prototype, so central services are represented by deterministic
domain modules and persisted demo state; production IAM, billing, signing keys,
provisioners and telemetry backends remain integration boundaries.

## Architecture invariants

- A module is usable only when the tenant has an active entitlement.
- Effective access is the intersection of entitlement, identity, permission and
  resource policy. Any denial wins.
- Tenant users receive permissions from GIC IAM; vendor users receive identity
  from IAM and permissions from the tenant VMS.
- Tenant data, subscriptions, usage and audit events never cross tenant context.
- Every subscription lifecycle change produces a new signed entitlement bundle
  and an audit event.
- UI routes and assets work both locally and under the GitHub Pages base path.

## Delivery phases

### Phase 1 — Control-plane vertical slice (this implementation)

- Define a versioned module/feature/plan catalogue.
- Model subscriptions, trials, usage limits and entitlement bundles.
- Add deterministic bundle signing and signature verification suitable for a
  static demo (explicitly not production cryptography).
- Implement the four-gate effective-access policy evaluator.
- Persist tenant-scoped control-plane state and audit history.
- Replace toast-only Marketplace actions with a working trial installation flow
  that immediately reconciles the tenant workspace.
- Let tenants select only the plan features they need, explain coupled feature
  dependencies before selection, and grant only the approved feature set.
- Add an Apps inventory where users can launch installed modules and uninstall
  them, immediately revoking their tenant entitlement.
- Record subscription and launch decisions in tenant-scoped audit state.
- Add unit tests for entitlement generation, tamper detection, access denial,
  lifecycle transitions and tenant isolation.

### Phase 2 — Identity and vendor boundaries

- Replace the demo browser session with an OIDC/OAuth 2.1 integration to GIC IAM.
- Validate issuer, audience, expiry, tenant and role/permission claims server-side.
- Add MFA/session-policy signals and joiner/mover/leaver handling.
- Build tenant VMS organisation, vendor-user, compliance and vendor-role flows.
- Enforce tenant-user IAM permissions and vendor-user VMS permissions separately.

### Phase 3 — Provisioning and secure tenant agents

- Create central tenant registry, catalogue, subscription and entitlement APIs.
- Store signing keys in managed KMS/HSM and rotate them with key IDs.
- Add mTLS tenant-agent enrollment, certificate rotation and heartbeat handling.
- Reconcile desired entitlements to deployed modules, configuration and routes.
- Add retryable jobs, idempotency keys, rollout status and rollback controls.

### Phase 4 — Telemetry, governance and operations

- Deploy per-tenant OpenTelemetry gateways with offline buffers.
- Ingest metrics, traces, logs, API usage and business events centrally.
- Connect usage metering to entitlement limits and Marketplace upgrade signals.
- Add immutable audit export, retention policies, security-event workflows,
  dashboards and alerts.
- Validate backup/restore, regional failover, SLOs and tenant isolation controls.

## Phase 1 acceptance criteria

- Installing a Marketplace trial adds the module to Apps and the workspace.
- Uninstalling from Apps removes the module and revokes access.
- A trial grants only catalogue-defined features and limits.
- A modified or expired entitlement bundle is rejected.
- A denied identity, permission or resource policy blocks access even when the
  module is entitled.
- Subscription, entitlement and access decisions are captured per tenant for a
  future audit UI.
- Type checking, production build, domain tests and browser E2E pass.

### Next control-plane proof

- Add plan comparison, purchase approval and upgrade/downgrade lifecycle UI.
- Add a tenant Control Centre for entitlement features/limits, tenant-agent
  health and visible audit history.
