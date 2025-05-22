import { ArrowRightFromLine, CirclePlus, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useShopProductsStore } from "../../hooks/useModalState";
import { usePathStore } from "../../hooks/usePathStore";
import $api from "../../http/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import ShopAddModal from "../../modals/shop-add-modal";
import { notification } from "../../components/notification";

export default function AllProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setName } = usePathStore();
  const { onOpen, data, setData, total } = useShopProductsStore();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const columns = [
    { field: "id", headerName: "№" },
    { field: "name", headerName: "Mahsulot nomi" },
    { field: "quantity", headerName: "Dokondagi soni" },
    { field: "price", headerName: "Narxi" },
    { field: "total_price", headerName: "Umumiy narx" },
    { field: "event", headerName: "Holat raqami" },
    { field: "type", headerName: "Mahsulot turi" },
    { field: "actions", headerName: "Amallar" },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await $api.get(`/shops/by/${id}`, {
        params: {
          name: searchQuery
        }
      });

      setData(data.data.products);
      // setTotal(products.length);
    } catch (error) {
      notification(error.response?.data?.message)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    setPage(0)
  }, [id, searchQuery]);

  const nextButton = (row) => {
    setName(row.name);
    navigate(`/maxsulotlar/${row.id}`);
  };

  const paginatedRows = data
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((row, i) => ({
      ...row,
      id: page * rowsPerPage + i + 1,
      quantity: row.ShopProductModel.quantity,
      event: row.event_product?.event_number,
      total_price: row.ShopProductModel.quantity * row.quantity,
      type: row.type_product?.product_type,
      actions: (
        <div className="flex items-center gap-4">
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
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Dokondagi maxsulotlar
        </p>

        <button
          onClick={onOpen}
          className="text-base text-white flex items-center gap-2 bg-[#249B73] px-4 py-2 rounded-md cursor-pointer"
        >
          <CirclePlus />
          <span>Maxsulot qo'shish</span>
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
          rows={paginatedRows}
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
        />
      )}

      <ShopAddModal />
    </div>
  );
}
