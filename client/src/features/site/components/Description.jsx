import Card from "../../../components/ui/Card";
import Check from "../../../components/ui/Check";
import { DESCRIPTION, STRENGTHS } from "../data/content";

export default function Description() {
  return (
    <Card id="about" title="Description">
      <div className="space-y-4 text-[15px] leading-relaxed text-stone-600">
        {DESCRIPTION.map((p) => <p key={p}>{p}</p>)}
      </div>
      <h3 className="mb-3 mt-7 font-display text-base font-bold text-ink">Key strengths</h3>
      <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {STRENGTHS.map((s) => (
          <li key={s} className="flex items-center gap-2.5 text-[15px] text-stone-700"><Check />{s}</li>
        ))}
      </ul>
    </Card>
  );
}
