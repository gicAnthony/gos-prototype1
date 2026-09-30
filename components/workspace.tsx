"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  FolderKanban,
  Grid2X2,
  Home,
  LogOut,
  Menu,
  MessageCircleMore,
  Moon,
  Palette,
  PenLine,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import type { Subscription, User } from "@/lib/types";
import type { CatalogueModule } from "@/lib/types";
import { catalogue, catalogueById } from "@/lib/catalogue";
import { evaluateAccess, issueEntitlementBundle } from "@/lib/entitlements";
import { auditEvent } from "@/lib/control-plane";
import { useGOSStore } from "@/lib/store";
import { Logo } from "./logo";

const moduleIcons = {
  project: FolderKanban,
  documents: FileText,
  signflow: PenLine,
  vendors: UsersRound,
  echo: MessageCircleMore,
  "risk-atlas": ShieldCheck,
  "people-hub": UsersRound,
  pulse: Zap,
  boardroom: Building2,
};
const appData = catalogue.map((item) => ({
  ...item,
  Icon: moduleIcons[item.id as keyof typeof moduleIcons] ?? Grid2X2,
}));
const wallpapers = [
  { id: "aurora", name: "Midnight aurora" },
  { id: "mountain", name: "Mountain" },
  { id: "graphite", name: "Graphite" },
  { id: "theme1", name: "Amber horizon" },
  { id: "theme2", name: "Future city" },
  { id: "theme3", name: "Ocean glass" },
  { id: "theme4", name: "Solar bloom" },
];
const nav = [
  { label: "Home", Icon: Home },
  { label: "Search", Icon: Search },
  { label: "Apps", Icon: Grid2X2 },
  { label: "People", Icon: UsersRound },
  { label: "Vendors", Icon: Building2 },
  { label: "Marketplace", Icon: ShoppingBag },
];

