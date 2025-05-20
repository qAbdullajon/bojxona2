import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import $api from "../../http/api";
import { notification } from "../../components/notification";
import { CloudUpload } from "lucide-react";

export const Security = ({ id, status, price }) => {
  const [discountInput, setDiscountInput] = useState("");
  const [priceHistory, setPriceHistory] = useState([]);
  const [fileData, setFileData] = useState(null);
  const navigate = useNavigate();

  const calculateDiscountPercentage = (original, discounted) =>
    ((original - discounted) / original) * 100;

  const formatPrice = (price) => new Intl.NumberFormat("uz-UZ").format(price);

  const handleFileChange = (e) => {
    setFileData(e.target.files[0]);
  };

  const applyDiscount = async (e) => {
    e.preventDefault();
    if (!fileData) {
      notification("Fayl kiritilmadi");
      return;
    }
    const discountValue = parseFloat(discountInput);
    if (
      discountInput === "" ||
      Number.isNaN(discountValue) ||
      discountValue < 0 ||
      discountValue > 10
    ) {
      notification("0 va 10 oralig'idagi foyz kiritilishi kerak");
      return;
    }

    try {
      const discountedPrice = price * (1 - discountValue / 100);
      const formData = new FormData();
      formData.append("productId", id);
      formData.append("document_title", "Narxi o'zgartirildi");
      formData.append("statusId", status);
      formData.append("document_img", fileData);

      const [res1, res2] = await Promise.all([
        $api.patch(`/sales/products/update/sale_product/price/${id}`, {
          discount_price: discountedPrice.toFixed(0),
        }),
        $api.post("/documents/create", formData),
      ]);
      
      if (res1.status === 200 && res2.status === 201) {
        setPriceHistory((prev) => [
          ...prev,
          {
            price: Math.round(discountedPrice),
            date: new Date().toLocaleDateString("uz-UZ"),
          },
        ]);
        navigate(`/maxsulotlar/${id}`);
      }
    } catch (err) {
      notification(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setDiscountInput("");
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchPriceHistory = async () => {
      try {
        const res = await $api.get(`/sales/products/get/by/${id}`);
        setPriceHistory(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPriceHistory();
  }, [id]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Narxni tushurish
        </h2>

        <div className="space-y-6">
          {/* Price History */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="font-medium text-gray-700 mb-4">Narx tarixi</h3>
            <div className="space-y-3">
              {priceHistory.length > 0 ? (
                priceHistory.map((entry, i) => {
                  const discount =
                    i > 0
                      ? calculateDiscountPercentage(
                          priceHistory[0].price,
                          entry.price
                        )
                      : null;

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 gap-4 items-center text-sm bg-white p-3 rounded-md shadow-xs"
                    >
                      <span className="text-gray-600">{entry.date}</span>
                      <span className="font-medium text-right">
                        {formatPrice(entry.price)} so'm
                      </span>
                      {discount !== null && (
                        <span className="text-[#249B73] text-right">
                          {discount.toFixed(2)}% tushirilgan
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>Mavjud emas</p>
              )}
            </div>
          </div>

          {/* Apply New Discount */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="font-medium text-gray-700 mb-4">
              Yangi chegirma qo'llash
            </h3>
            <form onSubmit={applyDiscount} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="discount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chegirma foizi (%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      id="discount"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={discountInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (
                          val === "" ||
                          (!isNaN(val) && parseFloat(val) <= 10)
                        ) {
                          setDiscountInput(val);
                        }
                      }}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-12 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <label htmlFor="file">
                    <div className="flex items-center gap-4 mt-5 bg-gray-100 border border-dashed px-5 py-2">
                      <CloudUpload />
                      <span>{!fileData ? "File yuklash" : fileData.name}</span>
                    </div>
                    <input
                      id="file"
                      hidden
                      type="file"
                      onChange={handleFileChange}
                      name="sales_document"
                      className="mt-2"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#249B73] hover:bg-[#167D3A] text-white px-4 py-2 rounded-md transition-colors"
                >
                  Chegirmani qo'llash
                </button>
              </div>
            </form>
          </div>

          {/* Summary */}
          {priceHistory.length > 1 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="font-medium text-green-800 mb-2">
                Yangi narx muvaffaqiyatli o'rnatildi
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Yangi narx:</p>
                  <p className="font-medium text-green-700">
                    {formatPrice(priceHistory[priceHistory.length - 1].price)}{" "}
                    so'm
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Umumiy tushirilgan:</p>
                  <p className="font-medium text-green-700">
                    {calculateDiscountPercentage(
                      priceHistory[0].price,
                      priceHistory[priceHistory.length - 1].price
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
