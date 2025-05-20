export const getStatusStyle = (status) => {
    switch (status) {
      case "Saqlovda":
        return "bg-blue-100 text-blue-800";
      case "Sotuvda":
        return "bg-green-100 text-green-800";
      case "Sotilgan":
        return "bg-yellow-100 text-yellow-800";
      case "Yo'q qilinadi":
        return "bg-orange-100 text-orange-800";
      case "Yo'q qilindi":
        return "bg-red-100 text-red-800";
      case "Egasiga qaytariladi":
        return "bg-purple-100 text-purple-800";
      case "Egasiga qaytarildi":
        return "bg-indigo-100 text-indigo-800";
      case "Beg'araz berilgan":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