export function Workspace({ user }: { user: User }) {
  const router = useRouter(),
    {
      tenantId,
      setTenantId,
      wallpaper,
      setWallpaper,
      mode,
      setMode,
      accent,
      setAccent,
      subscriptions,
      startTrial,
      cancelModule,
      recordAccess,
    } = useGOSStore();
  const [tenantOpen, setTenantOpen] = useState(false),
    [settingsOpen, setSettingsOpen] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [query, setQuery] = useState(""),
    [now, setNow] = useState<Date | null>(null),
    [toast, setToast] = useState(""),
    [view, setView] = useState<"home" | "apps" | "marketplace">("home");
  const tenant = user.tenants.find((t) => t.id === tenantId) ?? user.tenants[0];
  const tenantSubscriptions = subscriptions[tenant.id] ?? [];
  const bundle = useMemo(
    () => issueEntitlementBundle(tenant.id, tenantSubscriptions, now ?? new Date()),
    [tenant.id, tenantSubscriptions, now],
  );
  const apps = useMemo(
    () =>
      appData.filter(
        (a) =>
          bundle.grants.some((grant) => grant.moduleId === a.id) &&
          `${a.name} ${a.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [bundle, query],
  );
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  function launch(name: string) {
    setToast(name);
    setTimeout(() => setToast(""), 2400);
  }
  function launchModule(moduleId: string) {
    const item = catalogueById[moduleId];
    const decision = evaluateAccess(bundle, {
      tenantId: tenant.id,
      moduleId,
      identity: {
        authenticated: true,
        tenantId: tenant.id,
        principalType: "tenant-user",
      },
      permissionGranted: true,
      resourcePolicyGranted: true,
    });
    recordAccess(
      auditEvent(
        tenant.id,
        user.email,
        "module.launch",
        moduleId,
        decision.allowed
          ? `${item?.name ?? moduleId} passed entitlement, identity, permission and resource-policy checks.`
          : `Launch denied: ${decision.reason}.`,
        decision.allowed ? "success" : "denied",
      ),
    );
    launch(
      decision.allowed
        ? `${item?.name ?? moduleId} launched with verified access`
        : `Access denied: ${decision.reason}`,
    );
  }
  function navigate(label: string) {
    setMobileNav(false);
    if (label === "Home") setView("home");
    else if (label === "Apps") setView("apps");
    else if (label === "Marketplace") setView("marketplace");
    else launch(`${label} is ready to launch`);
  }
  function logout() {
    localStorage.removeItem("gos_session");
    router.push("/login");
  }
  return (
    <main
      className={`desktop mode-${mode} wallpaper-${wallpaper}`}
      style={{ "--orange": accent } as React.CSSProperties}
    >
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}>
        <Menu />
      </button>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <Logo />
        <nav>
          {nav.map(({ label, Icon }) => (
            <button
              key={label}
              className={
                (view === "home" && label === "Home") ||
                (view === "apps" && label === "Apps") ||
                (view === "marketplace" && label === "Marketplace")
                  ? "active"
                  : ""
              }
              onClick={() => navigate(label)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="side-secondary">
          <button>
            <Bell />
            Notifications <b>3</b>
          </button>
          <button>
            <CircleHelp />
            Help
          </button>
          <button onClick={() => setSettingsOpen(true)}>
            <Settings />
            Settings
          </button>
        </div>
        <button className="profile" onClick={() => setSettingsOpen(true)}>
          <span>AR</span>
          <div>
            <strong>{user.name}</strong>
            <small>{tenant.role}</small>
            <small>{tenant.name}</small>
          </div>
          <ArrowRight />
        </button>
      </aside>
      <section className="desktop-main">
        <header className="topbar">
          <div className="global-search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything in GOS…"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <button aria-label="AI assistant">
              <Sparkles />
            </button>
            <button>
              <Grid2X2 />
            </button>
            <button className="bell">
              <Bell />
              <i>3</i>
            </button>
            <button
              className="tenant-button"
              onClick={() => setTenantOpen(!tenantOpen)}
            >
              {tenant.name}
              <ChevronDown />
            </button>
            <button className="avatar">
              AR
              <span />
            </button>
          </div>
          {tenantOpen && (
            <div className="tenant-menu">
              <p>Switch organisation</p>
              {user.tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTenantId(t.id);
                    setTenantOpen(false);
                  }}
                >
                  <span>{t.shortName.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>
                      {t.role} · {t.deployment}
                    </small>
                  </div>
                  {t.id === tenant.id && <Check />}
                </button>
              ))}
              <hr />
              <button onClick={logout}>
                <LogOut />
                Sign out
              </button>
            </div>
          )}
        </header>
        <AnimatePresence mode="wait">
          {view === "home" ? (
            <HomeView
              key="home"
              user={user}
              tenant={tenant}
              apps={apps}
              now={now}
              launchModule={launchModule}
              openMarket={() => setView("marketplace")}
              openApps={() => setView("apps")}
            />
          ) : view === "apps" ? (
            <AppsView
              key="apps"
              tenant={tenant.name}
              subscriptions={tenantSubscriptions}
              onLaunch={launchModule}
              onUninstall={(moduleId) => {
                const name = catalogueById[moduleId]?.name ?? moduleId;
                cancelModule(tenant.id, moduleId, user.email);
                launch(`${name} uninstalled and access revoked`);
              }}
              onMarketplace={() => setView("marketplace")}
            />
          ) : (
            <Marketplace
              key="market"
              tenant={tenant.name}
              subscriptions={tenantSubscriptions}
              onBack={() => setView("home")}
              onInstall={(moduleId, features) => {
                const name = catalogueById[moduleId]?.name ?? moduleId;
                startTrial(tenant.id, moduleId, features, user.email);
                launch(`${name} installed with ${features.length} selected features`);
              }}
              onManage={() => setView("apps")}
            />
          )}
        </AnimatePresence>
      </section>
      <Dock
        active={view}
        onSettings={() => setSettingsOpen(true)}
        onNavigate={setView}
        onLaunch={launch}
      />
      <AnimatePresence>
        {settingsOpen && (
          <SettingsWindow
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            mode={mode}
            setMode={setMode}
            accent={accent}
            setAccent={setAccent}
            close={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="toast"
          >
            <Check /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function HomeView({
  user,
  tenant,
  apps,
  now,
  launchModule,
  openMarket,
  openApps,
}: {
  user: User;
  tenant: User["tenants"][number];
  apps: typeof appData;
  now: Date | null;
  launchModule: (moduleId: string) => void;
  openMarket: () => void;
  openApps: () => void;
}) {
  return (
    <motion.div
      className="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="hero">
        <div>
          <span className="eyebrow">
            GOOD{" "}
            {now && now.getHours() < 12
              ? "MORNING"
              : now && now.getHours() < 18
                ? "AFTERNOON"
                : "EVENING"}
          </span>
          <h1>
            {user.name.split(" ")[0]},<br />
            welcome to <em>GOS</em>
          </h1>
          <p>ONE PLATFORM. EVERY POSSIBILITY.</p>
        </div>
        <div className="weather">
          <Clock3 />
          <div>
            <b>
              {now?.toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
              }) ?? "--:--"}
            </b>
            <span>
              {now?.toLocaleDateString("en-ZA", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>{tenant.location}</span>
          </div>
          <div className="sun">☀️</div>
          <div>
            <b>18°C</b>
            <span>Clear skies</span>
          </div>
        </div>
      </div>
      <div className="section-head">
        <h2>Your workspace</h2>
        <button onClick={openApps}>
          Open app library <ArrowRight />
        </button>
      </div>
      <div className="app-grid">
        {apps.map((a, i) => (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -7 }}
            key={a.id}
            className={`app-card ${a.tone}`}
            onClick={() => launchModule(a.id)}
          >
            <span className="app-icon">
              <a.Icon />
            </span>
            <strong>{a.name}</strong>
            <small>{a.description}</small>
            <i>
              <ArrowRight />
            </i>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ y: -7 }}
          className="app-card marketplace"
          onClick={openMarket}
        >
          <span className="plus">+</span>
          <strong>Marketplace</strong>
          <small>Discover more apps</small>
        </motion.button>
      </div>
      <div className="dashboard-grid">
        <Panel title="Recent activity" action="View all">
          <Activity
            icon={<FileText />}
            title="RFQ-2026-0441"
            meta="Project Admin · 5 minutes ago"
            status="Updated"
          />
          <Activity
            icon={<FileText />}
            title="Board Pack Q3"
            meta="DocuWeave · 18 minutes ago"
            status="Shared"
          />
          <Activity
            icon={<PenLine />}
            title="Supplier Agreement"
            meta="Signflow · 1 hour ago"
            status="Completed"
          />
          <Activity
            icon={<UsersRound />}
            title="Vendor onboarding"
            meta="Vendor Management · 2 hours ago"
            status="In progress"
          />
        </Panel>
        <Panel title="Your notifications" action="View all">
          <Activity
            icon={<UserRound />}
            title="Vendor requires approval"
            meta="Kalahari Systems (Pty) Ltd"
            status="2h ago"
          />
          <Activity
            icon={<Bell />}
            title="Usage limit at 80%"
            meta="DocuWeave storage"
            status="5h ago"
          />
          <Activity
            icon={<Sparkles />}
            title="New feature available"
            meta="Echo 2.0 is now available"
            status="1d ago"
          />
        </Panel>
        <Panel title="Tenant overview" action="View details">
          <div className="metric wide">
            <UsersRound />
            <span>
              Active users
              <strong>
                {tenant.id === "gic" ? 128 : tenant.id === "kalahari" ? 64 : 22}
              </strong>
            </span>
            <em>↑ 12%</em>
          </div>
          <div className="metric">
            <Grid2X2 />
            <span>
              Applications<strong>{apps.length}</strong>
            </span>
          </div>
          <div className="metric">
            <Building2 />
            <span>
              Vendors<strong>{tenant.id === "gic" ? 37 : 12}</strong>
            </span>
          </div>
          <div className="compliance">
            <ShieldCheck />
            <span>
              Compliance status<strong>Compliant</strong>
            </span>
          </div>
        </Panel>
      </div>
    </motion.div>
  );
}
function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <header>
        <h3>{title}</h3>
        <button>
          {action} <ArrowRight />
        </button>
      </header>
      {children}
    </section>
  );
}
function Activity({
  icon,
  title,
  meta,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  status: string;
}) {
  return (
    <div className="activity">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <em>{status}</em>
    </div>
  );
}
function Dock({
  active,
  onSettings,
  onNavigate,
  onLaunch,
}: {
  active: "home" | "apps" | "marketplace";
  onSettings: () => void;
  onNavigate: (v: "home" | "apps" | "marketplace") => void;
  onLaunch: (s: string) => void;
}) {
  return (
    <motion.div className="dock" initial={{ y: 80 }} animate={{ y: 0 }}>
      {[
        { n: "Home", I: Home },
        { n: "Apps", I: Grid2X2 },
        { n: "People", I: UsersRound },
        { n: "Marketplace", I: ShoppingBag },
        { n: "Search", I: Search },
        { n: "Settings", I: Settings },
      ].map(({ n, I }) => (
        <motion.button
          whileHover={{ y: -7, scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={
            (n === "Home" && active === "home") ||
            (n === "Apps" && active === "apps") ||
            (n === "Marketplace" && active === "marketplace")
              ? "active"
              : ""
          }
          key={n}
          onClick={() =>
            n === "Settings"
              ? onSettings()
              : n === "Home"
                ? onNavigate("home")
                : n === "Apps"
                  ? onNavigate("apps")
                : n === "Marketplace"
                  ? onNavigate("marketplace")
                  : onLaunch(`${n} is ready to launch`)
          }
        >
          <I />
          <span>{n}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
function Marketplace({
  tenant,
  subscriptions,
  onBack,
  onInstall,
  onManage,
}: {
  tenant: string;
  subscriptions: Subscription[];
  onBack: () => void;
  onInstall: (moduleId: string, features: string[]) => void;
  onManage: () => void;
}) {
  const [installing, setInstalling] = useState<CatalogueModule | null>(null);
  return (
    <motion.div
      className="market-view content"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <button className="back-link" onClick={onBack}>
        <ArrowLeft /> Workspace
      </button>
      <div className="market-hero">
        <div>
          <span className="eyebrow">GOS MARKETPLACE</span>
          <h1>
            Build the workspace
            <br />
            <em>your team needs.</em>
          </h1>
          <p>
            Discover trusted modules, start a trial and expand {tenant} without
            leaving GOS.
          </p>
        </div>
        <ShoppingBag />
      </div>
      <div className="market-toolbar">
        <div>
          <strong>Explore modules</strong>
          <span>{catalogue.length} curated products · installs activate immediately</span>
        </div>
        <button>
          All categories <ChevronDown />
        </button>
      </div>
      <div className="market-grid">
        {appData.map((app, i) => {
          const installed = subscriptions.some(
            (subscription) =>
              subscription.moduleId === app.id && subscription.status !== "cancelled",
          );
          const startingPrice = app.plans[0].monthlyPrice.toLocaleString("en-ZA");
          return (
          <motion.article
            key={app.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <span className={`market-icon ${app.tone}`}>
              <app.Icon />
            </span>
            <small>{app.category}</small>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <footer>
              <strong>From R{startingPrice} / month</strong>
              <button
                className={installed ? "installed" : ""}
                onClick={() => (installed ? onManage() : setInstalling(app))}
              >
                {installed ? <><BadgeCheck /> Installed</> : <>Install trial <ArrowRight /></>}
              </button>
            </footer>
          </motion.article>
          );
        })}
      </div>
      <AnimatePresence>
        {installing && (
          <FeatureInstaller
            key={installing.id}
            module={installing}
            onClose={() => setInstalling(null)}
            onInstall={(features) => {
              onInstall(installing.id, features);
              setInstalling(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeatureInstaller({
  module,
  onClose,
  onInstall,
}: {
  module: CatalogueModule;
  onClose: () => void;
  onInstall: (features: string[]) => void;
}) {
  const professionalPlan = module.plans.find((plan) => plan.id === "professional")!;
  const available = module.featureDefinitions.filter((feature) =>
    professionalPlan.features.includes(feature.id),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, setPending] = useState<{
    featureId: string;
    dependencies: string[];
  } | null>(null);

  function allDependencies(featureId: string, found = new Set<string>()): string[] {
    const definition = module.featureDefinitions.find((feature) => feature.id === featureId);
    for (const dependency of definition?.dependsOn ?? []) {
      if (!found.has(dependency)) {
        found.add(dependency);
        allDependencies(dependency, found);
      }
    }
    return [...found];
  }

  function toggleFeature(featureId: string) {
    if (selected.includes(featureId)) {
      const requiredBy = selected.filter((selectedId) =>
        allDependencies(selectedId).includes(featureId),
      );
      if (requiredBy.length === 0) {
        setSelected((current) => current.filter((id) => id !== featureId));
      }
      return;
    }
    const dependencies = allDependencies(featureId).filter(
      (dependency) => !selected.includes(dependency),
    );
    if (dependencies.length > 0) {
      setPending({ featureId, dependencies });
      return;
    }
    setSelected((current) => [...current, featureId]);
  }

  function nameFor(featureId: string) {
    return module.featureDefinitions.find((feature) => feature.id === featureId)?.name ?? featureId;
  }

  return (
    <motion.div
      className="feature-installer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="feature-installer"
        initial={{ scale: 0.95, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-installer-title"
      >
        <header>
          <div>
            <span className="eyebrow">CONFIGURE MODULE</span>
            <h2 id="feature-installer-title">Choose {module.name} features</h2>
            <p>Only selected features and their required dependencies will be entitled.</p>
          </div>
          <button aria-label="Close feature selection" onClick={onClose}><X /></button>
        </header>
        <div className="installer-plan">
          <div>
            <strong>Professional trial</strong>
            <span>14 days · R{professionalPlan.monthlyPrice.toLocaleString("en-ZA")} / month afterwards</span>
          </div>
          <b>{selected.length} of {available.length} selected</b>
        </div>
        <div className="feature-options">
          {available.map((feature) => {
            const requiredBy = selected.filter((selectedId) =>
              allDependencies(selectedId).includes(feature.id),
            );
            const isSelected = selected.includes(feature.id);
            return (
              <button
                type="button"
                key={feature.id}
                className={isSelected ? "selected" : ""}
                onClick={() => toggleFeature(feature.id)}
                aria-pressed={isSelected}
              >
                <span className="feature-check">{isSelected && <Check />}</span>
                <div>
                  <strong>{feature.name}</strong>
                  <p>{feature.description}</p>
                  {feature.dependsOn.length > 0 && (
                    <small>Requires {feature.dependsOn.map(nameFor).join(" + ")}</small>
                  )}
                  {isSelected && requiredBy.length > 0 && (
                    <small className="required-by">Required by {requiredBy.map(nameFor).join(", ")}</small>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {pending && (
          <motion.div className="dependency-prompt" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldCheck />
            <div>
              <strong>{nameFor(pending.featureId)} needs other features</strong>
              <p>
                To function correctly it also requires {pending.dependencies.map(nameFor).join(", ")}.
                Would you like to include them?
              </p>
              <div>
                <button
                  onClick={() => {
                    setSelected((current) => [
                      ...new Set([...current, ...pending.dependencies, pending.featureId]),
                    ]);
                    setPending(null);
                  }}
                >
                  Include required features
                </button>
                <button onClick={() => setPending(null)}>Choose another feature</button>
              </div>
            </div>
          </motion.div>
        )}
        <footer>
          <button className="installer-cancel" onClick={onClose}>Cancel</button>
          <button
            className="installer-confirm"
            disabled={selected.length === 0 || pending !== null}
            onClick={() => onInstall(selected)}
          >
            Install {selected.length || "selected"} feature{selected.length === 1 ? "" : "s"}
            <ArrowRight />
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}

function AppsView({
  tenant,
  subscriptions,
  onLaunch,
  onUninstall,
  onMarketplace,
}: {
  tenant: string;
  subscriptions: Subscription[];
  onLaunch: (moduleId: string) => void;
  onUninstall: (moduleId: string) => void;
  onMarketplace: () => void;
}) {
  const installed = subscriptions.filter(
    (subscription) => subscription.status !== "cancelled",
  );
  return (
    <motion.div
      className="content apps-view"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <div className="apps-heading">
        <div>
          <span className="eyebrow">TENANT APPLICATIONS</span>
          <h1>Apps installed for {tenant}</h1>
          <p>Each app below has an active, signed tenant entitlement.</p>
        </div>
        <button onClick={onMarketplace}><ShoppingBag /> Browse Marketplace</button>
      </div>
      <div className="installed-grid">
        {installed.map((subscription) => {
          const app = catalogueById[subscription.moduleId];
          if (!app) return null;
          const Icon = moduleIcons[app.id as keyof typeof moduleIcons] ?? Grid2X2;
          return (
            <motion.article layout key={app.id} className="installed-app">
              <span className={`market-icon ${app.tone}`}><Icon /></span>
              <div className="installed-copy">
                <small>{app.category}</small>
                <h2>{app.name}</h2>
                <p>{app.description}</p>
                <div className="entitlement-meta">
                  <span><BadgeCheck /> {subscription.status === "trial" ? "Trial" : "Active"}</span>
                  <span>{subscription.planId} plan</span>
                  <span>Valid to {new Date(subscription.validUntil).toLocaleDateString("en-ZA")}</span>
                </div>
                <div className="enabled-features">
                  {(subscription.selectedFeatures ??
                    app.plans.find((plan) => plan.id === subscription.planId)?.features ??
                    []).map((featureId) => (
                    <span key={featureId}>
                      {app.featureDefinitions.find((feature) => feature.id === featureId)?.name ?? featureId}
                    </span>
                  ))}
                </div>
              </div>
              <div className="installed-actions">
                <button className="launch-app" onClick={() => onLaunch(app.id)}>
                  Launch <ArrowRight />
                </button>
                <button className="uninstall-app" onClick={() => onUninstall(app.id)}>
                  Uninstall
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
      {installed.length === 0 && (
        <div className="empty-apps">
          <Grid2X2 />
          <h2>No apps installed</h2>
          <p>Install a module from the Marketplace to add it to this tenant.</p>
          <button onClick={onMarketplace}>Open Marketplace</button>
        </div>
      )}
    </motion.div>
  );
}
function SettingsWindow({
  wallpaper,
  setWallpaper,
  mode,
  setMode,
  accent,
  setAccent,
  close,
}: {
  wallpaper: string;
  setWallpaper: (s: string) => void;
  mode: "dark" | "light";
  setMode: (m: "dark" | "light") => void;
  accent: string;
  setAccent: (s: string) => void;
  close: () => void;
}) {
  const [fileName, setFileName] = useState("");
  return (
    <motion.div
      className="window-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="settings-window"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
      >
        <header>
          <div>
            <span />
            <span />
            <span />
          </div>
          <h2>Personalise GOS</h2>
          <button onClick={close}>
            <X />
          </button>
        </header>
        <div className="settings-body">
          <aside>
            <button className="active">
              <Palette />
              Brand & appearance
            </button>
            <button>
              <Bell />
              Notifications
            </button>
            <button>
              <ShieldCheck />
              Privacy & security
            </button>
          </aside>
          <div className="wallpaper-settings">
            <span className="eyebrow">APPEARANCE</span>
            <h3>Make GOS feel like yours</h3>
            <p>
              Theme, brand colour and wallpaper preferences are saved on this
              device.
            </p>
            <div className="mode-picker">
              <button
                className={mode === "dark" ? "selected" : ""}
                onClick={() => setMode("dark")}
              >
                <Moon />
                Dark
              </button>
              <button
                className={mode === "light" ? "selected" : ""}
                onClick={() => setMode("light")}
              >
                <Sun />
                Light
              </button>
              <label>
                Brand colour
                <input
                  aria-label="Brand colour"
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                />
                <b>{accent.toUpperCase()}</b>
              </label>
            </div>
            <h4>Wallpaper</h4>
            <div className="wallpaper-grid">
              {wallpapers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWallpaper(w.id)}
                  className={`wallpaper-option ${w.id} ${wallpaper === w.id ? "selected" : ""}`}
                >
                  <span>{wallpaper === w.id && <Check />}</span>
                  <strong>{w.name}</strong>
                </button>
              ))}
            </div>
            <label className="upload">
              <Upload />
              <span>
                <strong>{fileName || "Upload your own image"}</strong>
                <small>JPG or PNG · up to 10 MB</small>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
            </label>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
