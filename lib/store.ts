"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoUser } from "./demo-data";
import { catalogueById } from "./catalogue";
import { auditEvent, cancelSubscription, seedSubscriptions, upsertSubscription } from "./control-plane";
import type { AuditEvent, PlanTier, Subscription } from "./types";

type GOSState = {
  tenantId: string;
  wallpaper: string;
  mode: "dark" | "light";
  accent: string;
  subscriptions: Record<string, Subscription[]>;
  auditEvents: AuditEvent[];
  setTenantId: (tenantId: string) => void;
  setWallpaper: (wallpaper: string) => void;
  setMode: (mode: "dark" | "light") => void;
  setAccent: (accent: string) => void;
  startTrial: (tenantId: string, moduleId: string, features: string[], actor: string) => void;
  changePlan: (tenantId: string, moduleId: string, planId: PlanTier, actor: string) => void;
  cancelModule: (tenantId: string, moduleId: string, actor: string) => void;
  recordAccess: (event: AuditEvent) => void;
};

const initialSubscriptions = seedSubscriptions(demoUser.tenants);

export const useGOSStore = create<GOSState>()(
  persist(
    (set) => ({
      tenantId: "gic",
      wallpaper: "aurora",
      mode: "dark",
      accent: "#F6921E",
      subscriptions: initialSubscriptions,
      auditEvents: [
        auditEvent(
          "gic",
          "GOS Entitlement Engine",
          "bundle.issued",
          "gos-demo-2026-01",
          "Signed entitlement bundle reconciled with 5 active modules.",
          "success",
          new Date("2026-09-29T08:00:00.000Z"),
        ),
      ],
      setTenantId: (tenantId) => set({ tenantId }),
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      startTrial: (tenantId, moduleId, features, actor) =>
        set((state) => {
          const now = new Date();
          return {
            subscriptions: {
              ...state.subscriptions,
              [tenantId]: upsertSubscription(
                state.subscriptions[tenantId] ?? [],
                moduleId,
                "professional",
                "trial",
                now,
                features,
              ),
            },
            auditEvents: [
              auditEvent(
                tenantId,
                actor,
                "subscription.trial_started",
                moduleId,
                `14-day Professional trial approved with ${features.length} selected features; entitlement bundle reissued.`,
                "success",
                now,
              ),
              ...state.auditEvents,
            ],
          };
        }),
      changePlan: (tenantId, moduleId, planId, actor) =>
        set((state) => {
          const now = new Date();
          return {
            subscriptions: {
              ...state.subscriptions,
              [tenantId]: upsertSubscription(
                state.subscriptions[tenantId] ?? [],
                moduleId,
                planId,
                "active",
                now,
              ),
            },
            auditEvents: [
              auditEvent(
                tenantId,
                actor,
                "subscription.plan_changed",
                moduleId,
                `${planId} plan activated; entitlement bundle reissued.`,
                "success",
                now,
              ),
              ...state.auditEvents,
            ],
          };
        }),
      cancelModule: (tenantId, moduleId, actor) =>
        set((state) => {
          const now = new Date();
          return {
            subscriptions: {
              ...state.subscriptions,
              [tenantId]: cancelSubscription(
                state.subscriptions[tenantId] ?? [],
                moduleId,
                now,
              ),
            },
            auditEvents: [
              auditEvent(
                tenantId,
                actor,
                "subscription.cancelled",
                moduleId,
                "Module revoked and removed from the tenant routing table.",
                "success",
                now,
              ),
              ...state.auditEvents,
            ],
          };
        }),
      recordAccess: (event) =>
        set((state) => ({ auditEvents: [event, ...state.auditEvents].slice(0, 100) })),
    }),
    {
      name: "gos-control-plane",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<GOSState>;
        const subscriptions = Object.fromEntries(
          Object.entries(state.subscriptions ?? initialSubscriptions).map(
            ([tenantId, tenantSubscriptions]) => [
              tenantId,
              tenantSubscriptions.map((subscription) => ({
                ...subscription,
                selectedFeatures:
                  subscription.selectedFeatures ??
                  catalogueById[subscription.moduleId]?.plans.find(
                    (plan) => plan.id === subscription.planId,
                  )?.features ??
                  [],
              })),
            ],
          ),
        );
        return { ...state, subscriptions } as GOSState;
      },
    },
  ),
);
