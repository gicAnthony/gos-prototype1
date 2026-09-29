import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoUser } from "@/lib/demo-data";
import { TenantSelector } from "@/components/tenant-selector";
export default async function Page(){const c=await cookies();if(c.get("gos_session")?.value!=="demo-session")redirect("/login");if(demoUser.tenants.length===1)redirect("/workspace");return <TenantSelector user={demoUser}/>}
