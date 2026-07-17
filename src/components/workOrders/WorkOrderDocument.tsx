import "./woPrint.css";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import type {
  Contractor,
  WorkOrder,
  WorkOrderRequest,
} from "@/lib/inventory/inventoryTypes";
import { fmtRupee } from "@/lib/inventory/poTotals";

export type WoDocumentSource =
  | { kind: "request"; request: WorkOrderRequest }
  | { kind: "wo"; order: WorkOrder };

/**
 * Printable Work Order — visual style matches PO (blue bar, company header, A4).
 * Content is work-order specific. Includes "To (Contractor)" block.
 */
export function WorkOrderDocument({
  source,
  businessProfile,
  contractor,
}: {
  source: WoDocumentSource;
  businessProfile: BusinessProfileData;
  contractor?: Contractor;
}) {
  const logo = resolveLogoUrl(businessProfile.logoUrl);
  const companyAddress = [
    businessProfile.address,
    businessProfile.city,
    businessProfile.state,
    businessProfile.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const isWo = source.kind === "wo";
  const requestNo = isWo
    ? source.order.requestNo ?? "—"
    : source.request.requestNo;
  const woId = isWo ? source.order.id : undefined;
  const contractorName = isWo
    ? source.order.contractorName
    : source.request.contractorName;
  const workProfile = isWo
    ? source.order.workProfile ?? source.order.trade ?? ""
    : source.request.workProfile;
  const categories = isWo
    ? source.order.workCategories ?? []
    : source.request.workCategories ?? [];
  const description = isWo
    ? source.order.description ?? source.order.title
    : source.request.description;
  const dateOfIssue = isWo
    ? source.order.dateOfIssue ?? source.order.startDate
    : source.request.dateOfIssue;
  const commitmentDate = isWo
    ? source.order.commitmentDate ?? "—"
    : source.request.commitmentDate;
  const status = isWo ? source.order.status : source.request.status;
  const materialIssues = isWo
    ? source.order.materialIssues ?? []
    : source.request.materialIssues ?? [];
  const materialReturns = isWo ? source.order.materialReturns ?? [] : [];
  const workAmount = isWo ? source.order.amountTotal ?? 0 : 0;

  const toName = contractor?.name ?? contractorName;
  const toAddress = [contractor?.address, contractor?.pinCode].filter(Boolean).join(", ");
  const toPhone = contractor?.phone;
  const toEmail = contractor?.email;
  const toProfile = contractor?.workProfile || workProfile;

  return (
    <div
      className="wo-a4-sheet bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      <div className="h-1.5 bg-[#1e4d8c]" />

      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-wide text-[#1e4d8c] uppercase">
          {isWo ? "Work Order" : "Work Order Request"}
        </h1>
        {!isWo && (
          <p className="text-xs font-semibold text-amber-700 mt-1">
            REQUEST — work amount set after generate
          </p>
        )}
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
            {businessProfile.tagline && (
              <p className="text-xs text-gray-500">{businessProfile.tagline}</p>
            )}
            {companyAddress && (
              <p className="text-xs text-gray-500 mt-1 max-w-xs">{companyAddress}</p>
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
            <span className="font-semibold text-gray-600">Request No</span>
            <span className="font-mono">{requestNo}</span>
          </div>
          {woId && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-600">Work Order ID</span>
              <span className="font-mono font-semibold">{woId}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Date of issue</span>
            <span>{dateOfIssue}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Commitment</span>
            <span>{commitmentDate}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Status</span>
            <span className="capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* To: contractor information */}
      <div className="px-8 py-5 border-b border-gray-100">
        <p className="text-sm font-bold text-[#0f1a35] mb-2">To</p>
        <p className="text-sm font-semibold text-[#0f1a35]">{toName}</p>
        {toProfile && (
          <p className="text-xs text-gray-600 mt-0.5">Work profile: {toProfile}</p>
        )}
        {toAddress && <p className="text-xs text-gray-600 mt-1">{toAddress}</p>}
        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
          {toPhone && <p>Phone: {toPhone}</p>}
          {toEmail && <p>Email: {toEmail}</p>}
          {contractor?.id && <p className="font-mono">ID: {contractor.id}</p>}
        </div>
        {categories.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Categories: {categories.join(", ")}
          </p>
        )}
      </div>

      {/* Work description — same table style as Materials */}
      <div className="px-8 py-4 border-b border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c] text-white text-left">
              <th className="py-2.5 px-3 font-semibold">Work description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3 align-top">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {description || "—"}
                </p>
                {workProfile && (
                  <p className="text-xs text-gray-500 mt-1">Profile: {workProfile}</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Materials issued
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c] text-white text-left">
              <th className="py-2.5 px-3 font-semibold">Material</th>
              <th className="py-2.5 px-3 font-semibold text-right w-24">Unit</th>
              <th className="py-2.5 px-3 font-semibold text-right w-24">Qty</th>
            </tr>
          </thead>
          <tbody>
            {materialIssues.length === 0 ? (
              <tr className="border-b border-gray-100">
                <td colSpan={3} className="py-3 px-3 text-gray-400">
                  No materials issued
                </td>
              </tr>
            ) : (
              materialIssues.map((line, i) => (
                <tr key={`${line.materialId}-${i}`} className="border-b border-gray-100">
                  <td className="py-3 px-3 font-medium text-[#0f1a35]">{line.materialName}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{line.unit}</td>
                  <td className="py-3 px-3 text-right text-gray-700">{line.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {materialReturns.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Materials returned
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-600 text-white text-left">
                  <th className="py-2 px-3 font-semibold">Material</th>
                  <th className="py-2 px-3 font-semibold text-right w-24">Qty</th>
                </tr>
              </thead>
              <tbody>
                {materialReturns.map((line, i) => (
                  <tr key={`ret-${line.materialId}-${i}`} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">{line.materialName}</td>
                    <td className="py-2 px-3 text-right text-gray-700">
                      {line.quantity} {line.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="px-8 pb-6 flex justify-end">
        <div className="w-full max-w-xs">
          <div className="flex justify-between gap-6 items-center bg-[#1e4d8c] text-white px-3 py-2.5 rounded-md font-semibold text-sm">
            <span>Work amount</span>
            <span>
              {isWo && workAmount > 0
                ? fmtRupee(workAmount)
                : isWo
                  ? "—"
                  : "N/A on request"}
            </span>
          </div>
        </div>
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
