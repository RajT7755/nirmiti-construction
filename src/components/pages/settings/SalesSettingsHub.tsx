import { Link } from "react-router";
import { FileText, MessageSquare, ChevronRight } from "lucide-react";

export function SalesSettingsHub() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-xl">
      <h3 className="text-base font-semibold text-[#0f1a35]">Sales Settings</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">Configure sales module and invoice output.</p>
      <div className="space-y-3">
        <Link
          to="/settings/sales/invoice-template"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f1a35]">Invoice Template</p>
              <p className="text-xs text-gray-500">Terms, prefix, and preview layout</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>

        <Link
          to="/settings/sales/message-templates"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <MessageSquare size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f1a35]">Message Templates</p>
              <p className="text-xs text-gray-500">Slab schedule and overdue WhatsApp messages</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
}