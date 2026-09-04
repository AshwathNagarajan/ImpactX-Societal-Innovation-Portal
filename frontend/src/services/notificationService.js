import api from "./api.js";

export const notificationService = {
  list: () => api.get("/notifications").then((res) => res.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.put("/notifications/read-all").then((res) => res.data),
};
