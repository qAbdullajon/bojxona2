import {
  FileText,
  MapPin,
  Pencil,
  Phone,
  Shield,
  User,
  Clock,
  Calendar,
  Plus,
  Search,
  Eye,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import $api from "../../http/api";
import { useSearchParams } from "react-router-dom";
import { formatDate } from "../../utils/dateChecker";

export default function UsersList() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [imageModal, setImageModal] = useState({ open: false, url: "" });

  const handleOpen = (imgPath) => {
    if (!imgPath) return;
    const fullUrl = `${import.meta.env.VITE_BASE_URL}/${imgPath}`;
    setImageModal({ open: true, url: fullUrl });
  };

  const handleClose = () => {
    setImageModal({ open: false, url: "" });
  };

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 100,
    total: 0,
    currentPage: 1,
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "full_name", headerName: "F.I.O" },
    { field: "phone_number", headerName: "Telefon" },
    { field: "region", headerName: "Hudud" },
    { field: "role", headerName: "Roli" },
    { field: "last_login", headerName: "Faollik" },
  ];

  const fetchData = async () => {
    try {
      const res = await $api.get(
        searchQuery ? `/users/search?q=${searchQuery}` : "/users/all",
        {
          params: {
            page: pagination.currentPage,
            limit: pagination.rowsPerPage,
          },
        }
      );

      setData(res.data.employees || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.totalItems || 0,
      }));
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage, searchQuery]);

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
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

  const filteredEmployees = data.filter((user) =>
    `${user.name} ${user.last_name} ${user.middle_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const rows = filteredEmployees.map((employee, index) => {
    let roleText = "Musodara bo‘limi xodimi";
    let roleClass = "bg-green-100 text-green-800";
    if (employee.is_super_admin) {
      roleText = "IT bo‘lim xodimi";
      roleClass = "bg-purple-100 text-purple-800";
    } else if (employee.is_admin) {
      roleText = "Admin";
      roleClass = "bg-blue-100 text-blue-800";
    }

    const avatarUrl = employee.avatar
      ? `${import.meta.env.VITE_BASE_URL}/${employee.avatar}`
      : null;

    return {
      id: index + 1 + pagination.page * pagination.rowsPerPage,
      full_name: (
        <div className="flex items-center">
          <div className="relative group flex-shrink-0 h-10 w-10">
            <button
              onClick={() => handleOpen(employee.avatar)}
              className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-green-600" />
            </button>

            {avatarUrl ? (
              <img
                className="h-10 w-10 rounded-full object-cover border border-white shadow"
                src={avatarUrl}
                alt="Employee Avatar"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#10865e]/10 flex items-center justify-center border border-white shadow">
                <User className="h-6 w-6 text-[#10865e]" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {employee.last_name} {employee.name}
            </div>
            <div className="text-sm text-gray-500">{employee.middle_name}</div>
            <div className="text-xs text-gray-500 flex items-center mt-1">
              <FileText className="h-3 w-3 mr-1" />
              {employee.passport_series} {employee.passport_number}
            </div>
          </div>
        </div>
      ),
      phone_number: (
        <div className="text-sm text-gray-900 flex items-center">
          <Phone className="h-4 w-4 mr-1 text-gray-500" />
          {employee.phone_number}
        </div>
      ),
      region: (
        <div className="text-sm text-gray-900 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
          {employee.residential_address || "Noma’lum"}
        </div>
      ),
      role: (
        <span
          className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${roleClass}`}
        >
          {(employee.is_super_admin || employee.is_admin) && (
            <Shield className="h-3 w-3 mr-1" />
          )}
          {roleText}
        </span>
      ),
      last_login: (
        <div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            {formatDate(employee.last_login)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <Calendar className="h-3 w-3 inline mr-1" />
            Yaratilgan: {formatDate(employee.createdAt).split(",")[0]}
          </div>
        </div>
      ),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#10865e] uppercase font-semibold">
          Foydalanuvchilar ro'yxati
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Qidirish..."
              className="w-[300px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <GlobalTable
        columns={columns}
        rows={rows}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        total={pagination.total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {imageModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={imageModal.url}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={handleClose}
              className="absolute -top-10 right-0 p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
