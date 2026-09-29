import type { User } from "./types";

export const DEMO_EMAIL = "anthony@gic.co.za";
export const DEMO_PASSWORD = "GOSdemo2026!";

export const demoUser: User = {
  name: "Anthony Raphasha",
  email: DEMO_EMAIL,
  tenants: [
    { id: "gic", name: "GIC", shortName: "GIC", role: "Tenant Administrator", location: "Pretoria, ZA", deployment: "On-premises", apps: ["project", "documents", "signflow", "vendors", "echo"] },
    { id: "kalahari", name: "Royal Kalahari", shortName: "Royal Kalahari", role: "Operations Manager", location: "Upington, ZA", deployment: "Public cloud", apps: ["project", "documents", "signflow", "vendors"] },
    { id: "blaauwklippen", name: "Blaauwklippen", shortName: "Blaauwklippen", role: "Document Reviewer", location: "Stellenbosch, ZA", deployment: "Private data centre", apps: ["documents", "signflow"] },
  ],
};
