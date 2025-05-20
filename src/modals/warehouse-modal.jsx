import React, { useState, useEffect } from "react";
import { Box, Modal, Typography } from "@mui/material";
import { X } from "lucide-react";
import $api from "../http/api";
import { notification } from "../components/notification";
import { useWarehouseStore } from "../hooks/useModalState";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function WarehouseModal() {
  const { open, onClose, editData, createData, updateState } = useWarehouseStore();
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formRemover = () => {
    onClose(), setFormData({ name: "", location: "" });
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        location: editData.location || "",
      });
    } else {
      setFormData({ name: "", location: "" });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.name.trim() || !formData.location.trim()) {
        throw new Error("Barcha maydonlarni to'ldiring");
      }

      if (editData?.id) {
        const res = await $api.patch(
          `/warehouses/update/${editData.id}`,
          formData
        );
        if(res.status === 200) {
          updateState({...formData, id: editData.id})
          formRemover()
          notification("Omborxona muvaffaqiyatli tahrirlandi", "success");
        }
      } else {
        const res = await $api.post("/warehouses/create", formData);
        if (res.status === 201) {
          createData(res.data.data);
          notification("Yangi omborxona muvaffaqiyatli qo'shildi", "success");
          formRemover();
        }
      }
    } catch (error) {
      console.error("Xatolik:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Xatolik yuz berdi";
      setError(errorMessage);
      notification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={formRemover}>
      <Box sx={style}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">
              {editData?.id
                ? "Omborxonani tahrirlash"
                : "Yangi omborxona qo'shish"}
            </h2>
            <button
              type="button"
              onClick={formRemover}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm text-gray-600">
                Omborxona nomi <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm text-gray-600">
                Joylashuvi <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={formRemover}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#249B73] rounded-md text-white hover:bg-[#1d7a5a] transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">↻</span>
                    Saqlanmoqda...
                  </span>
                ) : editData?.id ? (
                  "Saqlash"
                ) : (
                  "Qo'shish"
                )}
              </button>
            </div>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
