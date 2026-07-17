import { useMemo } from "react";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";
import { fmt } from "@/lib/utils";
import { rollupSupplierPayments } from "@/lib/inventory/paymentRollup";
import { SUPPLIER_PAYMENTS_API } from "@/lib/api/inventory/supplierPayments";

/**
 * Supplier payment detail — Total / Remaining from linked Purchase Orders.
 * Route: /inventory/suppliers/:supplierId/payments
 * API: SUPPLIER_PAYMENTS_API (VITE_INVENTORY_API_KEY / VITE_API_KEY)
 */
export function SupplierPaymentsPage() {
  const { supplierId = "" } = useParams();
  const navigate = useNavigate();
  const { suppliers, purchaseOrders } = useAppDataContext();

  const supplier = suppliers.find((s) => s.id === supplierId);
  const summary = useMemo(
    () => rollupSupplierPayments(supplierId, purchaseOrders),
    [supplierId, purchaseOrders]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <IndianRupee size={16} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">
              Supplier payments
            </h3>
            <p className="text-sm text-gray-500">
              {supplier?.name ?? supplierId} — totals from Purchase Orders
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate("/inventory/suppliers")}>
          <ArrowLeft size={16} />
          Back to Suppliers
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Total</p>
          <p className="text-2xl font-bold text-[#0f1a35] mt-1">{fmt(summary.paymentTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Paid</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(summary.paymentPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Remaining</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{fmt(summary.paymentRemaining)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-[#0f1a35]">Linked purchase orders</h4>
          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
            API: {SUPPLIER_PAYMENTS_API.list(supplierId)}
          </p>
        </div>
        {summary.lines.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No PO payment lines for this supplier.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-5 py-2.5 font-semibold">PO</th>
                <th className="px-3 py-2.5 font-semibold">Material</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Total</th>
                <th className="px-3 py-2.5 font-semibold">Paid</th>
                <th className="px-5 py-2.5 font-semibold">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {summary.lines.map((line) => (
                <tr key={line.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">
                    <Link
                      to="/inventory/purchase-orders"
                      className="text-blue-600 hover:underline"
                    >
                      {line.sourceId}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{line.note ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-500">{line.date}</td>
                  <td className="px-3 py-3 font-semibold">{fmt(line.amountTotal)}</td>
                  <td className="px-3 py-3 text-emerald-600">{fmt(line.amountPaid)}</td>
                  <td className="px-5 py-3 font-semibold text-orange-600">
                    {fmt(Math.max(0, line.amountTotal - line.amountPaid))}
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
