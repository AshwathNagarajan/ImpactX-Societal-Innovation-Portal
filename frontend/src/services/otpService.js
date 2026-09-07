import api from "./api.js";

export const otpService = {
  request: (mobile) => api.post("/otp/request", { mobile }).then((res) => res.data),
  verify: (payload) => api.post("/otp/verify", payload).then((res) => res.data),
};
