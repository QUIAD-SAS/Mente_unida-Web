"use client";

import { PatientSupportChatWidget } from "@/components/chat/patient-support-chat-widget";
import { PsychologistMessagingNotifier } from "@/lib/chat/messaging-notifications";
import { useSession } from "@/lib/auth/session-context";
import { isPsychologistRole } from "@/lib/auth/display";
import { usePathname } from "next/navigation";

export function PatientChatProvider() {
  const { session, loading } = useSession();
  const pathname = usePathname();

  if (loading || !session) return null;

  const isPsych = isPsychologistRole(session.roles);
  const hideEscuchaderoOnConsultorio =
    !isPsych && pathname.includes("/paciente/consultorio");

  return (
    <>
      {isPsych ? (
        <PsychologistMessagingNotifier />
      ) : hideEscuchaderoOnConsultorio ? null : (
        <PatientSupportChatWidget />
      )}
    </>
  );
}
