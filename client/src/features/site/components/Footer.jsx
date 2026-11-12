import Logo from "../../../components/ui/Logo";
import { anchorClick } from "../../../lib/scroll";
import { company, association } from "../../../config/company";
import { NAV_LINKS } from "../data/content";
import { PRODUCTS } from "../data/products";

export default function Footer() {
  return (
    <footer data-testid="footer" className="mt-16 bg-accent-soft text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-600">
            Tyre building drums manufacturing, Reconditioning, and spare parts supply.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Useful links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((n) => (
              <li key={n.hash}><a href={n.hash} data-testid={`footer-link-${n.id}`} onClick={anchorClick(n.hash)} className="text-stone-600 transition-colors hover:text-accent-brand">{n.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact us</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-600">
            {company.phone && <li data-testid="footer-phone">{company.phone}</li>}
            <li data-testid="footer-address">{association.address}</li>
            <li data-testid="footer-assoc-phone"><a href={`tel:${association.phone.replace(/[^+\d]/g, "")}`} className="hover:text-accent-brand">{association.phone}</a></li>
            <li data-testid="footer-assoc-email"><a href={`mailto:${association.email}`} className="break-all hover:text-accent-brand">{association.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-stone-600 sm:px-6">© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
