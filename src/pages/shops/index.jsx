import { ArrowRightFromLine, CirclePlus, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useShopStore } from "../../hooks/useModalState";
import { usePathStore } from "../../hooks/usePathStore";
import $api from "../../http/api";
import ShopModal from "../../modals/shop-modal";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";

export default function Shops() {
  const { onOpen, setData, data, isAddPageTotal, setPageTotal, setEditData, total, setTotal } =
    useShopStore();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setName } = usePathStore();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    if (isAddPageTotal) {
      setPagination({ ...pagination, total: pagination.total + 1 });
      setPageTotal(false);
    }
  }, [isAddPageTotal]);

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event);
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      page: 0,
      currentPage: 1,
    }));
  };

  const columns = [
    { field: "id", headerName: "№" },
    { field: "name", headerName: "Nomi" },
    { field: "region", headerName: "Joylashuvi" },
    { field: "total_product", headerName: "Umumiy maxsulotlar soni" },
    { field: "actions", headerName: "Action" },
  ];

  async function fetchShops() {
    try {
      setLoading(true);
      const res = await $api.get(`/shops/all`, {
        params: {
          page: pagination.page + 1,
          limit: pagination.rowsPerPage,
          name: searchQuery
        },
      });      
      setTotal(res.data.meta.total)
      
      setPagination((prev) => ({
        ...prev,
        total: res.data.meta.total,
        totalPages: res.data.meta.totalPages,
      }));
      setData(res.data.data);
    } catch (error) {
      console.error("Dokonlar olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShops();
  }, [pagination.page, pagination.rowsPerPage, searchQuery]);

    useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [searchQuery]);

  const handleEdit = (row) => {
    setEditData(row);
    onOpen();
  };

  const nextButton = (row) => {
    setName(row.name);
    navigate(`/dokonlar/${row.id}`);
  };

  const rows = data.map((row, i) => ({
    ...row,
    id: i + 1,
    region: row.region_shops?.name,
    total_product: row.productsCount,
    actions: (
      <div className="flex items-center gap-4">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
          onClick={() => handleEdit(row)}
        >
          <Pencil size={16} />
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

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-xl text-[#249B73] uppercase font-semibold">
            Mavjud dokonlar ro'yxati
          </p>

          <button
            onClick={onOpen}
            className="text-base text-white flex items-center gap-2 bg-[#249B73] px-4 py-2 rounded-md cursor-pointer"
          >
            <CirclePlus />
            <span>Yangi qo'shish</span>
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">
            <CircularProgress color="success" />
          </div>
        ) : data.length === 0 ? (
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
            rows={rows}
            page={pagination.page}
            rowsPerPage={pagination.rowsPerPage}
            total={total}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}

        <ShopModal />
      </div>
    </>
  );
}
