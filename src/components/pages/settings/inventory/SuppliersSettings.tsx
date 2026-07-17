import { useState } from "react";
import { Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";
import { formatSupplierId } from "@/lib/settings/defaultSettings";

/**
 * Settings → Inventory → Suppliers
 * - Supplier ID prefix (next id for Add Supplier)
 * - Work categories (shared with Materials)
 */
export function SuppliersSettings() {
  const { inventorySettings, updateInventorySettings } = useAppDataContext();
  const [catInput, setCatInput] = useState("");
  const [prefix, setPrefix] = useState(inventorySettings.supplierIdPrefix ?? "SUP");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const workCategories = inventorySettings.workCategories ?? [];
  const nextPreview = formatSupplierId(
    inventorySettings.supplierIdPrefix ?? "SUP",
    inventorySettings.supplierIdNext ?? 1
  );

  async function persist(patch: Record<string, unknown>, successMsg: string) {
    setSaving(true);
    setError("");
    setSavedMsg("");
    const updated = await updateInventorySettings(patch as never);
    setSaving(false);
    if (!updated) {
      setError("Could not save. Try again.");
      return false;
    }
    setSavedMsg(successMsg);
    return true;
  }

  async function handleSavePrefix(e: React.FormEvent) {
    e.preventDefault();
    const p = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "SUP";
    setPrefix(p);
    await persist({ supplierIdPrefix: p }, `Prefix saved. Next id: ${formatSupplierId(p, inventorySettings.supplierIdNext ?? 1)}`);
  }

  async function handleAddCat(e: React.FormEvent) {
    e.preventDefault();
    const value = catInput.trim();
    if (!value) {
      setError("Enter a work category name.");
      return;
    }
    if (workCategories.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setError("That category already exists.");
      return;
    }
    const ok = await persist(
      { workCategories: [...workCategories, value] },
      "Category added."
    );
    if (ok) setCatInput("");
  }

  async function handleRemoveCat(cat: string) {
    await persist(
      { workCategories: workCategories.filter((c) => c !== cat) },
      `Removed “${cat}”.`
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Truck size={16} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0f1a35]">Suppliers Settings</h3>
          <p className="text-sm text-gray-500">
            ID prefix for new suppliers + work categories (shared with Materials).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSavePrefix}
        className="space-y-3 max-w-lg rounded-xl border border-gray-100 bg-gray-50/50 p-4"
      >
        <label
          htmlFor="supplier-id-prefix"
          className="block text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          Supplier ID prefix
        </label>
        <input
          id="supplier-id-prefix"
          type="text"
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value);
            setError("");
            setSavedMsg("");
          }}
          placeholder="SUP"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
        <p className="text-xs text-gray-500">
          Next id preview:{" "}
          <span className="font-mono font-semibold text-[#0f1a35]">{nextPreview}</span>
        </p>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save prefix"}
        </Button>
      </form>

      <form
        onSubmit={handleAddCat}
        className="space-y-3 max-w-lg rounded-xl border border-gray-100 bg-gray-50/50 p-4"
      >
        <label
          htmlFor="settings-work-cat"
          className="block text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          Work category name
        </label>
        <input
          id="settings-work-cat"
          type="text"
          value={catInput}
          onChange={(e) => {
            setCatInput(e.target.value);
            setError("");
            setSavedMsg("");
          }}
          placeholder="e.g. Civil, Structural, Finishing"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
        <Button type="submit" variant="primary" disabled={saving}>
          <Plus size={16} />
          {saving ? "Saving…" : "Add category"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {savedMsg && <p className="text-xs text-emerald-600">{savedMsg}</p>}
      </form>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Saved work categories ({workCategories.length})
        </p>
        {workCategories.length === 0 ? (
          <p className="text-sm text-gray-400">No categories yet — add one above.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {workCategories.map((cat) => (
              <li
                key={cat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-sm text-[#0f1a35] shadow-sm"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCat(cat)}
                  className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                  aria-label={`Remove ${cat}`}
                  disabled={saving}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
