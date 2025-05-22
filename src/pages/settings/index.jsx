import $api from "../../http/api";
import { useEffect, useState } from "react";
import {
  Pencil,
  User,
  Lock,
  Bell,
  Shield,
  LogOut,
  Eye,
  X,
  CheckCheck,
} from "lucide-react";
import { formatDate } from "../../utils/dateChecker";
import { useNavigate } from "react-router-dom";
import { notification } from "../../components/notification";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";
import { Pagination } from "@mui/material";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotView, setIsNotView] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await $api.get("/users/profile/me");
        setUser(res.data.data);
        setFormData(res.data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        notification(
          error.response?.data?.message || "Failed to fetch profile data"
        );
      }
    };
    fetchUser();
  }, []);

  // Fetch notifications with pagination
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await $api.get("/notifications/my/notifications", {
        params: { page, limit: rowsPerPage },
      });
      const res = await $api.get(`/notifications/check`);
      if (res.status === 200) {
        setIsNotView(res?.data?.missed_notifications_count);
      }
      setNotifications(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      notification(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when the notifications tab is active or page changes
  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications(page);
    }
  }, [activeTab, page]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_view) {
        await $api.get(`/notifications/my/${notification.id}`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_view: true } : n
          )
        );
        setIsNotView((prev) => prev - 1);
      }
      const link = notification.link?.split("/")[2];
      navigate(`/maxsulotlar/${link}/price`);
    } catch (error) {
      console.error("Failed to mark notification as viewed:", error);
      notification(
        error.response?.data?.message || "Failed to process notification"
      );
    }
  };

  // Mark all notifications as read
  const handleAllCheck = async () => {
    try {
      const res = await $api.patch(`/notifications/update/all`);
      if (res.status === 200) {
        setIsNotView(0);
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_view: true }))
        );
      }
    } catch (error) {
      notification(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  };

  const handleChange = async (e) => {
    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);
    try {
      const res = await $api.patch(`/users/update`, formData);
      setFileData(res.data.data.avatar);
    } catch (error) {
      notification(error.response?.data?.message || "Failed to update avatar");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    if (confirm) {
      try {
        const res = await $api.post(`/auth/logout`);
        if (res.status === 200) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } catch (error) {
        notification(error.response?.data?.message || "Logout failed");
      }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#249B73]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-white shadow-sm p-4 lg:p-6 fixed h-[calc(100vh_-_120px)] top-[102px] rounded-2xl">
        <h1 className="text-xl font-bold text-gray-800 mb-8">Sozlamalar</h1>
        <nav className="space-y-2">
          <TabButton
            icon={<User size={18} />}
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            Shaxsiy ma'lumotlar
          </TabButton>
          <TabButton
            icon={<Bell size={18} />}
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          >
            Bildirishnomalar
            {isNotView > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {isNotView}
              </span>
            )}
          </TabButton>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => setConfirm(true)}
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={18} className="mr-3" />
              Profildan chiqish
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pl-[265px]">
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">
                Shaxsiy ma'lumotlar
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center relative">
                <div className="relative mb-4 group">
                  <button
                    onClick={() => setOpen(true)}
                    className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer"
                  >
                    <Eye color="green" />
                  </button>
                  {fileData || user.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/${
                        fileData || user.avatar
                      }`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                    <Pencil size={16} />
                    <input
                      onChange={handleChange}
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  JPG, PNG yoki GIF. Maksimum 5MB
                </p>
              </div>
              {/* User Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Ism"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Familiya"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Otasining ismi"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Telefon"
                  name="phone_number"
                  value={formData.phone_number?.[0] || ""}
                  onChange={handleInputChange}
                  type="tel"
                />
                <FormField
                  label="Tizimga qo'shilgan sanasi"
                  name="createdAt"
                  value={formatDate(formData.createdAt) || ""}
                  onChange={handleInputChange}
                  type="date"
                />
                <FormField
                  label="Login ID"
                  name="login_id"
                  value={formData.login_id}
                  editing={false}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Bildirishnomalar
              </h2>
              <button
                onClick={handleAllCheck}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <CheckCheck size={18} />
                Hamma o'qildi
              </button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 py-4">
                  Yuklanmoqda...
                </div>
              ) : total === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Bildirishnomalar topilmadi
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_view ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-800">
                            {notification.name}
                          </h3>
                          {!notification.is_view && (
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {notification.description}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        className="text-gray-500 hover:text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = notification.link?.split("/")[2];
                          navigate(`/maxsulotlar/${link}`);
                        }}
                      >
                        ♻️
                      </button>
                    </div>
                  </div>
                ))
              )}
              {total > rowsPerPage && (
                <div className="flex justify-end mt-6">
                  <Pagination
                    count={Math.ceil(total / rowsPerPage)}
                    page={page}
                    onChange={(event, newPage) => setPage(newPage)}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                      button: {
                        color: "black",
                        "&.Mui-selected": {
                          backgroundColor: "#e2e2e2",
                          color: "black",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "gray",
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Xavfsizlik sozlamalari
            </h2>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={`${import.meta.env.VITE_BASE_URL}/${
                fileData || user.avatar
              }`}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setOpen(null)}
              className="absolute -top-10 right-0 p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        message={"Profiledan chiqmoqchimisiz?"}
        onConfirm={handleLogout}
      />
    </div>
  );
};

const TabButton = ({ icon, children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2 rounded-lg ${
      active
        ? "bg-[#249B73]/10 text-[#249B73]"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <span className="mr-3">{icon}</span>
    {children}
  </button>
);

const FormField = ({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {editing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#249B73] focus:border-transparent"
      />
    ) : (
      <p className="px-3 py-2 text-gray-800 bg-gray-50 rounded-md">
        {value || "—"}
      </p>
    )}
  </div>
);

export default Settings;
