import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ClipboardList } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import {
  computePoTotals,
  DEFAULT_GST_RATE,
  defaultLineTotal,
  fmtRupee,
  isPoPayable,
} from "@/lib/inventory/poTotals";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

/**
 * Edit amounts on a unique Purchase Order (esp. when approved with grand total 0).
 * Saving with grandTotal > 0 marks payable — does not write to supplier master.
 */
export function EditPurchaseOrder() {
  const { poId = "" } = useParams();
  const navigate = useNavigate();
  const { getPurchaseOrderById, updatePurchaseOrderAmounts } = useAppDataContext();
  const order = getPurchaseOrderById(poId);

  const [quantity, setQuantity] = useState(String(order?.quantity ?? 1));
  const [unit, setUnit] = useState(order?.unit ?? "nos");
  const [unitPrice, setUnitPrice] = useState(String(order?.unitPrice ?? 0));
  const [lineTotal, setLineTotal] = useState(
    String(order?.subTotal ?? order?.amountTotal ?? 0)
  );
  const [lineTotalTouched, setLineTotalTouched] = useState(
    (order?.subTotal ?? 0) > 0 || (order?.amountTotal ?? 0) > 0
  );
  const [gstRate, setGstRate] = useState(String(order?.gstRate ?? DEFAULT_GST_RATE));
  const [productDescription, setProductDescription] = useState(
    order?.productDescription ?? ""
  );
  const [shipToAddress, setShipToAddress] = useState(order?.shipToAddress ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    return computePoTotals({
      subTotal: Number(lineTotal) || 0,
      gstRate: Number(gstRate) || 0,
    });
  }, [lineTotal, gstRate]);

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

  function onQtyOrPriceChange(nextQty: string, nextPrice: string) {
    setQuantity(nextQty);
    setUnitPrice(nextPrice);
    if (!lineTotalTouched) {
      setLineTotal(String(defaultLineTotal(Number(nextQty) || 0, Number(nextPrice) || 0)));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    setSaving(true);
    const updated = updatePurchaseOrderAmounts(order!.id, {
      quantity: qty,
      unitPrice: Number(unitPrice) || 0,
      lineTotal: Number(lineTotal) || 0,
      gstRate: Number(gstRate) || 0,
      unit,
      productDescription,
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
            <h3 className="text-base font-semibold text-[#0f1a35]">
              Edit purchase order
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              Purchase ID: {order.id}
              {!isPoPayable(order) && (
                <span className="ml-2 text-amber-700 font-sans font-semibold">
                  — set total to add to Payable
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/inventory/purchase-orders")}
        >
          Back
        </Button>
      </div>

      <div className="text-sm text-gray-600 border-t border-gray-100 pt-3 space-y-1">
        <p>
          <span className="font-semibold text-gray-500">Supplier:</span> {order.supplierName}
        </p>
        <p>
          <span className="font-semibold text-gray-500">Material:</span> {order.materialName}
        </p>
        {order.requestNo && (
          <p>
            <span className="font-semibold text-gray-500">Request No:</span> {order.requestNo}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label className={labelClass} htmlFor="edit-desc">
            Product detailed description
          </label>
          <textarea
            id="edit-desc"
            className={fieldClass}
            rows={2}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-qty">
              Qty *
            </label>
            <input
              id="edit-qty"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={quantity}
              onChange={(e) => onQtyOrPriceChange(e.target.value, unitPrice)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-unit">
              Unit
            </label>
            <input
              id="edit-unit"
              className={fieldClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-price">
              Per unit price (₹)
            </label>
            <input
              id="edit-price"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={unitPrice}
              onChange={(e) => onQtyOrPriceChange(quantity, e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-line">
              Total amount (₹) — editable *
            </label>
            <input
              id="edit-line"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={lineTotal}
              onChange={(e) => {
                setLineTotalTouched(true);
                setLineTotal(e.target.value);
              }}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-gst">
            GST %
          </label>
          <input
            id="edit-gst"
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
            <span>Round off (last)</span>
            <span>{fmtRupee(totals.roundOff)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#0f1a35] pt-1 border-t border-gray-200">
            <span>Grand Total</span>
            <span>{fmtRupee(totals.grandTotal)}</span>
          </div>
          {totals.grandTotal > 0 ? (
            <p className="text-[11px] text-emerald-700 pt-1">
              Will appear under Payable (unique PO, not written on supplier master).
            </p>
          ) : (
            <p className="text-[11px] text-amber-700 pt-1">
              Grand total is 0 — still not payable until you set an amount.
            </p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-shipto">
            Ship to address
          </label>
          <textarea
            id="edit-shipto"
            className={fieldClass}
            rows={2}
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save amounts"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}
          >
            View document
          </Button>
        </div>
      </form>
    </div>
  );
}
