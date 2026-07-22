import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import {
  computePoTotals,
  DEFAULT_GST_RATE,
  defaultLineTotal,
  fmtRupee,
  isPoPayable,
} from "@/lib/inventory/poTotals";
import { resolvePoLineItems } from "@/lib/inventory/poLineItems";
import type { PoLineItem } from "@/lib/inventory/inventoryTypes";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

type ItemRow = {
  materialId: string;
  materialName: string;
  productDescription: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  lineTotal: string;
  lineTotalTouched: boolean;
};

function emptyRow(): ItemRow {
  return {
    materialId: "",
    materialName: "",
    productDescription: "",
    quantity: "1",
    unit: "nos",
    unitPrice: "0",
    lineTotal: "0",
    lineTotalTouched: false,
  };
}

/**
 * Edit multi-line amounts on a unique Purchase Order.
 */
export function EditPurchaseOrder() {
  const { poId = "" } = useParams();
  const navigate = useNavigate();
  const { getPurchaseOrderById, updatePurchaseOrderAmounts, materials } =
    useAppDataContext();
  const order = getPurchaseOrderById(poId);

  const initialRows = useMemo(() => {
    if (!order) return [emptyRow()];
    return resolvePoLineItems(order).map((it) => ({
      materialId: it.materialId || "",
      materialName: it.materialName,
      productDescription: it.productDescription,
      quantity: String(it.quantity),
      unit: it.unit,
      unitPrice: String(it.unitPrice),
      lineTotal: String(it.lineTotal),
      lineTotalTouched: true,
    }));
  }, [order]);

  const [itemRows, setItemRows] = useState<ItemRow[]>(initialRows);
  const [gstRate, setGstRate] = useState(String(order?.gstRate ?? DEFAULT_GST_RATE));
  const [shipToAddress, setShipToAddress] = useState(order?.shipToAddress ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subTotal = useMemo(
    () => itemRows.reduce((s, r) => s + (Number(r.lineTotal) || 0), 0),
    [itemRows]
  );

  const totals = useMemo(() => {
    return computePoTotals({
      subTotal,
      gstRate: Number(gstRate) || 0,
    });
  }, [subTotal, gstRate]);

  if (!order) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500">
        <p>Purchase order not found.</p>
        <button
          type="button"
          className="mt-4 text-sm text-blue-600 font-medium"
          onClick={() => navigate("/inventory/purchase-orders")}
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  function updateRow(index: number, patch: Partial<ItemRow>) {
    setItemRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], ...patch };
      if (
        !row.lineTotalTouched &&
        (patch.quantity !== undefined || patch.unitPrice !== undefined)
      ) {
        row.lineTotal = String(
          defaultLineTotal(Number(row.quantity) || 0, Number(row.unitPrice) || 0)
        );
      }
      next[index] = row;
      return next;
    });
  }

  function onMaterialChange(index: number, materialId: string) {
    const mat = materials.find((m) => m.id === materialId);
    updateRow(index, {
      materialId,
      materialName: mat?.name || "",
      unit: mat?.unit || "nos",
      unitPrice: String(mat?.unitCost ?? 0),
      productDescription: mat?.name || itemRows[index]?.productDescription || "",
      lineTotalTouched: false,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const items: PoLineItem[] = itemRows
      .map((row) => {
        const mat = materials.find((m) => m.id === row.materialId);
        const quantity = Number(row.quantity) || 0;
        const unitPrice = Number(row.unitPrice) || 0;
        const lineTotal = Number(row.lineTotal) || 0;
        const name =
          mat?.name || row.materialName.trim() || row.productDescription.trim();
        if (!name && quantity <= 0) return null;
        return {
          materialId: mat?.id || row.materialId || undefined,
          materialName: name || "Item",
          productDescription: row.productDescription.trim() || name || "",
          unit: row.unit.trim() || "nos",
          quantity,
          unitPrice,
          lineTotal: lineTotal > 0 ? lineTotal : defaultLineTotal(quantity, unitPrice),
        };
      })
      .filter(Boolean) as PoLineItem[];

    if (!items.length) {
      setError("Add at least one item.");
      return;
    }
    if (items.some((it) => it.quantity <= 0)) {
      setError("Each item quantity must be greater than 0.");
      return;
    }

    setSaving(true);
    const updated = updatePurchaseOrderAmounts(order!.id, {
      items,
      gstRate: Number(gstRate) || 0,
      shipToAddress,
    });
    setSaving(false);
    if (!updated) {
      setError("Could not save. Try again.");
      return;
    }
    navigate("/inventory/purchase-orders");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <ClipboardList size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">Edit purchase order</h3>
            <p className="text-xs text-gray-500 font-mono">
              {order.id}
              {isPoPayable(order) ? " · payable" : " · set totals to make payable"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 border-t border-gray-100 pt-4">
        <div className="border border-gray-100 rounded-lg p-3 space-y-3">
          <p className="text-sm font-semibold text-[#0f1a35]">Items</p>
          {itemRows.map((row, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Item {i + 1}</span>
                {itemRows.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2 !py-1.5"
                    onClick={() => setItemRows(itemRows.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
              <div>
                <label className={labelClass}>Material</label>
                <select
                  className={fieldClass}
                  value={row.materialId}
                  onChange={(e) => onMaterialChange(i, e.target.value)}
                >
                  <option value="">Select material…</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={row.productDescription}
                  onChange={(e) => updateRow(i, { productDescription: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className={labelClass}>Qty</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClass}
                    value={row.quantity}
                    onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit</label>
                  <input
                    className={fieldClass}
                    value={row.unit}
                    onChange={(e) => updateRow(i, { unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit price</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClass}
                    value={row.unitPrice}
                    onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Line total</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={fieldClass}
                    value={row.lineTotal}
                    onChange={(e) =>
                      updateRow(i, {
                        lineTotal: e.target.value,
                        lineTotalTouched: true,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="text-xs !py-1.5"
            onClick={() => setItemRows([...itemRows, emptyRow()])}
          >
            <Plus size={14} /> Add item
          </Button>
        </div>

        <div>
          <label className={labelClass}>GST %</label>
          <input
            type="number"
            min="0"
            step="any"
            className={fieldClass}
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
          />
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Sub Total</span>
            <span>{fmtRupee(totals.subTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST ({totals.gstRate}%)</span>
            <span>{fmtRupee(totals.gstAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Round off</span>
            <span>{fmtRupee(totals.roundOff)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#0f1a35]">
            <span>Grand total</span>
            <span>{fmtRupee(totals.grandTotal)}</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Ship to</label>
          <textarea
            className={fieldClass}
            rows={2}
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
