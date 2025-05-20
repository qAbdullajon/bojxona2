import { create } from "zustand";

export const useCheckedStore = create((set) => ({
  items: [],
  toggleItem: (id) =>
    set((store) => {
      if (store.items.includes(id)) {
        return { items: store.items.filter((item) => item !== id) };
      }
      return { items: [...store.items, id] };
    }),
  clearItems: () => set({ items: [] }),
  addAllItems: (ids) => set({ items: [...new Set(ids)] }),
}));