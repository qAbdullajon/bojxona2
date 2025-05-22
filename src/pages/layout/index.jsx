import {
  Bell,
  CheckCheck,
  ChevronDown,
  LogOut,
  Search,
  User,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Pagination } from "@mui/material";
import $api from "../../http/api";
import { notification } from "../../components/notification";
import Logo from "../../assets/Logo.png";
import { navList } from "../../utils";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isNotView, setIsNotView] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20); // Adjust as needed
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

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

  // Fetch notifications when the notification panel opens or page changes
  useEffect(() => {
    fetchNotifications(page);
  }, [isNotificationOpen, page]);

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const { data } = await $api.get("/users/profile/me");
        setProfileData(data.data || {});
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        notification(
          error.response?.data?.message || "Failed to fetch profile data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Handle clicks outside of menu and notification panels
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await $api.post("/auth/logout");
      if (res.status === 200) {
        localStorage.removeItem("accessToken");
        navigate("/login");
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      notification(error.response?.data?.message || "Logout failed");
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchParams({ search: value });
  };

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
      }
      const link = notification.link?.split("/")[2];
      navigate(`/maxsulotlar/${link}/price`);
      setIsNotificationOpen(false);
    } catch (error) {
      console.error("Failed to mark notification as viewed:", error);
      notification(
        error.response?.data?.message || "Failed to process notification"
      );
    }
  };

  const handleAllCheck = async () => {
    try {
      const res = await $api.patch(`/notifications/update/all`);
      if (res.status === 200) {
        setIsNotView(0);
        setIsNotificationOpen(false);
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_view: true }))
        );
      }
    } catch (error) {
      notification(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#F5F8F9]">
      {/* HEADER */}
      <header className="bg-[#249B73] pl-[400px] fixed w-full shadow-lg shadow-[#9aaba5] z-50 text-white h-14 flex justify-between items-center px-10">
        <div className="flex items-center"></div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              onChange={handleSearchChange}
              className="bg-white text-[14px] text-gray-600 outline-none pl-8 py-1.5 rounded-sm w-64"
              type="text"
              placeholder="Qidiruv..."
              value={searchParams.get("search") || ""}
            />
            <Search
              size={18}
              className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-1 cursor-pointer hover:bg-[#1e7d5d] rounded-full transition-colors"
            >
              <Bell size={18} />
              {isNotView > 0 && (
                <span className="absolute -top-1 -right-0.5 w-4 h-4 text-[10px] flex items-center justify-center bg-red-500 rounded-full">
                  {isNotView}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Bildirishnomalar
                  </p>
                  <button
                    onClick={handleAllCheck}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 cursor-pointer bg-gray-100 rounded-full"
                  >
                    <CheckCheck color="black" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Yuklanmoqda...
                    </div>
                  ) : total === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Bildirishnomalar topilmadi
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="font-medium">
                                {notification.name}
                              </h2>
                              {!notification.is_view && (
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              )}
                            </div>
                            <p className="text-gray-600">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                          <button
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent div's onClick
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
                    <Pagination
                      count={Math.ceil(total / rowsPerPage)}
                      page={page}
                      onChange={(event, newPage) => setPage(newPage)}
                      color="primary"
                      siblingCount={1}
                      boundaryCount={1}
                      sx={{
                        paddingTop: "15px",
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
                        ul: {
                          justifyContent: "end",
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-[#1e7d5d] px-2 py-1 rounded transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {profileData.avatar ? (
                <img
                  className="rounded-full w-8 h-8 min-w-8"
                  src={`${import.meta.env.VITE_BASE_URL}/${profileData.avatar}`}
                  alt="Profile"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center bg-white/20 border border-white/30 rounded-full">
                  <User size={18} />
                </div>
              )}
              <div className="flex items-center gap-1">
                <div className="text-left">
                  <p className="text-[12px] leading-4 max-w-[140px] truncate">
                    {profileData.last_name} {profileData.name}{" "}
                    {profileData.middle_name}
                  </p>
                  <p className="text-[11px] leading-4 text-white/80">
                    {profileData.is_super_admin
                      ? "Super Admin"
                      : profileData.is_admin
                      ? "Admin"
                      : "Xodim"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-50 border border-gray-100 animate-fadeIn">
                <div className="px-4 py-3 text-sm border-b border-gray-100">
                  <p className="font-medium text-gray-800">
                    {profileData.last_name} {profileData.name}{" "}
                    {profileData.middle_name}
                  </p>
                </div>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon size={14} className="mr-2 text-gray-400" />
                  Profil
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <LogOut size={14} className="mr-2 text-gray-400" />
                  Chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className={`transition-all duration-500 ease-in-out fixed z-60 bg-white py-4 top-3 left-3 h-[calc(100%-32px)] rounded-2xl shadow-lg
          ${isSidebarOpen ? "w-[300px]" : "w-[60px]"}`}
      >
        <div className="flex items-center justify-center gap-2 h-[60px] px-2">
          <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span
            className={`text-xl font-semibold uppercase whitespace-nowrap transition-all duration-500 overflow-hidden
              ${
                isSidebarOpen
                  ? "opacity-100 max-w-[200px]"
                  : "opacity-0 max-w-0"
              }`}
          >
            BOJXONASERVIS.UZ
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-gray-200 pt-4">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                location.pathname.split("/")[1] === item.path.split("/")[1]);

            return (
              <NavLink
                to={item.path}
                key={item.id}
                className={`flex items-center h-10 gap-2 py-2 rounded-sm transition-all duration-300
                  ${isSidebarOpen ? "px-4" : "px-2 justify-center"}
                  hover:bg-[#F6FAFC] ${isActive ? "!bg-[#e9f5fa]" : ""}`}
              >
                <Icon size={18} color={item.color || "gray"} />
                <span
                  className={`transition-opacity duration-300 whitespace-nowrap
                    ${
                      isSidebarOpen
                        ? "opacity-100 delay-200"
                        : "opacity-0 w-0 overflow-hidden"
                    }`}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className={`ml-[62px] h-[calc(100vh-56px)] p-5 pt-20`}>
        <Outlet />
      </div>
    </div>
  );
}
