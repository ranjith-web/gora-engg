import { CUSTOMERS } from "../data/content";

export default function Customers() {
  return (
    <section data-testid="customers" className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-14">
      <h2 className="text-center font-display text-xl font-bold text-ink sm:text-2xl">Our customers</h2>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CUSTOMERS.map((c) => (
          <li key={c.name} data-testid={`customer-${c.name.toLowerCase()}`}
              className="flex h-24 items-center justify-center rounded-lg border hairline bg-white px-4">
            {c.logo
              ? <img src={c.logo} alt={c.name} className="max-h-10 w-auto max-w-full object-contain" />
              : <span className="font-display text-2xl font-bold tracking-tight text-stone-700">{c.name}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
