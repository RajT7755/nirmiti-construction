import { fmt } from "@/lib/utils";
import type { OverdueBill } from "@/lib/inventory/inventoryTypes";

export function InventoryOverduePaymentsPanel({ bills }: { bills: OverdueBill[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#0f1a35]">Overdue Payments</h3>
      </div>
      {bills.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No overdue payments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-5 py-2.5 font-semibold">Party</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Bill ref</th>
                <th className="px-3 py-2.5 font-semibold">Due date</th>
                <th className="px-5 py-2.5 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-[#0f1a35]">{bill.partyName}</td>
                  <td className="px-3 py-3 capitalize text-gray-600">{bill.partyType}</td>
                  <td className="px-3 py-3 text-gray-600">{bill.billRef}</td>
                  <td className="px-3 py-3 text-gray-500">{bill.dueDate}</td>
                  <td className="px-5 py-3 text-right font-semibold text-orange-600">
                    {fmt(bill.dueAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
