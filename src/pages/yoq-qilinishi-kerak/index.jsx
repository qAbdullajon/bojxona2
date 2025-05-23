import { ArrowRightFromLine, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import $api from "../../http/api";
import NoData from "../../assets/no-data.png";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getStatusStyle } from "../../utils/status";
import { format } from "date-fns";

export default function YoqQilingan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0, // MUI uchun 0-based
    rowsPerPage: 100,
    total: 0,
    currentPage: 1, // API uchun 1-based
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
    { field: "mib_number", headerName: "MIB ning dalolatnoma raqami" },
    { field: "mib_region", headerName: "MIB ning hududi" },
    { field: "sud_number", headerName: "Sudning ijro varaqa no'meri" },
    { field: "sud_region", headerName: "Sudning hududi" },
    { field: "sud_date", headerName: "Sudning sanasi" },
    { field: "status", headerName: "Status" },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await $api.get(
        "/statuses/products/by/ed207621-3867-4530-8886-0fa434dedc19",
        {
          params: {
            page: pagination.currentPage,
            limit: pagination.rowsPerPage,
            search: searchQuery,
          },
        }
      );
      console.log(res);

      setData(res.data.data.data);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.pagination.totalItems || 0,
      }));
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage, searchQuery]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [searchQuery]);

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1, // API uchun 1-based
    }));
  };

  const handleRowsPerPageChange = (value) => {
    const newRowsPerPage = parseInt(value);
    setPagination({
      page: 0,
      rowsPerPage: newRowsPerPage,
      currentPage: 1,
      total: pagination.total,
    });
  };
  const rows = data.map((row, index) => {
    const lastDestroyed =
      row.destroyed_product?.[row.destroyed_product.length - 1];

    return {
      id: index + 1 + pagination.page * pagination.rowsPerPage,
      name: row.name || "Noma’lum",
      event_number: row?.event_product?.event_number
        ? "#" + row.event_product.event_number
        : "Noma’lum",
      mib_region: lastDestroyed?.mib_document?.name || "Yo'q",
      mib_number: lastDestroyed?.mib_dalolatnoma || "Yo'q",
      sud_number: lastDestroyed?.sud_dalolatnoma || "Yo'q",
      sud_region: lastDestroyed?.sud_document?.name || "Yo'q",
      sud_date: lastDestroyed?.sud_date
        ? format(new Date(lastDestroyed.sud_date), "yyyy-MM-dd")
        : "Noma'lum",
      total_price: row.total_price || "0",
      status: (
        <span
          className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
            row.statusProduct?.product_status || "Noma'lum"
          )}`}
        >
          {row.statusProduct?.product_status || "Noma'lum"}
        </span>
      ),
      actions: (
        <div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() =>
              row.event_product?.id &&
              navigate(`/holatlar/${row.event_product.id}`)
            }
          >
            <ArrowRightFromLine size={16} />
          </button>
        </div>
      ),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          mavjud Yo'q qilingan yuk xatlar
        </p>
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
          total={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
}
