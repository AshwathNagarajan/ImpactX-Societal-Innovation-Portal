import axios from "axios";
import { safeGetItem, safeRemoveItem } from "../utils/auth.js";

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:8000/api"
  : "https://impactx-societal-innovation-portal.onrender.com/api";

const api = axios.create({
  baseURL: import.meta.env.API_URL || defaultApiUrl,
});

api.interceptors.request.use((config) => {
  const token = safeGetItem("impactx_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      safeRemoveItem("impactx_access_token");
      safeRemoveItem("impactx_user");
    }
    return Promise.reject(error);
  }
);

export default api;
