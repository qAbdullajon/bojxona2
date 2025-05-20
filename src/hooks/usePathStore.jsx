import { create } from "zustand";

export const usePathStore = create((set) => ({
  name: "",
  setName: (name) => set(() => ({ name })),
}));
