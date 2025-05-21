import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Modal, CircularProgress, ClickAwayListener } from "@mui/material";
import { X, ChevronDown, LoaderCircle } from "lucide-react";
import { useProductStore } from "../hooks/useModalState";
import $api from "../http/api";
import { notification } from "../components/notification";
import debounce from "lodash.debounce";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "white",
  boxShadow: 24,
  px: 3,
  py: 2,
  borderRadius: "8px",
};

const units = [
  "dona",
  "tonna",
  "kg",
  "gramm",
  "litr",
  "millilitr",
  "santimetr",
  "metr",
  "to'plam",
  "juft",
  "o'ram",
  "quti",
  "tugun / bog'lama",
];

export default function ProductModal({ setConfirm }) {
  const { open, onClose, editData, createPandingData } = useProductStore();
  const [submitLoading, setSubmitLoading] = useState(false);
  const loadMoreRef = useRef({});
  const dropdownRef = useRef({});

  const [dropdowns, setDropdowns] = useState({
    warehouse: {
      search: "",
      selected: null,
      items: [],
      loading: false,
      page: 1,
      hasMore: true,
      show: false,
    },
    event: {
      search: "",
      selected: null,
      items: [],
      loading: false,
      page: 1,
      hasMore: true,
      show: false,
    },
    type: {
      search: "",
      selected: null,
      items: [],
      loading: false,
      page: 1,
      hasMore: true,
      show: false,
    },
    childType: {
      search: "",
      selected: null,
      items: [],
      loading: false,
      page: 1,
      hasMore: true,
      show: false,
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    unit: "",
    description: "",
    expiration_date: "",
  });

  const updateDropdown = useCallback((dropdownName, updates) => {
    setDropdowns((prev) => ({
      ...prev,
      [dropdownName]: {
        ...prev[dropdownName],
        ...updates,
      },
    }));
  }, []);

  const fetchData = useCallback(
    async (dropdownName, endpoint, params = {}) => {
      if (loadMoreRef.current[dropdownName]) return;
      loadMoreRef.current[dropdownName] = true;

      const dropdownElement = dropdownRef.current[dropdownName];
      const scrollTop = dropdownElement ? dropdownElement.scrollTop : 0;

      updateDropdown(dropdownName, { loading: true });
      try {
        const res = await $api.get(endpoint, { params });
        if (res.status === 200) {
          const currentPage = dropdowns[dropdownName].page;
          const newItems =
            dropdownName === "event"
              ? res.data.events
              : dropdownName === "type"
              ? res.data.types
              : dropdownName === "childType"
              ? res.data.data
              : res.data.warehouses;

          const updatedItems =
            currentPage === 1
              ? newItems
              : [...dropdowns[dropdownName].items, ...newItems];

          updateDropdown(dropdownName, {
            items: updatedItems,
            hasMore: res.data.totalPages > currentPage,
            loading: false,
          });

          setTimeout(() => {
            if (dropdownElement) {
              dropdownElement.scrollTop = scrollTop;
            }
          }, 0);
        }
      } catch (error) {
        notification(
          error.response?.data?.message || `${dropdownName} yuklashda xatolik`
        );
      } finally {
        updateDropdown(dropdownName, { loading: false });
        loadMoreRef.current[dropdownName] = false;
      }
    },
    [updateDropdown, dropdowns]
  );

  useEffect(() => {
    if (open) {
      setFormData({
        name: editData?.name || "",
        quantity: editData?.quantity || "",
        price: editData?.price === "0.00" ? "0" : editData?.price || "",
        unit: editData?.unit || "",
        description: editData?.description || "",
        expiration_date: editData?.expiration_date || "",
      });

      setDropdowns((prev) => ({
        ...prev,
        warehouse: { ...prev.warehouse, selected: editData?.warehouseId || null },
        event: { ...prev.event, selected: editData?.eventId || null },
        type: { ...prev.type, selected: editData?.typeId || null },
        childType: { ...prev.childType, selected: editData?.childTypeId || null },
      }));
    }
  }, [open, editData]);

  const handleClose = useCallback(() => {
    onClose();
    setFormData({
      name: "",
      quantity: "",
      price: "",
      unit: "",
      description: "",
      expiration_date: "",
    });
    setDropdowns({
      warehouse: {
        search: "",
        selected: null,
        items: [],
        loading: false,
        page: 1,
        hasMore: true,
        show: false,
      },
      event: {
        search: "",
        selected: null,
        items: [],
        loading: false,
        page: 1,
        hasMore: true,
        show: false,
      },
      type: {
        search: "",
        selected: null,
        items: [],
        loading: false,
        page: 1,
        hasMore: true,
        show: false,
      },
      childType: {
        search: "",
        selected: null,
        items: [],
        loading: false,
        page: 1,
        hasMore: true,
        show: false,
      },
    });
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!dropdowns.warehouse.selected) {
        notification("Omborxonani kiriting");
        return;
      }
      if (!dropdowns.event.selected) {
        notification("Yuk xatini kiriting");
        return;
      }
      if (!dropdowns.type.selected) {
        notification("Mahsulot turini kiriting");
        return;
      }

      const completeData = {
        ...formData,
        warehouseId: dropdowns.warehouse.selected,
        eventId: dropdowns.event.selected,
        typeId: dropdowns.type.selected,
        childTypeId: dropdowns.childType.selected,
      };

      try {
        setSubmitLoading(true);
        const res = editData?.id
          ? await $api.patch(`/products/update/${editData.id}`, completeData)
          : await $api.post("/products/create", completeData);

        if (res.status === 201 || res.status === 200) {
          handleClose();
          notification(
            editData?.id ? "Muvofaqiyatli o'zgardi" : "Muvofaqiyatli qo'shildi",
            "success"
          );
          if (!editData?.id) {
            createPandingData(res.data.data);
            if (setConfirm) {
              setConfirm((prev) => ({
                ...prev,
                open: true,
                message: "Yangi mahsulot qo'shmoqchimisiz?",
              }));
            }
          }
        }
      } catch (error) {
        notification(error?.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setSubmitLoading(false);
      }
    },
    [dropdowns, formData, editData, handleClose, createPandingData, setConfirm]
  );

  const CustomSelect = ({
    dropdownName,
    placeholder,
    displayField = "name",
    akk = false,
    disabled = false,
    searchPlaceholder = "Qidirish...",
  }) => {
    const dropdown = dropdowns[dropdownName];
    const scrollableRef = useRef(null);

    useEffect(() => {
      if (dropdown.show && scrollableRef.current) {
        dropdownRef.current[dropdownName] = scrollableRef.current;
      }
    }, [dropdown.show, dropdownName]);

    const debouncedFetch = useCallback(
      debounce((value, page) => {
        const endpoint =
          dropdownName === "event"
            ? value
              ? "events/search"
              : "events/all"
            : dropdownName === "type"
            ? value
              ? "product/types/search"
              : "product/types/all"
            : dropdownName === "childType"
            ? `/child/types/get/by/type/${dropdowns.type.selected}`
            : "warehouses/all";
        fetchData(dropdownName, endpoint, {
          search: value,
          page,
          ...(dropdownName === "childType" ? { limit: 10 } : { limit: 30 }),
        });
      }, 300),
      [fetchData, dropdownName, dropdowns.type.selected]
    );

    const toggleDropdown = useCallback(() => {
      if (disabled) return;
      updateDropdown(dropdownName, { show: !dropdown.show });

      if (
        !dropdown.show &&
        (dropdown.items.length === 0 || dropdown.search) &&
        !dropdown.loading
      ) {
        debouncedFetch(dropdown.search, 1);
      }
    }, [dropdown.show, dropdown.items.length, dropdown.search, dropdown.loading, disabled, debouncedFetch]);

    const handleSelect = useCallback(
      (id) => {
        updateDropdown(dropdownName, { selected: id, show: false });
        if (dropdownName === "type") {
          updateDropdown("childType", {
            selected: null,
            items: [],
            search: "",
            page: 1,
            hasMore: true,
            show: false,
          });
        }
      },
      [dropdownName]
    );

    const loadMore = useCallback(() => {
      if (!dropdown.hasMore || dropdown.loading) return;
      updateDropdown(dropdownName, { page: dropdown.page + 1 });
      debouncedFetch(dropdown.search, dropdown.page + 1);
    }, [dropdown.hasMore, dropdown.loading, dropdown.search, dropdown.page, debouncedFetch]);

    const handleSearchChange = useCallback(
      (value) => {
        updateDropdown(dropdownName, {
          search: value,
          page: 1,
          items: [],
          hasMore: true,
        });
        debouncedFetch(value, 1);
      },
      [dropdownName, debouncedFetch]
    );

    const selectedItem = dropdown.items.find((item) => item.id === dropdown.selected);

    return (
      <div className="relative mb-4">
        <div
          onClick={toggleDropdown}
          className={`flex items-center justify-between border border-gray-300 rounded-md p-2 ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          } transition-colors`}
        >
          <span className={dropdown.selected ? "text-black" : "text-gray-500"}>
            {selectedItem
              ? akk
                ? `Yuk xati raqami - #${selectedItem.event_number}`
                : selectedItem[displayField]
              : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform ${
              dropdown.show ? "rotate-180" : ""
            } ${disabled ? "text-gray-400" : ""}`}
          />
        </div>

        {dropdown.show && !disabled && (
          <ClickAwayListener
            onClickAway={() => updateDropdown(dropdownName, { show: false })}
          >
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden">
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={dropdown.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full border border-gray-300 rounded-md p-2 focus:border-gray-500 focus:ring-gray-500"
                  autoFocus
                />
              </div>

              {dropdown.loading && dropdown.items.length === 0 && (
                <div className="flex justify-center p-2">
                  <CircularProgress size={24} />
                </div>
              )}

              <div className="max-h-60 overflow-y-auto" ref={scrollableRef}>
                {dropdown.items.length > 0 ? (
                  <>
                    {dropdown.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`p-3 hover:bg-gray-100 cursor-pointer ${
                          dropdown.selected === item.id
                            ? "bg-gray-100 font-semibold"
                            : ""
                        }`}
                      >
                        {akk
                          ? `Yuk xati raqami - #${item.event_number}`
                          : item[displayField]}
                      </div>
                    ))}
                    {dropdown.hasMore && (
                      <div className="p-2 border-t border-gray-200 text-center">
                        <button
                          onClick={loadMore}
                          disabled={dropdown.loading}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium py-1 px-3 rounded hover:bg-gray-100"
                        >
                          {dropdown.loading ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Ko'proq ko'rish"
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  !dropdown.loading && (
                    <div className="text-center p-3 text-gray-500">
                      Ma'lumot topilmadi
                    </div>
                  )
                )}
              </div>
            </div>
          </ClickAwayListener>
        )}
      </div>
    );
  };

  const CustomUnitSelect = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Birlik
      </label>
      <select
        name="unit"
        value={formData.unit}
        onChange={(e) => {
          e.stopPropagation();
          handleChange(e);
        }}
        className="w-full border border-gray-300 rounded-md p-2 focus:border-gray-500 focus:ring-gray-500"
        required
      >
        <option value="">Tanlang</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
      }}
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={style}>
        <div className="flex items-center justify-between pb-8">
          <p className="text-xl uppercase">Mahsulot qo'shish</p>
          <button
            onClick={handleClose}
            className="w-8 h-8 hover:bg-gray-100 cursor-pointer flex items-center justify-center rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nomi
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Miqdori
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Narxi
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="expiration_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Yaroqlilik muddati
              </label>
              <input
                id="expiration_date"
                name="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <CustomUnitSelect />
            <CustomSelect
              dropdownName="warehouse"
              placeholder="Omborxonalar"
              searchPlaceholder="Omborxona qidirish"
            />
            <CustomSelect
              dropdownName="event"
              placeholder="Yuk xati"
              searchPlaceholder="Yuk xati qidirish"
              akk={true}
            />
            <CustomSelect
              dropdownName="type"
              placeholder="Mahsulot turi"
              displayField="product_type"
              searchPlaceholder="Mahsulot turi qidirish"
            />
            <CustomSelect
              dropdownName="childType"
              placeholder={
                dropdowns.type.selected
                  ? "Qannday mahsulot"
                  : "Avval turini tanlang"
              }
              displayField="name"
              searchPlaceholder="Qannday mahsulot qidirish"
              disabled={!dropdowns.type.selected}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tavsif
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => {
                  e.stopPropagation();
                  handleChange(e);
                }}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="w-[100px] py-2 bg-[#249B73] rounded-md text-white hover:bg-[#1d7a5a] transition-colors"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <div className="animate-spin flex items-center justify-center">
                  <LoaderCircle />
                </div>
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}