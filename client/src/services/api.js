import axios from "axios";
import { supabase } from "../lib/supabase";

// One configured client for the whole app. Feature services build on this.
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api`,
  timeout: 15000,
});

// Send the signed-in admin's Supabase token with every API request.
api.interceptors.request.use(async (cfg) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// The API rejected the session (expired or signed out elsewhere): sign out here too,
// which sends the user back to the login page.
api.interceptors.response.use(undefined, (err) => {
  if (err.response?.status === 401 && supabase) supabase.auth.signOut();
  return Promise.reject(err);
});
