import api from "./api.js";

export const auditService = {
  events: (params = {}) => api.get("/audit/events", { params }).then((res) => res.data),
};
