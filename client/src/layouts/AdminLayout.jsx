import { NavLink, Outlet, Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import { ADMIN_NAV } from "../features/admin/adminNav";

// TODO: wrap in an auth guard (login) before exposing this publicly.
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-paper font-body text-ink">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink p-6 text-white md:flex">
        <Logo dark />
        <nav className="mt-10 flex flex-col gap-1">
          {ADMIN_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "bg-accent-brand text-white" : "text-stone-400 hover:text-white"
                }`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-auto font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-white">← View website</Link>
      </aside>
      <div className="flex-1">
        <nav className="flex gap-2 overflow-x-auto border-b hairline bg-white p-3 md:hidden">
          {ADMIN_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${isActive ? "bg-ink text-white" : "text-stone-500"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <main className="p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
