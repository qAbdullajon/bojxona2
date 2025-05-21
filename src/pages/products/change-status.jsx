import React, { useEffect, useState, useCallback } from "react";
import { X, Upload, FileText, Trash2, Video } from "lucide-react";
import $api from "../../http/api";
import { Statuses } from "../../utils";
import { notification } from "../../components/notification";
import { useCheckedStore } from "../../hooks/useCheckedStore";
import { useProductStore } from "../../hooks/useModalState";

const FileUploader = ({
  file,
  fileName,
  onRemove,
  onChange,
  accept,
  label,
  maxSize,
  sizeUnit,
}) => {
  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
        <Upload size={40} className="text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 text-center">{label}</p>
        <p className="text-xs text-gray-500 text-center">
          {accept} (maksimum {maxSize}
          {sizeUnit})
        </p>
        <input
          type="file"
          className="hidden"
          onChange={onChange}
          accept={accept}
        />
      </label>

      {file && (
        <div className="border border-gray-300 rounded p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText size={24} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {(
                    file.size /
                    (1024 * (sizeUnit === "MB" ? 1024 : 1))
                  ).toFixed(1)}{" "}
                  {sizeUnit}
                </p>
              </div>
            </div>
            <div className="flex">
              <label className="cursor-pointer mr-2">
                <button
                  type="button"
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Upload size={16} />
                </button>
                <input
                  type="file"
                  className="hidden"
                  onChange={onChange}
                  accept={accept} // Added accept prop for consistency
                />
              </label>
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-red-500 hover:bg-gray-100 rounded-full"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoUploader = ({
  videoFile,
  videoName,
  videoPreview,
  onRemove,
  onChange,
}) => {
  if (!videoFile) {
    return (
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
        <Video size={40} className="text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 text-center">
          Videoni yuklash uchun bosing
        </p>
        <p className="text-xs text-gray-500 text-center">
          MP4, MOV (maksimum 50MB)
        </p>
        <input
          type="file"
          name="product_video"
          className="hidden"
          onChange={onChange}
          accept="video/mp4,video/quicktime"
        />
      </label>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="relative pt-[56.25%] bg-black">
        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="absolute top-0 left-0 w-full h-full"
          />
        )}
      </div>
      <div className="p-3 border-t border-gray-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Video size={24} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {videoName}
              </p>
              <p className="text-xs text-gray-500">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
          <div className="flex">
            <label className="cursor-pointer mr-2">
              <button
                type="button"
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <Upload size={16} />
              </button>
              <input
                type="file"
                className="hidden"
                onChange={onChange}
                accept="video/mp4,video/quicktime" // Added accept prop for consistency
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-red-500 hover:bg-gray-100 rounded-full"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({
  label,
  id,
  type = "text",
  required = false,
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
      required={required}
      {...props}
    />
  </div>
);

