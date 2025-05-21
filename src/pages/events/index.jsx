import { ArrowRightFromLine, CirclePlus, Pencil, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useEventStore } from "../../hooks/useModalState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePathStore } from "../../hooks/usePathStore";
import { format } from "date-fns";
import EventsModal from "../../modals/holatlar-modal";
import $api from "../../http/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import IsAddProduct from "../../components/Add-product/IsAddProduct";
import { notification } from "../../components/notification";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";

export default function Events() {
  const navigate = useNavigate();
  const {
    onOpen,
    data,
    pageTotal,
    setData,
    setTotal,
    setEditData,
    type,
    isOnSubmit,
  } = useEventStore();
  const { setName } = usePathStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [confirm, setConfirm] = useState({ open: false, id: null, event_number: null });

  useEffect(() => {
    const fetchData = async (page = 1, limit = 100) => {
      setLoading(true);
      try {
        const res = await $api.get(
          `/events/${
            searchQuery ? "search" : "all"
          }?page=${page}&limit=${limit}&search=${searchQuery || ""}`
        );
        setData(res.data.events || []);
        setTotal(res.data.total);
      } catch (error) {
        notification(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(page + 1, rowsPerPage);
  }, [page, rowsPerPage, searchQuery]);

  const columns = [
    { field: "index", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
    { field: "date", headerName: "Yuk xati sanasi" },
    { field: "productsCount", headerName: "Maxsulotlar turining soni" },
    { field: "totalQuantity", headerName: "Umumiy mahsulotlar soni" },
    { field: "shipperName", headerName: "Yetkazib beruvchi" },
    { field: "status", headerName: "Status" },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  const originalRows = data.map((item, i) => ({
    id: item.id,
    index: page * rowsPerPage + i + 1,
    event_number: item.event_number,
    shipperName: item.shipperName,
    totalQuantity: item.totalQuantity,
    status: (
      <div className="flex flex-wrap gap-1">
        {item.productStatuses?.map((status) => (
          <span
            key={status}
            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </span>
        ))}
      </div>
    ),
    productsCount: item.productsCount,
    date: format(new Date(item.date), "dd-MM-yyyy"),
  }));

  const handleEdit = (row) => {
    onOpen();
    setEditData(row);
  };

  const handleDelete = async () => {
    if (confirm.open) {
      try {
        const res = await $api.delete(`events/delete/${confirm.id}`);
        if (res.status === 200) {
          setData(data.filter((item) => item.id !== confirm.id));
          setConfirm((prev) => ({ ...prev, open: false }));
        }
      } catch (error) {
        notification(error?.response?.data?.message);
      }
    } else {
      setConfirm((prev) => ({ ...prev, open: true }));
    }
  };

  useEffect(() => {
    if (type === "event-delete") {
      const eventDelete = async () => {};
      eventDelete();
    }
  }, [isOnSubmit]);
  const nextButton = (row) => {
    setName(row.name);
    navigate(`/holatlar/${row.id}`);
  };

  const rows = originalRows.map((row) => ({
    ...row,
    actions: (
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            setConfirm((prev) => ({ ...prev, open: true, id: row.id, event_number: row.event_number }))
          }
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
        >
          <Trash size={16} />
        </button>
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

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Mavjud yuk xatlar ro'yxati
        </p>
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
      ) : pageTotal === 0 ? (
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
          rows={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          total={pageTotal}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <IsAddProduct />
      <EventsModal />
      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm((prev) => ({ ...prev, open: false }))}
        onConfirm={handleDelete}
        message={
          <span>
            Siz{" "}
            <span className="text-red-500 font-semibold">{confirm.event_number}</span>{" "} id ga tegishli yuk xatini
            o'chirmoqchimisiz?
          </span>
        }
      />
    </>
  );
}
