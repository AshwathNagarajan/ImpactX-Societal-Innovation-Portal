import { instituteService } from "./instituteService.js";

export const proposalService = {
  create: (payload) => instituteService.submitProposal(payload),
};
