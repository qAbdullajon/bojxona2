import { Box, Modal } from "@mui/material";
import { X } from "lucide-react";

const modalStyle = {
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "white",
  boxShadow: 24,
  px: 3,
  py: 2,
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  message,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.4)" }, // bu esa qorong‘iroq
      }}
    >
      <Box sx={modalStyle}>
        <div className="flex items-center justify-between pb-8">
          <p className="text-xl uppercase">{message}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-[#f4f1f1] cursor-pointer flex items-center justify-center"
          >
            <X />
          </button>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer border border-gray-500 px-5 py-1.5"
          >
            Yo'q
          </button>
          <button
            onClick={onConfirm}
            className="text-white cursor-pointer w-[100px] bg-[#249B73] px-5 py-1.5"
          >
            Ha
          </button>
        </div>
      </Box>
    </Modal>
  );
}
