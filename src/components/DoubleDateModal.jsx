import React, { useEffect, useState } from "react";
import { Box, Button, Modal, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDateFilterStore } from "../hooks/useFilterStore";

const DoubleDateModal = () => {
  const [open, setOpen] = useState(false);
  const { startDate, endDate, setEndDate, setStartDate } = useDateFilterStore();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    setStartDate(dayjs());
    setEndDate(dayjs().add(1, "day"));
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ textAlign: "center" }}>
        <div className="cursor-pointer" onClick={handleOpen}>
          Yuk xati sanasi
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          BackdropProps={{
            style: { backgroundColor: "rgba(0, 0, 0, 0.4)" }, // bu esa qorong‘iroq
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "background.paper",
              boxShadow: 24,
              outline: "none",
              p: 4,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
              }}
            >
              <DatePicker
                label="Boshlanish sanasi"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <DatePicker
                label="Tugash sanasi"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <button
                className="text-gray-500 cursor-pointer border border-gray-500 px-5 py-1.5 rounded-md"
                onClick={handleClose}
              >
                Bekor qilish
              </button>
              <button
                className="text-white cursor-pointer w-[150px] bg-[#249B73] px-5 py-1.5 rounded-md"
                onClick={handleClose}
              >
                Tasdiqlash
              </button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default DoubleDateModal;
