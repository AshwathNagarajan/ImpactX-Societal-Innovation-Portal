import api from "./api.js";

export async function loginWithApi(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  if (data.access_token) {
    localStorage.setItem("impactx_access_token", data.access_token);
  }
  return data;
}

export function clearApiToken() {
  localStorage.removeItem("impactx_access_token");
}
