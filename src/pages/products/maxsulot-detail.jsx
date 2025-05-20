import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  FileText,
  Image,
  ShieldAlert,
  BarChart2,
  Container,
  X,
  QrCode,
  CircleDollarSign,
} from "lucide-react";
import { Link, Route, Routes, useParams, useLocation } from "react-router-dom";
import $api from "../../http/api";
import { ProductDetails } from "./details";
import { ImagesSection } from "./images";
import { Security } from "./security";
import ChangeStatus from "./change-status";
import { format } from "date-fns";
import { notification } from "../../components/notification";
import PriceHistoryTable from "./history";

export default function PremiumProductDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState({});
  const [status, setStatus] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const printWindow = window.open(`/product/${id}`, "_blank");

    printWindow.onload = () => {
      // Rasm va boshqa resurslar yuklanishini kutish
      const interval = setInterval(() => {
        const images = printWindow.document.images;
        let loaded = 0;

        for (let i = 0; i < images.length; i++) {
          if (images[i].complete) {
            loaded++;
          }
        }

        // Barcha rasm va resurslar yuklangan bo‘lsa
        if (loaded === images.length) {
          clearInterval(interval);
          printWindow.print();
        }
      }, 500); // har 500ms da tekshiradi
    };
  };

  useEffect(() => {
    fetchProduct();

    const getAllStatus = async () => {
      try {
        const res = await $api.get(`/statuses/all`);
        setStatus(res.data.status);
      } catch (error) {
        notification(error.response?.data?.message);
      }
    };
    getAllStatus();
  }, [id]);
  const handleChange = (e) => {
    setSelected(e.target.value);
  };
  const fetchProduct = async () => {
    try {
      const { data } = await $api.get(`/products/by/${id}`);
      setProduct(data.data || {});
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith("/photos")) {
      setActiveTab("images");
    } else if (path.endsWith("/history")) {
      setActiveTab("history");
    } else if (path.endsWith("/price")) {
      setActiveTab("security");
    } else if (path.endsWith("/change-status")) {
      setActiveTab("change-status");
    } else {
      setActiveTab("details");
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Product Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-[#249B73]/10 to-white p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex justify-center mt-4 mb-2">
                  <div className="p-2 bg-gray-100 inline-block">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL_V3}${
                        product.qrCodeUrl
                      }`}
                      alt="QR Code"
                      className="w-24 h-24"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {product.name || "Mahsulot nomi"}
                  </h1>
                  <div className="flex items-center mt-1 gap-2">
                    <span className="bg-[#249B73]/10 text-[#249B73] text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {product.type_product?.product_type || "Tur"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Container className="h-4 w-4 mr-1 flex-shrink-0" />
                    <Link
                      to={`/holatlar/${product?.eventId}`}
                      className="hover:underline hover:text-blue-400 cursor-pointer"
                    >
                      Yuk xati raqami:{" "}
                      {product.event_product?.event_number || "N/A"}
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>
                      Yaratilgan:{" "}
                      {product.createdAt &&
                        format(product.createdAt, "yyyy-MM-dd HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-[#249B73]">
                  {product.price &&
                    product.price !== "0.00" &&
                    `${product.price.toLocaleString()} so'm`}
                </div>
                <button onClick={handleSubmit}>
                  <QrCode />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-100">
            <div className="flex overflow-x-auto scrollbar-hide">
              <Link
                to={`/maxsulotlar/${id}`}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center ${
                  activeTab === "details"
                    ? "border-[#249B73] text-[#249B73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Mahsulot ma'lumotlari
              </Link>
              <Link
                to={`/maxsulotlar/${id}/photos`}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center ${
                  activeTab === "images"
                    ? "border-[#249B73] text-[#249B73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Image className="h-4 w-4 mr-2" />
                Rasmlar
              </Link>
              <Link
                to={`/maxsulotlar/${id}/history`}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center ${
                  activeTab === "history"
                    ? "border-[#249B73] text-[#249B73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Tarix
              </Link>
              <Link
                to={`/maxsulotlar/${id}/price`}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center ${
                  activeTab === "security"
                    ? "border-[#249B73] text-[#249B73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Narxni tushurish
              </Link>
              <Link
                to={`/maxsulotlar/${id}/change-status`}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center ${
                  activeTab === "change-status"
                    ? "border-[#249B73] text-[#249B73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <select
                  onChange={handleChange}
                  className="ml-2 block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring focus:border-[#249B73]"
                >
                  <option hidden value="">
                    Statusni o'zgartirish
                  </option>
                  {status.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_status}
                    </option>
                  ))}
                </select>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Routes>
              <Route path="/" element={<ProductDetails product={product} />} />
              <Route
                path="/photos"
                element={
                  <ImagesSection
                    product={product}
                    handleToggleModal={handleToggleModal}
                  />
                }
              />
              <Route
                path="/history"
                element={<PriceHistoryTable product={product} />}
              />
              <Route
                path="/price"
                element={
                  <Security
                    id={product.id}
                    status={product.statusId}
                    price={product.price}
                  />
                }
              />
              <Route
                path="/change-status"
                element={<ChangeStatus product={product} status={selected} />}
              />
            </Routes>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-4">
              {/* Additional product information or sidebar content can go here */}
              <h3 className="font-medium text-gray-700 mb-3">
                Qo'shimcha ma'lumotlar
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Bu joyga qo'shimcha ma'lumotlar joylashtirishingiz mumkin</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}