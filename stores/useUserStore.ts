import { create } from "zustand";

interface UserState {
  name: string;
  setName: (name: string) => void;
  offlineMode: boolean;
  toggleOfflineMode: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "CJ",
  setName: (name) => set({ name }),
  offlineMode: false,
  toggleOfflineMode: () =>
    set((state) => ({ offlineMode: !state.offlineMode })),
  notificationsEnabled: false,
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
}));
