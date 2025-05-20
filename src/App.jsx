import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import Layout from "./pages/layout";
import Xodimlar from "./pages/xodimlar";
import Sotuvda from "./pages/sotuvda";
import EgasigaQaytarilgan from "./pages/egasiga-qaytarish";
import Omborxonalar from "./pages/omborxonalar";
import Statistika from "./pages/statistika";
import Arxive from "./pages/arxive";
import YoqQilingan from "./pages/yoq-qilinishi-kerak";
import Events from "./pages/events";
import EventDetail from "./pages/events/event-detail";
import Products from "./pages/products";
import PremiumProductDetailsPage from "./pages/products/maxsulot-detail";
import Shops from "./pages/shops";
import AllProducts from "./pages/shops/all-products";
import PandingProducts from "./pages/products/panding-products";
import WarehousesDetails from "./pages/omborxonalar/datails";
import Receipt from "./pages/product_chek";
import Settings from "./pages/settings";
import { ToastContainer } from "react-toastify";
import NotFoundPage from "./pages/not_found/Notfound";
import GiveFreely from "./pages/give-freely";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Events />} />
          <Route path="/holatlar/:id" element={<EventDetail />} />
          <Route path="/omborxonalar" element={<Omborxonalar />} />
          <Route path="/omborxonalar/:id" element={<WarehousesDetails />} />
          <Route path="/maxsulotlar" element={<Products />}>
            <Route path="/maxsulotlar/panding" element={<PandingProducts />} />
          </Route>
          <Route path="/maxsulotlar/:id/*" element={<PremiumProductDetailsPage />} />
          <Route path="/dokonlar" element={<Shops />} />
          <Route path="/dokonlar/:id" element={<AllProducts />} />
          <Route path="/sotuvda" element={<Sotuvda />} />
          <Route path="/begaraz-berilgan" element={<GiveFreely />} />
          <Route path="/yoq-qilingan" element={<YoqQilingan />} />
          <Route path="/egasiga-qaytarilgan" element={<EgasigaQaytarilgan />} />
          <Route path="/statistika" element={<Statistika />} />
          <Route path="/xodimlar" element={<Xodimlar />} />
          <Route path="/arxiv" element={<Arxive />} />
          <Route path="/profile" element={<Settings />} />
          <Route path="/all/stats/*" element={<Statistika />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Route>

        <Route path="/product/:id" element={<Receipt />} />
      </Routes>
      <ToastContainer />

    </>
  );
}
