import PageHeader from "./PageHeader";

export default function ComingSoon({ title, children }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="border hairline bg-white p-8 text-sm leading-relaxed text-stone-600">{children}</div>
    </>
  );
}
