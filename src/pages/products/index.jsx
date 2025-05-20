import { ArrowRightFromLine, CirclePlus, Pencil, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import {
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useProductStore } from "../../hooks/useModalState";
import { usePathStore } from "../../hooks/usePathStore";
import $api from "../../http/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import ProductModal from "../../modals/product-modal";
import { getStatusStyle } from "../../utils/status";
import IsAddProduct from "../../components/Add-product/IsAddProduct";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";

export default function Products() {
  const { onOpen, data, setData, total, setTotal } = useProductStore();
  const { setName } = usePathStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event", headerName: "Holat raqami", width: 100 },
    { field: "name", headerName: "Nomi" },
    { field: "quantity", headerName: "Soni" },
    { field: "price", headerName: "Narxi" },
    { field: "total_price", headerName: "Umumiy narx" },
    { field: "status", headerName: "Status", width: 100 },
    { field: "type", headerName: "Turi" },
    { field: "actions", headerName: "Amallar" },
  ];
  const handleDelete = async () => {
    if (confirm.open) {
      const res = await $api.delete(`products/delete/${confirm.id}`);
      if (res.status === 200) {
        setData(data.filter((item) => item.id !== confirm.id));
        setConfirm((prev) => ({ ...prev, open: false }));
      }
    }
  };
  // useEffect(() => {
  //   if (isOnSubmit && type === "product-detail") {
  //     const productDeleted = async () => {
  //       const res = await $api.delete(`products/delete/${productId}`);
  //       if (res.status === 200) {
  //         setData(data.filter((item) => item.id !== productId));
  //         setIsOnSubmit(false);
  //       }
  //     };
  //     productDeleted();
  //   }
  // }, [isOnSubmit]);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        setLoading(true);
        const res = await $api.get(
          searchQuery
            ? `/products/search?search=${searchQuery}`
            : `/products/all`,
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.rowsPerPage,
            },
          }
        );
        console.log(res);

        setData(searchQuery ? res.data.products : res.data.data);
        setTotal(res.data.total);
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, [pagination.currentPage, pagination.rowsPerPage, searchQuery]);

  const formattedRows = data.map((row, index) => ({
    ...row,
    id: index + 1,
    status: (
      <span
        className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
          row.statusProduct?.product_status || "Saqlovda"
        )}`}
      >
        {row.statusProduct?.product_status}
      </span>
    ),
    event: "#" + row.event_product?.event_number || "Noma'lum",
    type: row.type_product?.product_type || "Noma'lum",
    actions: (
      <div className="flex items-center gap-2">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
          onClick={() => setConfirm((prev) => ({ ...prev, open: true, id: row.id }))}
        >
          <Trash size={16} />
        </button>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
          onClick={() => nextButton(row)}
        >
          <ArrowRightFromLine size={16} />
        </button>
      </div>
    ),
  }));

  const nextButton = (row) => {
    setName(row.name);
    navigate(`/maxsulotlar/${row.id}`);
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
    }));
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setPagination({
      page: 0,
      rowsPerPage: newRowsPerPage,
      currentPage: 1,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Mahsulotlar ro'yxati
        </p>
        <button
          onClick={onOpen}
          className="text-base text-white flex items-center gap-2 bg-[#249B73] px-4 py-2 rounded-md cursor-pointer"
        >
          <CirclePlus />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {/* NAVBAR */}
      <div className="flex gap-4 mb-6">
        <NavLink
          to="/maxsulotlar"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
              isActive
                ? "bg-[#249B73] text-white shadow"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`
          }
        >
          Maxsulotlar
        </NavLink>
        <NavLink
          to="/maxsulotlar/panding"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
              isActive
                ? "bg-[#249B73] text-white shadow"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`
          }
        >
          Hali tasdiqlanmagan mahsulotlar
        </NavLink>
      </div>
      {location.pathname === "/maxsulotlar" ? (
        loading ? (
          <div className="flex justify-center mt-10">
            <CircularProgress color="success" />
          </div>
        ) : total === 0 ? (
          <Box textAlign="center" py={10}>
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
        )
      ) : (
        <Outlet />
      )}

      <ProductModal />
      <IsAddProduct />
      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm((prev) => ({ ...prev, open: false }))}
        message={"Rostanham o'chirmoqchimisiz?"}
        onConfirm={handleDelete}
      />
    </div>
  );
}
