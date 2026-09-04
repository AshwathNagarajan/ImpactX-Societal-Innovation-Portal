import api from "./api.js";

export const projectService = {
  list: () => api.get("/projects").then((res) => res.data),
  get: (projectId) => api.get(`/projects/${projectId}`).then((res) => res.data),
  create: (payload) => api.post("/projects", payload).then((res) => res.data),
  update: (projectId, payload) => api.put(`/projects/${projectId}`, payload).then((res) => res.data),
  transition: (projectId, targetStatus, note = "") => api.post(`/projects/${projectId}/transition`, { target_status: targetStatus, note }).then((res) => res.data),
};
