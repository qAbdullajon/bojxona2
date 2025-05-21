import { ArrowRightFromLine, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import $api from "../../http/api";
import { format } from "date-fns";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import { notification } from "../../components/notification";

export default function Arxive() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

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

  useEffect(() => {
    const getAllArchive = async () => {
      try {
        setLoading(true);
        const res = await $api.get(
          `/products/get/archive?page=${pagination.page + 1}&limit=${pagination.rowsPerPage}&search=${searchQuery}`
        );
        setData(res.data.products);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.data.currentPage,
          total: res.data.total,
          totalPages: res.data.totalPages,
        }));
      } catch (error) {
        notification(error.response?.data?.message)
      } finally {
        setLoading(false);
      }
    };
    getAllArchive();
  }, [pagination.rowsPerPage, pagination.page, searchQuery]);

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

const rows = data.map((row, i) => {
  const statusId = row.statusProduct?.id;
  const destroyed = row.destroyed_product;
  const sales = row.sales_product;
  const documents = row.document_product;

  let lastSource = null;

  if (statusId === "ed207621-3867-4530-8886-0fa434dedc19" && destroyed?.length) {
    lastSource = destroyed[destroyed.length - 1];
  } else if (statusId === "3cb7247b-88b9-4769-bbfa-47341e339b89" && sales?.length) {
    lastSource = sales[sales.length - 1];
  } else if (documents?.length) {
    lastSource = documents[documents.length - 1];
  }

  const mibRegion =
    lastSource?.mib_document?.name || // document_product
    lastSource?.mib_destroyed_product?.name || // destroyed_product
    lastSource?.mib_sales_product?.name || // sales_product
    "Noma’lum";

  const mibNumber =
    lastSource?.mib_dalolatnoma || // document_product yoki destroyed_product
    lastSource?.mib_destroyed_product?.mib_number ||
    lastSource?.mib_sales_product?.mib_number ||
    "Noma’lum";

  const sudNumber =
    lastSource?.sud_dalolatnoma ||
    lastSource?.sud_destroyed_product?.sud_dalolatnoma ||
    lastSource?.sud_sales_product?.sud_dalolatnoma ||
    "Noma’lum";

  const sudRegion =
    lastSource?.sud_document?.name ||
    lastSource?.sud_destroyed_product?.name ||
    lastSource?.sud_sales_product?.name ||
    "Noma’lum";

  const sudDate = lastSource?.sud_date
    ? format(new Date(lastSource.sud_date), "yyyy-MM-dd")
    : "Noma’lum";


  return {
    ...row,
    id: i + 1 + pagination.page * pagination.rowsPerPage,
    name: row.name || "Noma’lum",
    event_number: "#" + `${row.event_product?.event_number}` || "Noma’lum",
    mib_region: mibRegion,
    mib_number: mibNumber,
    sud_number: sudNumber,
    sud_region: sudRegion,
    sud_date: sudDate,
    status: (
      <span
        className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
          row.statusProduct?.product_status
        )}`}
      >
        {row.statusProduct?.product_status}
      </span>
    ),
    actions: (
      <div>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
          onClick={() => navigate(`/holatlar/${row.event_product?.id}`)}
        >
          <ArrowRightFromLine size={16} />
        </button>
      </div>
    ),
  };
});

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="text-xl text-[#249B73] uppercase font-semibold">
            Mavjud arxivdagilar ro'yxati
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center mt-10">
            <CircularProgress color="success" />
          </div>
        ) : pagination.total === 0 ? (
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
            page={pagination.page}
            rowsPerPage={pagination.rowsPerPage}
            total={pagination.total}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </div>
    </>
  );
}
