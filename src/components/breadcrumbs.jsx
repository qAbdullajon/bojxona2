import React from "react";
import { useLocation, Link } from "react-router-dom";
import { navList } from "../utils";
import { usePathStore } from "../hooks/usePathStore";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const crumbs = [];
  const { name } = usePathStore();

  pathSegments.forEach((segment, index) => {
    const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`;

    // navListdagi eng yaqin mos marshrutni topamiz
    const matched = navList.find((item) => fullPath.startsWith(item.path));

    if (matched) {
      // Bu segment asl marshrut bo‘lsa
      if (fullPath === matched.path) {
        crumbs.push({
          name: matched.name,
          icon: matched.icon,
          color: matched.color,
          path: matched.path,
        });
      } else {
        // Bu qo‘shimcha segment (masalan: ID yoki boshqa yozuv)
        const extraName = name;

        crumbs.push({
          name: extraName,
          icon: matched.icon,
          color: matched.color,
          path: fullPath,
        });
      }
    }
  });

  return (
    <nav className="flex items-center space-x-2 text-sm px-4 py-2 rounded-md">
      <Link to="/" className="text-white hover:underline">
        Bosh sahifa
      </Link>
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span>/</span>
          <Link
            to={crumb.path}
            className="flex items-center space-x-1 hover:underline"
          >
            {/* <crumb.icon size={16} color={crumb.color} /> */}
            <span>{crumb.name}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
