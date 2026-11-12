import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent-brand">404</p>
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <Link to="/" className="bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white hover:bg-accent-brand">
        Back to home
      </Link>
    </div>
  );
}
