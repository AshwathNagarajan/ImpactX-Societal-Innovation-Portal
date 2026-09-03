import api from "./api.js";

export const analyticsService = {
  public: () => api.get("/analytics/public").then((res) => res.data),
  admin: () => api.get("/analytics/admin").then((res) => res.data),
  institute: () => api.get("/analytics/institute").then((res) => res.data),
  industry: () => api.get("/analytics/industry").then((res) => res.data),
  impact: () => api.get("/analytics/impact").then((res) => res.data),
};
