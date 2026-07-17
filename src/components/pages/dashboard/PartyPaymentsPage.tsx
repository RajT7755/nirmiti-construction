import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CreditCard, Plus } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/utils";
import { isPoPayable } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";

type Split = "suppliers" | "contractors";

/**
 * Dashboard party payment log — suppliers (PO) vs contractors (WO).
 */
export function PartyPaymentsPage() {
  const navigate = useNavigate();
  const {
    purchaseOrders,
    workOrders,
    partyReceivedPayments = [],
  } = useAppDataContext();
  const [split, setSplit] = useState<Split>("suppliers");

  const supplierRows = useMemo(() => {
    return purchaseOrders
      .filter(isPoPayable)
      .map((po) => {
        const total = po.grandTotal ?? po.amountTotal ?? 0;
        const paid = po.amountPaid ?? 0;
        return {
          key: po.id,
          name: po.supplierName,
          ref: po.id,
          total,
          remaining: Math.max(0, total - paid),
          paid,
        };
      })
      .sort((a, b) => b.remaining - a.remaining);
  }, [purchaseOrders]);

  const contractorRows = useMemo(() => {
    return workOrders
      .filter(isWoPayable)
      .map((wo) => {
        const total = wo.amountTotal ?? 0;
        const paid = wo.amountPaid ?? 0;
        return {
          key: wo.id,
          name: wo.contractorName,
          ref: wo.id,
          total,
          remaining: Math.max(0, total - paid),
          paid,
        };
      })
      .sort((a, b) => b.remaining - a.remaining);
  }, [workOrders]);

  const rows = split === "suppliers" ? supplierRows : contractorRows;
  const recentLog = useMemo(
    () =>
      [...partyReceivedPayments]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .slice(0, 8),
    [partyReceivedPayments]
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <CreditCard size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f1a35]">Payment log</h2>
            <p className="text-sm text-gray-400">
              Supplier PO &amp; contractor work-order payables
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => navigate("/dashboard/party-payments/receive")}
            className="gap-1.5"
          >
            <Plus size={14} /> Received Payment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/party-payments/all")}
          >
            View all
          </Button>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setSplit("suppliers")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
            split === "suppliers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
        >
          Suppliers
        </button>
        <button
          type="button"
          onClick={() => setSplit("contractors")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
            split === "contractors"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-gray-500"
          }`}
        >
          Contractors
        </button>
      </nav>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">
                  {split === "suppliers" ? "PO id" : "Work order"}
                </th>
                <th className="px-3 py-2.5 font-semibold text-right">Total payment</th>
                <th className="px-3 py-2.5 font-semibold text-right">Remaining</th>
                <th className="px-5 py-2.5 font-semibold text-right">Paid</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No payable {split === "suppliers" ? "POs" : "work orders"} yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.key}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-3 font-medium text-[#0f1a35]">{r.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-600">{r.ref}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[#0f1a35]">
                      {fmt(r.total)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-orange-600">
                      {fmt(r.remaining)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-600">{fmt(r.paid)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Recent received payments</h3>
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:underline"
            onClick={() => navigate("/dashboard/party-payments/all")}
          >
            View all
          </button>
        </div>
        {recentLog.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No payments recorded yet. Use Received Payment.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-5 py-2 font-semibold">Receipt No</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Ref</th>
                <th className="px-3 py-2 font-semibold text-right">Done</th>
                <th className="px-5 py-2 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {recentLog.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-2.5 font-mono text-xs font-medium text-[#0f1a35]">
                    {p.id}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{p.date}</td>
                  <td className="px-3 py-2.5 text-[#0f1a35]">{p.partyName}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{p.sourceId}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-emerald-600">
                    {fmt(p.received)}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 hover:underline"
                      onClick={() =>
                        navigate(`/dashboard/party-payments/receipt/${p.id}`)
                      }
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
