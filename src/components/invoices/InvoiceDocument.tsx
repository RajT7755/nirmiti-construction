import "./invoicePrint.css";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData, InvoiceTemplateSettings } from "@/lib/settings/settingsTypes";
import type { Invoice, ReceivedPayment } from "@/lib/types";
import { fmt } from "@/lib/utils";

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
  const addressLine = [businessProfile.address, businessProfile.city, businessProfile.state, businessProfile.pinCode]
    .filter(Boolean)
    .join(", ");
  const isSuperseded = invoice.lifecycle === "superseded" || invoice.lifecycle === "void";

  return (
    <div
      className="invoice-a4-sheet bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {isSuperseded && (
        <div className="px-8 py-3 bg-red-50 border-b border-red-200 text-red-800 text-sm font-semibold text-center">
          SUPERSEDED — not valid for billing
          {invoice.supersededAt && ` (superseded on ${invoice.supersededAt})`}
        </div>
      )}

      <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={logo}
            alt={businessProfile.companyName}
            className="w-16 h-16 rounded-lg object-contain border border-gray-100 bg-white p-1"
          />
          <div>
            <h1 className="text-lg font-bold text-[#0f1a35]">{businessProfile.companyName}</h1>
            {businessProfile.tagline && (
              <p className="text-xs text-gray-500">{businessProfile.tagline}</p>
            )}
            {addressLine && <p className="text-xs text-gray-500 mt-1 max-w-xs">{addressLine}</p>}
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
              {businessProfile.email && <p>Email: {businessProfile.email}</p>}
              {businessProfile.gstin && <p>GSTIN: {businessProfile.gstin}</p>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Tax Invoice
          </p>
          <p className="text-xl font-bold text-[#0f1a35] mt-1">{invoice.invoiceNo}</p>
          {invoice.revision > 1 && (
            <p className="text-xs font-semibold text-amber-700 mt-1">Revision {invoice.revision}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Date: {invoice.date}</p>
          <p className="text-sm text-gray-500">Status: {invoice.status}</p>
          {previousInvoice && (
            <p className="text-xs text-gray-500 mt-1">Supersedes {previousInvoice.invoiceNo}</p>
          )}
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Bill To
          </p>
          <p className="text-sm font-semibold text-[#0f1a35]">{invoice.customerName}</p>
          <p className="text-sm text-gray-600">Flat: {invoice.flat}</p>
          {payment && (
            <>
              <p className="text-sm text-gray-600 mt-1">Category: {payment.category}</p>
              <p className="text-sm text-gray-600">Method: {payment.method}</p>
            </>
          )}
        </div>
        <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">
            Payment Summary
          </p>
          <p className="text-2xl font-bold text-[#0f1a35]">{fmt(invoice.amount)}</p>
          {payment && payment.received > 0 && (
            <p className="text-xs text-gray-500 mt-1">Received: {fmt(payment.received)}</p>
          )}
        </div>
      </div>

      <div className="px-8 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-3 text-gray-700">
                {payment?.category ?? "Payment"} — Flat {invoice.flat}
              </td>
              <td className="py-3 text-right font-semibold text-[#0f1a35]">
                {fmt(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoiceTemplate.showBankDetails &&
        (businessProfile.bankName || businessProfile.accountNo) && (
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/80">
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