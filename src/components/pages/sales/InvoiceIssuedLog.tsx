import { useState } from "react";
import { Eye } from "lucide-react";
import { fmt } from "@/lib/utils";
import {
  getActiveInvoices,
  sortInvoicesNewestFirst,
} from "@/lib/sales/invoiceLog";
import type { Invoice } from "@/lib/types";
import { RecentInvoicesModal } from "./RecentInvoicesModal";

const PREVIEW_LIMIT = 5;

export function InvoiceIssuedLog({
  invoices,
  onViewInvoice,
}: {
  invoices: Invoice[];
  onViewInvoice: (invoiceId: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const activeInvoices = sortInvoicesNewestFirst(getActiveInvoices(invoices));
  const preview = activeInvoices.slice(0, PREVIEW_LIMIT);

  return (
    <>
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-[#0f1a35]">Invoice Issued Log</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Active invoices only</p>
        </div>
        <button
          onClick={() => setShowAll(true)}
          disabled={invoices.length === 0}
          className="text-[10px] text-blue-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Invoice No.</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Flat</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Rev.</th>
              <th className="px-5 py-3">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {preview.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm text-gray-400">
                  No active invoices yet — issue from Payment Log.
                </td>
              </tr>
            )}
            {preview.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-semibold text-[#0f1a35]">
                  {inv.invoiceNo}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{inv.customerName}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{inv.flat}</td>
                <td className="px-5 py-3 text-sm font-bold text-green-700">{fmt(inv.amount)}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{inv.date}</td>
                <td className="px-5 py-3 text-xs text-gray-500 font-mono">{inv.revision}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => onViewInvoice(inv.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAll && (
        <RecentInvoicesModal
          invoices={sortInvoicesNewestFirst(invoices)}
          onClose={() => setShowAll(false)}
          onViewInvoice={onViewInvoice}
        />
      )}
    </>
  );
}