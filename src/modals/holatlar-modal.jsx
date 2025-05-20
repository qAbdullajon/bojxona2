import {
  Box,
  CircularProgress,
  ClickAwayListener,
  MenuItem,
  Modal,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  X,
  Trash2,
  FileText,
  LoaderCircle,
  Image,
  ChevronDown,
} from "lucide-react";
import { useEventStore } from "../hooks/useModalState";
import { notification } from "../components/notification";
import $api from "../http/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function EventsModal() {
  const {
    open,
    onClose,
    createData,
    editData,
    updateState,
    toggleIsAddModal,
    setText,
    setType,
  } = useEventStore();
  console.log(editData);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_number: editData?.event_number || "",
    shipperId: editData?.name || "",
    date: "",
    description: "",
    offender_full_name: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [filesData, setFilesData] = useState([]);
  const [hasFile, setHasFile] = useState(false);

  const [shipperSearch, setShipperSearch] = useState("");
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [shippers, setShippers] = useState([]);
  const [allShippers, setAllShippers] = useState([]);
  const [shipperLoading, setShipperLoading] = useState(false);
  const [showShipperDropdown, setShowShipperDropdown] = useState(false);

  useEffect(() => {
    if (editData?.id) {
      setFormData({
        name: editData?.name || "",
        event_number: editData?.event_number || "",
        date: editData?.date || "",
      });
    }
  }, [editData]);

  const resetForm = () => {
    setFormData({
      description: "",
      event_number: "",
      date: "",
      offender_full_name: "",
    });
    setImages([]);
    setPreviews([]);
    setHasFile(false);
    setFiles([]);
    setFilesData([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
        notification(
          `${file.name} - faqat JPG yoki PNG formatidagi rasmlar qabul qilinadi`,
          "error"
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      newImages.push({
        name: file.name,
        size: file.size,
        type: file.type,
        fileObject: file,
      });
    });

    setImages([...images, ...newImages]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilesData((prev) => [...prev, { name: file.name, size: file.size }]);
    setFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        fileObject: file,
      },
    ]);
  };
  const fetchShippers = async () => {
    setShipperLoading(true);
    try {
      const res = await $api.get("shipper/all");

      if (res.status === 200) {
        setAllShippers(res.data.shippers);
        filterShippers(res.data.shippers, shipperSearch);
      }
    } catch (error) {
      notification(
        error.response?.data?.message || "Shipperlarni yuklashda xatolik"
      );
      return;
    } finally {
      setShipperLoading(false);
    }
  };
  // Filter shippers (client-side)
  const filterShippers = (shippersList, search = "") => {
    let filtered = shippersList;

    if (search) {
      filtered = filtered.filter((shipper) =>
        shipper.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setShippers(filtered);
  };

  useEffect(() => {
    if (allShippers.length > 0) {
      filterShippers(allShippers, shipperSearch);
    }
  }, [shipperSearch, allShippers]);

  useEffect(() => {
    if (open) {
      setShipperSearch("");
      setSelectedShipper(null);
      setShippers([]);
      setAllShippers([]);
      setShipperLoading(false);
      setShowShipperDropdown(false);
    }
  }, [open]);

  const toggleDropdown = (setter, fetchFn, condition) => {
    setter((prev) => {
      if (!prev && condition) {
        fetchFn();
      }
      return !prev;
    });
  };
  const toggleShipperDropdown = () =>
    toggleDropdown(
      setShowShipperDropdown,
      () => {
        setShipperSearch("");
        fetchShippers();
      },
      allShippers.length === 0
    );

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilesData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShipper && !editData?.id) {
      notification("Topshiruvchini kiriting");
      return;
    }
    if (files.length === 0 && !editData?.id) {
      notification("Fayl yuklanmagan", "error");
      return;
    }

    if (!formData.event_number) {
      notification("Holat raqamini kiriting");
      return;
    }

    if (!formData.date) {
      notification("Sanani kiriting");
      return;
    }

    const newData = new FormData();
    newData.append("event_number", formData.event_number);
    newData.append("date", formData.date);
    newData.append("shipperId", selectedShipper);
    newData.append("description", formData.description);
    newData.append("offender_full_name", formData.offender_full_name);

    if (hasFile && Array.isArray(images)) {
      images.forEach((image) => {
        if (image?.fileObject) {
          newData.append("event_images", image.fileObject);
        }
      });
    }

    files.forEach((file) => {
      if (file?.fileObject) {
        newData.append("event_file", file.fileObject);
      }
    });

    setLoading(true);

    if (editData?.id) {
      // Yangilash
      try {
        const updatedData = {
          date: formData.date,
          description: formData.description,
          event_number: formData.event_number,
          shipperId: selectedShipper
        };

        const res = await $api.patch(
          `/events/update/${editData.id}`,
          updatedData
        );

        if (res.status === 200) {
          updateState({ ...updatedData, id: editData.id });
          notification("Muvaffaqiyatli yangilandi", "success");
          onClose();
          return;
        }
        resetForm();
      } catch (err) {
        console.error("Yangilashda xatolik:", err);
        notification(
          err.response?.data?.message || "Yangilashda xatolik yuz berdi",
          "error"
        );
        return;
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await $api.post(`/events/create`, newData);
        if (res.status === 201) {
          onClose();
          createData({ ...res.data.data, productsCount: 0 });
          notification("Muvaffaqiyatli yaratildi", "success");
          setType("create-product");
          setText("Mahsulot qo'shmoqchimisiz?");
          toggleIsAddModal();
        }
        resetForm();
      } catch (err) {
        notification(
          err.response?.data?.message || "Yaratishda xatolik yuz berdi",
          "error"
        );
        return;
      } finally {
        setLoading(false);
      }
    }
  };

  const CustomSelect = ({
    value,
    placeholder,
    showDropdown,
    toggleDropdown,
    selectedItem,
    items,
    loading,
    search,
    setSearch,
    hasMore,
    loadMore,
    onSelect,
    searchPlaceholder,
    displayField = "name",
    akk = false,
    disabled = false,
  }) => (
    <div className="relative mb-4">
      <div
        onClick={!disabled ? toggleDropdown : undefined}
        className={`flex items-center justify-between border border-gray-300 rounded-md p-2 ${
          disabled ? "bg-gray-100" : "cursor-pointer hover:border-gray-400"
        } transition-colors`}
      >
        <span className={value ? "text-black" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`transition-transform ${
            showDropdown ? "rotate-180" : ""
          } ${disabled ? "text-gray-400" : ""}`}
        />
      </div>

      {showDropdown && !disabled && (
        <ClickAwayListener onClickAway={toggleDropdown}>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                size="small"
                fullWidth
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "gray" },
                    "&:hover fieldset": { borderColor: "gray" },
                    "&.Mui-focused fieldset": { borderColor: "gray" },
                  },
                }}
              />
            </div>

            {loading && (
              <div className="flex justify-center p-2">
                <CircularProgress size={24} />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {items.length > 0
                ? items.map((item, i) => (
                    <MenuItem
                      key={i}
                      onClick={() => {
                        onSelect(item.id);
                        toggleDropdown();
                      }}
                      selected={selectedItem === item.id}
                      sx={{
                        backgroundColor:
                          selectedItem === item.id ? "#f5f5f5" : "white",
                        fontWeight: selectedItem === item.id ? "600" : "normal",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      {akk
                        ? `#${item["event_number"]} - ${item["name"]}`
                        : item[displayField]}
                    </MenuItem>
                  ))
                : !loading && (
                    <p className="text-center p-3 text-gray-500">
                      Ma'lumot topilmadi
                    </p>
                  )}

              {hasMore && items.length > 0 && (
                <div className="p-2 border-t border-gray-200 text-center">
                  <Button
                    size="small"
                    onClick={loadMore}
                    disabled={loading}
                    sx={{
                      color: "#249B73",
                      "&:hover": {
                        backgroundColor: "rgba(36, 155, 115, 0.08)",
                      },
                    }}
                  >
                    Ko'proq yuklash
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ClickAwayListener>
      )}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">
              {editData?.id
                ? "Yuk xatini tahrirlash"
                : "Yangi yuk xati qo'shish"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event_number" className="text-sm text-gray-600">
                Yuk xati raqami <span className="text-red-500">*</span>
              </label>
              <input
                id="event_number"
                name="event_number"
                type="number"
                defaultValue={formData.event_number}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>

            <CustomSelect
              value={
                selectedShipper
                  ? shippers.find((s) => s.id === selectedShipper)?.name
                  : ""
              }
              placeholder="Topshiruvchi"
              showDropdown={showShipperDropdown}
              toggleDropdown={toggleShipperDropdown}
              selectedItem={selectedShipper}
              items={shippers}
              loading={shipperLoading}
              search={shipperSearch}
              setSearch={setShipperSearch}
              hasMore={false}
              loadMore={() => {}}
              onSelect={setSelectedShipper}
              searchPlaceholder="Topshiruvchi qidirish"
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm text-gray-600">
                Sana <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={formData.date}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>
            {/* File upload section */}
            {!editData?.id && (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <FileText size={40} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Faylni yuklash uchun bosing
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf, .xls, .xlsx, .doc, .docx"
                  />
                </label>
                {filesData.map((item, i) => (
                  <div key={i} className="border border-gray-300 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText size={24} className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(item.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <label className="cursor-pointer mr-2">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1 text-red-500 hover:bg-gray-100 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!editData?.id && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="offender_full_name"
                  className="text-sm text-gray-600"
                >
                  Huquq buzar
                </label>
                <input
                  id="offender_full_name"
                  name="offender_full_name"
                  type="text"
                  defaultValue={formData.offender_full_name}
                  onChange={handleChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm text-gray-600">
                Yuk xati tavsifi
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={formData.description}
                onChange={handleChange}
                className="w-full px-3 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Holat file switch */}
            {!editData?.id && (
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-300 mt-2">
                <p className="text-base font-medium">Yuk xati rasm</p>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasFile}
                    onChange={(e) => setHasFile(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-1 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#249B73]"></div>
                </label>
              </div>
            )}

            {hasFile && !editData?.id && (
              <div className="space-y-4 mt-2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Image size={40} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Rasmni yuklash uchun bosing
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png"
                    multiple
                  />
                </label>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Yuklangan rasmlar ({images.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative border border-gray-300 rounded p-2"
                        >
                          <img
                            src={previews[index]}
                            alt={`Yuklangan rasm ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs truncate max-w-[80%]">
                              {image.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 text-red-500 hover:bg-gray-100 rounded-full cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="absolute top-1 left-1 bg-black text-white text-xs py-0.5 px-1.5 rounded">
                            {(image.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="w-[100px] py-2 bg-[#249B73] rounded-md text-white hover:bg-[#1d7a5a] transition-colors"
              >
                {loading ? (
                  <div className="animate-spin flex items-center justify-center">
                    <LoaderCircle />
                  </div>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
