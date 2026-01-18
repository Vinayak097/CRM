import api from "./api";

export const locationService = {
  searchLocations: async (q: string, limit: number = 10) => {
    const response = await api.get(
      `/locations/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
    return response.data; // backend returns array of locations
  },
  getAllLocations: async () => {
    const response = await api.get(`/locations/search?q=&limit=100`);
    return response.data;
  },
};
