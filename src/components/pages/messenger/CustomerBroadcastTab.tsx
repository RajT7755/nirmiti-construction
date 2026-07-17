import { useMemo, useState } from "react";
import { Search, Send, CheckCircle2, X } from "lucide-react";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import {
  CUSTOMER_BROADCAST_TEMPLATE_VARIABLES,
  renderWhatsAppTemplate,
} from "@/lib/messenger/templates";
import { Button } from "@/components/ui/Button";

interface SelectedCustomer {
  id: string;
  name: string;
  phone: string;
  flat: string;
  project: string;
}

/**
 * Broadcast WhatsApp to multiple customers — Search → Selected To → From → Preview.
 */
export function CustomerBroadcastTab({
  customerProfiles,
  companyName,
  template,
  onWhatsAppSend,
}: {
  customerProfiles: CustomerDetailProfile[];
  companyName: string;
  template: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedCustomer[]>([]);
  const [sendOk, setSendOk] = useState(false);

  const activeProfiles = useMemo(
    () => customerProfiles.filter((p) => p.status !== "inactive"),
    [customerProfiles]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = activeProfiles.map((p) => ({
      id: p.id,
      name: p.name,
      phone: (p.phone ?? "").trim(),
      flat: p.flat,
      project: p.project,
    }));
    if (!q) return list.slice(0, 30);
    return list
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.flat.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [query, activeProfiles]);

  function toggle(r: SelectedCustomer) {
    setSelected((prev) => {
      if (prev.some((p) => p.id === r.id)) return prev.filter((p) => p.id !== r.id);
      return [...prev, r];
    });
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  const previewVars = useMemo(() => {
    const first = selected[0];
    return {
      owner_name: first?.name ?? "Customer Name",
      phone: first?.phone || "—",
      flat_name: first?.flat ?? "—",
      project: first?.project ?? "—",
      company_name: companyName || "Company",
    };
  }, [selected, companyName]);

  const previewText = useMemo(
    () => renderWhatsAppTemplate(template, previewVars),
    [template, previewVars]
  );

  function handleSend() {
    if (selected.length === 0) return;
    const missing = selected.filter((s) => !s.phone);
    if (missing.length > 0) {
      window.alert(
        `Missing phone for: ${missing.map((s) => s.name).join(", ")}. Add phone on customer profile before broadcast.`
      );
      return;
    }
    onWhatsAppSend("customer_broadcast", selected.length);
    setSendOk(true);
    setTimeout(() => setSendOk(false), 2500);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Search customer name, phone, or flat…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg">
          {results.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-400 text-center">No matches</li>
          ) : (
            results.map((r) => {
              const on = selected.some((s) => s.id === r.id);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex justify-between gap-2 ${
                      on ? "bg-green-50" : ""
                    }`}
                  >
                    <span>
                      <span className="font-medium text-[#0f1a35]">{r.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{r.flat}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Phone: {r.phone || "— not set —"}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-green-700 shrink-0">
                      {on ? "Selected" : "Select"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Selected To ({selected.length})
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-400">Select customers to broadcast.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 pl-2.5 pr-1 py-1 text-xs text-gray-700"
              >
                <span>
                  {s.name}
                  <span className="text-gray-400 ml-1">{s.phone || "no phone"}</span>
                </span>
                <button
                  type="button"
                  className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400"
                  onClick={() => remove(s.id)}
                  aria-label={`Remove ${s.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* From — company name only */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-bold text-[#0f1a35] mb-1">From</p>
        <p className="text-sm text-gray-700">{companyName || "—"}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Message preview
        </p>
        <div className="bg-[#e9f5e1] border border-green-200 rounded-xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {previewText}
        </div>
        <p className="text-[10px] text-gray-400">
          Variables:{" "}
          {CUSTOMER_BROADCAST_TEMPLATE_VARIABLES.map((v) => (
            <code key={v} className="bg-gray-100 px-1 rounded mr-1">
              {v}
            </code>
          ))}
        </p>
        <p className="text-[10px] text-gray-400">
          Template file: <code className="bg-gray-100 px-1">src/lib/messenger/templates/customerBroadcast.ts</code>
        </p>
        {sendOk && (
          <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <CheckCircle2 size={16} /> Broadcast queued ({selected.length} customers)
          </div>
        )}
        <Button
          type="button"
          className="gap-2"
          disabled={selected.length === 0}
          onClick={handleSend}
        >
          <Send size={16} /> Broadcast WhatsApp
        </Button>
      </div>
    </div>
  );
}
