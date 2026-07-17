import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Printer, Wrench } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import { fmtRupee } from "@/lib/inventory/poTotals";
import { isWoPayable, netIssuedByMaterial } from "@/lib/inventory/workOrderStock";
import type { WorkMaterialLine } from "@/lib/inventory/inventoryTypes";
import { WorkOrderDocument } from "@/components/workOrders/WorkOrderDocument";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";
import "@/components/workOrders/woPrint.css";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

export function EditWorkOrder() {
  const { woId = "" } = useParams();
  const navigate = useNavigate();
  const {
    getWorkOrderById,
    updateWorkOrderAmount,
    returnWorkOrderMaterials,
    materials,
    contractors,
    businessProfile,
  } = useAppDataContext();
  const order = getWorkOrderById(woId);
  const contractor = order
    ? contractors.find((c) => c.id === order.contractorId)
    : undefined;
  const profile = resolveBusinessProfile(businessProfile);

  const [amount, setAmount] = useState(String(order?.amountTotal ?? 0));
  const [returnRows, setReturnRows] = useState<{ materialId: string; quantity: string }[]>(
    []
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const netIssued = useMemo(
    () => (order ? netIssuedByMaterial(order) : new Map()),
    [order]
  );

  const returnableMaterials = useMemo(() => {
    if (!order) return [];
    return (order.materialIssues ?? []).filter(
      (l) => (netIssued.get(l.materialId) ?? 0) > 0
    );
  }, [order, netIssued]);

  if (!order) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center text-gray-500">
        <p>Work order not found.</p>
        <button
          type="button"
          className="mt-4 text-sm text-blue-600 font-medium"
          onClick={() => navigate("/inventory/work-orders")}
        >
          Back
        </button>
      </div>
    );
  }

  function saveAmount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const updated = updateWorkOrderAmount(order!.id, Number(amount) || 0);
    if (!updated) {
      setError("Could not save amount.");
      return;
    }
    setMessage(
      isWoPayable(updated)
        ? "Work amount saved — WO is now in Payable."
        : "Work amount is 0 — not in Payable yet."
    );
  }

  function saveReturns(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const lines: WorkMaterialLine[] = returnRows
      .map((row) => {
        const issue = (order!.materialIssues ?? []).find(
          (l) => l.materialId === row.materialId
        );
        if (!issue) return null;
        const qty = Number(row.quantity) || 0;
        if (qty <= 0) return null;
        return {
          materialId: issue.materialId,
          materialName: issue.materialName,
          unit: issue.unit,
          quantity: qty,
        };
      })
      .filter(Boolean) as WorkMaterialLine[];

    if (!lines.length) {
      setError("Add return qty for at least one issued material.");
      return;
    }
    const updated = returnWorkOrderMaterials(order!.id, lines);
    if (!updated) {
      setError("Could not record returns.");
      return;
    }
    setReturnRows([]);
    setMessage("Materials returned to stock. Low stock / totals updated.");
  }

  return (
    <div className="space-y-6">
      <div className="wo-no-print bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Wrench size={16} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0f1a35]">Edit work order</h3>
              <p className="text-xs text-gray-500 font-mono">
                {order.id}
                {!isWoPayable(order) && (
                  <span className="ml-2 text-amber-700 font-sans font-semibold">
                    — set work amount for Payable
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/inventory/work-orders/${order.id}`)}
            >
              View document
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/inventory/work-orders")}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1 border-t border-gray-100 pt-3">
          <p>
            <span className="font-semibold text-gray-500">Contractor:</span>{" "}
            {order.contractorName}
          </p>
          <p>
            <span className="font-semibold text-gray-500">Description:</span>{" "}
            {order.description ?? order.title}
          </p>
          <p>
            <span className="font-semibold text-gray-500">Issue / Commit:</span>{" "}
            {order.dateOfIssue ?? order.startDate} → {order.commitmentDate ?? "—"}
          </p>
        </div>

        <form onSubmit={saveAmount} className="max-w-md space-y-3 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-[#0f1a35]">Work amount (after generate)</h4>
          <div>
            <label className={labelClass} htmlFor="wo-amount">
              Work amount (₹)
            </label>
            <input
              id="wo-amount"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button type="submit">Save work amount</Button>
        </form>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <h4 className="text-sm font-semibold text-[#0f1a35]">
            Issued materials (stock reduced)
          </h4>
          {(order.materialIssues ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">None</p>
          ) : (
            <ul className="text-sm text-gray-600 space-y-1">
              {(order.materialIssues ?? []).map((l) => {
                const stock = materials.find((m) => m.id === l.materialId)?.quantity;
                const rem = netIssued.get(l.materialId) ?? 0;
                return (
                  <li key={l.materialId}>
                    {l.materialName}: issued {l.quantity} {l.unit} · still out {rem} · catalog
                    stock {stock ?? "—"}
                  </li>
                );
              })}
            </ul>
          )}
          {(order.materialReturns ?? []).length > 0 && (
            <div className="text-xs text-gray-500">
              Returned:{" "}
              {(order.materialReturns ?? [])
                .map((l) => `${l.materialName} (${l.quantity})`)
                .join(", ")}
            </div>
          )}
        </div>

        {returnableMaterials.length > 0 && (
          <form
            onSubmit={saveReturns}
            className="max-w-lg space-y-3 border-t border-gray-100 pt-4"
          >
            <h4 className="text-sm font-semibold text-[#0f1a35]">
              Return material (adds back to stock)
            </h4>
            {returnableMaterials.map((issue) => {
              const rem = netIssued.get(issue.materialId) ?? 0;
              const row = returnRows.find((r) => r.materialId === issue.materialId);
              return (
                <div key={issue.materialId} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[160px]">
                    <p className="text-sm text-gray-700">
                      {issue.materialName}{" "}
                      <span className="text-xs text-gray-400">
                        (max return {rem} {issue.unit})
                      </span>
                    </p>
                  </div>
                  <div className="w-28">
                    <label className={labelClass}>Return qty</label>
                    <input
                      type="number"
                      min="0"
                      max={rem}
                      step="any"
                      className={fieldClass}
                      value={row?.quantity ?? ""}
                      placeholder="0"
                      onChange={(e) => {
                        const q = e.target.value;
                        setReturnRows((prev) => {
                          const rest = prev.filter((r) => r.materialId !== issue.materialId);
                          if (!q) return rest;
                          return [...rest, { materialId: issue.materialId, quantity: q }];
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <Button type="submit" variant="outline">
              Record returns
            </Button>
          </form>
        )}

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {isWoPayable(order) && (
          <p className="text-xs text-gray-500">
            Current payable amount: {fmtRupee(order.amountTotal ?? 0)}
          </p>
        )}
      </div>

      {/* Printable document (hidden on screen chrome; shown when printing) */}
      <div id="wo-print-root" className="hidden print:block">
        <WorkOrderDocument
          source={{ kind: "wo", order }}
          businessProfile={profile}
          contractor={contractor}
        />
      </div>
    </div>
  );
}
