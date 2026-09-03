import api from "./api.js";

export const aiService = {
  analyzeChallenge: (challengeId) => api.post(`/ai/analyze/${challengeId}`).then((res) => res.data),
  getAnalysis: (challengeId) => api.get(`/ai/analysis/${challengeId}`).then((res) => res.data),
};
