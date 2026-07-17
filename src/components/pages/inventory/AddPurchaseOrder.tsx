import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ClipboardList } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { Button } from "@/components/ui/Button";
import {
  computePoTotals,
  DEFAULT_GST_RATE,
  defaultLineTotal,
  fmtRupee,
} from "@/lib/inventory/poTotals";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

/**
 * Simple multi-choice form: supplier + material selects.
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
  const [materialId, setMaterialId] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("nos");
  const [unitPrice, setUnitPrice] = useState("0");
  const [lineTotal, setLineTotal] = useState("0");
  const [lineTotalTouched, setLineTotalTouched] = useState(false);
  const [gstRate, setGstRate] = useState(String(DEFAULT_GST_RATE));
  const [shipToAddress, setShipToAddress] = useState(defaultShipTo);
  const [shipVia, setShipVia] = useState("");
  const [fob, setFob] = useState("");
  const [shippingTerms, setShippingTerms] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedMaterial = materials.find((m) => m.id === materialId);
  const selectedSupplier = activeSuppliers.find((s) => s.id === supplierId);

  // When material changes: fill unit, unit cost, description default
  useEffect(() => {
    if (!selectedMaterial) return;
    setUnit(selectedMaterial.unit || "nos");
    setUnitPrice(String(selectedMaterial.unitCost ?? 0));
    if (!productDescription.trim()) {
      setProductDescription(selectedMaterial.name);
    }
    setLineTotalTouched(false);
  }, [materialId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto line total from qty × unit price unless user edited total
  useEffect(() => {
    if (lineTotalTouched) return;
    const q = Number(quantity) || 0;
    const p = Number(unitPrice) || 0;
    setLineTotal(String(defaultLineTotal(q, p)));
  }, [quantity, unitPrice, lineTotalTouched]);

  const totals = useMemo(() => {
    return computePoTotals({
      subTotal: Number(lineTotal) || 0,
      gstRate: Number(gstRate) || 0,
    });
  }, [lineTotal, gstRate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!supplierId || !selectedSupplier) {
      setError("Select a supplier.");
      return;
    }
    if (!materialId || !selectedMaterial) {
      setError("Select a material.");
      return;
    }
    if (!productDescription.trim()) {
      setError("Enter product detailed description.");
      return;
    }
    if (!shipToAddress.trim()) {
      setError("Enter ship-to address.");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    setSaving(true);
    const created = addPurchaseRequest({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      productDescription: productDescription.trim(),
      unit,
      quantity: qty,
      unitPrice: Number(unitPrice) || 0,
      lineTotal: Number(lineTotal) || 0,
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
              Saves as Request No. Approve later to create Purchase ID (payable).
            </p>
          </div>
        </div>
        <BackToInventoryButton />
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 border-t border-gray-100 pt-4">
        {/* Supplier — multi-choice */}
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

        {/* Material — multi-choice */}
        <div>
          <label className={labelClass} htmlFor="po-material">
            Material *
          </label>
          <select
            id="po-material"
            className={fieldClass}
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            required
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
          <label className={labelClass} htmlFor="po-desc">
            Product detailed description *
          </label>
          <textarea
            id="po-desc"
            className={fieldClass}
            rows={2}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Product detailed description"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="po-qty">
              Qty *
            </label>
            <input
              id="po-qty"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="po-unit">
              Unit
            </label>
            <input
              id="po-unit"
              className={fieldClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              list="po-unit-list"
            />
            <datalist id="po-unit-list">
              {materials.map((m) => (
                <option key={m.id} value={m.unit} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="po-price">
              Per unit price (₹) *
            </label>
            <input
              id="po-price"
              type="number"
              min="0"
              step="any"
              className={fieldClass}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="po-line">
              Total amount (₹) — editable *
            </label>
            <input
              id="po-line"
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

        {/* Live totals — GST then round-off only at end */}
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
        </div>

        <div>
          <label className={labelClass} htmlFor="po-shipto">
            Ship to address *
          </label>
          <textarea
            id="po-shipto"
            className={fieldClass}
            rows={2}
            value={shipToAddress}
            onChange={(e) => setShipToAddress(e.target.value)}
            placeholder="Delivery / site address"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass} htmlFor="po-shipvia">
              Ship Via
            </label>
            <input
              id="po-shipvia"
              className={fieldClass}
              value={shipVia}
              onChange={(e) => setShipVia(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="po-fob">
              FOB
            </label>
            <input
              id="po-fob"
              className={fieldClass}
              value={fob}
              onChange={(e) => setFob(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="po-terms">
              Shipping terms
            </label>
            <input
              id="po-terms"
              className={fieldClass}
              value={shippingTerms}
              onChange={(e) => setShippingTerms(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-2">
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
