import {
  AlarmClock,
  Archive,
  BaggageClaim,
  BookmarkX,
  ChartNoAxesCombined,
  ChartPie,
  Codepen,
  Flower,
  // GalleryVerticalEnd,
  Hourglass,
  Inbox,
  Library,
  Mailbox,
  Package,
  PackageX,
  Percent,
  RouteOff,
  ShoppingBag,
  ShoppingCart,
  Store,
  // SlidersHorizontal,
  User,
  UsersRound,
  Warehouse,
} from "lucide-react";

export const navList = [
  {
    id: 1,
    name: "Yuk Xatlari",
    icon: Mailbox,
    color: "#1e88e5", // ko‘k - pochta bilan bog‘liq
    path: "/",
  },
  {
    id: 2,
    name: "Omborxonalar",
    icon: Warehouse,
    color: "#6d4c41", // jigarrang - ombor, yerga yaqin rang
    path: "/omborxonalar",
  },
  {
    id: 3,
    name: "Mahsulotlar",
    icon: Package,
    color: "#ffb300", // sariq - qadoqlash va mahsulotlarga mos
    path: "/maxsulotlar",
  },
  {
    id: 4,
    name: "Do'konlar",
    icon: Store,
    color: "#7b1fa2", // binafsha - chakana savdo bilan bog‘liq
    path: "/dokonlar",
  },
  {
    id: 5,
    name: "Sotuvda",
    icon: Percent,
    color: "#43a047", // yashil - faol harakat, sotuv
    path: "/sotuvda",
  },
  {
    id: 13,
    name: "Sotilgan",
    icon: BaggageClaim,
    color: "#20dee2", // yashil - faol harakat, sotuv
    path: "/sotilgan",
  },
  {
    id: 7,
    name: "Egasiga qaytarildi",
    icon: RouteOff,
    color: "#3949ab", // moviy-binafsha - qaytish yo‘li
    path: "/egasiga-qaytarilgan",
  },
  {
    id: 6,
    name: "Yo'q qilindi",
    icon: PackageX,
    color: "#e53935", // qizil - xavf, yo‘q qilishga mos
    path: "/yoq-qilingan",
  },
  {
    id: 12,
    name: "Begaraz berilgan",
    icon: Codepen,
    color: "#fa31ce", // yashil - faol harakat, sotuv
    path: "/begaraz-berilgan",
  },
  {
    id: 9,
    name: "Statistika",
    icon: ChartPie,
    color: "#00897b", // to‘q ko‘k-yashil - data, analiz
    path: "/statistika",
  },

  {
    id: 10,
    name: "Arxiv",
    icon: Archive,
    color: "#757575", // kulrang - arxivlangan, pasiv holat
    path: "/arxiv",
  },
  {
    id: 8,
    name: "Xodimlar",
    icon: UsersRound,
    color: "#fb8c00", // to'q sariq - insonlar, energiya
    path: "/xodimlar",
  },
  {
    id: 11,
    name: "Profil",
    icon: User,
    color: "#5e35b1", // binafsha - shaxsiy profilga mos
    path: "/profile",
  },
];

export const Statuses = [
  { id: "d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783", name: "Sotuvda" },
  { id: "01f8dafe-c399-4d04-9814-31b572e95f0d", name: "Saqlovda" },
  { id: "3cb7247b-88b9-4769-bbfa-47341e339b89", name: "Sotilgan" },
  { id: "d52a7e64-387b-4cc8-8044-2772aa9764bf", name: "Yo'q qilinadi" },
  { id: "ed207621-3867-4530-8886-0fa434dedc19", name: "Yo'q qilindi" },
  { id: "9f90c564-2ce0-4026-b4e3-613762aa3c43", name: "Egasiga qaytariladi" },
  { id: "ea2d9a99-0e0b-41ba-bf8b-d77e9b24bd4b", name: "Egasiga qaytarildi" },
  { id: "3a926719-31d2-4a47-8117-b15ab503b5bc", name: "Beg'araz berilgan" },
];
