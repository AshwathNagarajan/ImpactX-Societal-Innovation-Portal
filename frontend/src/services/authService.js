import api from "./api.js";
import { safeRemoveItem, safeSetItem } from "../utils/auth.js";

export async function loginWithApi(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.access_token) {
    safeSetItem("impactx_access_token", data.access_token);
  }
  return data;
}

export function clearApiToken() {
  safeRemoveItem("impactx_access_token");
}
