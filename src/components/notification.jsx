import { toast } from "react-toastify";

export const notification = (text, type = 'error', options = {}) => {
  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  };

  switch (type.toLowerCase()) {
    case 'success':
      toast.success(text, toastOptions);
      break;
    case 'warning':
      toast.warning(text, toastOptions);
      break;
    case 'info':
      toast.info(text, toastOptions);
      break;
    case 'error':
    default:
      toast.error(text, toastOptions);
  }
};