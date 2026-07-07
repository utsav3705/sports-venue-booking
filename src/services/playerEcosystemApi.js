import api from "./authApi";

export const teamApi = {
  getAll: async () => {
    const res = await api.get("/teams");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/teams/${id}`);
    return res.data;
  },
  create: async (teamData) => {
    const res = await api.post("/teams", teamData);
    return res.data;
  },
  update: async (id, teamData) => {
    const res = await api.put(`/teams/${id}`, teamData);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  },
  requestJoin: async (id) => {
    const res = await api.post(`/teams/${id}/request`);
    return res.data;
  },
  resolveRequest: async (id, payload) => {
    const res = await api.post(`/teams/${id}/resolve`, payload);
    return res.data;
  },
  removeMember: async (id, playerId) => {
    const res = await api.post(`/teams/${id}/remove`, { playerId });
    return res.data;
  },
  leave: async (id) => {
    const res = await api.post(`/teams/${id}/leave`);
    return res.data;
  },
};

export const playerApi = {
  getAll: async () => {
    const res = await api.get("/players");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/players/${id}`);
    return res.data;
  },
  connect: async (id) => {
    const res = await api.post(`/players/${id}/connect`);
    return res.data;
  },
  resolveConnect: async (id, action) => {
    const res = await api.post(`/players/${id}/resolve-connect`, { action });
    return res.data;
  },
  disconnect: async (id) => {
    const res = await api.delete(`/players/${id}/connect`);
    return res.data;
  },
};

export const matchApi = {
  getAll: async () => {
    const res = await api.get("/matches");
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/matches/${id}`);
    return res.data;
  },
  create: async (matchData) => {
    const res = await api.post("/matches", matchData);
    return res.data;
  },
  join: async (id) => {
    const res = await api.post(`/matches/${id}/join`);
    return res.data;
  },
  leave: async (id) => {
    const res = await api.post(`/matches/${id}/leave`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.delete(`/matches/${id}`);
    return res.data;
  },
};

export const notificationApi = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
