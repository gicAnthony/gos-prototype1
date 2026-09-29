import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoUser } from "@/lib/demo-data";
import { Workspace } from "@/components/workspace";
export default async function Page(){const c=await cookies();if(c.get("gos_session")?.value!=="demo-session")redirect("/login");return <Workspace user={demoUser}/>}
