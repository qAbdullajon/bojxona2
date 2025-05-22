import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import $api from "../../http/api";
import { format } from "date-fns";
import {
  ArrowRightFromLine,
  Check,
  CircleCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import NoData from "../../assets/no-data.png";
import { Box, Dialog, Typography, Checkbox } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProductStore } from "../../hooks/useModalState";
import { notification } from "../../components/notification";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";

export default function PandingProducts() {
  const {
    createData,
    setEditData,
    onOpen: openModal,
    setPandingData,
    deleteItem,
    pandingData,
  } = useProductStore();
  const [total, setTotal] = useState(0);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    currentPage: 1,
  });
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    name: null,
  });
  const [selectedProducts, setSelectedProducts] = useState([]); // Tanlangan mahsulotlar
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false); // Bir nechta tasdiqlash dialogi

  // Checkbox uchun column qo'shamiz
  const columns = [
    {
      field: "checkbox",
      headerName: (
        <Checkbox
          checked={
            selectedProducts.length === pandingData.length &&
            pandingData.length > 0
          }
          indeterminate={
            selectedProducts.length > 0 &&
            selectedProducts.length < pandingData.length
          }
          onChange={(e) => handleSelectAll(e)}
        />
      ),
      width: 50,
    },
    { field: "id", headerName: "№" },
    { field: "name", headerName: "Mahsulot nomi" },
    { field: "price", headerName: "Narxi" },
    { field: "createdAt", headerName: "Qo'shilgan sana" },
    { field: "action", headerName: "Tasdiqlash" },
  ];

  // Barchasini tanlash/olib tashlash
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(pandingData.map((item) => item.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Bitta mahsulotni tanlash/olib tashlash
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Bir nechta mahsulotlarni tasdiqlash
  const bulkUpdateAccess = async () => {
    try {
      const requests = selectedProducts.map((productId) =>
        $api.patch(`products/update/${productId}`, {
          statusId: "01f8dafe-c399-4d04-9814-31b572e95f0d",
          access_product: true,
        })
      );

      await Promise.all(requests);
      notification(
        `${selectedProducts.length} ta mahsulot muvaffaqiyatli tasdiqlandi`,
        "success"
      );
      setSelectedProducts([]);
      setBulkConfirmOpen(false);

      // Ma'lumotlarni yangilash
      const res = await $api.get("/products/get/access?access_product=false", {
        params: {
          page: pagination.currentPage,
          limit: pagination.rowsPerPage,
          search: search,
        },
      });
      setPandingData(res.data.productData);
      setTotal(res.data.total);
    } catch (error) {
      notification(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };
  const handleDelete = async () => {
    if (confirm.open) {
      try {
        const res = await $api.delete(`products/delete/${confirm.id}`);
        if (res.status === 200) {
          deleteItem(confirm.id);
          setConfirm((prev) => ({ ...prev, open: false }));
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // Bitta mahsulotni tasdiqlash (oldingi funksiya)
  const updateAccess = async () => {
    try {
      const res = await $api.patch(`products/update/${product.id}`, {
        statusId: "01f8dafe-c399-4d04-9814-31b572e95f0d",
        access_product: true,
      });
      if (res.status === 200) {
        setOpen(false);
        notification("Mahsulot muvaffaqiyatli tasdiqlandi", "success");

        // Ma'lumotlarni yangilash
        const res = await $api.get(
          "/products/get/access?access_product=false",
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.rowsPerPage,
              search: search,
            },
          }
        );
        setPandingData(res.data.productData);
        setTotal(res.data.total);
      }
    } catch (error) {
      notification(error.response?.data?.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await $api.get(
          "/products/get/access?access_product=false",
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.rowsPerPage,
              search: search,
            },
          }
        );
        setPandingData(res.data.productData);
        setTotal(res.data.total);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.rowsPerPage, search]);

  const onClose = () => {
    setProduct(null);
    setOpen(false);
  };

  const onOpen = (row) => {
    setOpen(true);
    setProduct(row);
    createData({ ...row, statusProduct: { product_status: "Saqlovda" } });
  };

  const editData = (row) => {
    setEditData(row);
    openModal();
  };
  console.log(pandingData);

  const formattedRows =
    pandingData.length > 0 &&
    pandingData.map((row, index) => ({
      ...row,
      id: index + 1,
      checkbox: (
        <Checkbox
          checked={selectedProducts.includes(row.id)}
          onChange={() => handleSelectProduct(row.id)}
        />
      ),
      createdAt: row?.createdAt
        ? format(new Date(row?.createdAt), "dd-MM-yyyy")
        : "",
      action: (
        <div className="flex gap-4">
          <button
            onClick={() => onOpen(row)}
            className="border border-gray-500 rounded-full p-1 cursor-pointer"
          >
            <Check size={17} />
          </button>
          <button
            onClick={() =>
              setConfirm((prev) => ({
                ...prev,
                open: true,
                name: row.name,
                id: row.id,
              }))
            }
            className="border border-gray-500 rounded-full p-1 cursor-pointer"
          >
            <Trash2 size={17} />
          </button>
          <button
            onClick={() => editData(row)}
            className="border border-gray-500 rounded-full p-1 cursor-pointer"
          >
            <Pencil size={17} />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => navigate(`/maxsulotlar/${row.id}`)}
          >
            <ArrowRightFromLine size={16} />
          </button>
        </div>
      ),
    }));

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
    <div className="p-4">
      {/* Bir nechta tasdiqlash tugmasi */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <span>Tanlanganlar: {selectedProducts.length}</span>
          <button
            onClick={() => setBulkConfirmOpen(true)}
            className="bg-[#249B73] text-white px-4 py-2 rounded"
          >
            Tasdiqlash ({selectedProducts.length})
          </button>
        </div>
      )}

      {total === 0 ? (
        <Box textAlign="center" py={10} sx={{userSelect: 'none'}}>
          <Box
            component="img"
            src={NoData}
            alt="No data"
            sx={{ width: 128, height: 128, margin: "0 auto", mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            Ma'lumotlar topilmadi
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

      {/* Bitta mahsulotni tasdiqlash dialogi */}
      <Dialog open={open} onClose={onClose}>
        <div className="w-[400px] flex flex-col items-center p-4">
          <CircleCheck size={48} color="green" />
          <p className="text-center text-2xl pt-4">
            Siz mahsulotni tasdiqlamochimisiz?
          </p>
          <button
            onClick={updateAccess}
            className="w-full bg-[green] text-white py-2 rounded-md mt-4 cursor-pointer"
          >
            Ha
          </button>
        </div>
      </Dialog>

      {/* Bir nechta mahsulotlarni tasdiqlash dialogi */}
      <Dialog open={bulkConfirmOpen} onClose={() => setBulkConfirmOpen(false)}>
        <div className="w-[400px] flex flex-col items-center p-4">
          <CircleCheck size={48} color="green" />
          <p className="text-center text-2xl pt-4">
            {selectedProducts.length} ta mahsulotni tasdiqlamochimisiz?
          </p>
          <button
            onClick={bulkUpdateAccess}
            className="w-full bg-[green] text-white py-2 rounded-md mt-4 cursor-pointer"
          >
            Ha, Tasdiqlash
          </button>
        </div>
      </Dialog>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm((prev) => ({ ...prev, open: false }))}
        message={
          <span>
            Siz{" "}
            <span className="text-red-500 font-semibold">{confirm.name}</span>{" "}
            ni o'chirmoqchimisiz?
          </span>
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
