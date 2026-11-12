import axios from "axios";

// One configured client for the whole app. Feature services build on this.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  timeout: 15000,
});

// Future: attach auth token here once the admin area has login.
// api.interceptors.request.use((cfg) => { ...; return cfg; });
