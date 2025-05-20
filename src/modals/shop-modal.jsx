import { Box, Modal, TextField } from "@mui/material";
import React, { useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { useShopStore } from "../hooks/useModalState";
import $api from "../http/api";
import { notification } from "../components/notification";

const style = {
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "white",
  boxShadow: 24,
  px: 3,
  py: 2,
  borderRadius: "8px",
};

export default function ShopModal() {
  const { open, onClose, createData, setPageTotal, editData, setUpdateData } = useShopStore();
  const [loading, setLoading] = useState();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name } = e.target;

    setLoading(true);
    if (editData?.id) {
      try {
        const res = await $api.patch(`/shops/update/${editData.id}`, {
          name: name.value,
        });
        if (res.status === 200) {
          notification("Muvofaqiyatli o'zgardi", "success");
          setUpdateData({...editData, name: name.value})
          onClose();
        }
      } catch (error) {
        notification(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await $api.post("shops/create", { name: name.value });
        createData({ ...res.data.createdData, productsCount: 0 });
        if (res.status === 201) {
          notification("Muvofaqiyatli qo'shildi", "success");
          onClose();
          setPageTotal(true);
        }
      } catch (error) {
        notification(error.response.data?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <div className="flex items-center justify-between pb-8">
          <p className="text-xl uppercase">Yangi do'kon qoshish</p>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-[#f4f1f1] cursor-pointer flex items-center justify-center"
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField
            name="name"
            defaultValue={editData?.name || ""}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderWidth: "1px",
                  borderColor: "gray",
                },
                "&:hover fieldset": {
                  borderColor: "gray",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: "1px",
                  borderColor: "gray",
                },
              },
              "& .MuiInputLabel-root": {
                color: "gray",
                fontSize: "16px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "black",
              },
            }}
            fullWidth
            size="small"
            label="Do'kon nomi"
          />
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 cursor-pointer border border-gray-500 px-5 py-1.5 rounded-md"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="text-white cursor-pointer w-[100px] bg-[#249B73] px-5 py-1.5 rounded-md"
            >
              {loading ? (
                <div className="flex items-center justify-center animate-spin">
                  <LoaderCircle />
                </div>
              ) : "Saqlash"}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
