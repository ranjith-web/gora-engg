import { createClient } from "@supabase/supabase-js";

// Supabase is used only for the admin login. Both values are public (safe in the browser);
// access is enforced by the API, which checks the signed-in user on every request.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
