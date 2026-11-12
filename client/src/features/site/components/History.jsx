import Card from "../../../components/ui/Card";
import { FOUNDED_YEAR, HISTORY, YEARS_OF_EXPERIENCE } from "../data/content";

export default function History() {
  return (
    <Card id="history" title="Company history">
      <div className="grid gap-4 sm:grid-cols-2">
        <div data-testid="history-founded" className="rounded-lg bg-accent-soft p-5">
          <p className="font-display text-4xl font-bold text-accent-brand">{FOUNDED_YEAR}</p>
          <p className="mt-1 text-sm text-stone-600">Year we started</p>
        </div>
        <div data-testid="history-years" className="rounded-lg bg-accent-soft p-5">
          <p className="font-display text-4xl font-bold text-accent-brand">{YEARS_OF_EXPERIENCE} years</p>
          <p className="mt-1 text-sm text-stone-600">Experience in tyre building drum manufacture</p>
        </div>
      </div>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-stone-600">
        {HISTORY.map((p) => <p key={p}>{p}</p>)}
      </div>
    </Card>
  );
}
