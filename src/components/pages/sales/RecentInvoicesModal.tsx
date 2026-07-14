import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import { getSupersededInvoiceLabel } from "@/lib/sales/invoiceLog";
import type { Invoice } from "@/lib/types";

export interface RecentInvoicesModalProps {
  invoices: Invoice[];
  onClose: () => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export function RecentInvoicesModal({ invoices, onClose, onViewInvoice }: RecentInvoicesModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  const colSpan = onViewInvoice ? 9 : 8;

  return createPortal(
    <div
      className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recent-invoices-title"
    >
      <div
        className="absolute inset-0 bg-[#0f1a35]/45 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex w-full max-w-5xl max-h-[90dvh] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h3 id="recent-invoices-title" className="text-base font-bold text-[#0f1a35]">
            All Invoices
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Flat</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Rev.</th>
                <th className="px-5 py-3">Status</th>
                {onViewInvoice && <th className="px-5 py-3">View</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="text-center py-10 text-sm text-gray-400">
                    No invoices issued yet.
                  </td>
                </tr>
              )}
              {invoices.map((inv, i) => (
                <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-[#0f1a35]">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{inv.customerName}</td>
                  <td className="px-5 py-3 text-sm font-mono text-gray-600">{inv.flat}</td>
                  <td className="px-5 py-3 text-sm font-bold text-green-700">{fmt(inv.amount)}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{inv.date}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{inv.revision ?? 1}</td>
                  <td className="px-5 py-3">
                    <Badge
                      status={
                        inv.lifecycle === "superseded" || inv.lifecycle === "void"
                          ? inv.lifecycle
                          : inv.status
                      }
                    />
                    {(inv.lifecycle === "superseded" || inv.lifecycle === "void") && (
                      <span className="sr-only">{getSupersededInvoiceLabel(inv)}</span>
                    )}
                  </td>
                  {onViewInvoice && (
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onViewInvoice(inv.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}