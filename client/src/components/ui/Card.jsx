export default function Card({ id, title, children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-lg border hairline bg-white p-6 sm:p-8 ${className}`}>
      {title && <h2 className="mb-5 font-display text-xl font-bold text-ink">{title}</h2>}
      {children}
    </section>
  );
}
