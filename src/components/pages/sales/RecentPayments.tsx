import { fmt } from "@/lib/utils";
import type { ReceivedPayment } from "@/lib/types";

const PREVIEW_LIMIT = 5;

export function RecentPayments({
  payments,
  onViewAll,
}: {
  payments: ReceivedPayment[];
  onViewAll?: () => void;
}) {
  return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Payments</h3>
          <button
            onClick={() => onViewAll?.()}
            disabled={!onViewAll}
            className="text-[10px] text-blue-600 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
          >
            View all
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-2.5">#</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Flat</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-gray-400">
                  No data yet.
                </td>
              </tr>
            )}
            {payments.slice(0, PREVIEW_LIMIT).map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-700">
                  {fmt(r.received > 0 ? r.received : r.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}