import { Calendar, Check, MapPin, Package, Pencil, Truck } from "lucide-react";
import { getStatusStyle } from "../../utils/status";
import { format, isBefore } from "date-fns";
import { useEffect, useState } from "react";
import $api from "../../http/api";
import { notification } from "../../components/notification";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";

const InfoCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-[#249B73]",
}) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
      {title}
    </div>
    <div className="font-medium flex items-center">
      {Icon && <Icon className={`h-4 w-4 ${iconColor} mr-1`} />}
      {value || "Mavjud emas"}
    </div>
  </div>
);

const PriceDisplay = ({ value, unit }) => (
  <span>
    {value ? `${value.toLocaleString()} so'm` : "Narxi belgilanmagan"}
    {unit && value && ` / ${unit}`}
  </span>
);

export const ProductDetails = ({ product }) => {
  console.log(product);

  const [desc, setDesc] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setDesc(product.description || "");
      setUpdateDesc(product.description || "");
    }
  }, [product]);

  if (!product || Object.keys(product).length === 0) {
    return <div>Mahsulot ma'lumotlari yuklanmoqda...</div>;
  }

  const {
    name,
    quantity,
    unit,
    price,
    active_quantity,
    expiration_date,
    total_price,
    active_total_price,
    warehouse,
    region_product,
    event_product,
    statusProduct,
    sale_product_quantity,
    destroyed_product,
    document_product,
  } = product;

  const handleEditDesc = async () => {
    if (isEdit) {
      try {
        const res = await $api.patch(`/products/update/${product.id}`, {
          description: updateDesc,
        });
        if (res.status === 200) {
          setIsEdit(false);
          setDesc(updateDesc);
          setOpen(false);
        }
      } catch (error) {
        notification(error.response?.data?.message);
      }
    } else {
      setIsEdit(true);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <SectionTitle>Asosiy ma'lumotlar</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            title="Nomi"
            value={
              <>
                {name}
                {statusProduct && (
                  <span
                    className={`ml-2 text-xs font-medium px-2 min-w-[80px] py-0.5 rounded-full ${getStatusStyle(
                      statusProduct.product_status
                    )}`}
                  >
                    {statusProduct.product_status}
                  </span>
                )}
              </>
            }
          />
          <InfoCard title="Miqdori" value={`${quantity || 0} ${unit || ""}`} />
          {price != "0.00" && (
            <InfoCard
              title={`Har 1 ${unit} narxi`}
              value={<PriceDisplay value={price} />}
            />
          )}
          <InfoCard
            title="Amaldagi mahsulotlar"
            value={`${active_quantity || 0} ${unit || ""}`}
          />
          {destroyed_product?.length > 0 ? (
            <InfoCard
              title="MIB ning dalolat noma raqami"
              value={
                destroyed_product[destroyed_product.length - 1]?.mib_dalolatnoma
              }
            />
          ) : (
            document_product.length > 0 && (
              <InfoCard
                title="MIB ning dalolat noma raqami"
                value={
                  document_product[document_product.length - 1]?.mib_dalolatnoma
                }
              />
            )
          )}
          {destroyed_product?.length > 0 ? (
            <InfoCard
              title="MIB joylashuvi"
              value={
                destroyed_product[destroyed_product.length - 1]
                  ?.mib_destroyed_product?.name
              }
            />
          ) : (
            document_product.length > 0 && (
              <InfoCard
                title="MIB joylashuvi"
                value={
                  document_product[document_product.length - 1]?.mib_document
                    ?.name
                }
              />
            )
          )}
          {destroyed_product?.length > 0 ? (
            <InfoCard
              title="Sud ni dalolatnoma raqami"
              value={
                destroyed_product[destroyed_product.length - 1]?.sud_dalolatnoma
              }
            />
          ) : (
            document_product.length > 0 && (
              <InfoCard
                title="Sud ni dalolatnoma raqami"
                value={
                  document_product[document_product.length - 1]?.sud_dalolatnoma
                }
              />
            )
          )}
          {destroyed_product?.length > 0 ? (
            <InfoCard
              title="Sud sanasi"
              value={
                destroyed_product.at(-1)?.sud_date
                  ? format(
                      new Date(destroyed_product.at(-1).sud_date),
                      "yyyy-MM-dd"
                    )
                  : "Sana yo'q"
              }
            />
          ) : (
            <InfoCard
              title="Sud sanasi"
              value={
                document_product.at(-1)?.sud_date
                  ? format(
                      new Date(document_product.at(-1).sud_date),
                      "yyyy-MM-dd"
                    )
                  : "Sana yo'q"
              }
            />
          )}

          {destroyed_product?.length > 0 ? (
            <InfoCard
              title="Sud ni joylashuvi"
              value={
                destroyed_product?.length
                  ? destroyed_product[destroyed_product.length - 1]
                      ?.sud_destroyed_product?.name
                  : "Maʼlumot yoʻq"
              }
            />
          ) : (
            <InfoCard
              title="Sud ni joylashuvi"
              value={
                document_product?.length
                  ? document_product[document_product.length - 1]?.sud_document
                      ?.name
                  : "Maʼlumot yoʻq"
              }
            />
          )}

          {expiration_date && (
            <InfoCard
              title="Yaroqlilik muddati"
              value={
                <>
                  {expiration_date && format(expiration_date, "dd-MM-yyyy")}
                  {expiration_date && (
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isBefore(new Date(), new Date(expiration_date))
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isBefore(new Date(), new Date(expiration_date))
                        ? "Yaroqli"
                        : "Yaroqsiz"}
                    </span>
                  )}
                </>
              }
              icon={Calendar}
              iconColor="text-red-500"
            />
          )}
          {price != "0.00" && (
            <InfoCard
              title="Miqdorning umumiy narxi"
              value={<PriceDisplay value={total_price} />}
            />
          )}
          {price != "0.00" && (
            <InfoCard
              title="Amaldagi mahsulotlarning umumiy narxi"
              value={<PriceDisplay value={active_total_price} />}
            />
          )}
        </div>

        {/* Location Information Section */}
        <SectionTitle>Joylashuv ma'lumotlari</SectionTitle>

        <div className="bg-gradient-to-r from-[#249B73]/5 to-white p-4 rounded-lg border border-[#249B73]/10 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoCard
                title="Ombor"
                value={
                  <div className="flex gap-2 items-center">
                    {warehouse?.name}
                    {warehouse?.location && (
                      <div className="text-sm text-gray-500 mt-1">
                        {warehouse.location}
                      </div>
                    )}
                  </div>
                }
                icon={Package}
              />
            </div>

            <div>
              <InfoCard
                title="Mintaqa"
                value={region_product?.name}
                icon={MapPin}
              />
            </div>
          </div>
        </div>

        {sale_product_quantity !== 0 ? (
          <div className="mb-6 mt-4">
            {/* Additional Information */}
            <InfoCard
              title="Sotuvga berilgan maxsulotlar soni"
              value={`${sale_product_quantity}  ${unit}`}
            />
          </div>
        ) : null}
        <InfoCard
          title="Yuk xati raqami"
          value={event_product?.event_number}
          className="mt-6"
        />
        <div className="bg-gray-100 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-2xl">Mahsulot tarifi</p>
            <button
              onClick={() => (isEdit ? setOpen(true) : setIsEdit(true))}
              className="w-10 h-10 border cursor-pointer border-gray-400 rounded-full flex items-center justify-center"
            >
              {isEdit ? <Check size={24} /> : <Pencil size={20} />}
            </button>
          </div>

          {isEdit ? (
            <textarea
              className="border mt-2 border-gray-300 w-full outline-none p-2"
              onChange={(e) => setUpdateDesc(e.target.value)}
              value={updateDesc}
            />
          ) : (
            <p>{desc || "Tarif mavjud emas"}</p>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleEditDesc}
        message={"Kommentariyani o‘zgartirmoqchimisiz?"}
      />
    </div>
  );
};

// Helper component for section titles
const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-800 mb-4 mt-8 first:mt-0">
    {children}
  </h2>
);
