import api from "./api.js";

export const evidenceService = {
  upload: (files, entityType = "general", entityId = "") => {
    const form = new FormData();
    Array.from(files || []).forEach((file) => form.append("files", file));
    form.append("entity_type", entityType);
    form.append("entity_id", entityId);
    return api.post("/evidence/upload", form).then((res) => res.data);
  },
};
