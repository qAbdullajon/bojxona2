import $api from "../../http/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { notification } from "../../components/notification";

export default function Receipt() {
  const { id } = useParams();
  const [isPrinting, setIsPrinting] = useState(false);
  const [productData, setProductData] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const printReceipt = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      let { data } = await $api.get(`/products/by/${id}`);
      setProductData(data.data);
    } catch (error) {
      notification(error.response?.data?.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div
        id="print-content"
        className={`bg-white w-80 p-4 shadow-md ${isPrinting ? "" : "mb-4"}`}
      >
        <div className="text-center mb-4 font-mono">
          <div className="font-bold text-lg">MAHSULOT MA'LUMOTI</div>
          <div className="border-b border-dashed border-gray-400 my-2"></div>
        </div>

        <div className="font-mono text-sm">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1 text-left">Mahsulot:</td>
                <td className="py-1 text-right font-bold">
                  {productData.name}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-left">Miqdor:</td>
                <td className="py-1 text-right">{productData.quantity} {productData.unit}</td>
              </tr>
              <tr>
                <td className="py-1 text-left">Aktiv miqdor:</td>
                <td className="py-1 text-right">
                  {productData.active_quantity}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-left">Narx:</td>
                <td className="py-1 text-right">
                  {productData.price?.toLocaleString()} so'm
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <div className="border-b border-dashed border-gray-400 my-1"></div>
                </td>
              </tr>
              <tr>
                <td className="py-1 text-left font-bold">Jami narx:</td>
                <td className="py-1 text-right font-bold">
                  {productData.total_price?.toLocaleString()} so'm
                </td>
              </tr>
              <tr>
                <td className="py-1 text-left font-bold">Aktiv jami narx:</td>
                <td className="py-1 text-right font-bold">
                  {productData.active_total_price?.toLocaleString()} so'm
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <div className="border-b border-dashed border-gray-400 my-1"></div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="space-y-1 mt-2">
            <div>
              <span className="font-bold">Yaroqlilik muddati:</span>{" "}
              {productData.expiration_date === null ? " ----.--.-- --:--" : formatDate(productData.expiration_date)}
            </div>

            <div>
              <span className="font-bold">Yuk xati raqami:</span>{" "}
              {productData.event_product?.event_number}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>
          </div>

          <div className="flex justify-center mt-4 mb-2">
            <div className="p-2 bg-gray-100 inline-block">
              <img
                src={`${import.meta.env.VITE_BASE_URL_V3}${
                  productData.qrCodeUrl
                }`}
                alt="QR Code"
                className="w-24 h-24"
              />
            </div>
          </div>

          <div className="text-center text-xs mt-4"></div>
        </div>
      </div>

      {!isPrinting && (
        <button
          onClick={printReceipt}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-mono text-sm"
        >
          Chekni chop etish
        </button>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #print-content,
          #print-content * {
            visibility: visible;
          }

          #print-content {
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 80mm;
            padding: 10px;
            background: white;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
