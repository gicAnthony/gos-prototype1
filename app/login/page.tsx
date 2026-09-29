"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL), [password, setPassword] = useState(DEMO_PASSWORD);
  const [show, setShow] = useState(false), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data=await res.json(); setLoading(false); if (!res.ok) return setError(data.message||"The email or password is incorrect.");
    router.push(data.user.tenants.length === 1 ? "/workspace" : "/select-tenant"); router.refresh();
  }
  return <main className="login-page"><section className="login-story"><Logo/><motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="story-copy"><div className="eyebrow"><span/> GOVERNANCE OPERATING SYSTEM</div><h1>One platform.<br/><em>Every possibility.</em></h1><p>Move securely between organisations, applications and workflows from one intelligent workspace.</p><div className="trust-row"><span><ShieldCheck/> Enterprise secure</span><span><CheckCircle2/> Tenant isolated</span></div></motion.div><p className="story-foot">GIC IAM · Protected by multi-factor authentication</p></section><section className="login-panel"><motion.form initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} onSubmit={submit} className="login-card"><div className="mobile-logo"><Logo/></div><span className="signin-icon"><LockKeyhole/></span><h2>Welcome back</h2><p>Sign in to continue to your GOS workspace.</p><label>Work email<input aria-label="Work email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<div className="password-field"><input aria-label="Password" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" aria-label="Toggle password visibility" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label><div className="login-options"><label><input type="checkbox" defaultChecked/> Keep me signed in</label><button type="button">Forgot password?</button></div>{error&&<div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={loading}>{loading?"Signing in…":"Continue to workspace"}<ArrowRight/></button><div className="demo-hint">Demo credentials are pre-filled for <strong>{DEMO_EMAIL}</strong></div><small className="terms">By continuing you agree to GIC&apos;s acceptable use and privacy policies.</small></motion.form></section></main>;
}
