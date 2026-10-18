import { api } from "@/lib/api-client";
import { clearPatientSupportChat } from "@/lib/chat/patient-support-store";
import { useMessagingUnreadStore } from "@/lib/chat/messaging-unread-store";

/**
 * Al cerrar sesión del paciente: borra el chat local y notifica al backend
 * para que no quede historial visible en futuras sesiones del paciente.
 */
export async function cleanupPatientChatOnLogout(token: string | null) {
  clearPatientSupportChat();
  useMessagingUnreadStore.getState().reset();
  if (!token) return;
  try {
    await api.messaging.support.endSession(token);
  } catch {
    /* el backend puede no estar listo aún */
  }
}
