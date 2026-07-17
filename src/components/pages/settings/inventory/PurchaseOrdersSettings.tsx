import { ClipboardList } from "lucide-react";

export function PurchaseOrdersSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
          <ClipboardList size={16} className="text-amber-600" />
        </div>
        <h3 className="text-base font-semibold text-[#0f1a35]">Purchase Orders Settings</h3>
      </div>
      <p className="text-sm text-gray-500">
        PO numbering, approval rules, and status labels — detailed settings next.
      </p>
    </div>
  );
}
