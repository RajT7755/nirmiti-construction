import "./invoicePrint.css";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData, InvoiceTemplateSettings } from "@/lib/settings/settingsTypes";
import type { Invoice, ReceivedPayment } from "@/lib/types";
import { fmt } from "@/lib/utils";

/**
 * Invoice / purchase receipt document — visual style aligned with PO & Work Order
 * (blue top bar, From block, To party, blue table header, blue total bar).
 */
export function InvoiceDocument({
  invoice,
  payment,
  businessProfile,
  invoiceTemplate,
  previousInvoice,
}: {
  invoice: Invoice;
  payment?: ReceivedPayment;
  businessProfile: BusinessProfileData;
  invoiceTemplate: InvoiceTemplateSettings;
  previousInvoice?: Invoice;
}) {
  const logo = resolveLogoUrl(businessProfile.logoUrl);
  const addressLine = [
    businessProfile.address,
    businessProfile.city,
    businessProfile.state,
    businessProfile.pinCode,
  ]
    .filter(Boolean)
    .join(", ");
  const isSuperseded = invoice.lifecycle === "superseded" || invoice.lifecycle === "void";
  const lineDescription = `${payment?.category ?? "Payment"} — Flat ${invoice.flat}`;

  return (
    <div
      className="invoice-a4-sheet bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      <div className="h-1.5 bg-[#1e4d8c]" />

      {isSuperseded && (
        <div className="px-8 py-3 bg-red-50 border-b border-red-200 text-red-800 text-sm font-semibold text-center">
          SUPERSEDED — not valid for billing
          {invoice.supersededAt && ` (superseded on ${invoice.supersededAt})`}
        </div>
      )}

      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-wide text-[#1e4d8c] uppercase">
          Purchase Receipt
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1">
          Tax Invoice
        </p>
      </div>

      {/* From + meta — same structure as PO / WO */}
      <div className="px-8 py-4 flex flex-wrap justify-between gap-6 border-b border-gray-100">
        <div className="flex items-start gap-4 min-w-0">
          <img
            src={logo}
            alt={businessProfile.companyName}
            className="w-16 h-16 rounded-lg object-contain border border-gray-100 bg-white p-1 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              From
            </p>
            <p className="text-sm font-bold text-[#0f1a35]">{businessProfile.companyName}</p>
            {businessProfile.tagline && (
              <p className="text-xs text-gray-500">{businessProfile.tagline}</p>
            )}
            {addressLine && (
              <p className="text-xs text-gray-500 mt-1 max-w-xs">{addressLine}</p>
            )}
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              {businessProfile.phone && <p>{businessProfile.phone}</p>}
              {businessProfile.email && <p>{businessProfile.email}</p>}
              {businessProfile.gstin && <p>GSTIN: {businessProfile.gstin}</p>}
            </div>
          </div>
        </div>

        <div className="text-sm text-[#0f1a35] space-y-1.5 min-w-[200px]">
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Invoice No</span>
            <span className="font-mono font-semibold">{invoice.invoiceNo}</span>
          </div>
          {invoice.revision > 1 && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-600">Revision</span>
              <span className="text-amber-700 font-semibold">{invoice.revision}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Date</span>
            <span>{invoice.date}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Status</span>
            <span className="capitalize">{invoice.status}</span>
          </div>
          {previousInvoice && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-600">Supersedes</span>
              <span className="font-mono text-xs">{previousInvoice.invoiceNo}</span>
            </div>
          )}
        </div>
      </div>

      {/* To — plain block like WO (no grey card) */}
      <div className="px-8 py-5 border-b border-gray-100">
        <p className="text-sm font-bold text-[#0f1a35] mb-2">To</p>
        <p className="text-sm font-semibold text-[#0f1a35]">{invoice.customerName}</p>
        <p className="text-sm text-gray-600 mt-0.5">Flat: {invoice.flat}</p>
        {payment && (
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            <p>Category: {payment.category}</p>
            <p>Method: {payment.method}</p>
          </div>
        )}
      </div>

      {/* Line items — blue header table like PO/WO materials */}
      <div className="px-8 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c] text-white text-left">
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 font-semibold text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3 text-gray-700">{lineDescription}</td>
              <td className="py-3 px-3 text-right font-semibold text-[#0f1a35]">
                {fmt(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total bar — same style as PO/WO */}
      <div className="px-8 pb-6 flex justify-end">
        <div className="w-full max-w-xs text-sm space-y-2">
          {payment && payment.received > 0 && (
            <div className="flex justify-between gap-6 text-gray-600">
              <span>Received</span>
              <span className="font-medium text-[#0f1a35]">{fmt(payment.received)}</span>
            </div>
          )}
          <div className="flex justify-between gap-6 items-center bg-[#1e4d8c] text-white px-3 py-2.5 rounded-md font-semibold">
            <span>Total</span>
            <span>{fmt(invoice.amount)}</span>
          </div>
        </div>
      </div>

      {invoiceTemplate.showBankDetails &&
        (businessProfile.bankName || businessProfile.accountNo) && (
          <div className="px-8 py-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Bank Details
            </p>
            <p className="text-sm text-gray-600">
              {businessProfile.bankName}
              {businessProfile.accountNo && ` · A/C ${businessProfile.accountNo}`}
              {businessProfile.ifsc && ` · IFSC ${businessProfile.ifsc}`}
            </p>
          </div>
        )}

      <div className="px-8 py-5 border-t border-gray-100 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Terms &amp; Conditions
        </p>
        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
          {invoiceTemplate.termsAndConditions}
        </p>
        {invoiceTemplate.footerNote && (
          <p className="text-xs text-gray-500 mt-3 italic">{invoiceTemplate.footerNote}</p>
        )}
      </div>

      <div className="px-8 py-8 border-t border-gray-100 mt-auto flex justify-end">
        <div className="text-right min-w-[200px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-10">
            Authorised Signatory
          </p>
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-semibold text-[#0f1a35]">{businessProfile.companyName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Authorised Sign</p>
          </div>
        </div>
      </div>
    </div>
  );
}
