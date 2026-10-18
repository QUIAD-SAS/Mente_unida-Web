import { redirect } from "next/navigation";

export default function PsicologosRedirectPage() {
  redirect("/dashboard/usuarios?tab=psicologos");
}
