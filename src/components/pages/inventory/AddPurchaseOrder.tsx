import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { Button } from "@/components/ui/Button";
import {
  computePoTotals,
  DEFAULT_GST_RATE,
  defaultLineTotal,
  fmtRupee,
} from "@/lib/inventory/poTotals";
import { sumPoLineTotals } from "@/lib/inventory/poLineItems";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

type ItemRow = {
  materialId: string;
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
    productDescription: "",
    quantity: "1",
    unit: "nos",
    unitPrice: "0",
    lineTotal: "0",
    lineTotalTouched: false,
  };
}

/**
 * Multi-item purchase request form.
 * Saves as a Request; Approve on PO page creates payable Purchase Order.
 */
export function AddPurchaseOrder() {
  const navigate = useNavigate();
  const { suppliers, materials, businessProfile, addPurchaseRequest } = useAppDataContext();
  const company = resolveBusinessProfile(businessProfile);

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.status !== "inactive"),
    [suppliers]
  );

  const defaultShipTo = [
    company.address,
    company.city,
    company.state,
    company.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const [supplierId, setSupplierId] = useState("");
  const [itemRows, setItemRows] = useState<ItemRow[]>([emptyRow()]);
  const [gstRate, setGstRate] = useState(String(DEFAULT_GST_RATE));
  const [shipToAddress, setShipToAddress] = useState(defaultShipTo);
  const [shipVia, setShipVia] = useState("");
  const [fob, setFob] = useState("");
  const [shippingTerms, setShippingTerms] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSupplier = activeSuppliers.find((s) => s.id === supplierId);

  const subTotal = useMemo(
    () =>
      itemRows.reduce((s, r) => s + (Number(r.lineTotal) || 0), 0),
    [itemRows]
  );

  const totals = useMemo(
    () =>
      computePoTotals({
        subTotal,
        gstRate: Number(gstRate) || 0,
      }),
    [subTotal, gstRate]
  );

  function updateRow(index: number, patch: Partial<ItemRow>) {
    setItemRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], ...patch };
      if (
        !row.lineTotalTouched &&
        (patch.quantity !== undefined ||
          patch.unitPrice !== undefined ||
          patch.materialId !== undefined)
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
      unit: mat?.unit || "nos",
      unitPrice: String(mat?.unitCost ?? 0),
      productDescription: mat?.name || itemRows[index]?.productDescription || "",
      lineTotalTouched: false,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!supplierId || !selectedSupplier) {
      setError("Select a supplier.");
      return;
    }
    if (!shipToAddress.trim()) {
      setError("Enter ship-to address.");
      return;
    }

    const items = itemRows
      .map((row) => {
        const mat = materials.find((m) => m.id === row.materialId);
        const quantity = Number(row.quantity) || 0;
        const unitPrice = Number(row.unitPrice) || 0;
        const lineTotal = Number(row.lineTotal) || 0;
        if (!mat && !row.productDescription.trim()) return null;
        if (quantity <= 0 && lineTotal <= 0) return null;
        return {
          materialId: mat?.id,
          materialName: mat?.name || row.productDescription.trim() || "Item",
          productDescription: row.productDescription.trim() || mat?.name || "",
          unit: row.unit.trim() || mat?.unit || "nos",
          quantity,
          unitPrice,
          lineTotal: lineTotal > 0 ? lineTotal : defaultLineTotal(quantity, unitPrice),
        };
      })
      .filter(Boolean) as {
      materialId?: string;
      materialName: string;
      productDescription: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];

    if (items.length === 0) {
      setError("Add at least one item with material or description.");
      return;
    }
    for (const it of items) {
      if (!it.productDescription.trim()) {
        setError("Each item needs a product description.");
        return;
      }
      if (it.quantity <= 0) {
        setError("Each item quantity must be greater than 0.");
        return;
      }
    }

    setSaving(true);
    const created = addPurchaseRequest({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      items,
      gstRate: Number(gstRate) || DEFAULT_GST_RATE,
      shipToAddress: shipToAddress.trim(),
      shipVia: shipVia.trim() || undefined,
      fob: fob.trim() || undefined,
      shippingTerms: shippingTerms.trim() || undefined,
    });
    setSaving(false);

    if (!created) {
      setError("Could not save request. Try again.");
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
            <h3 className="text-base font-semibold text-[#0f1a35]">Add purchase request</h3>
            <p className="text-xs text-gray-500">
              Multi-item request. Approve later to create Purchase ID (payable).
            </p>
          </div>
        </div>
        <BackToInventoryButton />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label className={labelClass} htmlFor="po-supplier">
            Supplier name *
          </label>
          <select
            id="po-supplier"
            className={fieldClass}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select supplier…</option>
            {activeSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </div>

        <div className="border border-gray-100 rounded-lg p-3 space-y-3">
          <p className="text-sm font-semibold text-[#0f1a35]">Items</p>
          {itemRows.map((row, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500">Item {i + 1}</span>
                {itemRows.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2 !py-1.5 text-xs"
                    onClick={() => setItemRows(itemRows.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
              <div>
                <label className={labelClass}>Material *</label>
                <select
                  className={fieldClass}
                  value={row.materialId}
                  onChange={(e) => onMaterialChange(i, e.target.value)}
                >
                  <option value="">Select material…</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Product detailed description *</label>
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={row.productDescription}
                  onChange={(e) => updateRow(i, { productDescription: e.target.value })}
                  placeholder="Product detailed description"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className={labelClass}>Qty *</label>
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
                  <label className={labelClass}>Unit price (₹)</label>
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
                  <label className={labelClass}>Line total (₹)</label>
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
          <p className="text-[11px] text-gray-400">
            Sub total of lines: {fmtRupee(sumPoLineTotals(
              itemRows.map((r) => ({
                materialName: "",
                productDescription: "",
                unit: "nos",
                quantity: Number(r.quantity) || 0,
                unitPrice: Number(r.unitPrice) || 0,
                lineTotal: Number(r.lineTotal) || 0,
              }))
            ))}
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="po-gst">
            GST %
          </label>
          <input
            id="po-gst"
            type="number"
            min="0"
            step="any"
            className={fieldClass}
            value={gstRate}
            onChange={(e) => setGstRate(e.target.value)}
            placeholder="e.g. 18 or 9.5"
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
          <div className="flex justify-between font-semibold text-[#0f1a35] pt-1 border-t border-gray-200">
            <span>Grand total</span>
            <span>{fmtRupee(totals.grandTotal)}</span>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="po-ship">
            Ship to *
          </label>
          <textarea
            id="po-ship"
            className={fieldClass}
            rows={2}
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Ship via</label>
            <input
              className={fieldClass}
              value={shipVia}
              onChange={(e) => setShipVia(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>FOB</label>
            <input
              className={fieldClass}
              value={fob}
              onChange={(e) => setFob(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Shipping terms</label>
            <input
              className={fieldClass}
              value={shippingTerms}
              onChange={(e) => setShippingTerms(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save request"}
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
