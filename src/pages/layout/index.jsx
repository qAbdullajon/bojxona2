import {
  Bell,
  ChevronDown,
  LogOut,
  Logs,
  Search,
  Settings,
  User,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { navList } from "../../utils";
import Logo from "../../assets/Logo.png";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import $api from "../../http/api";
import { notification } from "../../components/notification";

export default function Layout() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [myProfileData, setMyProfileData] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const toggleNotification = async () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      try {
        setLoading(true);
        const response = await $api.get("/notifications/my/notifications");
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePage = async (link) => {
    navigate(`maxsulotlar/${link.split("/")[2]}`);
  };

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async() => {
    try {
      const res = await $api.post(`/auth/logout`)
      if(res.status === 200) {
        localStorage.removeItem("accessToken");
        navigate("/login");
        setIsMenuOpen(false);
      }
    } catch (error) {
      notification(error.response?.data?.message)
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchParams({ search: value });
  };

  useEffect(() => {
    fetchMyProfileData();
  }, []);

  async function fetchMyProfileData() {
    try {
      setLoading(true);
      const { data } = await $api.get("/users/profile/me");
      setMyProfileData(data.data || {});
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="min-h-screen relative bg-[#F5F8F9]">
        {/* HEADER */}
        <header className="bg-[#249B73] pl-[400px] fixed w-full shadow-lg shadow-[#9aaba5] z-50 text-white h-14 flex justify-between items-center px-10">
          <div className="flex items-center">
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                onChange={handleSearchChange}
                className="bg-white text-[14px] text-gray-600 outline-none pl-8 py-1.5 rounded-sm w-64"
                type="text"
                placeholder="Qidiruv..."
              />
              <Search
                size={18}
                className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotification}
                className="cursor-pointer relative p-1 hover:bg-[#1e7d5d] rounded-full transition-colors"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      Bildirishnomalar
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Yuklanmoqda...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Bildirishnomalar topilmadi
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <NavLink
                          key={notification.id}
                          to={`maxsulotlar/${notification.link?.split("/")[2]
                            }/price`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          <div
                            className="name"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <h2 className="font-medium">{notification.name}</h2>
                            <button
                              className="cursor-pointer"
                              onClick={() => handlePage(notification.link)}
                              style={{ marginLeft: "40px" }}
                            >
                              ♻️
                            </button>
                          </div>
                          <p className="text-gray-600">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </NavLink>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile and menu */}
            <div className="relative" ref={menuRef}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-[#1e7d5d] px-2 py-1 rounded transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {myProfileData.avatar ? (
                  <div className="w-8 h-8 flex items-center justify-center bg-white/20 border border-white/30 rounded-full">
                    <img
                      className="rounded-full w-10 h-10 min-w-10"
                      src={`${import.meta.env.VITE_BASE_URL}/${myProfileData.avatar
                        }`}
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center bg-white/20 border border-white/30 rounded-full">
                    <User size={18} />
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <div className="text-left">
                    <p className="text-[12px] leading-4 max-w-[140px] truncate">
                      {myProfileData.last_name} {myProfileData.name}{" "}
                      {myProfileData.middle_name}
                    </p>
                    <p className="text-[11px] leading-4 text-white/80">
                      {myProfileData.is_super_admin
                        ? "Super Admin"
                        : myProfileData.is_admin
                          ? "Admin"
                          : "Xodim"}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </div>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-50 border border-gray-100 animate-fadeIn">
                  <div className="px-4 py-3 text-sm border-b border-gray-100">
                    <p className="font-medium text-gray-800">
                      {myProfileData.last_name} {myProfileData.name}{" "}
                      {myProfileData.middle_name}
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

                    {/* <NavLink
                      to="/sozlamalar"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={14} className="mr-2 text-gray-400" />
                      Sozlamalar
                    </NavLink> */}

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
          onMouseEnter={() => setMenu(true)}
          onMouseLeave={() => setMenu(false)}
          className={`transition-all duration-500 ease-in-out fixed z-60 bg-white py-4 top-3 left-3 h-[calc(100%-32px)] rounded-2xl shadow-lg
            ${menu ? "w-[300px]" : "w-[60px]"}`}
        >
          {/* <button
            onClick={() => setMenu(!menu)}
            className="absolute -right-10 top-1.5 w-8 h-8 flex items-center justify-center text-white rounded-full"
          >
            <Logs size={18} />
          </button> */}

          <div className="flex items-center justify-center gap-2 h-[60px] px-2">
            <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span
              className={`text-xl font-semibold uppercase whitespace-nowrap transition-all duration-500 overflow-hidden
    ${menu ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"}`}
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
                    ${menu ? "px-4" : "px-2 justify-center"}
                    hover:bg-[#F6FAFC] ${isActive && "!bg-[#e9f5fa]"}`}
                >
                  <Icon size={18} color={item.color || "gray"} />
                  <span
                    className={`transition-opacity duration-300 whitespace-nowrap
                      ${menu
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

        <div
          className={`ml-[62px] h-[calc(100vh-56px)] p-5 pt-20`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
}
