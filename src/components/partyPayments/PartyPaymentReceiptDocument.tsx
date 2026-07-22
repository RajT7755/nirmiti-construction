import "./partyPaymentPrint.css";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import type { PartyReceivedPayment } from "@/lib/inventory/partyPaymentTypes";
import { fmtRupee } from "@/lib/inventory/poTotals";

/** Payment receipt for a done supplier/contractor payment — style matches PO/WO. */
export function PartyPaymentReceiptDocument({
  payment,
  businessProfile,
}: {
  payment: PartyReceivedPayment;
  businessProfile: BusinessProfileData;
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

  const description =
    payment.sourceType === "purchase_order"
      ? payment.materialDescription || "—"
      : payment.workDescription || "—";

  const refLabel =
    payment.sourceType === "purchase_order" ? "PO id" : "Work order id";

  return (
    <div
      className="party-pay-a4-sheet bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      <div className="h-1.5 bg-[#1e4d8c]" />

      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-wide text-[#1e4d8c] uppercase">
          Payment Receipt
        </h1>
      </div>

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
            {addressLine && (
              <p className="text-xs text-gray-500 mt-1 max-w-xs">{addressLine}</p>
            )}
            {businessProfile.gstin && (
              <p className="text-xs text-gray-500 mt-0.5">GSTIN: {businessProfile.gstin}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-[#0f1a35] space-y-1.5 min-w-[180px]">
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Receipt No</span>
            <span className="font-mono text-xs">{payment.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Date</span>
            <span>{payment.date}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Method</span>
            <span className="capitalize">{payment.method}</span>
          </div>
        </div>
      </div>

      {/* To — name, address, GST (no supplier/contractor label) */}
      <div className="px-8 py-5 border-b border-gray-100">
        <p className="text-sm font-bold text-[#0f1a35] mb-2">To</p>
        <p className="text-sm font-semibold text-[#0f1a35]">{payment.partyName}</p>
        {payment.partyAddress && (
          <p className="text-xs text-gray-600 mt-1">{payment.partyAddress}</p>
        )}
        {payment.partyGstin && (
          <p className="text-xs text-gray-600 mt-0.5">GSTIN: {payment.partyGstin}</p>
        )}
        {payment.note && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Note
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{payment.note}</p>
          </div>
        )}
      </div>

      <div className="px-8 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c] text-white text-left">
              <th className="py-2.5 px-3 font-semibold">{refLabel}</th>
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 font-semibold text-right">This payment</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3 font-mono text-xs font-medium text-[#0f1a35]">
                {payment.sourceId}
              </td>
              <td className="py-3 px-3 text-gray-700">{description}</td>
              <td className="py-3 px-3 text-right font-semibold text-[#0f1a35]">
                {fmtRupee(payment.received)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-8 pb-6 flex justify-end">
        <div className="w-full max-w-xs text-sm">
          <div className="flex justify-between gap-6 items-center bg-[#1e4d8c] text-white px-3 py-2.5 rounded-md font-semibold">
            <span>Paid (this receipt)</span>
            <span>{fmtRupee(payment.received)}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 border-t border-gray-100 mt-auto flex justify-end">
        <div className="text-right min-w-[200px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Authorised Signatory
          </p>
          {businessProfile.digitalSignUrl?.trim() && (
            <img
              src={businessProfile.digitalSignUrl.trim()}
              alt="Authorised signature"
              className="h-14 max-w-[180px] object-contain ml-auto mb-2"
            />
          )}
          {!businessProfile.digitalSignUrl?.trim() && <div className="h-10" />}
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-semibold text-[#0f1a35]">{businessProfile.companyName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Authorised Sign</p>
          </div>
        </div>
      </div>
    </div>
  );
}
