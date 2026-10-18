import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-mu-text-muted">Cargando…</p>}>
      <OnboardingWizard />
    </Suspense>
  );
}
