import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Supplier } from "@/lib/inventory/inventoryTypes";

/**
 * Edit supplier profile only (name, contact, address, GST, categories).
 * Payment totals stay rollup-driven from POs — not edited here.
 */
export function EditSupplierProfileModal({
  supplier,
  categoryOptions,
  onSave,
  onClose,
}: {
  supplier: Supplier;
  categoryOptions: string[];
  onSave: (patch: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    pinCode?: string;
    gstin?: string;
    workCategories: string[];
  }) => boolean;
  onClose: () => void;
}) {
  const options = useMemo(
    () =>
      categoryOptions.length > 0
        ? categoryOptions
        : ["Civil", "Structural", "Plastering", "Finishing"],
    [categoryOptions]
  );

  const [name, setName] = useState(supplier.name);
  const [phone, setPhone] = useState(supplier.phone ?? "");
  const [email, setEmail] = useState(supplier.email ?? "");
  const [address, setAddress] = useState(supplier.address ?? "");
  const [pinCode, setPinCode] = useState(supplier.pinCode ?? "");
  const [gstin, setGstin] = useState(supplier.gstin ?? "");
  const [selectedCats, setSelectedCats] = useState<string[]>([
    ...(supplier.workCategories ?? []),
  ]);
  const [catSelect, setCatSelect] = useState("");
  const [customCat, setCustomCat] = useState("");
  const [error, setError] = useState("");

  const fieldClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    if (
      !window.confirm(
        `Save profile changes for ${name.trim()}?\n\nPayment totals are not changed (from POs).`
      )
    ) {
      return;
    }
    const ok = onSave({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      pinCode: pinCode.trim() || undefined,
      gstin: gstin.trim() || undefined,
      workCategories: selectedCats,
    });
    if (!ok) {
      setError("Could not save profile.");
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="edit-supplier-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 id="edit-supplier-title" className="text-base font-semibold text-[#0f1a35]">
              Edit supplier profile
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{supplier.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="es-name" className={labelClass}>
              Name *
            </label>
            <input
              id="es-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="es-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="es-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="es-email" className={labelClass}>
                Email
              </label>
              <input
                id="es-email"
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
                    onClick={() =>
                      setSelectedCats((prev) => prev.filter((x) => x !== c))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-800"
                  >
                    {c} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="es-address" className={labelClass}>
              Address
            </label>
            <textarea
              id="es-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="es-pin" className={labelClass}>
                Pincode
              </label>
              <input
                id="es-pin"
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="es-gstin" className={labelClass}>
                GST No (GSTIN)
              </label>
              <input
                id="es-gstin"
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className={fieldClass}
                placeholder="e.g. 27AAAAA0000A1Z5"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Total / remaining amounts come from linked purchase orders and are not edited
            here.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" variant="primary">
              Confirm &amp; save
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
