import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Box, Paper, styled, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import $api from "../../http/api";
import { toast } from "react-toastify";

// Statistik doiralar uchun stil
const StatCircle = styled(Paper)(({ theme, color }) => ({
  width: 160,
  height: 160,
  borderRadius: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: theme.spacing(2),
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.1), 0 7px 10px -5px ${color}40`,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0 8px 25px 0 rgba(0, 0, 0, 0.1), 0 10px 15px -5px ${color}40`,
  },
}));

// Statistik konteyner uchun stil
const StatsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  margin: "20px 0",
}));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Statistika = () => {
  // Sana holatlari
  const [timeRange, setTimeRange] = useState("month");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(1, 'month'),
    endDate: dayjs()
  });

  // Yuklash holatlari
  const [loading, setLoading] = useState({
    stats: false,
    chart: false
  });
  const [error, setError] = useState(null);

  // Statistik ma'lumotlar
  const [statsData, setStatsData] = useState({
    warehouses_count: 0,
    shopsCount: 0,
    productsCount: 0,
    eventsCount: 0,
  });

  const [statistika, setStatistika] = useState([]);
  const [productStatus, setProductStatus] = useState([]);

  // TimeRange o'zgarishini qayta ishlash
  useEffect(() => {
    const now = dayjs();
    let newStartDate;

    switch (timeRange) {
      case "day":
        newStartDate = now.subtract(1, 'day');
        break;
      case "week":
        newStartDate = now.subtract(1, 'week');
        break;
      case "month":
        newStartDate = now.subtract(1, 'month');
        break;
      case "year":
        newStartDate = now.subtract(1, 'year');
        break;
      default:
        newStartDate = now.subtract(1, 'month');
    }

    setDateRange({
      startDate: newStartDate,
      endDate: now
    });
  }, [timeRange]);

  // Asosiy statistik ma'lumotlarni yuklash
  const fetchWmsData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const { data } = await $api.get("/data/stats");      
      setStatsData({
        warehouses_count: data.warehouses_cound || 0,
        shopsCount: data.shopsCount || 0,
        productsCount: data.productsCount || 0,
        eventsCount: data.evenetsCount || 0,
      });
    } catch (error) {
      console.error("Statistik ma'lumotlarni yuklashda xato:", error);
      setError("Statistik ma'lumotlarni yuklashda xatolik");
      toast.error("Statistik ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // Grafik ma'lumotlarini yuklash
  const fetchChartData = useCallback(async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    try {
      setLoading(prev => ({ ...prev, chart: true }));
      setError(null);

      const response = await $api.get(`/all/stats`, {
        params: {
          startDate: dateRange.startDate.format("YYYY-MM-DD"),
          endDate: dateRange.endDate.format("YYYY-MM-DD"),
        }
      });
      console.log(response);

      if (response.data) {
        // Regionlar bo'yicha statistika
        const regionsData = response.data.regions || [];
        setStatistika(
          regionsData.map(item => ({
            name: item.region || "Noma'lum",
            value: item.total_price || 0,
          }))
        );

        // Mahsulot holatlari
        const statusesData = regionsData[0]?.statuses || [];
        setProductStatus(
          statusesData
            .filter(item => item.count > 0)
            .map(item => ({
              name: item.status || "Noma'lum",
              value: item.count || 0,
            }))
        );
      }
    } catch (err) {
      console.error("Grafik ma'lumotlarini yuklashda xato:", err);
      setError("Grafik ma'lumotlarini yuklashda xatolik");
      toast.error("Grafik ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  }, [dateRange]);

  // Komponent yuklanganda ma'lumotlarni olish
  useEffect(() => {
    fetchWmsData();
  }, [fetchWmsData]);

  // Sana oraligi o'zgarganda grafik ma'lumotlarini yangilash
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChartData();
    }, 300);

    return () => clearTimeout(timer);
  }, [dateRange, fetchChartData]);

  // Excel faylini yuklab olish
  const handleDownload = useCallback(async () => {
    try {
      const response = await $api.get(`/all/stats`, {
        params: {
          startDate: dateRange.startDate.format("YYYY-MM-DD"),
          endDate: dateRange.endDate.format("YYYY-MM-DD"),
          download: 'excel'
        },
        responseType: "blob",
      });

      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : `statistika_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Fayl muvaffaqiyatli yuklab olindi");
    } catch (err) {
      console.error("Yuklab olishda xatolik:", err);
      toast.error("Faylni yuklab olishda xatolik");
    }
  }, [dateRange]);

  // TimeRange tugmalari uchun konfiguratsiya
  const timeRangeButtons = useMemo(() => [
    { value: "day", label: "Kunlik" },
    { value: "week", label: "Haftalik" },
    { value: "month", label: "Oylik" },
    { value: "year", label: "Yillik" }
  ], []);

  // Yuklash holati
  if (loading.stats && loading.chart) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Xato holati
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => {
              fetchWmsData();
              fetchChartData();
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Xisobotlar</h1>

        {/* Sana va vaqt oralig'i tanlash */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {timeRangeButtons.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeRange(value)}
                  className={`px-4 py-2 rounded-md hover:text-white ${
                    timeRange === value ? "bg-[#249B73] text-white" : "bg-gray-200 text-gray-700"
                  } hover:bg-[#1d7d5d]`}
                >
                  {label}
                </button>
              ))}
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <DatePicker
                  label="Boshlang'ich sana"
                  value={dateRange.startDate}
                  onChange={(newValue) => setDateRange(prev => ({
                    ...prev,
                    startDate: newValue
                  }))}
                  maxDate={dateRange.endDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                    },
                  }}
                />
                <DatePicker
                  label="Oxirgi sana"
                  value={dateRange.endDate}
                  onChange={(newValue) => setDateRange(prev => ({
                    ...prev,
                    endDate: newValue
                  }))}
                  minDate={dateRange.startDate}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      size: "small",
                      variant: "outlined",
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </div>
        </div>

        {/* Asosiy statistik ko'rsatkichlar */}
        <StatsContainer>
          <StatCircle color="#4CAF50">
            <Typography variant="h4" component="div" fontWeight="bold">
              {statsData.warehouses_count.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1">Omborxonalar</Typography>
          </StatCircle>

          <StatCircle color="#2196F3">
            <Typography variant="h4" component="div" fontWeight="bold">
              {statsData.shopsCount.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1">Do'konlar</Typography>
          </StatCircle>

          <StatCircle color="#FF9800">
            <Typography variant="h4" component="div" fontWeight="bold">
              {statsData.productsCount.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1">Mahsulotlar</Typography>
          </StatCircle>

          <StatCircle color="#9C27B0">
            <Typography variant="h4" component="div" fontWeight="bold">
              {statsData.eventsCount.toLocaleString()}
            </Typography>
            <Typography variant="subtitle1">Yuk xati</Typography>
          </StatCircle>
        </StatsContainer>

        {/* Grafiklar bo'limi */}
        <div className="flex flex-col gap-6 mb-6">
          {/* Sotuvlar grafigi */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sotuvlar bo'yicha statistika
            </h2>
            <div className="h-80">
              {loading.chart ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : statistika.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistika}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toLocaleString()} so'm`, "Sotuvlar"]}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#3B82F6"
                      name="Sotuvlar (so'm)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p>Sotuvlar bo'yicha ma'lumot mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          {/* Mahsulotlar holati */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Mahsulotlar holati
            </h2>
            <div className="h-80">
              {loading.chart ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : productStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {productStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} ta`, "Miqdori"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p>Mahsulotlar holati bo'yicha ma'lumot mavjud emas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Yuklab olish tugmasi */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleDownload}
            disabled={loading.chart}
            className={`bg-[#249B73] hover:bg-[#1d7d5d] text-white font-medium py-3 px-6 rounded-md shadow-md transition duration-300 flex items-center ${
              loading.chart ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Statistikani yuklab olish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistika;