"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { demoUser } from "@/lib/demo-data";
import { Workspace } from "@/components/workspace";
export default function Page(){const router=useRouter(),[ready,setReady]=useState(false);useEffect(()=>{if(localStorage.getItem("gos_session")!=="demo-session")router.replace("/login");else setReady(true)},[router]);return ready?<Workspace user={demoUser}/>:null}
