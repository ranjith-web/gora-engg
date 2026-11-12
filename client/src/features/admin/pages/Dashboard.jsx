import { Link } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
import { ADMIN_NAV } from "../adminNav";

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Internal tools for Gora Engineering Works." />
      <div className="grid gap-4 sm:grid-cols-3">
        {ADMIN_NAV.filter((n) => !n.end).map((n) => (
          <Link key={n.to} to={n.to} className="border hairline bg-white p-6 transition-colors hover:border-accent-brand">
            <p className="font-display text-xl font-bold">{n.label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
