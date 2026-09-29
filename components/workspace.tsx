"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
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
import type { User } from "@/lib/types";
import { useGOSStore } from "@/lib/store";
import { Logo } from "./logo";

const appData = [
  {
    id: "project",
    name: "Project Admin",
    description: "Projects and delivery",
    Icon: FolderKanban,
    tone: "orange",
  },
  {
    id: "documents",
    name: "DocuWeave",
    description: "Documents and work",
    Icon: FileText,
    tone: "purple",
  },
  {
    id: "signflow",
    name: "Signflow",
    description: "Digital signatures",
    Icon: PenLine,
    tone: "blue",
  },
  {
    id: "vendors",
    name: "Vendor Management",
    description: "Vendors and compliance",
    Icon: UsersRound,
    tone: "green",
  },
  {
    id: "echo",
    name: "Echo",
    description: "AI collaboration",
    Icon: MessageCircleMore,
    tone: "slate",
  },
];
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
const marketApps = [
  {
    name: "Risk Atlas",
    category: "Governance",
    description: "Live enterprise risk registers and controls.",
    Icon: ShieldCheck,
    tone: "orange",
    price: "R1 490 / month",
  },
  {
    name: "People Hub",
    category: "Workforce",
    description: "A connected directory, leave and team insights.",
    Icon: UsersRound,
    tone: "purple",
    price: "R890 / month",
  },
  {
    name: "Pulse Analytics",
    category: "Intelligence",
    description: "Turn operational signals into decisions.",
    Icon: Zap,
    tone: "blue",
    price: "14-day trial",
  },
  {
    name: "Boardroom",
    category: "Collaboration",
    description: "Secure agendas, packs, minutes and resolutions.",
    Icon: Building2,
    tone: "green",
    price: "R1 190 / month",
  },
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
    } = useGOSStore();
  const [tenantOpen, setTenantOpen] = useState(false),
    [settingsOpen, setSettingsOpen] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [query, setQuery] = useState(""),
    [now, setNow] = useState<Date | null>(null),
    [toast, setToast] = useState(""),
    [view, setView] = useState<"home" | "marketplace">("home");
  const tenant = user.tenants.find((t) => t.id === tenantId) ?? user.tenants[0];
  const apps = useMemo(
    () =>
      appData.filter(
        (a) =>
          tenant.apps.includes(a.id) &&
          `${a.name} ${a.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [tenant, query],
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
  function navigate(label: string) {
    setMobileNav(false);
    if (label === "Home") setView("home");
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
              launch={launch}
              openMarket={() => setView("marketplace")}
            />
          ) : (
            <Marketplace
              key="market"
              tenant={tenant.name}
              onBack={() => setView("home")}
              onAdd={launch}
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
  launch,
  openMarket,
}: {
  user: User;
  tenant: User["tenants"][number];
  apps: typeof appData;
  now: Date | null;
  launch: (s: string) => void;
  openMarket: () => void;
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
        <button onClick={() => launch("App library is ready to launch")}>
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
            onClick={() => launch(`${a.name} is ready to launch`)}
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
              Applications<strong>{tenant.apps.length}</strong>
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
  active: "home" | "marketplace";
  onSettings: () => void;
  onNavigate: (v: "home" | "marketplace") => void;
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
  onBack,
  onAdd,
}: {
  tenant: string;
  onBack: () => void;
  onAdd: (s: string) => void;
}) {
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
          <span>{marketApps.length} curated products</span>
        </div>
        <button>
          All categories <ChevronDown />
        </button>
      </div>
      <div className="market-grid">
        {marketApps.map((app, i) => (
          <motion.article
            key={app.name}
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
              <strong>{app.price}</strong>
              <button onClick={() => onAdd(`${app.name} added to your trial`)}>
                Add <ArrowRight />
              </button>
            </footer>
          </motion.article>
        ))}
      </div>
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
