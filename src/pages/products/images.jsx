import {
  Eye,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Download,
} from "lucide-react";
import { formatDate } from "../../utils/dateChecker";
import { useState } from "react";
// import $api from "../../http/api";
import { notification } from "../../components/notification";
import { format } from "date-fns";

export const ImagesSection = ({ product, handleToggleModal }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const productImages = [
    {
      type: "storage",
      title: "Yuk xati rasmi",
      images: [...(product?.event_product?.event_images || [])],
      date: product?.updatedAt,
      canUpload: true,
    },
  ];

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    handleToggleModal();
  };

  // const handleFileChange = async (e) => {
  //   const files = Array.from(e.target.files); // Bir nechta faylni olish
  //   const formData = new FormData();
  //   // formData.append("name", product.event_product.name);
  //   // formData.append("event_number", product.event_product.event_number);
  //   files.forEach((file) => formData.append("event_images", file)); // Fayllarni formData-ga qo'shish

  //   try {
  //     const res = await $api.patch(
  //       `/events/update/${product.event_product.id}`,
  //       formData
  //     );
  //   } catch (error) {
  //     notification(error.response?.data?.message);
  //   }
  //   setShowUploadModal(false);
  // };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename || "file";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      notification("Fayl yuklab olishda xatolik yuz berdi");
      console.error("Download error:", error);
    }
  };
  const getFilenameFromUrl = (url) => {
    return typeof url === "string" ? url.split("/").pop() : "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="space-y-8 pb-4">
          {productImages.map((imageGroup, index) => (
            <div key={`${imageGroup.type}-${index}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  {imageGroup.title}
                </h3>
              </div>

              {imageGroup.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageGroup.images.map((img, imgIndex) => (
                    <div
                      key={`${imageGroup.type}-img-${imgIndex}`}
                      className="relative group"
                    >
                      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        {img && (
                          <img
                            src={`${import.meta.env.VITE_BASE_URL_V3}${img}`}
                            alt={`${imageGroup.title} ${imgIndex + 1}`}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/image-placeholder.png";
                            }}
                          />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                        <button
                          onClick={() =>
                            handleImageClick(
                              `${import.meta.env.VITE_BASE_URL}${img}`
                            )
                          }
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-[#249B73] transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 py-4"
                  onClick={() => setShowUploadModal(true)}
                >
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm mb-4">Rasm mavjud emas</p>
                </div>
              )}

              {imageGroup.date && (
                <div className="mt-2 text-xs text-gray-500">
                  Yuklangan: {formatDate(imageGroup.date)}
                </div>
              )}
            </div>
          ))}
        </div>

        {product.event_product?.event_file &&
          product.event_product?.event_file.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-xl px-5 py-2 rounded-md w-full justify-between"
            >
              <div>
                <span>Yuk xati hujjati</span>
              </div>
              <button
                onClick={() =>
                  handleDownload(
                    `${import.meta.env.VITE_BASE_URL}/${item}`,
                    getFilenameFromUrl(product.event_product.event_file)
                  )
                }
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md"
              >
                <Download />
              </button>
            </div>
          ))}

        {Array.isArray(product.sales_product) &&
          product.sales_product.length > 0 &&
          product.sales_product.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-xl px-5 py-2 rounded-md w-full justify-between"
            >
              <div>
                <span>Sud qarori</span>
                <span className="text-sm px-5">
                  {format(item.sud_date, "yyyy-MM-dd")}
                </span>
              </div>
              <button
                onClick={() =>
                  handleDownload(
                    `${import.meta.env.VITE_BASE_URL}/uploads/${
                      item.sales_document[index]
                    }`,
                    getFilenameFromUrl(item.sales_document[index])
                  )
                }
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md"
              >
                <Download />
              </button>
            </div>
          ))}

        {Array.isArray(product.document_product) &&
          product.document_product.length > 0 &&
          product.document_product.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-xl px-5 py-2 rounded-md w-full justify-between"
            >
              <div>
                <span>Sud qarori</span>
                <span className="text-sm pl-5">
                  {format(item.sud_date, "yyyy-MM-dd")}
                </span>
              </div>
              <button
                onClick={() =>
                  handleDownload(
                    `${import.meta.env.VITE_BASE_URL}/uploads/${
                      item.document_img[0]
                    }`,
                    getFilenameFromUrl(item.document_img[0])
                  )
                }
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md"
              >
                <Download />
              </button>
            </div>
          ))}

        {Array.isArray(product.destroyed_product) &&
          product.destroyed_product.length > 0 &&
          product.destroyed_product.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-xl px-5 py-2 rounded-md w-full justify-between"
            >
              <div>
                <span>Sud qarori</span>
                <span className="text-sm pl-5">
                  {format(item.sud_date, "yyyy-MM-dd")}
                </span>
              </div>
              <button
                onClick={() =>
                  handleDownload(
                    `${import.meta.env.VITE_BASE_URL}/uploads/${
                      item.document_img[0]
                    }`,
                    getFilenameFromUrl(item.document_img[0])
                  )
                }
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-gray-200 rounded-md"
              >
                <Download />
              </button>
            </div>
          ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rasm yuklash</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="mb-4">Rasmlarni shu yerga sudrab keling yoki</p>

              <label className="inline-block px-4 py-2 bg-[#249B73] text-white rounded-lg hover:bg-[#1d7d5d] transition-colors cursor-pointer">
                {/* <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                /> */}
                Faylni tanlash
              </label>
              <p className="text-xs text-gray-500 mt-3">
                PNG, JPG yoki JPEG (maks. 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
