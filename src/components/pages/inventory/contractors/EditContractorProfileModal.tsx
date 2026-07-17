import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Contractor } from "@/lib/inventory/inventoryTypes";

/**
 * Edit contractor profile only (name, work profile, contact, address, GST, categories).
 * Payment totals stay rollup-driven from WOs — not edited here.
 */
export function EditContractorProfileModal({
  contractor,
  categoryOptions,
  onSave,
  onClose,
}: {
  contractor: Contractor;
  categoryOptions: string[];
  onSave: (patch: {
    name: string;
    workProfile: string;
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
        : ["Civil", "Structural", "Plastering", "Finishing", "Electrical"],
    [categoryOptions]
  );

  const [name, setName] = useState(contractor.name);
  const [workProfile, setWorkProfile] = useState(
    contractor.workProfile ?? contractor.trade ?? ""
  );
  const [phone, setPhone] = useState(contractor.phone ?? "");
  const [email, setEmail] = useState(contractor.email ?? "");
  const [address, setAddress] = useState(contractor.address ?? "");
  const [pinCode, setPinCode] = useState(contractor.pinCode ?? "");
  const [gstin, setGstin] = useState(contractor.gstin ?? "");
  const [selectedCats, setSelectedCats] = useState<string[]>([
    ...(contractor.workCategories ?? []),
  ]);
  const [catSelect, setCatSelect] = useState("");
  const [customCat, setCustomCat] = useState("");
  const [error, setError] = useState("");

  const fieldClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";
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
      setError("Contractor name is required.");
      return;
    }
    if (
      !window.confirm(
        `Save profile changes for ${name.trim()}?\n\nPayment totals are not changed (from work orders).`
      )
    ) {
      return;
    }
    const ok = onSave({
      name: name.trim(),
      workProfile: workProfile.trim(),
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
        aria-labelledby="edit-contractor-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3
              id="edit-contractor-title"
              className="text-base font-semibold text-[#0f1a35]"
            >
              Edit contractor profile
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{contractor.id}</p>
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
            <label htmlFor="ec-name" className={labelClass}>
              Name *
            </label>
            <input
              id="ec-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="ec-profile" className={labelClass}>
              Work profile
            </label>
            <input
              id="ec-profile"
              type="text"
              value={workProfile}
              onChange={(e) => setWorkProfile(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Internal plastering, RCC works"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ec-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="ec-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="ec-email" className={labelClass}>
                Email
              </label>
              <input
                id="ec-email"
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
                    className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800"
                  >
                    {c} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="ec-address" className={labelClass}>
              Address
            </label>
            <textarea
              id="ec-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ec-pin" className={labelClass}>
                Pincode
              </label>
              <input
                id="ec-pin"
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="ec-gstin" className={labelClass}>
                GST No (GSTIN)
              </label>
              <input
                id="ec-gstin"
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className={fieldClass}
                placeholder="e.g. 27AAAAA0000A1Z5"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Total / remaining amounts come from linked work orders and are not edited here.
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
