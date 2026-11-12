import { useEffect, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { inquiryService } from "../../inquiries/inquiryService";

export default function Inquiries() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    inquiryService.list().then(setRows).catch(() => setError(true));
  }, []);

  return (
    <>
      <PageHeader title="Inquiries" subtitle="RFQs submitted from the website." />
      {error && <p className="text-sm text-red-600">Could not load inquiries. Is the API running?</p>}
      {!error && rows === null && <p className="text-sm text-stone-500">Loading…</p>}
      {rows && rows.length === 0 && <p className="text-sm text-stone-500">No inquiries yet.</p>}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto border hairline bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b hairline font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <tr>{["Date", "Name", "Company", "Contact", "Product", "Requirement"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hairline align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.company}</td>
                  <td className="px-4 py-3">{r.email}<br />{r.phone}</td>
                  <td className="px-4 py-3">{r.product}</td>
                  <td className="max-w-sm px-4 py-3">{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
