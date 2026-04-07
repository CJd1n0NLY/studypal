import { create } from "zustand";

interface UserState {
  name: string;
  setName: (name: string) => void;
  offlineMode: boolean;
  toggleOfflineMode: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "CJ", // Your default name!
  setName: (name) => set({ name }),
  offlineMode: false,
  toggleOfflineMode: () =>
    set((state) => ({ offlineMode: !state.offlineMode })),
}));
