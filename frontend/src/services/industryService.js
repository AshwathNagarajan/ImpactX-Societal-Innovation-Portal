import api from "./api.js";

export const industryService = {
  dashboard: () => api.get("/industry/dashboard").then((res) => res.data),
  recommendedProjects: () => api.get("/industry/recommended-projects").then((res) => res.data),
  aiRecommendations: () => api.get("/industry/recommendations").then((res) => res.data),
  projects: () => api.get("/industry/projects").then((res) => res.data),
  createPartnership: (payload) => api.post("/industry/partnerships", payload).then((res) => res.data),
  supportProject: (projectId) => api.post(`/industry/projects/${projectId}/support`).then((res) => res.data),
};
