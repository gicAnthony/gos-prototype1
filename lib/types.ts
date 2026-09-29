export type Tenant = {
  id: string;
  name: string;
  shortName: string;
  role: string;
  location: string;
  deployment: string;
  apps: string[];
};

export type User = {
  name: string;
  email: string;
  tenants: Tenant[];
};
