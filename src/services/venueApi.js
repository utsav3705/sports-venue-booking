import api from "./authApi";

/**
 * VENUE API SERVICE
 *
 * All requests use the shared `api` axios instance from authApi.js,
 * which automatically attaches the JWT Bearer token from localStorage.
 */
export const venueApi = {
  /** GET /api/venues — optional { sport, area } query params */
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.sport && filters.sport !== "all") params.sport = filters.sport;
    if (filters.area && filters.area !== "all") params.area = filters.area;
    const res = await api.get("/venues", { params });
    return res.data;
  },

  /** GET /api/venues/:id */
  getById: async (id) => {
    const res = await api.get(`/venues/${id}`);
    return res.data;
  },

  /** POST /api/venues — venue_owner or admin only */
  create: async (venueData) => {
    const res = await api.post("/venues", venueData);
    return res.data;
  },

  /** PUT /api/venues/:id — own venue or admin only */
  update: async (id, venueData) => {
    const res = await api.put(`/venues/${id}`, venueData);
    return res.data;
  },

  /** DELETE /api/venues/:id — own venue or admin only */
  remove: async (id) => {
    const res = await api.delete(`/venues/${id}`);
    return res.data;
  },
};

export default venueApi;
