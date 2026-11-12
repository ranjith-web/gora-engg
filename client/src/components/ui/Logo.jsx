import { Link } from "react-router-dom";
import { scrollToTop } from "../../lib/scroll";

export const LogoMark = ({ className = "h-9 w-auto" }) => (
  <img src="/gora-logo.png" alt="Gora Engineering Works" className={className} />
);

export default function Logo({ dark = false }) {
  return (
    <Link
      to="/"
      data-testid="logo-link"
      onClick={() => scrollToTop()}
      className={`flex items-center gap-3 ${dark ? "text-white" : "text-ink"}`}
    >
      <LogoMark className="h-9 w-auto shrink-0" />
      <span className="leading-none">
        <span className="block font-display text-[15px] font-extrabold tracking-[0.14em]">GORA</span>
        <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.18em] opacity-70">Engineering Works</span>
      </span>
    </Link>
  );
}
