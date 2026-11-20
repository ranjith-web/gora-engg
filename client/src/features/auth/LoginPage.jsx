import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogoMark } from "../../components/ui/Logo";
import { useAuth } from "./AuthProvider";

const field = "w-full rounded-md border hairline bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-accent-brand focus:outline-none focus:ring-2 focus:ring-accent-brand/15";
const label = "mb-1.5 block text-xs font-semibold text-stone-600";

export default function LoginPage() {
  const { configured, loading, session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && session) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Wrong email or password." : err.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6 font-body text-ink">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border hairline bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-auto" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">Admin sign in</p>
            <p className="text-xs text-stone-500">Gora Engineering Works</p>
          </div>
        </div>

        {!configured ? (
          <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Login is not set up for this website yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className={label} htmlFor="l-email">Email</label>
              <input id="l-email" type="email" autoComplete="username" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="l-password">Password</label>
              <input id="l-password" type="password" autoComplete="current-password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full rounded-md bg-accent-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </div>
        )}
        <a href="/" className="mt-6 block text-center text-xs text-stone-500 hover:text-accent-brand">← Back to website</a>
      </form>
    </div>
  );
}
