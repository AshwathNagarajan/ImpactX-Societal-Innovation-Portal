import { industryService } from "./industryService.js";

export const partnershipService = {
  create: (payload) => industryService.createPartnership(payload),
  supportProject: (projectId) => industryService.supportProject(projectId),
};
