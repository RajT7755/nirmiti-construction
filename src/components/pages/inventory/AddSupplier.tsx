import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Truck } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";
import { formatSupplierId } from "@/lib/settings/defaultSettings";

export function AddSupplier() {
  const navigate = useNavigate();
  const { inventorySettings, addSupplier } = useAppDataContext();
  const categoryOptions = inventorySettings.workCategories ?? [];

  const nextId = useMemo(
    () =>
      formatSupplierId(
        inventorySettings.supplierIdPrefix ?? "SUP",
        inventorySettings.supplierIdNext ?? 1
      ),
    [inventorySettings.supplierIdPrefix, inventorySettings.supplierIdNext]
  );

  const options = useMemo(
    () =>
      categoryOptions.length > 0
        ? categoryOptions
        : ["Civil", "Structural", "Plastering", "Finishing"],
    [categoryOptions]
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [paymentTotal, setPaymentTotal] = useState("");
  const [paymentRemaining, setPaymentRemaining] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [catSelect, setCatSelect] = useState("");
  const [customCat, setCustomCat] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function addCategoryFromSelect() {
    if (!catSelect) return;
    if (!selectedCats.includes(catSelect)) {
      setSelectedCats((prev) => [...prev, catSelect]);
    }
    setCatSelect("");
  }

  function addCustomCategory() {
    const v = customCat.trim();
    if (!v) return;
    if (!selectedCats.some((c) => c.toLowerCase() === v.toLowerCase())) {
      setSelectedCats((prev) => [...prev, v]);
    }
    setCustomCat("");
  }

  function removeCat(cat: string) {
    setSelectedCats((prev) => prev.filter((c) => c !== cat));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    const total = paymentTotal.trim() === "" ? 0 : Number(paymentTotal);
    const remaining = paymentRemaining.trim() === "" ? 0 : Number(paymentRemaining);
    if (Number.isNaN(total) || total < 0 || Number.isNaN(remaining) || remaining < 0) {
      setError("Total and Remaining must be valid non-negative numbers.");
      return;
    }
    if (remaining > total) {
      setError("Remaining cannot be greater than Total.");
      return;
    }
    setSaving(true);
    const created = addSupplier({
      name: name.trim(),
      workCategories: selectedCats,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      pinCode: pinCode.trim() || undefined,
      gstin: gstin.trim() || undefined,
      paymentTotal: total,
      paymentRemaining: remaining,
      status: "active",
    });
    setSaving(false);
    if (!created) {
      setError("Could not save supplier.");
      return;
    }
    navigate("/inventory/suppliers");
  }

  const fieldClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Truck size={16} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">Add Supplier</h3>
            <p className="text-sm text-gray-500">
              ID from settings prefix. Work categories: dropdown or custom text.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate("/inventory/suppliers")}>
          <ArrowLeft size={16} />
          Back to Supplier List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label className={labelClass}>Supplier id</label>
          <input type="text" value={nextId} readOnly className={`${fieldClass} bg-gray-50 font-mono`} />
        </div>

        <div>
          <label htmlFor="sup-name" className={labelClass}>
            Name
          </label>
          <input
            id="sup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Supplier name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sup-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="sup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="sup-email" className={labelClass}>
              Email
            </label>
            <input
              id="sup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <p className={labelClass}>Work categories</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={catSelect}
              onChange={(e) => setCatSelect(e.target.value)}
              className={`${fieldClass} flex-1 min-w-[10rem]`}
            >
              <option value="">Select category…</option>
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={addCategoryFromSelect}>
              <Plus size={16} /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              placeholder="Or type custom category"
              className={`${fieldClass} flex-1 min-w-[10rem]`}
            />
            <Button type="button" variant="outline" onClick={addCustomCategory}>
              <Plus size={16} /> Add
            </Button>
          </div>
          {selectedCats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedCats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => removeCat(c)}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-800"
                >
                  {c} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sup-address" className={labelClass}>
            Address
          </label>
          <textarea
            id="sup-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sup-pin" className={labelClass}>
              Pincode
            </label>
            <input
              id="sup-pin"
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="sup-gstin" className={labelClass}>
              GST No (GSTIN)
            </label>
            <input
              id="sup-gstin"
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 27AAAAA0000A1Z5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sup-total" className={labelClass}>
              Total (₹)
            </label>
            <input
              id="sup-total"
              type="number"
              min={0}
              step="0.01"
              value={paymentTotal}
              onChange={(e) => setPaymentTotal(e.target.value)}
              placeholder="0"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="sup-remaining" className={labelClass}>
              Remaining (₹)
            </label>
            <input
              id="sup-remaining"
              type="number"
              min={0}
              step="0.01"
              value={paymentRemaining}
              onChange={(e) => setPaymentRemaining(e.target.value)}
              placeholder="0"
              className={fieldClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save supplier"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/inventory/suppliers")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
