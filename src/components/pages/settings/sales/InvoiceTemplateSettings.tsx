import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import type { BusinessProfileData, InvoiceTemplateSettings } from "@/lib/settings/settingsTypes";
import type { Invoice, ReceivedPayment } from "@/lib/types";

const PREVIEW_INVOICE: Invoice = {
  id: "preview",
  invoiceNo: "INV-2026-0001",
  customerName: "Sample Customer",
  flat: "A-101",
  amount: 250000,
  paymentId: "preview-payment",
  date: new Date().toISOString().slice(0, 10),
  status: "issued",
};

const PREVIEW_PAYMENT: ReceivedPayment = {
  id: "preview-payment",
  customer: "Sample Customer",
  flat: "A-101",
  category: "flat",
  amount: 250000,
  received: 250000,
  method: "NEFT",
  date: new Date().toISOString().slice(0, 10),
  status: "paid",
};

export function InvoiceTemplateSettings({
  template,
  businessProfile,
  onSave,
}: {
  template: InvoiceTemplateSettings;
  businessProfile: BusinessProfileData;
  onSave: (patch: Partial<InvoiceTemplateSettings>) => Promise<boolean>;
}) {
  const [form, setForm] = useState(template);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(template), [template]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const labelClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5";
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        <h3 className="text-base font-semibold text-[#0f1a35] flex items-center gap-2">
          <FileText size={18} className="text-blue-600" /> Invoice Template
        </h3>
        <p className="text-sm text-gray-500">
          Terms and branding pull from Business Profile. Bill-to data comes from Received Payments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Invoice Prefix</label>
            <input
              className={inputClass}
              value={form.invoicePrefix}
              onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
            <input
              type="checkbox"
              checked={form.showBankDetails}
              onChange={(e) => setForm((f) => ({ ...f, showBankDetails: e.target.checked }))}
            />
            Show bank details on invoice
          </label>
        </div>

        <div>
          <label className={labelClass}>Terms &amp; Conditions</label>
          <textarea
            className={`${inputClass} min-h-[140px]`}
            value={form.termsAndConditions}
            onChange={(e) => setForm((f) => ({ ...f, termsAndConditions: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelClass}>Footer Note</label>
          <input
            className={inputClass}
            value={form.footerNote}
            onChange={(e) => setForm((f) => ({ ...f, footerNote: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          {saving ? "Saving…" : "Save Template"}
        </button>
      </form>

      <div>
        <p className="text-sm font-semibold text-[#0f1a35] mb-3">Live Preview</p>
        <InvoiceDocument
          invoice={PREVIEW_INVOICE}
          payment={PREVIEW_PAYMENT}
          businessProfile={businessProfile}
          invoiceTemplate={form}
        />
      </div>
    </div>
  );
}