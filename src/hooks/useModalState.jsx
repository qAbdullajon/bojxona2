import { create } from "zustand";

export const useEventStore = create((set) => ({
  open: false,
  text: null,
  data: [],
  isAddModal: false,
  pageTotal: 0,
  type: null,
  setType: (type) => set({ type }),
  editData: null,
  isOnSubmit: false,
  setIsOnSubmit: (bool) => set({ isOnSubmit: bool }),
  setText: (lorem) => set({ text: lorem }),
  toggleIsAddModal: () =>
    set((state) => ({
      isAddModal: !state.isAddModal,
    })),
  setEditData: (data) => set(() => ({ editData: data })),
  updateState: (new_data) =>
    set((store) => ({
      data: store.data.map((item) =>
        item.id === new_data.id
          ? {
              ...item,
              name: new_data.name,
              event_number: new_data.event_number,
            }
          : item
      ),
    })),
  onOpen: () => set(() => ({ open: true })),
  onClose: () => set(() => ({ open: false, editData: null })),
  setData: (all_data) => set({ data: [...all_data] }),
  setTotal: (count) => set({ pageTotal: count }),
  createData: (event) =>
    set((store) => {
      return {
        data: [event, ...store.data],
        pageTotal: store.pageTotal + 1,
      };
    }),
}));
export const useWarehouseStore = create((set) => ({
  open: false,
  data: [],
  editData: null,
  total: 0,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
  setData: (all_data) => set({ data: [...all_data] }),
  createData: (event) =>
    set((store) => {
      return {
        data: [{ ...event, productsCount: 0 }, ...store.data],
        total: store.total + 1,
      };
    }),
  setEditData: (data) => set({ editData: data }),
  setTotal: (num) => set({ total: num }),
  updateState: (new_data) =>
    set((store) => ({
      data: store.data.map((item) =>
        item.id === new_data.id
          ? {
              ...item,
              name: new_data.name,
              location: new_data.location,
            }
          : item
      ),
    })),
}));

export const useProductStore = create((set) => ({
  open: false,
  data: [],
  total: 0,
  chandeStatusData: null,
  editData: null,
  setEditData: (obj) => set({ editData: obj }),
  setChangeStatusData: (data) => set({ chandeStatusData: data }),
  onClose: () => set({ open: false }),
  onOpen: () => set({ open: true }),
  setData: (all_data) => set({ data: [...all_data] }),
  setTotal: (num) => set({ total: num }),
  pandingData: [],
  setPandingData: (data) =>
    set({
      pandingData: Array.isArray(data) ? data : [],
    }),
  createPandingData: (item) =>
    set((state) => ({
      pandingData: [item, ...state.pandingData],
    })),
  deleteItem: (id) =>
    set((state) => ({
      pandingData: state.pandingData.filter((item) => item.id !== id),
    })),

  createData: (product) =>
    set((store) => {
      if (store.total < 10) {
        return {
          data: [product, ...store.data],
          total: store.total + 1,
        };
      } else {
        return {
          total: store.total + 1,
        };
      }
    }),
}));

export const useShopProductsStore = create((set) => ({
  open: false,
  data: [],
  total: 0,
  onOpen: () => set(() => ({ open: true })),
  onClose: () => set(() => ({ open: false, editData: {} })),
  setData: (shops) => set(() => ({ data: [...shops] })),
  createData: (product) =>
    set((store) => {
      if (store.total < 10) {
        return {
          data: [product, ...store.data],
          total: store.total + 1,
        };
      } else {
        return {
          total: store.total + 1,
        };
      }
    }),
  setTotal: (num) => set({ total: num }),
}));

export const useShopStore = create((set) => ({
  open: false,
  data: [],
  editData: {},
  total: 0,
  setData: (shops) => set(() => ({ data: [...shops] })),
  onOpen: () => set(() => ({ open: true })),
  onClose: () => set(() => ({ open: false, editData: {} })),
  createData: (shop) =>
    set((store) => {
      if (store.total < 10) {
        return {
          data: [shop, ...store.data],
          total: store.total + 1,
        };
      } else {
        return {
          total: store.total + 1,
        };
      }
    }),
  setTotal: (num) => set({ total: num }),
  setEditData: (data) => set(() => ({ editData: data })),
  setUpdateData: (obj) =>
    set((store) => ({
      data: store.data.map((item) => (item.id === obj.id ? obj : item)),
    })),
}));

export const useEmployeesModal = create((set) => ({
  open: false,
  toggleOpen: () => set((state) => ({ open: !state.open })),
}));
