import { useState } from "react";
import Logo from "../../../components/ui/Logo";
import { anchorClick } from "../../../lib/scroll";
import { NAV_LINKS } from "../data/content";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const go = (hash) => (e) => {
    setOpen(false);
    anchorClick(hash)(e);
  };

  return (
    <header data-testid="header-nav" className="sticky top-0 z-50 border-b hairline bg-white">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.hash} data-testid={`nav-link-${l.id}`} onClick={go(l.hash)}
               className="text-sm font-medium text-stone-600 transition-colors hover:text-accent-brand">
              {l.label}
            </a>
          ))}
          <a href="#contact" data-testid="nav-cta-button" onClick={go("#contact")}
             className="rounded-md bg-accent-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
            Request a Quote
          </a>
        </nav>
        <button aria-label="Toggle menu" data-testid="nav-mobile-toggle" onClick={() => setOpen((v) => !v)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden">
          <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="border-t hairline bg-white px-4 py-2 md:hidden" data-testid="nav-mobile-panel">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.hash} onClick={go(l.hash)} className="block border-b hairline py-3.5 text-base font-medium last:border-0">{l.label}</a>
          ))}
          <a href="#contact" onClick={go("#contact")} className="my-3 block rounded-md bg-accent-brand px-5 py-3 text-center text-sm font-semibold text-white">Request a Quote</a>
        </div>
      )}
    </header>
  );
}
