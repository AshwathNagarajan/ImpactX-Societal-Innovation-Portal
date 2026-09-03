import api from "./api.js";

export const instituteService = {
  dashboard: () => api.get("/institute/dashboard").then((res) => res.data),
  assignedChallenges: () => api.get("/institute/assigned-challenges").then((res) => res.data),
  recommendedChallenges: () => api.get("/institute/recommended-challenges").then((res) => res.data),
  acceptChallenge: (challengeId) => api.post(`/institute/challenges/${challengeId}/accept`).then((res) => res.data),
  rejectChallenge: (challengeId) => api.post(`/institute/challenges/${challengeId}/reject`).then((res) => res.data),
  submitProposal: (payload) => api.post("/institute/proposals", payload).then((res) => res.data),
  projects: () => api.get("/institute/projects").then((res) => res.data),
};
