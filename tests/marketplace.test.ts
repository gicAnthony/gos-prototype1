import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cancelSubscription, seedSubscriptions, upsertSubscription } from "../lib/control-plane";
import { demoUser } from "../lib/demo-data";
import { evaluateAccess, issueEntitlementBundle, verifyEntitlementBundle } from "../lib/entitlements";

const now = new Date("2026-09-29T12:00:00.000Z");

describe("Marketplace install and Apps lifecycle", () => {
  it("entitles only the features selected during installation", () => {
    const installed = upsertSubscription(
      [],
      "risk-atlas",
      "professional",
      "trial",
      now,
      ["risk-register", "controls"],
    );
    const grant = issueEntitlementBundle("gic", installed, now).grants[0];

    assert.deepEqual(grant.features, ["risk-register", "controls"]);
    assert.equal(grant.features.includes("heatmaps"), false);
    assert.equal(grant.features.includes("assurance"), false);
  });

  it("rejects a coupled feature when its dependency was not selected", () => {
    assert.throws(
      () =>
        upsertSubscription(
          [],
          "risk-atlas",
          "professional",
          "trial",
          now,
          ["controls"],
        ),
      /controls requires: risk-register/,
    );
  });

  it("installs a Marketplace module into the tenant entitlement", () => {
    const seeded = seedSubscriptions(demoUser.tenants);
    const installed = upsertSubscription(
      seeded.blaauwklippen,
      "risk-atlas",
      "professional",
      "trial",
      now,
    );
    const bundle = issueEntitlementBundle("blaauwklippen", installed, now);

    assert.equal(installed.find((item) => item.moduleId === "risk-atlas")?.status, "trial");
    assert.ok(bundle.grants.some((grant) => grant.moduleId === "risk-atlas"));
    assert.equal(verifyEntitlementBundle(bundle, "blaauwklippen", now).valid, true);
  });

  it("uninstalls an app and immediately revokes its grant", () => {
    const installed = upsertSubscription([], "pulse", "professional", "trial", now);
    const cancelled = cancelSubscription(installed, "pulse", new Date(now.getTime() + 1000));
    const bundle = issueEntitlementBundle(
      "gic",
      cancelled,
      new Date(now.getTime() + 2000),
    );

    assert.equal(cancelled[0].status, "cancelled");
    assert.equal(bundle.grants.some((grant) => grant.moduleId === "pulse"), false);
  });

  it("keeps installs isolated to the selected tenant", () => {
    const seeded = seedSubscriptions(demoUser.tenants);
    const gic = upsertSubscription(seeded.gic, "boardroom", "professional", "trial", now);

    assert.ok(issueEntitlementBundle("gic", gic, now).grants.some((grant) => grant.moduleId === "boardroom"));
    assert.equal(
      issueEntitlementBundle("kalahari", seeded.kalahari, now).grants.some(
        (grant) => grant.moduleId === "boardroom",
      ),
      false,
    );
  });
});

describe("Effective access", () => {
  const subscription = upsertSubscription([], "risk-atlas", "professional", "active", now);
  const bundle = issueEntitlementBundle("gic", subscription, now);

  it("allows an installed app only when every access gate agrees", () => {
    const decision = evaluateAccess(bundle, {
      tenantId: "gic",
      moduleId: "risk-atlas",
      identity: { authenticated: true, tenantId: "gic", principalType: "tenant-user" },
      permissionGranted: true,
      resourcePolicyGranted: true,
    }, now);
    assert.deepEqual(decision, { allowed: true, reason: "allowed" });
  });

  it("denies cross-tenant use", () => {
    const decision = evaluateAccess(bundle, {
      tenantId: "other-tenant",
      moduleId: "risk-atlas",
      identity: { authenticated: true, tenantId: "other-tenant", principalType: "tenant-user" },
      permissionGranted: true,
      resourcePolicyGranted: true,
    }, now);
    assert.deepEqual(decision, { allowed: false, reason: "invalid-entitlement" });
  });

  it("rejects a modified entitlement bundle", () => {
    const tampered = {
      ...bundle,
      grants: [{ ...bundle.grants[0], features: [...bundle.grants[0].features, "forged-feature"] }],
    };
    assert.deepEqual(verifyEntitlementBundle(tampered, "gic", now), {
      valid: false,
      reason: "invalid-signature",
    });
  });
});
