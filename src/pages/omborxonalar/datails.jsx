import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import $api from "../../http/api";
import { format } from "date-fns";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { ArrowRightFromLine } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { notification } from "../../components/notification";
import { getStatusStyle } from "../../utils/status";

export default function WarehousesDetails() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const parmas = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");


  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    currentPage: 1,
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
    { field: "createdAt", headerName: "Yaratilgan sana" },
    { field: "status", headerName: "Status" },
    { field: "products_count", headerName: "Maxsulot soni" },
    { field: "actions", headerName: "Harakatlar" },
  ];

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        const res = await $api.get(
          searchQuery
            ? `/warehouses/product/search?name=${searchQuery}&warehouseId=${parmas.id}`
            : `/warehouses/products/by/${parmas.id}`,
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.rowsPerPage,
            },
          }
        );
        if (res.status === 200) {
          console.log(res.data);

          setData(searchQuery ? res.data.events : res.data.events);
          setTotal(res.data.totalItems);
        }
      } catch (error) {
        notification(error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    getDetails();
  }, [pagination.currentPage, pagination.rowsPerPage, searchQuery]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [searchQuery]);

  const formattedRows = data?.map((row, index) => {
    const createdAtRaw = searchQuery ? row?.event.date : row?.event?.date;

    const eventNumber = searchQuery
      ? row?.event.event_number
      : row?.event?.event_number ?? "";

    return {
      ...row,
      id: ` ${index + 1}`,
      createdAt: createdAtRaw
        ? format(new Date(createdAtRaw), "dd-MM-yyyy")
        : "Nomaʼlum sana",
      event_number: '#' + eventNumber || "Nomaʼlum",
      products_count: row.productsCount,
      status: (
        <div className="flex flex-wrap gap-1">
          {row.productStatuses?.map((status) => (
            <span
              key={status}
              className={`mr-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </span>
          ))}
        </div>
      ),
      actions: (
        <div>
          <Link
            to={`/holatlar/${row?.event?.id || row.id}`}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
          >
            {console.log(row)}
            <ArrowRightFromLine size={16} />
          </Link>
        </div>
      ),
    };
  });

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
      <h1 className="text-xl text-[#249B73] uppercase font-semibold mb-5">
        Batafsil ma'lumotlar
      </h1>

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
    </div>
  );
}
