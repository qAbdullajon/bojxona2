import { format } from "date-fns";
import React from "react";

export default function PriceHistoryTable({ product }) {
  const data = [
    {
      status: "Saqlovda",
      price: product?.price,
      date: product?.createdAt && format(product?.createdAt, "yyyy-MM-dd"),
    },
  ];
  product.sales_product?.map((item) =>
    data.push({
      status: "Sotuvda",
      date: item?.sud_date && format(item?.sud_date, "yyyy-MM-dd"),
      price: item?.discount_price[0].price
    })
  );
  product.document_product?.map((item) =>
    data.push({
      status: "Sotuvda",
      date: item?.sud_date && format(item?.sud_date, "yyyy-MM-dd"),
      price: item?.discount_price && item?.discount_price[0]?.price
    })
  );
  return (
    <div className="bg-white w-full p-4 grid">
      <div className="grid grid-cols-3">
        <div className="text-xl">Status</div>
        <div className="text-xl">Narxi</div>
        <div className="text-xl">Sanasi</div>
      </div>
      {data.map((item) => (
        <div className="grid grid-cols-3">
          <div className="text-base py-2">{item.status}</div>
          <div className="text-base py-2">{item.price}</div>
          <div className="text-base py-2">{item.date}</div>
        </div>
      ))}
    </div>
  );
}
