import api from "./api.js";

export const adminService = {
  pendingChallenges: () => api.get("/admin/challenges/pending").then((res) => res.data),
  approveChallenge: (challengeId) => api.put(`/admin/challenges/${challengeId}/approve`).then((res) => res.data),
  rejectChallenge: (challengeId) => api.put(`/admin/challenges/${challengeId}/reject`).then((res) => res.data),
  requestInfo: (challengeId) => api.put(`/challenges/${challengeId}`, { status: "UNDER_REVIEW" }).then((res) => res.data),
  updatePriority: (challengeId, priority) => api.put(`/admin/challenges/${challengeId}/priority`, { priority }).then((res) => res.data),
  assignChallenge: (challengeId, instituteId) => api.put(`/admin/challenges/${challengeId}/assign`, { institute_id: instituteId }).then((res) => res.data),
  assignmentRequests: () => api.get("/admin/assignment-requests").then((res) => res.data),
  approveAssignmentRequest: (requestId) => api.put(`/admin/assignment-requests/${requestId}/approve`).then((res) => res.data),
  updateAssignmentRequest: (requestId, payload) => api.put(`/admin/assignment-requests/${requestId}`, payload).then((res) => res.data),
  proposals: (status = "") => api.get("/admin/proposals", { params: status ? { status } : {} }).then((res) => res.data),
  updateProposal: (proposalId, payload) => api.put(`/admin/proposals/${proposalId}`, payload).then((res) => res.data),
  supportOffers: (status = "") => api.get("/admin/support-offers", { params: status ? { status } : {} }).then((res) => res.data),
  updateSupportOffer: (offerId, payload) => api.put(`/admin/support-offers/${offerId}`, payload).then((res) => res.data),
  jointProposals: (status = "") => api.get("/admin/joint-proposals", { params: status ? { status } : {} }).then((res) => res.data),
  updateJointProposal: (jointId, payload) => api.put(`/admin/joint-proposals/${jointId}`, payload).then((res) => res.data),
  users: () => api.get("/admin/users").then((res) => res.data),
  createUser: (payload) => api.post("/admin/users", payload).then((res) => res.data),
  updateUser: (userId, payload) => api.put(`/admin/users/${userId}`, payload).then((res) => res.data),
};
