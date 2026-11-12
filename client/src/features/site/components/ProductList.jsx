import Card from "../../../components/ui/Card";
import Check from "../../../components/ui/Check";
import { PRODUCTS } from "../data/products";

export default function ProductList() {
  return (
    <Card id="products" title="Products / Services">
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {PRODUCTS.map((p) => (
          <li key={p.id} data-testid={`product-${p.id}`} className="flex gap-3">
            <Check className="mt-0.5" />
            <div>
              <p className="font-semibold text-ink">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{p.desc}</p>
              <p className="mt-1.5 text-xs text-stone-500">{p.tags.join(" · ")}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
