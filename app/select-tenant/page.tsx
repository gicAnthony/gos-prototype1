"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { demoUser } from "@/lib/demo-data";
import { TenantSelector } from "@/components/tenant-selector";
export default function Page(){const router=useRouter(),[ready,setReady]=useState(false);useEffect(()=>{if(localStorage.getItem("gos_session")!=="demo-session")router.replace("/login");else if(demoUser.tenants.length===1)router.replace("/workspace");else setReady(true)},[router]);return ready?<TenantSelector user={demoUser}/>:null}
