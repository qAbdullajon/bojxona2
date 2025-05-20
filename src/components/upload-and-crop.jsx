import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { File, X } from "lucide-react";
import Modal from "./Modal";
import { getCroppedImg } from "../utils/cropImage";

const UploadAndCrop = ({ uploadFiles, onFilesChange, name }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawFile, setRawFile] = useState(null);

  const handleChangeUploadFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setRawFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      };
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Cropped imagedan fayl yaratamiz (serverga yubormaymiz)
      const blob = await fetch(croppedImage).then((r) => r.blob());

      // Yangi fayl ro'yxatini yaratamiz
      const newFile = {
        url: croppedImage, // Ko'rinish uchun preview
        name: rawFile.name,
        size: blob.size,
        id: Date.now(),
        croppedBlob: blob, // Kesilgan fayl ma'lumoti (keyinroq yuborish uchun)
      };

      // Fayllar ro'yxatini yangilaymiz
      onFilesChange([...uploadFiles, newFile]);

      // Modalni yopamiz va holatlarni tozalaymiz
      setShowCropModal(false);
      setImageSrc(null);
      setRawFile(null);
    } catch (error) {
      console.error("Kesishda xatolik:", error);
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    onFilesChange(uploadFiles.filter((item) => item.id !== fileToRemove.id));
  };

  return (
    <div>
      <label
        className="flex items-center justify-center gap-2 py-2 px-2 text-center rounded-md border-dashed border-gray-400 border-2 cursor-pointer"
        htmlFor="file"
      >
        <File size={16} />
        <span className="text-sm">{name}</span>
      </label>
      <input
        onChange={handleChangeUploadFile}
        type="file"
        hidden
        name="file"
        id="file"
        accept="image/*"
      />
      <div className="flex flex-col gap-2 pt-3">
        {uploadFiles.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-2 py-1 bg-[#F9FAFB] rounded-md"
          >
            <div className="flex items-center gap-2">
              <img
                src={item.url}
                alt={item.name}
                className="w-10 h-10 object-cover rounded-md"
              />
              <div>
                <p className="w-[100px] line-clamp-1">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {(item.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveFile(item)}
              className="w-8 h-8 flex items-center justify-center bg-red-400 hover:bg-red-500 cursor-pointer rounded-md text-white"
            >
              <X />
            </button>
          </div>
        ))}
      </div>

      {showCropModal && (
        <Modal onClose={() => setShowCropModal(false)}>
          <div className="relative w-[400px] h-[400px] bg-white">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleCrop}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Kesib olish (Crop)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UploadAndCrop;
