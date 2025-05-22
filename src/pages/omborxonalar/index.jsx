import { ArrowRightFromLine, CirclePlus, Pencil, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import GlobalTable from "../../components/global-table";
import $api from "../../http/api";
import NoData from "../../assets/no-data.png";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useWarehouseStore } from "../../hooks/useModalState";
import WarehouseModal from "../../modals/warehouse-modal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notification } from "../../components/notification";
import { formatDate } from "../../utils/dateChecker";

// Custom Toast Component for card-like appearance
const CustomToast = ({ message }) => (
  <div className="flex items-center gap-2 bg-white rounded-md p-2 shadow-md border-l-4 border-[#249B73]">
    <div className="bg-[#249B73] p-1 rounded-full">
      <Check size={16} color="white" />
    </div>
    <div className="text-gray-800 text-sm font-medium">{message}</div>
  </div>
);

export default function Omborxonalar() {
  const { onOpen, setEditData, data, setData, total, setTotal } =
    useWarehouseStore();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    currentPage: 1,
    totalPages: 1,
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "name", headerName: "Nomi" },
    { field: "location", headerName: "Joylashuvi" },
    { field: "productsCount", headerName: "Yuk xatlari soni" },
    { field: "createdAt", headerName: "Sanasi" },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  useEffect(() => {
    const getAllData = async () => {
      try {
        setLoading(true);
        const res = await $api.get(`/warehouses/all`, {
          params: {
            page: pagination.currentPage,
            limit: pagination.rowsPerPage,
            search: searchQuery,
          },
        });
        setData(res.data.warehouses);
        setTotal(res.data.totalItems);
      } catch (error) {
        notification(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    getAllData();
  }, [pagination.currentPage, pagination.rowsPerPage, searchQuery]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [searchQuery]);

  const formattedRows = data.map((row, index) => {
    return {
      ...row,
      id: index + 1,
      productsCount: row.eventsCount,
      createdAt: formatDate(new Date(row.createdAt), "dd-MM-yyyy"),
      actions: (
        <div className="flex items-center gap-3">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => handleEdit(row)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => navigate(`/omborxonalar/${row.id}`)}
          >
            <ArrowRightFromLine size={16} />
          </button>
        </div>
      ),
    };
  });

  const handleEdit = (row) => {
    onOpen();
    setEditData(row);
  };

  // Custom toast with card-like appearance for adding
  const handleAddSuccess = () => {
    toast.success(
      <CustomToast
        message="Omborxona muvaffaqiyatli qo'shildi!"
        type="success"
      />,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast-container",
      }
    );
  };

  // Custom toast with card-like appearance for editing
  const handleEditSuccess = () => {
    toast.success(
      <CustomToast
        message="Omborxona muvaffaqiyatli tahrirlandi!"
        type="success"
      />,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast-container",
      }
    );
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage, // This is for TablePagination (0-based)
      currentPage: newPage + 1, // This is for your API (1-based)
    }));
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0, // Reset to first page
      currentPage: 1, // Reset to first page (1-based)
    }));
  };

  return (
    <div className="p-4">
      {/* Add ToastContainer to render notifications */}
      <ToastContainer />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl text-[#249B73] uppercase font-semibold">
          Mavjud omborxonalar ro'yxati
        </h1>

        <button
          onClick={onOpen}
          className="text-base text-white flex items-center gap-2 bg-[#249B73] px-4 py-2 rounded-md cursor-pointer hover:bg-[#1d7d5d] transition-colors"
        >
          <CirclePlus />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <CircularProgress color="success" />
        </div>
      ) : total === 0 ? (
        <Box textAlign="center" py={10} sx={{userSelect: 'none'}}>
          <Box
            component="img"
            src={NoData}
            alt="No data"
            sx={{ width: 128, height: 128, margin: "0 auto", mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            Hech qanday ma'lumot topilmadi
          </Typography>
        </Box>
      ) : (
        <GlobalTable
          columns={columns}
          rows={formattedRows}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          total={total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <WarehouseModal
        onAddSuccess={handleAddSuccess}
        onEditSuccess={handleEditSuccess}
      />

      {/* Add custom CSS for toast styling */}
      <style>
        {`
    .Toastify__toast-container {
      width: auto !important;
      max-width: 350px;
    }

    .custom-toast-container {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      min-height: auto !important;
      margin-bottom: 10px;
    }

    .toast-card {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: white;
      border-radius: 6px;
      padding: 10px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #249b73;
    }

    .toast-icon {
      background-color: #249b73;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-message {
      color: #333;
      font-size: 14px;
      font-weight: 500;
    }

    .Toastify__toast--success {
      animation: slideInRight 0.3s, fadeOut 0.3s 2.7s forwards;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `}
      </style>
    </div>
  );
}
