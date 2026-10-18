import { create } from "zustand";

interface MessagingUnreadState {
  psychologistUnread: number;
  supportUnread: number;
  appointmentUnread: number;
  setPsychologistUnread: (counts: {
    total: number;
    support: number;
    appointment: number;
  }) => void;
  reset: () => void;
}

export const useMessagingUnreadStore = create<MessagingUnreadState>((set) => ({
  psychologistUnread: 0,
  supportUnread: 0,
  appointmentUnread: 0,
  setPsychologistUnread: ({ total, support, appointment }) =>
    set({
      psychologistUnread: total,
      supportUnread: support,
      appointmentUnread: appointment,
    }),
  reset: () =>
    set({
      psychologistUnread: 0,
      supportUnread: 0,
      appointmentUnread: 0,
    }),
}));
