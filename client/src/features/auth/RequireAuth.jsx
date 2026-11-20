import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/** Renders the admin area only for a signed-in user; otherwise sends them to the login page. */
export default function RequireAuth({ children }) {
  const { configured, loading, session } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6 font-body text-ink">
        <div className="max-w-md rounded-lg border hairline bg-white p-6 text-sm leading-relaxed text-stone-700">
          <p className="font-display text-lg font-bold text-ink">Login is not set up</p>
          <p className="mt-2">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> for the website, then rebuild.</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-stone-500">Loading…</div>;
  }
  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
