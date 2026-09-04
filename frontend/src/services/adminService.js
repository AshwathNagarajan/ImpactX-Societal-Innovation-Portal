import api from "./api.js";

export const adminService = {
  pendingChallenges: () => api.get("/admin/challenges/pending").then((res) => res.data),
  approveChallenge: (challengeId) => api.put(`/admin/challenges/${challengeId}/approve`).then((res) => res.data),
  rejectChallenge: (challengeId) => api.put(`/admin/challenges/${challengeId}/reject`).then((res) => res.data),
  requestInfo: (challengeId) => api.put(`/challenges/${challengeId}`, { status: "UNDER_REVIEW" }).then((res) => res.data),
  updatePriority: (challengeId, priority) => api.put(`/admin/challenges/${challengeId}/priority`, { priority }).then((res) => res.data),
  assignChallenge: (challengeId, instituteId) => api.put(`/admin/challenges/${challengeId}/assign`, { institute_id: instituteId }).then((res) => res.data),
};
