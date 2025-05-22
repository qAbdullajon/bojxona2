import { create } from "zustand";

export const useStatusFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useShipperFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useProductTypeFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useSortFilterStore = create((set) => ({
  field: null,
  grow: true,
  setField: (id) => set({ field: id }),
  toggleGrow: () => set((store) => ({ grow: !store.grow })),
}));

export const useDateFilterStore = create((set) => ({
  startDate: null,
  endDate: null,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
}));
