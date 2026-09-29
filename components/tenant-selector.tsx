"use client";
import { motion } from "motion/react";
import { ArrowRight, Building2, MapPin, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { useGOSStore } from "@/lib/store";
import { Logo } from "./logo";

export function TenantSelector({user}:{user:User}){
  const router=useRouter(),setTenantId=useGOSStore(s=>s.setTenantId);
  function choose(id:string){setTenantId(id);router.push("/workspace")}
  return <main className="tenant-select"><div className="tenant-select-top"><Logo/><span>Signed in as {user.email}</span></div><motion.section initial={{opacity:0,y:22}} animate={{opacity:1,y:0}}><span className="eyebrow">CHOOSE YOUR WORKSPACE</span><h1>Where are you working today?</h1><p>Select an organisation to enter its secure, isolated workspace.</p><div className="tenant-choice-grid">{user.tenants.map((tenant,i)=><motion.button key={tenant.id} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.08*i}} onClick={()=>choose(tenant.id)}><span className="tenant-monogram"><Building2/></span><div><h2>{tenant.name}</h2><p>{tenant.role}</p><small><MapPin/> {tenant.location}</small><small><Server/> {tenant.deployment}</small></div><ArrowRight className="tenant-arrow"/></motion.button>)}</div></motion.section></main>
}
