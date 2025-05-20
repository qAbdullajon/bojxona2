import { ArrowRightFromLine, Check, Download, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { usePathStore } from "../../hooks/usePathStore";
import $api from "../../http/api";
import { Box, CircularProgress, Typography, Checkbox } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import ImageGallery from "../../components/ImageGallery";
import { notification } from "../../components/notification";
import { useCheckedStore } from "../../hooks/useCheckedStore";
import ChangeStatus from "../products/change-status";
import { useProductStore } from "../../hooks/useModalState";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";

export default function EventDetail() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { setName } = usePathStore();
  const params = useParams();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [eventFile, setEventFile] = useState([]);
  const [eventImages, setEventImages] = useState([]);
  const { items, toggleItem, clearItems, addAllItems } = useCheckedStore();
  const [status, setStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const { chandeStatusData, setChangeStatusData } = useProductStore();
  const [prices, setPrices] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricesSubmitted, setPricesSubmitted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Barcha tanlangan mahsulotlar uchun narxlar kiritilganligini tekshirish
  const allPricesEntered = () => {
    return items.every((itemId) => {
      const price = prices[itemId];
      return (
        price !== undefined &&
        price !== "" &&
        !isNaN(price) &&
        Number(price) > 0
      );
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      addAllItems(data.map((item) => item.id));
    } else {
      clearItems();
    }
  };

  // Narxlarni o'zgartirish va faqat raqamlarga ruxsat berish
  const handlePriceChange = (productId, value) => {
    // Faqat raqamlar va bo'sh stringga ruxsat berish
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrices((prev) => ({
        ...prev,
        [productId]: value,
      }));
    }
  };

  const columns = [
    {
      field: "check",
      headerName: (
        <Checkbox
          checked={data.length > 0 && items.length === data.length}
          indeterminate={items.length > 0 && items.length < data.length}
          onChange={handleSelectAll}
        />
      ),
      width: 50,
    },
    { field: "index", headerName: "№" },
    { field: "name", headerName: "Nomi" },
    { field: "quantity", headerName: "Soni" },
    { field: "total_price", headerName: "Umumiy narxi" },
    { field: "offender_full_name", headerName: "Huquqbuzar I.F.O." },
    { field: "status", headerName: "Status" },
    { field: "event", headerName: "Yuk xati" },
    { field: "type", headerName: "Mahsulot turi" },
    {
      field: "actions",
      headerName: pricesSubmitted
        ? "Sozlash"
        : chandeStatusData?.status
        ? "Narxi"
        : "Sozlash",
    },
  ];

  const handleEditDesc = async () => {
    if (isEdit) {
      try {
        const res = await $api.patch(`/events/update/${params.id}`, {
          description: updateDesc,
        });

        if (res.status === 200) {
          setIsEdit(false);
          setDescription(updateDesc);
          notification("Muvaffaqiyatli o'zgartirildi", "success");
          setConfirm(false);
        }
      } catch (error) {
        notification(error.response?.data?.message || "Xatolik yuz berdi");
      }
    } else {
      setIsEdit(true);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    if (e.target.value && items.length > 0) {
      setSelectedProduct({
        id: items[0],
        statusProduct: { product_status: "Saqlovda" },
      });
      setModalOpen(true);
    }
  };

  const handleSubmitPrices = async () => {
    if (!chandeStatusData || !allPricesEntered()) return;

    setIsSubmitting(true);
    let hasError = false;
    let globalError = false;

    try {
      const requests = items.map(async (productId) => {
        try {
          const price = prices[productId] || "0";
          const formData = new FormData();

          formData.set(
            "discount_price",
            JSON.stringify([{ price, date: null }])
          );
          formData.set("productId", productId);
          formData.set("sales_document", chandeStatusData.commonData.fileData);
          formData.set("mibId", chandeStatusData.commonData.mibId);
          formData.set(
            "mib_dalolatnoma",
            chandeStatusData.commonData.mib_dalolatnoma
          );
          formData.set("sudId", chandeStatusData.commonData.sudId);
          formData.set(
            "sud_dalolatnoma",
            chandeStatusData.commonData.sud_dalolatnoma
          );
          formData.set("sud_date", chandeStatusData.commonData.sud_date);

          const response = await $api.post("/sales/products/create", formData);
          return response;
        } catch (error) {
          hasError = true;
          notification(
            `Mahsulot ID ${productId} uchun xatolik: ${
              error.response?.data?.message || "Noma'lum xatolik"
            }`,
            "error"
          );
          return null;
        }
      });

      await Promise.all(requests);

      if (hasError) {
        notification(
          "Ba'zi mahsulotlar uchun narxlarni saqlashda xatolik yuz berdi",
          "error"
        );
      } else {
        notification(
          "Barcha mahsulotlar uchun narxlar muvaffaqiyatli saqlandi",
          "success"
        );
        setChangeStatusData();
        setPrices({});
        clearItems();
        setPricesSubmitted(true);

        // Ma'lumotlarni yangilash
        const res = await $api.get(
          `/events/products/by/${params.id}?page=${
            page + 1
          }&limit=${rowsPerPage}`
        );
        // setDataCount(res.data.)
        setData(res.data.data.products);
        setTotal(res.data.data.total);
        
      }
    } catch (error) {
      // Faqat tarmoq yoki serverdagi global xatoliklar uchun
      globalError = true;
      notification(
        "Umumiy xatolik yuz berdi: " +
          (error.response?.data?.message || "Noma'lum xatolik"),
        "error"
      );
    } finally {
      setIsSubmitting(false);

      // Agar global xatolik bo'lsa va mahsulot darajasidagi xatoliklar bo'lmasa
      if (globalError && !hasError) {
        notification(
          "Narxlarni saqlash jarayonida tizim xatosi yuz berdi",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    const getAllEvents = async (page = 1, limit = 100) => {
      setLoading(true);
      try {
        const res = await $api.get(
          searchQuery
            ? `/events/product/search?eventId=${params.id}&name=${searchQuery}&page=${page}&limit=${limit}`
            : `/events/products/by/${params.id}?page=${page}&limit=${limit}`
        );
        setTotalQuantity(res.data.data.totalQuantity);

        const res2 = await $api.get(`/events/by/${params.id}`);
        setDescription(res2.data.data.description);
        setUpdateDesc(res2.data.data.description);
        const offenderName = res2.data.data.offender_full_name;
        const products = searchQuery ? res.data.data : res.data.data.products;
        const enrichedProducts = products.map((item) => ({
          ...item,
          offender_full_name: offenderName,
        }));

        setEventImages(res2.data.data.event_images);
        setEventFile(res2.data.data.event_file);
        setTotal(searchQuery ? res.data.totalItems : res.data.data.total);
        setData(enrichedProducts);
        clearItems();
      } catch (error) {
        notification(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    const getAllStatus = async () => {
      try {
        const res = await $api.get(`/statuses/all`);
        setStatus(res.data.status);
      } catch (error) {
        notification(error.response?.data?.message);
      }
    };

    getAllEvents(page + 1, rowsPerPage);
    getAllStatus();
  }, [page, rowsPerPage, searchQuery]);

  const originalRows = (data || []).map((item, i) => ({
    ...item,
    index: i + 1,
    check: (
      <Checkbox
        checked={items.includes(item.id)}
        onChange={() => toggleItem(item.id)}
      />
    ),
    status: (
      <span
        className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
          item.statusProduct?.product_status
        )}`}
      >
        {item.statusProduct?.product_status}
      </span>
    ),
    event: item.event_product.event_number,
    type: item.type_product.product_type,
  }));

  const nextButton = (row) => {
    setName(row.name);
    navigate(`/maxsulotlar/${row.id}`);
  };

  const rows = (originalRows || []).map((row) => ({
    ...row,
    actions: (
      <div className="flex items-center gap-4">
        {!pricesSubmitted && chandeStatusData?.status ? (
          <input
            type="text"
            className={`border p-2 outline-none w-24 ${
              !prices[row.id] ? "border-red-500" : "border-gray-400"
            }`}
            placeholder="narxi"
            value={prices[row.id] || ""}
            onChange={(e) => handlePriceChange(row.id, e.target.value)}
          />
        ) : (
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => nextButton(row)}
          >
            <ArrowRightFromLine size={16} />
          </button>
        )}
      </div>
    ),
  }));

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-xl text-[#249B73] uppercase font-semibold">
            Yuk xatiga tegishli mahsulotlar ro'yxati
          </p>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <>
                <p className="text-sm text-gray-600 w-[180px]">
                  Tanlanganlar: {items.length}
                </p>
                {chandeStatusData?.status ? (
                  <button
                    className={`px-6 py-2 text-white rounded-sm cursor-pointer flex items-center gap-2 ${
                      allPricesEntered() ? "bg-[#249B73]" : "bg-gray-400"
                    }`}
                    onClick={handleSubmitPrices}
                    disabled={isSubmitting || !allPricesEntered()}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} color="inherit" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      "Saqlash"
                    )}
                  </button>
                ) : (
                  <select
                    onChange={handleStatusChange}
                    value={selectedStatus}
                    className="ml-2 block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring focus:border-[#249B73]"
                  >
                    <option hidden value="">
                      Statusni o'zgartirish
                    </option>
                    {status.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.product_status}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">
            <CircularProgress color="success" />
          </div>
        ) : data?.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Box
              component="img"
              src={NoData}
              alt="No data"
              sx={{ width: 128, height: 128, margin: "0 auto", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              Hech qanday mahsulot topilmadi
            </Typography>
          </Box>
        ) : (
          <>
            <GlobalTable
              columns={columns}
              rows={rows}
              page={page}
              rowsPerPage={rowsPerPage}
              total={total}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              totalQuantity={totalQuantity}
            />
          </>
        )}
        <div>
          <h2>Mahsulotlarning umumiy miqdori</h2>
        </div>
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-2xl">Yuk xati tarifi</p>
            <button
              onClick={() => (isEdit ? setConfirm(true) : setIsEdit(true))}
              className="w-10 h-10 border cursor-pointer border-gray-400 rounded-full flex items-center justify-center"
            >
              {isEdit ? <Check size={24} /> : <Pencil size={20} />}
            </button>
          </div>

          {isEdit ? (
            <textarea
              className="border mt-2 border-gray-300 w-full outline-none p-2"
              value={updateDesc}
              onChange={(e) => setUpdateDesc(e.target.value)}
            />
          ) : (
            <p>{description || "Tarif mavjud emas"}</p>
          )}
        </div>
        <ImageGallery eventImages={eventImages} />

        {eventFile?.length > 0 ? (
          eventFile.map((item) => (
            <a
              key={item}
              className="flex items-center mt-8 gap-3 text-white bg-[#249B73] w-fit px-5 py-2 rounded-md"
              href={`${import.meta.env.VITE_BASE_URL}/${item}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download />
              <span>File ni yuklab olish</span>
            </a>
          ))
        ) : (
          <p className="pt-4">File mavjud emas</p>
        )}
      </div>

      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ChangeStatus
              product={selectedProduct}
              status={selectedStatus}
              eventId={params.id}
              onClose={() => {
                setModalOpen(false);
                setSelectedStatus("");
              }}
            />
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        message={"Kommentariyani o‘zgartirmoqchimisiz?"}
        onConfirm={handleEditDesc}
      />
    </>
  );
}
