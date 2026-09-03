import api from "./api.js";

export const aiService = {
  analyzeChallenge: (challengeId) => api.post(`/ai/challenges/${challengeId}/analyze`).then((res) => res.data),
  getAnalysis: (challengeId) => api.get(`/ai/challenges/${challengeId}/analysis`).then((res) => res.data),
  getSimilarChallenges: (challengeId) => api.get(`/ai/challenges/${challengeId}/similar`).then((res) => res.data),
  getInstituteRecommendations: (challengeId) => api.get(`/ai/challenges/${challengeId}/institutes`).then((res) => res.data),
  generateSolutions: (challengeId) => api.post(`/ai/challenges/${challengeId}/solutions`).then((res) => res.data),
  getIndustryRecommendations: (projectId) => api.get(`/ai/projects/${projectId}/industries`).then((res) => res.data),
  generateRoadmap: (projectId) => api.post(`/ai/projects/${projectId}/roadmap`).then((res) => res.data),
  getProjectHealth: (projectId) => api.get(`/ai/projects/${projectId}/health`).then((res) => res.data),
  getNextActions: (projectId) => api.get(`/ai/projects/${projectId}/next-actions`).then((res) => res.data),
  summarizeProjectProgress: (projectId) => api.post(`/ai/projects/${projectId}/progress-summary`).then((res) => res.data),
  getAdminReviewCenter: () => api.get("/ai/admin/review-center").then((res) => res.data),
};
