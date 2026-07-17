import { useMemo, useState } from "react";
import { Search, Send, CheckCircle2, X } from "lucide-react";
import type { Contractor, WorkOrderRequest } from "@/lib/inventory/inventoryTypes";
import {
  WO_REQUEST_TEMPLATE_VARIABLES,
  renderWhatsAppTemplate,
} from "@/lib/messenger/messageTemplates";
import { Button } from "@/components/ui/Button";

export interface WoMessengerRecipient {
  id: string;
  name: string;
  phone: string;
  requestNo?: string;
  workProfile?: string;
  description?: string;
  dateOfIssue?: string;
  commitmentDate?: string;
}

export function WoRequestTab({
  contractors,
  workOrderRequests,
  companyName,
  template,
  onWhatsAppSend,
}: {
  contractors: Contractor[];
  workOrderRequests: WorkOrderRequest[];
  companyName: string;
  template: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WoMessengerRecipient[]>([]);
  const [sendOk, setSendOk] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromContractors: WoMessengerRecipient[] = contractors
      .filter((c) => c.status !== "inactive")
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone?.trim() || "",
        workProfile: c.workProfile || c.trade,
      }));

    const fromRequests: WoMessengerRecipient[] = workOrderRequests
      .filter((r) => r.status === "pending")
      .map((r) => {
        const con = contractors.find((c) => c.id === r.contractorId);
        return {
          id: `req:${r.id}`,
          name: r.contractorName,
          phone: con?.phone?.trim() || "",
          requestNo: r.requestNo,
          workProfile: r.workProfile,
          description: r.description,
          dateOfIssue: r.dateOfIssue,
          commitmentDate: r.commitmentDate,
        };
      });

    const all = [...fromRequests, ...fromContractors];
    if (!q) return all.slice(0, 20);
    return all
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.requestNo ?? "").toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query, contractors, workOrderRequests]);

  function toggle(r: WoMessengerRecipient) {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === r.id);
      if (exists) return prev.filter((p) => p.id !== r.id);
      return [...prev, r];
    });
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  const previewVars = useMemo(() => {
    const first = selected[0];
    return {
      party_name: first?.name ?? "Contractor Name",
      phone: first?.phone || "—",
      company_name: companyName || "Company",
      request_no: first?.requestNo ?? "WOR-000001",
      work_profile: first?.workProfile ?? "—",
      description: first?.description ?? "—",
      date_of_issue: first?.dateOfIssue ?? "—",
      commitment_date: first?.commitmentDate ?? "—",
    };
  }, [selected, companyName]);

  const previewText = useMemo(
    () => renderWhatsAppTemplate(template, previewVars),
    [template, previewVars]
  );

  function handleSend() {
    if (selected.length === 0) return;
    const missingPhone = selected.filter((s) => !s.phone);
    if (missingPhone.length > 0) {
      window.alert(
        `Missing phone for: ${missingPhone.map((s) => s.name).join(", ")}. Add phone on contractor profile.`
      );
      return;
    }
    onWhatsAppSend("wo_request", selected.length);
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
            placeholder="Search contractor name, phone, or request no…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg">
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
                      on ? "bg-teal-50" : ""
                    }`}
                  >
                    <span>
                      <span className="font-medium text-[#0f1a35]">{r.name}</span>
                      {r.requestNo && (
                        <span className="text-xs text-gray-400 ml-2 font-mono">
                          {r.requestNo}
                        </span>
                      )}
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Phone: {r.phone || "— not set —"}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-teal-700 shrink-0">
                      {on ? "Selected" : "Select"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-bold text-[#0f1a35] mb-1">From</p>
        <p className="text-sm text-gray-700">{companyName || "—"}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Selected To ({selected.length})
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-400">Select contractors / requests from search.</p>
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Message preview
        </p>
        <div className="bg-[#e9f5e1] border border-green-200 rounded-xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {previewText}
        </div>
        <p className="text-[10px] text-gray-400">
          Variables:{" "}
          {WO_REQUEST_TEMPLATE_VARIABLES.map((v) => (
            <code key={v} className="bg-gray-100 px-1 rounded mr-1">
              {v}
            </code>
          ))}
        </p>
        <p className="text-[10px] text-gray-400">
          Edit template in Settings → Sales → Message Templates → WO Request
        </p>
        {sendOk && (
          <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <CheckCircle2 size={16} /> Queued for send ({selected.length})
          </div>
        )}
        <Button
          type="button"
          className="gap-2"
          disabled={selected.length === 0}
          onClick={handleSend}
        >
          <Send size={16} /> Send WhatsApp
        </Button>
      </div>
    </div>
  );
}
