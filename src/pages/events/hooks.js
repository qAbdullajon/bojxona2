import { notification } from "../../components/notification";
import $api from "../../http/api";

export const allProducts = async (id, page, limit) => {
  try {
    const res = await $api.get(`/events/products/by/${id}?page=${page}&limit=${limit}`);
    return res;
  } catch (error) {
    notification(error.response?.data?.message)
  }
};
