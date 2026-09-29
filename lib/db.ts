import "server-only";
import Database from "better-sqlite3";
import { createHash } from "crypto";
import path from "path";
import type { Tenant, User } from "./types";
import { DEMO_EMAIL, DEMO_PASSWORD, demoUser } from "./demo-data";

const db = new Database(path.join(process.cwd(), "gos-demo.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT NOT NULL, location TEXT NOT NULL, deployment TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS memberships (user_id INTEGER NOT NULL, tenant_id TEXT NOT NULL, role TEXT NOT NULL, apps TEXT NOT NULL, PRIMARY KEY(user_id, tenant_id));
`);

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const seed = db.transaction(() => {
  db.prepare("INSERT OR IGNORE INTO users (id,name,email,password_hash) VALUES (1,?,?,?)").run(demoUser.name, DEMO_EMAIL, hash(DEMO_PASSWORD));
  const tenantStmt = db.prepare("INSERT INTO tenants (id,name,short_name,location,deployment) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, short_name=excluded.short_name, location=excluded.location, deployment=excluded.deployment");
  const memberStmt = db.prepare("INSERT OR IGNORE INTO memberships (user_id,tenant_id,role,apps) VALUES (1,?,?,?)");
  for (const tenant of demoUser.tenants) {
    tenantStmt.run(tenant.id, tenant.name, tenant.shortName, tenant.location, tenant.deployment);
    memberStmt.run(tenant.id, tenant.role, JSON.stringify(tenant.apps));
  }
});
seed();

type UserRow = { id: number; name: string; email: string; password_hash: string };
type TenantRow = { id: string; name: string; short_name: string; location: string; deployment: string; role: string; apps: string };

export function authenticate(email: string, password: string): User | null {
  const user = db.prepare("SELECT * FROM users WHERE lower(email)=lower(?)").get(email) as UserRow | undefined;
  if (!user || user.password_hash !== hash(password)) return null;
  const rows = db.prepare(`SELECT t.*, m.role, m.apps FROM tenants t JOIN memberships m ON m.tenant_id=t.id WHERE m.user_id=?`).all(user.id) as TenantRow[];
  const tenants: Tenant[] = rows.map((t) => ({ id:t.id, name:t.name, shortName:t.short_name, location:t.location, deployment:t.deployment, role:t.role, apps:JSON.parse(t.apps) as string[] }));
  return { name:user.name, email:user.email, tenants };
}
