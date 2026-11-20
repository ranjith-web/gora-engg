import { NavLink, Outlet, Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import { ADMIN_NAV } from "../features/admin/adminNav";
import { useAuth } from "../features/auth/AuthProvider";

// Only rendered for signed-in admins (see RequireAuth in app/routes.jsx).
export default function AdminLayout() {
  const { user, signOut } = useAuth();
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
        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          {user?.email && <p className="truncate text-xs text-stone-400" title={user.email}>{user.email}</p>}
          <button type="button" onClick={signOut} className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-white">Sign out</button>
          <Link to="/" className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-white">← View website</Link>
        </div>
      </aside>
      <div className="flex-1">
        <nav className="flex gap-2 overflow-x-auto border-b hairline bg-white p-3 md:hidden">
          {ADMIN_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${isActive ? "bg-ink text-white" : "text-stone-500"}`}>
              {n.label}
            </NavLink>
          ))}
          <button type="button" onClick={signOut} className="ml-auto whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Sign out</button>
        </nav>
        <main className="p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
