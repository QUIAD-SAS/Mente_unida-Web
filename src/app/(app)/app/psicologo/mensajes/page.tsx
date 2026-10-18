import { AuthGate } from "@/components/dashboard/auth-gate";
import { PsychologistMessagingView } from "@/components/dashboard/psychologist-messaging-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Mensajes",
  robots: { index: false },
};

export default function PsychologistMessagesPage() {
  return (
    <AuthGate
      allowedRoles={[
        "PSYCHOLOGIST",
        "CLINICAL_SUPERVISOR",
        "SUPERVISOR",
        "ADMIN",
      ]}
    >
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-mu-text-muted">
            Cargando mensajes…
          </div>
        }
      >
        <PsychologistMessagingView />
      </Suspense>
    </AuthGate>
  );
}
