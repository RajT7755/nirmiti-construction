import { useMemo, useState } from "react";
import { Search, Mail, Send, CheckCircle2, X } from "lucide-react";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import {
  EMAIL_BANK_LOAN_BODY_DEFAULT,
  EMAIL_BANK_LOAN_SUBJECT_DEFAULT,
  EMAIL_BANK_LOAN_VARIABLES,
} from "@/lib/messenger/templates";
import {
  isLoanCustomer,
  renderBankLoanEmail,
} from "@/lib/messenger/buildBankLoanEmailVars";
import { emailSendApi } from "@/lib/api/email/send";
import { Button } from "@/components/ui/Button";

const USE_API = import.meta.env.VITE_USE_API === "true";

/**
 * Email to bank for loan approval (current slab).
 * Separate from WhatsApp — only emailSendApi / local queue.
 */
export function EmailTab({
  customerProfiles,
  companyName,
}: {
  customerProfiles: CustomerDetailProfile[];
  companyName: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendOk, setSendOk] = useState(false);
  const [error, setError] = useState("");

  const loanCustomers = useMemo(
    () =>
      customerProfiles.filter(
        (c) => c.status !== "inactive" && isLoanCustomer(c)
      ),
    [customerProfiles]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return loanCustomers.slice(0, 30);
    return loanCustomers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.flat.toLowerCase().includes(q) ||
          (c.bankName ?? "").toLowerCase().includes(q) ||
          (c.bankEmail ?? "").toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
      .slice(0, 40);
  }, [query, loanCustomers]);

  const selected = useMemo(
    () => loanCustomers.find((c) => c.id === selectedId) ?? null,
    [loanCustomers, selectedId]
  );

  const rendered = useMemo(() => {
    if (!selected) {
      return {
        subject: EMAIL_BANK_LOAN_SUBJECT_DEFAULT.replace(
          "{company_name}",
          companyName || "Company"
        ),
        body: EMAIL_BANK_LOAN_BODY_DEFAULT,
      };
    }
    return renderBankLoanEmail(
      selected,
      companyName,
      EMAIL_BANK_LOAN_SUBJECT_DEFAULT,
      EMAIL_BANK_LOAN_BODY_DEFAULT
    );
  }, [selected, companyName]);

  async function handleSend() {
    setError("");
    if (!selected) {
      setError("Select a loan customer first.");
      return;
    }
    const bankEmail = selected.bankEmail?.trim();
    if (!bankEmail) {
      setError(
        "Bank email is missing for this customer. Add bank email on the customer profile."
      );
      return;
    }

    const { subject, body } = renderBankLoanEmail(selected, companyName);
    const payload = {
      fromName: companyName || "Company",
      to: [{ email: bankEmail, name: selected.bankName || "Bank" }],
      subject,
      body,
      purpose: "bank_loan_approval" as const,
      customerId: selected.id,
    };

    setSending(true);
    try {
      if (USE_API) {
        // Only backend email API — never WhatsApp
        await emailSendApi.send(payload);
      }
      // Local mode: success without WhatsApp / without network
      setSendOk(true);
      setTimeout(() => setSendOk(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Email send failed. Check backend /api/email/send."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0f1a35]">
          <Mail size={16} className="text-indigo-600" />
          Bank loan approval email
        </div>
        <p className="text-xs text-gray-500">
          Email the customer&apos;s bank for loan approval. Includes current slab.
          Separate from WhatsApp — uses <code className="bg-gray-100 px-1">/api/email/send</code> only.
        </p>
      </div>

      {/* Search loan customers */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
          Search (loan customers)
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Name, flat, bank, bank email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg">
          {results.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-400 text-center">
              No loan customers (loan status Yes/Maybe)
            </li>
          ) : (
            results.map((c) => {
              const on = selectedId === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 ${
                      on ? "bg-indigo-50" : ""
                    }`}
                  >
                    <span className="font-medium text-[#0f1a35]">{c.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{c.flat}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Bank: {c.bankName || "—"} · To: {c.bankEmail || "— no bank email —"}
                    </span>
                    <span className="block text-xs text-indigo-600 mt-0.5">
                      Current slab: {c.currentSlabLabel || "—"}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Selected To — bank */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Selected To (bank)
        </p>
        {!selected ? (
          <p className="text-sm text-gray-400">Select a loan customer above.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 pl-2.5 pr-1 py-1 text-xs text-gray-700">
              <span>
                {selected.bankName || "Bank"} ·{" "}
                <span className="text-gray-500">
                  {selected.bankEmail || "no bank email"}
                </span>
              </span>
              <button
                type="button"
                className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400"
                onClick={() => setSelectedId(null)}
                aria-label="Clear selection"
              >
                <X size={12} />
              </button>
            </span>
            <span className="text-xs text-gray-500">
              Customer: {selected.name} · Slab: {selected.currentSlabLabel || "—"}
            </span>
          </div>
        )}
      </div>

      {/* From — name only */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-bold text-[#0f1a35] mb-1">From</p>
        <p className="text-sm text-gray-700">{companyName || "—"}</p>
      </div>

      {/* Subject + body preview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Email preview
        </p>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Subject</p>
          <p className="text-sm font-medium text-[#0f1a35] border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
            {rendered.subject}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Body</p>
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-100 rounded-lg px-4 py-3 bg-white">
            {rendered.body}
          </div>
        </div>
        <p className="text-[10px] text-gray-400">
          Template file:{" "}
          <code className="bg-gray-100 px-1">
            src/lib/messenger/templates/emailBankLoanApproval.ts
          </code>
        </p>
        <p className="text-[10px] text-gray-400">
          Variables:{" "}
          {EMAIL_BANK_LOAN_VARIABLES.map((v) => (
            <code key={v} className="bg-gray-100 px-1 rounded mr-1">
              {v}
            </code>
          ))}
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {sendOk && (
          <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
            <CheckCircle2 size={16} />
            {USE_API
              ? "Email sent via backend /api/email/send"
              : "Email queued (local) — set VITE_USE_API=true and implement backend to deliver"}
          </div>
        )}
        <Button
          type="button"
          className="gap-2"
          disabled={!selected || sending}
          onClick={() => void handleSend()}
        >
          <Send size={16} />
          {sending ? "Sending…" : "Send email to bank"}
        </Button>
      </div>
    </div>
  );
}
