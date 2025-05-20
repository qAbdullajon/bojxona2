import { Eye, Download, X } from "lucide-react";
import { useState } from "react";

const ImageGallery = ({ eventImages }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Rasmni yuklab olish funksiyasi
  const handleDownload = async (item) => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${item}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg"; 
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {eventImages?.map((item) => (
          <div
            key={item}
            className="relative w-[200px] aspect-square group overflow-hidden rounded-md border border-gray-300 shadow-xl shadow-gray-200"
          >
            <img
              src={`${import.meta.env.VITE_BASE_URL}${item}`}
              alt="Event"
              className="object-cover w-full h-full"
            />

            {/* Hover paytida ko'rinadigan tugmalar */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Ko'rish tugmasi */}
              <button
                onClick={() =>
                  setSelectedImage(`${import.meta.env.VITE_BASE_URL}${item}`)
                }
                className="p-2 bg-white rounded-full text-gray-700 hover:text-[#249B73] transition-colors"
                aria-label="View image"
              >
                <Eye className="w-5 h-5" />
              </button>

              {/* Yuklab olish tugmasi */}
              <button
                onClick={handleDownload}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-500 transition-colors"
                aria-label="Download image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: rasmni katta ko'rinishda ko'rsatish */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute -top-10 right-0 flex gap-2">
              {/* Yuklab olish tugmasi modalda ham */}
              <button
                onClick={() =>
                  handleDownload(
                    selectedImage.replace(import.meta.env.VITE_BASE_URL, "")
                  )
                }
                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-500 transition-colors"
                aria-label="Download image"
              >
                <Download className="h-6 w-6" />
              </button>

              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
