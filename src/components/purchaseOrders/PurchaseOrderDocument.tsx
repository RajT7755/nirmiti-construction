import "./poPrint.css";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";
import type { PurchaseOrder, PurchaseRequest, Supplier } from "@/lib/inventory/inventoryTypes";
import { resolvePoLineItems } from "@/lib/inventory/poLineItems";
import { fmtRupee } from "@/lib/inventory/poTotals";

export type PoDocumentSource =
  | { kind: "po"; order: PurchaseOrder }
  | { kind: "request"; request: PurchaseRequest };

export function PurchaseOrderDocument({
  source,
  businessProfile,
  supplier,
}: {
  source: PoDocumentSource;
  businessProfile: BusinessProfileData;
  supplier?: Supplier;
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

  const isPo = source.kind === "po";
  const data = isPo ? source.order : source.request;

  const requestNo = isPo
    ? source.order.requestNo ?? "—"
    : source.request.requestNo;
  const docId = isPo ? source.order.id : source.request.requestNo;
  const lineItems = resolvePoLineItems(
    isPo
      ? {
          ...source.order,
          lineTotal: source.order.subTotal,
          productDescription: source.order.productDescription,
        }
      : source.request
  );
  const lineTotal = isPo
    ? source.order.subTotal ?? source.order.amountTotal ?? 0
    : source.request.lineTotal;
  const gstRate = isPo ? source.order.gstRate ?? 0 : source.request.gstRate;
  const gstAmount = isPo ? source.order.gstAmount ?? 0 : source.request.gstAmount;
  const roundOff = isPo ? source.order.roundOff ?? 0 : source.request.roundOff;
  const grandTotal = isPo
    ? source.order.grandTotal ?? source.order.amountTotal ?? 0
    : source.request.grandTotal;
  const shipTo =
    (isPo ? source.order.shipToAddress : source.request.shipToAddress) ||
    companyAddress;
  const shipVia = isPo ? source.order.shipVia : source.request.shipVia;
  const fob = isPo ? source.order.fob : source.request.fob;
  const shippingTerms = isPo
    ? source.order.shippingTerms
    : source.request.shippingTerms;
  const orderDate = data.orderDate;
  const supplierName = data.supplierName;
  const vendorPhone = supplier?.phone;
  const vendorEmail = supplier?.email;
  const vendorAddress = [supplier?.address, supplier?.pinCode].filter(Boolean).join(", ");

  return (
    <div
      className="po-a4-sheet bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      <div className="h-1.5 bg-[#1e4d8c]" />

      <div className="px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-wide text-[#1e4d8c] uppercase">
          Purchase Order
        </h1>
        {!isPo && (
          <p className="text-xs font-semibold text-amber-700 mt-1">
            REQUEST (not payable until approved)
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
              {businessProfile.website && <p>{businessProfile.website}</p>}
              {businessProfile.gstin && <p>GSTIN: {businessProfile.gstin}</p>}
            </div>
          </div>
        </div>

        <div className="text-sm text-[#0f1a35] space-y-1.5 min-w-[200px]">
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Request No</span>
            <span className="font-mono">{requestNo}</span>
          </div>
          {isPo && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-600">Purchase ID</span>
              <span className="font-mono font-semibold">{docId}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Date</span>
            <span>{orderDate}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Ship Via</span>
            <span>{shipVia || "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">FOB</span>
            <span>{fob || "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold text-gray-600">Shipping Terms</span>
            <span>{shippingTerms || "—"}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Vendor
          </p>
          <p className="text-sm font-semibold text-[#0f1a35]">{supplierName}</p>
          {vendorAddress && <p className="text-xs text-gray-600 mt-1">{vendorAddress}</p>}
          {vendorPhone && <p className="text-xs text-gray-600">{vendorPhone}</p>}
          {vendorEmail && <p className="text-xs text-gray-600">{vendorEmail}</p>}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Ship To
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{shipTo}</p>
        </div>
      </div>

      <div className="px-8 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e4d8c] text-white text-left">
              <th className="py-2.5 px-3 font-semibold">Item Details</th>
              <th className="py-2.5 px-3 font-semibold text-right w-20">Qty</th>
              <th className="py-2.5 px-3 font-semibold text-right w-28">Unit Price</th>
              <th className="py-2.5 px-3 font-semibold text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={`${item.materialId ?? item.materialName}-${idx}`} className="border-b border-gray-100">
                <td className="py-3 px-3 align-top">
                  <p className="font-semibold text-[#0f1a35]">{item.materialName}</p>
                  {item.productDescription && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.productDescription}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5">Unit: {item.unit}</p>
                </td>
                <td className="py-3 px-3 text-right text-gray-700">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-gray-700">
                  {fmtRupee(item.unitPrice)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-[#0f1a35]">
                  {fmtRupee(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 pb-6 flex justify-end">
        <div className="w-full max-w-xs text-sm space-y-2">
          <div className="flex justify-between gap-6 text-gray-600">
            <span>Sub Total</span>
            <span className="font-medium text-[#0f1a35]">{fmtRupee(lineTotal)}</span>
          </div>
          <div className="flex justify-between gap-6 text-gray-600">
            <span>GST ({gstRate}%)</span>
            <span className="font-medium text-[#0f1a35]">{fmtRupee(gstAmount)}</span>
          </div>
          <div className="flex justify-between gap-6 text-gray-600">
            <span>Round off</span>
            <span className="font-medium text-[#0f1a35]">{fmtRupee(roundOff)}</span>
          </div>
          <div className="flex justify-between gap-6 items-center bg-[#1e4d8c] text-white px-3 py-2.5 rounded-md font-semibold">
            <span>Total</span>
            <span>{fmtRupee(grandTotal)}</span>
          </div>
          {isPo && (
            <p className="text-[11px] text-gray-500 text-right pt-1">
              Payable purchase — linked to supplier Total / Remaining
            </p>
          )}
        </div>
      </div>

      <div className="px-8 py-8 border-t border-gray-100 mt-auto flex justify-end">
        <div className="text-right min-w-[220px]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Authorised Signatory
          </p>
          {businessProfile.digitalSignUrl?.trim() ? (
            <>
              <p className="text-[10px] text-gray-400 mb-1">Digital signature</p>
              <img
                src={businessProfile.digitalSignUrl.trim()}
                alt="Authorised digital signature"
                className="h-16 max-w-[200px] w-auto object-contain ml-auto mb-2"
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              />
            </>
          ) : (
            <div className="h-12" aria-hidden />
          )}
          <div className="border-t border-gray-300 pt-2">
            <p className="text-sm font-semibold text-[#0f1a35]">{businessProfile.companyName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Authorised Sign</p>
          </div>
        </div>
      </div>
    </div>
  );
}
