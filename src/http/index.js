import axios from "axios";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const $axios = axios.create({
  baseURL: VITE_BASE_URL,
  withCredentials: true,
});


export { $axios, VITE_BASE_URL };  