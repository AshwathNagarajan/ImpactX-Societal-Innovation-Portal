export default function EvidenceViewer({ items = [] }) {
  const evidence = Array.isArray(items) ? items.filter(Boolean) : [];
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue">Evidence</p>
          <h2 className="mt-1 text-xl font-semibold text-navy md:text-2xl">Uploaded documents and OCR</h2>
        </div>
        <span className="text-sm font-semibold text-slate-500">{evidence.length} file(s)</span>
      </div>
      {evidence.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {evidence.map((item) => (
            <article key={item.evidence_id || item.id || item.original_name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-navy">{item.original_name || "Evidence file"}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.content_type || "stored file"} | {formatSize(item.size)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.ocr_status)}`}>{formatStatus(item.ocr_status)}</span>
              </div>
              {item.image_data_url && <img src={item.image_data_url} alt={item.original_name || "Evidence preview"} className="mt-4 max-h-56 w-full rounded-xl border bg-white object-contain" />}
              {item.ocr_text ? <p className="mt-4 max-h-36 overflow-auto rounded-xl bg-white p-4 text-sm leading-6 text-slate-600">{item.ocr_text}</p> : <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-500">No readable OCR text is stored for this file yet.</p>}
              {item.file_data_url && <a href={item.file_data_url} download={item.original_name || "evidence"} className="mt-4 inline-flex rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue">Download file</a>}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed bg-slate-50 p-5 text-sm font-semibold text-slate-500">No evidence files are attached to this record.</p>
      )}
    </section>
  );
}

function formatStatus(status = "") {
  return String(status || "not available").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSize(size = 0) {
  const value = Number(size) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status = "") {
  const normalized = String(status).toUpperCase();
  if (normalized === "COMPLETED") return "bg-green-50 text-green-700";
  if (normalized.includes("FAILED")) return "bg-red-50 text-red-600";
  if (normalized.includes("PENDING")) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}
