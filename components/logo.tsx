import { Hexagon } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><div className="logo-mark"><Hexagon /><span /></div>{!compact && <div><b>GOS</b><small>Enterprise operating environment</small></div>}</div>;
}
