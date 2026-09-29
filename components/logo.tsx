import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "compact" : ""}`}>
      <picture>
        <Image
          className="logo-dark"
          src="/gos-prototype1/light_logo.png"
          width={280}
          height={126}
          alt="GOS — Governance Operating System"
          priority
        />
        <Image
          className="logo-light"
          src="/gos-prototype1/dark_logo.png"
          width={280}
          height={126}
          alt="GOS — Governance Operating System"
          priority
        />
      </picture>
    </div>
  );
}
