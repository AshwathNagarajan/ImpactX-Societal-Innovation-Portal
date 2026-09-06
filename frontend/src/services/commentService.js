import api from "./api.js";

export const commentService = {
  list: async (entityType, entityId) => {
    const res = await api.get("/comments", { params: { entity_type: entityType, entity_id: entityId } });
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post("/comments", payload);
    return res.data;
  }
};