const FormSelect = ({
  label,
  id,
  options,
  value,
  onChange,
  required = false,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      className="w-full h-10 px-3 border border-gray-300 rounded-md"
      value={value}
      onChange={onChange}
      required={required}
    >
      <option hidden value="">
        Tanlang
      </option>
      {options?.map((item) => (
        <option key={item?.id} value={item?.id}>
          {item?.name}
        </option>
      ))}
    </select>
  </div>
);

const StatusInfo = ({ product, status }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Joriy status</p>
        <p className="font-medium">
          {product?.statusProduct?.product_status || "Saqlovda"}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Yangi status</p>
        <p className="font-medium">
          {Statuses.find((item) => item.id === status)?.name}
        </p>
      </div>
    </div>
  </div>
);

export default function ChangeStatus({ product, status, onClose }) {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoName, setVideoName] = useState("");
  const [mibsOptions, setMibsOptions] = useState([]);
  const [sudsOptions, setSudsOptions] = useState([]);
  const [selectedMib, setSelectedMib] = useState("");
  const [selectedSud, setSelectedSud] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items } = useCheckedStore();
  const { setChangeStatusData } = useProductStore();

  const fetchData = useCallback(async () => {
    try {
      const [mibsRes, sudsRes] = await Promise.all([
        $api.get("/mib/all"),
        $api.get("/sud/all"),
      ]);
      setMibsOptions(mibsRes.data.mibs || []);
      setSudsOptions(sudsRes.data.mibs || []);
    } catch (error) {
      console.error("Fetch error:", error);
      notification("Ma'lumotlarni yuklashda xatolik yuz berdi");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = e.target.accept.includes("video");
    const maxSize = isVideo ? 50 : 10;

    if (file.size > maxSize * 1024 * 1024) {
      notification(`Fayl hajmi ${maxSize}MB dan katta`, "error");
      return;
    }

    if (isVideo && !file.type.includes("video/")) {
      notification("Faqat video fayllarni yuklashingiz mumkin", "error");
      return;
    }

    if (isVideo) {
      setVideoFile(file);
      setVideoName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFileData(file);
      setFileName(file.name);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFileData(null);
    setFileName("");
  }, []);

  const removeVideo = useCallback(() => {
    setVideoFile(null);
    setVideoPreview("");
    setVideoName("");
  }, []);

  const handleMibChange = useCallback((e) => {
    setSelectedMib(e.target.value);
  }, []);

  const handleSudChange = useCallback((e) => {
    setSelectedSud(e.target.value);
  }, []);

  const getFormValues = useCallback((form) => {
    const formData = new FormData(form);
    const values = {};

    formData.forEach((value, key) => {
      values[key] = { value };
    });

    return values;
  }, []);

  const prepareFormData = useCallback(
    (productId, formValues) => {
      const data = new FormData();
      const commonFields = {
        productId,
        mib_dalolatnoma: formValues.mib_dalolatnoma?.value || "",
        sud_dalolatnoma: formValues.sud_dalolatnoma?.value || "",
        sud_date: formValues.sud_date?.value || "",
        mibId: selectedMib,
        sudId: selectedSud,
      };

      // Add status ID for all status types
      data.append("statusId", status);

      switch (status) {
        case "d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783": // Sales status
          data.append(
            "discount_price",
            JSON.stringify([
              { price: formValues.discount_price?.value || 0, date: null },
            ])
          );
          if (fileData) {
            data.append("sales_document", fileData);
          }
          break;
        case "ed207621-3867-4530-8886-0fa434dedc19": // Destruction status
          data.append(
            "destroyed_institution",
            formValues.document_title?.value || ""
          );
          if (fileData) {
            data.append("document_img", fileData);
          }
          data.append(
            "date_destroyed",
            formValues.sud_date?.value || "2025-05-30"
          );
          if (videoFile) {
            data.append("video_destroyed", videoFile);
          }
          break;
        default: // Other status types
          data.append("document_title", formValues.document_title?.value || "");
          if (fileData) {
            data.append("document_img", fileData);
          }
      }

      Object.entries(commonFields).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      return data;
    },
    [fileData, selectedMib, selectedSud, status, videoFile]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Input validation
      if (!selectedMib || !selectedSud || !fileData) {
        notification(
          !selectedMib
            ? "MIBni tanlang"
            : !selectedSud
            ? "SUDni tanlang"
            : "Faylni yuklang",
          "error"
        );
        return;
      }

      setIsSubmitting(true);

      try {
        const productIds = items.length > 0 ? items : [product?.id];
        if (!productIds || productIds.length === 0) {
          throw new Error("Mahsulot tanlanmagan");
        }

        const formValues = getFormValues(e.target);

        const endpointMap = {
          "d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783": "/sales/products/create",
          "ed207621-3867-4530-8886-0fa434dedc19": "/destroyes/create",
          default: "/documents/create",
        };

        const endpoint = endpointMap[status] || endpointMap.default;

        // Sotuvga chiqarish uchun status
        if (status === "d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783") {
          const productsData = productIds.map((productId) => ({
            productId,
            formData: prepareFormData(productId, formValues),
          }));

          setChangeStatusData({
            commonData: {
              mib_dalolatnoma: formValues.mib_dalolatnoma?.value || "",
              sud_dalolatnoma: formValues.sud_dalolatnoma?.value || "",
              sud_date: formValues.sud_date?.value || "",
              mibId: selectedMib,
              sudId: selectedSud,
              fileData,
            },
            productsData,
            status,
          });

          onClose(); // Modalni yopish
        } else {
          // Boshqa statuslar uchun API so‘rovlar
          let successCount = 0;
          let failCount = 0;

          for (const productId of productIds) {
            const data = prepareFormData(productId, formValues);

            try {
              const res = await $api.post(endpoint, data);

              if (res.status >= 200 && res.status < 300) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              failCount++;
              console.error(`Xatolik productId: ${productId}`, err);
            }
          }

          if (successCount === productIds.length) {
            notification(
              items.length > 0
                ? "Barcha tanlangan mahsulotlar uchun status muvaffaqiyatli o'zgartirildi"
                : "Status muvaffaqiyatli o'zgartirildi",
              "success"
            );
            window.location.reload();
            onClose();
          } else if (successCount > 0) {
            notification(
              `${successCount} ta mahsulot muvaffaqiyatli, ${failCount} ta mahsulotda xatolik yuz berdi`,
              "warning"
            );
          } else {
            notification(
              "Barcha mahsulotlarda status o‘zgartirishda xatolik bo‘ldi",
              "error"
            );
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        notification(
          error.response?.data?.message || "Xatolik yuz berdi",
          "error"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      fileData,
      fileName,
      getFormValues,
      items,
      onClose,
      prepareFormData,
      product?.id,
      selectedMib,
      selectedSud,
      setChangeStatusData,
      status,
    ]
  );

  const renderInputs = useCallback(() => {
    if (!status) return null;

    const commonInputs = (
      <>
        <FormInput
          label="Mib ijro ishi raqami"
          id="mib_dalolatnoma"
          name="mib_dalolatnoma"
          type="text"
          pattern="[0-9\-\/#]*"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9\-/#]/g, "");
          }}
          required
        />
        <FormSelect
          label="MIB tanlang"
          id="mibs"
          options={mibsOptions}
          value={selectedMib}
          onChange={handleMibChange}
          required
        />
        <FormInput
          label="Sud ijro varaqa raqami"
          id="sud_dalolatnoma"
          name="sud_dalolatnoma"
          type="text"
          pattern="[0-9\-\/#]*"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9\-/#]/g, "");
          }}
          required
        />
        <FormInput
          label="Sud ijro varaqa sanasi"
          id="sud_date"
          name="sud_date"
          type="date"
          required
        />
        <FormSelect
          label="SUD tanlang"
          id="suds"
          options={sudsOptions}
          value={selectedSud}
          onChange={handleSudChange}
          required
        />
      </>
    );

    if (status === "d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783") {
      return (
        <div className="space-y-4">
          {commonInputs}
          <FileUploader
            file={fileData}
            fileName={fileName}
            onRemove={removeFile}
            onChange={handleFileChange}
            accept=".pdf,.xls,.xlsx,.png,.jpg,.svg"
            label="Sotuv hujjatini yuklash uchun bosing"
            maxSize={10}
            sizeUnit="MB"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <FormInput
          label="Nima sababdan o'zgartirimoqda"
          id="document_title"
          name="document_title"
          type="text"
          placeholder="Text"
          required
        />
        {commonInputs}
        <FileUploader
          file={fileData}
          fileName={fileName}
          onRemove={removeFile}
          onChange={handleFileChange}
          accept=".pdf,.xls,.xlsx,.png,.jpg,.svg"
          label="Sotuv hujjatini yuklash uchun bosing"
          maxSize={10}
          sizeUnit="MB"
        />
        {status === "ed207621-3867-4530-8886-0fa434dedc19" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Mahsulot videosi</h3>
            <VideoUploader
              videoFile={videoFile}
              videoName={videoName}
              videoPreview={videoPreview}
              onRemove={removeVideo}
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    );
  }, [
    fileData,
    fileName,
    handleFileChange,
    handleMibChange,
    handleSudChange,
    mibsOptions,
    removeFile,
    removeVideo,
    selectedMib,
    selectedSud,
    status,
    sudsOptions,
    videoFile,
    videoName,
    videoPreview,
  ]);

  // Check if product exists to avoid potential issues
  if (!product || !product.id) {
    return (
      <div className="p-6 text-center">Mahsulot ma'lumotlari topilmadi</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Statusni o'zgartirish</h2>
        <button
          type="button"
          className="p-1 hover:bg-gray-100 rounded-full"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <StatusInfo product={product} status={status} />
        {renderInputs()}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="submit"
            className={`px-6 py-2 bg-[#249B73] rounded-md text-white hover:bg-[#1d7a5a] transition-colors flex items-center justify-center min-w-[100px] ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saqlanmoqda...
              </>
            ) : (
              "Saqlash"
            )}
          </button>
        </div>
      </div>

      {/* <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <div className="flex flex-col items-center p-4">
            <CircleCheck size={48} className="text-green-500" />
            <p className="text-center text-2xl pt-4">
              Mahsulotni statusni o'zgartirilsinmi?
            </p>
            <a
              href={
                eventId ? `/holatlar/${eventId}` : `/maxsulotlar/${product.id}`
              }
              className="w-full bg-green-600 text-center text-white py-2 rounded-md mt-4 cursor-pointer"
            >
              Ha
            </a>
          </div>
        </DialogContent>
      </Dialog> */}
    </form>
  );
}
