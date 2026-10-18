import { create } from "zustand";

interface PatientSupportChatState {
  open: boolean;
  unreadCount: number;
  setOpen: (open: boolean) => void;
  minimize: () => void;
  setUnreadCount: (count: number) => void;
  reset: () => void;
}

export const usePatientSupportChatStore = create<PatientSupportChatState>(
  (set) => ({
    open: false,
    unreadCount: 0,
    setOpen: (open) =>
      set((s) => ({
        open,
        unreadCount: open ? 0 : s.unreadCount,
      })),
    minimize: () => set({ open: false }),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
    reset: () => set({ open: false, unreadCount: 0 }),
  }),
);

export function clearPatientSupportChat() {
  usePatientSupportChatStore.getState().reset();
}
