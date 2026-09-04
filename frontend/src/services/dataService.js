import api from "./api.js";

export async function getPublicData() {
  const { data } = await api.get("/data/public");
  return data.data;
}
