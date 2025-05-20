import axios from "axios";
import { VITE_BASE_URL } from ".";

const $api = axios.create({
  baseURL: `${VITE_BASE_URL}`,
  withCredentials: true
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-api-key'] = import.meta.env.VITE_API_KEY;
  }
  return config;
});

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      
      try {
        // Yangi token olish uchun so'rov
        const { data } = await axios.post(`${VITE_BASE_URL}/auth/refresh/token`, {}, {
          withCredentials: true
        });
        if (data?.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);

          // Original so'rovni yangi token bilan takrorlash
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return $api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        // Foydalanuvchini chiqarish yoki login sahifasiga yo'naltirish
        localStorage.removeItem("accessToken");
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default $api;