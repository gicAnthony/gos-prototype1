import type { CatalogueModule, FeatureDefinition, ModulePlan, PlanTier } from "./types";

const feature = (
  id: string,
  name: string,
  description: string,
  dependsOn: string[] = [],
): FeatureDefinition => ({ id, name, description, dependsOn });

const plan = (
  id: PlanTier,
  monthlyPrice: number,
  features: string[],
  limits: Record<string, number>,
): ModulePlan => ({
  id,
  name: id[0].toUpperCase() + id.slice(1),
  monthlyPrice,
  features,
  limits,
});

export const catalogue: CatalogueModule[] = [
  {
    id: "project",
    name: "Project Admin",
    category: "Delivery",
    description: "Projects, milestones and delivery governance.",
    service: "project-admin-api",
    tone: "orange",
    featureDefinitions: [
      feature("projects", "Projects", "Create and govern project workspaces."),
      feature("tasks", "Tasks", "Assign, track and complete project tasks.", ["projects"]),
      feature("portfolios", "Portfolios", "Group projects into strategic portfolios.", ["projects"]),
      feature("automation", "Automation", "Automate task and project transitions.", ["projects", "tasks"]),
      feature("custom-workflows", "Custom workflows", "Design tenant-specific delivery workflows.", ["automation"]),
    ],
    plans: [
      plan("standard", 690, ["projects", "tasks"], { users: 25, projects: 20 }),
      plan("professional", 1290, ["projects", "tasks", "portfolios", "automation"], { users: 100, projects: 200 }),
      plan("enterprise", 2490, ["projects", "tasks", "portfolios", "automation", "custom-workflows"], { users: -1, projects: -1 }),
    ],
  },
  {
    id: "documents",
    name: "DocuWeave",
    category: "Content",
    description: "Secure documents, records and collaborative work.",
    service: "sio-document-service",
    tone: "purple",
    featureDefinitions: [
      feature("documents", "Documents", "Create, store and collaborate on documents."),
      feature("versioning", "Version history", "Retain and compare document versions.", ["documents"]),
      feature("workflows", "Document workflows", "Route documents through review and approval.", ["documents", "versioning"]),
      feature("retention", "Retention policies", "Apply governed retention schedules.", ["documents"]),
      feature("legal-hold", "Legal hold", "Suspend disposal for legal and investigation matters.", ["retention"]),
    ],
    plans: [
      plan("standard", 790, ["documents", "versioning"], { users: 25, storageGb: 50 }),
      plan("professional", 1490, ["documents", "versioning", "workflows", "retention"], { users: 100, storageGb: 500 }),
      plan("enterprise", 2890, ["documents", "versioning", "workflows", "retention", "legal-hold"], { users: -1, storageGb: 5000 }),
    ],
  },
  {
    id: "signflow",
    name: "Signflow",
    category: "Agreements",
    description: "Digital signatures and governed approval journeys.",
    service: "signflow-api",
    tone: "blue",
    featureDefinitions: [
      feature("signatures", "Digital signatures", "Send and complete signing requests."),
      feature("templates", "Templates", "Create reusable signing templates.", ["signatures"]),
      feature("bulk-send", "Bulk send", "Send a template to many recipients.", ["signatures", "templates"]),
      feature("advanced-fields", "Advanced fields", "Add conditional and validated fields.", ["templates"]),
      feature("qualified-signing", "Qualified signing", "Use high-assurance qualified signatures.", ["signatures", "advanced-fields"]),
    ],
    plans: [
      plan("standard", 590, ["signatures", "templates"], { users: 20, envelopes: 100 }),
      plan("professional", 1090, ["signatures", "templates", "bulk-send", "advanced-fields"], { users: 75, envelopes: 1000 }),
      plan("enterprise", 2190, ["signatures", "templates", "bulk-send", "advanced-fields", "qualified-signing"], { users: -1, envelopes: -1 }),
    ],
  },
  {
    id: "vendors",
    name: "Vendor Management",
    category: "Supply chain",
    description: "Vendor onboarding, compliance, roles and policy workflows.",
    service: "vendor-management-api",
    tone: "green",
    featureDefinitions: [
      feature("vendor-directory", "Vendor directory", "Maintain tenant vendor organisations."),
      feature("onboarding", "Vendor onboarding", "Guide vendors through onboarding.", ["vendor-directory"]),
      feature("compliance", "Compliance", "Collect and verify compliance evidence.", ["onboarding"]),
      feature("vendor-rbac", "Vendor roles", "Control vendor-user roles and permissions.", ["vendor-directory"]),
      feature("risk-workflows", "Risk workflows", "Escalate vendor risks and remediation.", ["compliance"]),
    ],
    plans: [
      plan("standard", 890, ["vendor-directory", "onboarding"], { users: 20, vendors: 50 }),
      plan("professional", 1690, ["vendor-directory", "onboarding", "compliance", "vendor-rbac"], { users: 75, vendors: 500 }),
      plan("enterprise", 3190, ["vendor-directory", "onboarding", "compliance", "vendor-rbac", "risk-workflows"], { users: -1, vendors: -1 }),
    ],
  },
  {
    id: "echo",
    name: "Echo",
    category: "Intelligence",
    description: "Secure AI collaboration grounded in tenant content.",
    service: "echo-api",
    tone: "slate",
    featureDefinitions: [
      feature("chat", "Secure chat", "Use tenant-isolated AI conversations."),
      feature("summaries", "Summaries", "Summarise tenant content and discussions.", ["chat"]),
      feature("tenant-search", "Tenant search", "Ground answers in approved tenant content.", ["chat"]),
      feature("agents", "AI agents", "Run goal-driven tenant automations.", ["tenant-search"]),
      feature("private-models", "Private models", "Connect tenant-managed model endpoints.", ["agents"]),
    ],
    plans: [
      plan("standard", 490, ["chat", "summaries"], { users: 20, requests: 1000 }),
      plan("professional", 990, ["chat", "summaries", "tenant-search", "agents"], { users: 100, requests: 10000 }),
      plan("enterprise", 1990, ["chat", "summaries", "tenant-search", "agents", "private-models"], { users: -1, requests: -1 }),
    ],
  },
  {
    id: "risk-atlas",
    name: "Risk Atlas",
    category: "Governance",
    description: "Live enterprise risk registers and controls.",
    service: "risk-atlas-api",
    tone: "orange",
    featureDefinitions: [
      feature("risk-register", "Risk register", "Record, own and monitor enterprise risks."),
      feature("controls", "Controls", "Map mitigating controls to risks.", ["risk-register"]),
      feature("heatmaps", "Risk heatmaps", "Visualise inherent and residual exposure.", ["risk-register"]),
      feature("assurance", "Control assurance", "Test control design and effectiveness.", ["risk-register", "controls"]),
      feature("quantification", "Risk quantification", "Model financial exposure scenarios.", ["heatmaps"]),
    ],
    plans: [
      plan("standard", 1490, ["risk-register", "controls"], { users: 25, risks: 250 }),
      plan("professional", 2490, ["risk-register", "controls", "heatmaps", "assurance"], { users: 100, risks: 2500 }),
      plan("enterprise", 4490, ["risk-register", "controls", "heatmaps", "assurance", "quantification"], { users: -1, risks: -1 }),
    ],
  },
  {
    id: "people-hub",
    name: "People Hub",
    category: "Workforce",
    description: "A connected directory, leave and team insights.",
    service: "people-hub-api",
    tone: "purple",
    featureDefinitions: [
      feature("directory", "People directory", "Maintain the connected workforce directory."),
      feature("leave", "Leave", "Request and approve employee leave.", ["directory"]),
      feature("insights", "People insights", "Analyse workforce trends.", ["directory"]),
      feature("org-design", "Organisation design", "Model teams and reporting structures.", ["directory"]),
      feature("workforce-planning", "Workforce planning", "Plan roles, capacity and future structures.", ["insights", "org-design"]),
    ],
    plans: [
      plan("standard", 890, ["directory", "leave"], { users: 50, employees: 250 }),
      plan("professional", 1590, ["directory", "leave", "insights", "org-design"], { users: 150, employees: 1500 }),
      plan("enterprise", 2990, ["directory", "leave", "insights", "org-design", "workforce-planning"], { users: -1, employees: -1 }),
    ],
  },
  {
    id: "pulse",
    name: "Pulse Analytics",
    category: "Intelligence",
    description: "Turn operational signals into decisions.",
    service: "pulse-analytics-api",
    tone: "blue",
    featureDefinitions: [
      feature("dashboards", "Dashboards", "Build operational dashboards."),
      feature("exports", "Exports", "Export governed dashboard data.", ["dashboards"]),
      feature("alerts", "Alerts", "Notify teams when metrics cross thresholds.", ["dashboards"]),
      feature("forecasting", "Forecasting", "Forecast operational trends.", ["dashboards"]),
      feature("embedded-analytics", "Embedded analytics", "Embed governed insights in other modules.", ["dashboards"]),
    ],
    plans: [
      plan("standard", 990, ["dashboards", "exports"], { users: 25, dataSources: 5 }),
      plan("professional", 1890, ["dashboards", "exports", "alerts", "forecasting"], { users: 100, dataSources: 25 }),
      plan("enterprise", 3490, ["dashboards", "exports", "alerts", "forecasting", "embedded-analytics"], { users: -1, dataSources: -1 }),
    ],
  },
  {
    id: "boardroom",
    name: "Boardroom",
    category: "Collaboration",
    description: "Secure agendas, packs, minutes and resolutions.",
    service: "boardroom-api",
    tone: "green",
    featureDefinitions: [
      feature("agendas", "Agendas", "Prepare and distribute meeting agendas."),
      feature("packs", "Board packs", "Compile governed board packs.", ["agendas"]),
      feature("minutes", "Minutes", "Capture and approve meeting minutes.", ["agendas"]),
      feature("resolutions", "Resolutions", "Track decisions and written resolutions.", ["minutes"]),
      feature("subsidiaries", "Subsidiary boards", "Manage multiple governed board entities.", ["agendas", "packs"]),
    ],
    plans: [
      plan("standard", 1190, ["agendas", "packs"], { users: 20, boards: 2 }),
      plan("professional", 1990, ["agendas", "packs", "minutes", "resolutions"], { users: 75, boards: 10 }),
      plan("enterprise", 3690, ["agendas", "packs", "minutes", "resolutions", "subsidiaries"], { users: -1, boards: -1 }),
    ],
  },
];

export const catalogueById = Object.fromEntries(
  catalogue.map((item) => [item.id, item]),
) as Record<string, CatalogueModule>;
