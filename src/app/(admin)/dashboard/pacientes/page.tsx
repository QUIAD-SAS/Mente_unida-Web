import { redirect } from "next/navigation";

export default function PacientesRedirectPage() {
  redirect("/dashboard/usuarios?tab=pacientes");
}
