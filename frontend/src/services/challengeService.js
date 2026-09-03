import api from "./api.js";

export const challengeService = {
  create: (payload) => api.post("/challenges", payload).then((res) => res.data),
  list: (params) => api.get("/challenges", { params }).then((res) => res.data),
  get: (challengeId) => api.get(`/challenges/${challengeId}`).then((res) => res.data),
};
