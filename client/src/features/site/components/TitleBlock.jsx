import { company } from "../../../config/company";
import { anchorClick } from "../../../lib/scroll";
import { ABOUT_TEXT, CORE_ACTIVITY, HERO_HEADLINE, HERO_IMAGE } from "../data/content";

export default function TitleBlock() {
  return (
    <section data-testid="hero" className="relative isolate overflow-hidden bg-ink text-white">
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" loading="eager" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <h1 data-testid="page-title" className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{company.name}</h1>
        <p className="mt-4 max-w-2xl font-display text-xl font-semibold leading-snug text-stone-100 sm:text-2xl">{HERO_HEADLINE}</p>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-stone-300 sm:text-base">{ABOUT_TEXT}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#products" data-testid="hero-cta-products" onClick={anchorClick("#products")}
             className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-stone-200">
            Our Products
          </a>
          <a href="#contact" data-testid="hero-cta-rfq" onClick={anchorClick("#contact")}
             className="rounded-md border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            Request a Quote
          </a>
        </div>

        <p data-testid="hero-core-activity" className="mt-14 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/20 pt-5 text-sm text-stone-200">
          <span className="font-semibold text-accent-light">Core activity:</span>
          {CORE_ACTIVITY.map((c, i) => (
            <span key={c}>{c}{i < CORE_ACTIVITY.length - 1 && <span className="ml-3 text-white/30">|</span>}</span>
          ))}
        </p>
      </div>
    </section>
  );
}
