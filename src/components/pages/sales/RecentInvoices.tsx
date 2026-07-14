import { useState } from "react";
import { FileText } from "lucide-react";
import { fmt } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { RecentInvoicesModal } from "./RecentInvoicesModal";

const PREVIEW_LIMIT = 5;

export function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Invoices</h3>
          </div>
          <button
            onClick={() => setShowAll(true)}
            disabled={invoices.length === 0}
            className="text-[10px] text-blue-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
          >
            View all
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-2.5">Invoice No.</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-sm text-gray-400">
                  No invoices yet. Issue from Received Payments.
                </td>
              </tr>
            )}
            {invoices.slice(0, PREVIEW_LIMIT).map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-semibold text-[#0f1a35]">
                  {inv.invoiceNo}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{inv.customerName}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-700">{fmt(inv.amount)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAll && (
        <RecentInvoicesModal invoices={invoices} onClose={() => setShowAll(false)} />
      )}
    </>
  );
}