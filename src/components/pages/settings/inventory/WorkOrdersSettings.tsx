import { Wrench } from "lucide-react";

export function WorkOrdersSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
          <Wrench size={16} className="text-teal-600" />
        </div>
        <h3 className="text-base font-semibold text-[#0f1a35]">Work Order Settings</h3>
      </div>
      <p className="text-sm text-gray-500">
        Work order templates, statuses, and assignment defaults — detailed settings next.
      </p>
    </div>
  );
}
