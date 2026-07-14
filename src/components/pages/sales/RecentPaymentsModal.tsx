import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import type { ReceivedPayment } from "@/lib/types";

export interface RecentPaymentsModalProps {
  payments: ReceivedPayment[];
  onClose: () => void;
}

export function RecentPaymentsModal({ payments, onClose }: RecentPaymentsModalProps) {
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

  return createPortal(
    <div
      className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recent-payments-title"
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
          <h3 id="recent-payments-title" className="text-base font-bold text-[#0f1a35]">
            All Received Payments
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
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Flat</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-gray-400">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {payments.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                  <td className="px-5 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{r.category}</td>
                  <td className="px-5 py-3 text-sm font-bold text-green-700">
                    {fmt(r.received > 0 ? r.received : r.amount)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 capitalize">{r.method}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{r.date}</td>
                  <td className="px-5 py-3">
                    <Badge status={r.status} />
                  </td>
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