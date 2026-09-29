import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`logo ${compact ? "compact" : ""}`}><picture><Image className="logo-dark" src="/light_logo.png" width={280} height={126} alt="GOS — Governance Operating System" priority/><Image className="logo-light" src="/dark_logo.png" width={280} height={126} alt="GOS — Governance Operating System" priority/></picture></div>;
}
