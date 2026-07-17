import { useState } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";

/**
 * Settings → Inventory → Materials
 * Manage unit list; values appear on Add Material unit dropdown.
 */
export function MaterialsSettings() {
  const { inventorySettings, updateInventorySettings } = useAppDataContext();
  const [unitInput, setUnitInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const units = inventorySettings.units ?? [];

  async function persistUnits(next: string[], successMsg: string) {
    setSaving(true);
    setError("");
    setSavedMsg("");
    const updated = await updateInventorySettings({ units: next });
    setSaving(false);
    if (!updated) {
      setError("Could not save units. Try again.");
      return false;
    }
    setSavedMsg(successMsg);
    return true;
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    const value = unitInput.trim();
    if (!value) {
      setError("Enter a unit name.");
      return;
    }
    const exists = units.some((u) => u.toLowerCase() === value.toLowerCase());
    if (exists) {
      setError("That unit already exists.");
      return;
    }
    const ok = await persistUnits([...units, value], "Unit added.");
    if (ok) setUnitInput("");
  }

  async function handleRemoveUnit(unit: string) {
    await persistUnits(
      units.filter((u) => u !== unit),
      `Removed “${unit}”.`
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Boxes size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0f1a35]">Materials Settings</h3>
          <p className="text-sm text-gray-500">
            Define stock units for the Add Material form (dropdown + custom unit).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleAddUnit}
        className="space-y-3 max-w-lg rounded-xl border border-gray-100 bg-gray-50/50 p-4"
      >
        <label
          htmlFor="settings-unit-name"
          className="block text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          Unit name
        </label>
        <input
          id="settings-unit-name"
          type="text"
          value={unitInput}
          onChange={(e) => {
            setUnitInput(e.target.value);
            setError("");
            setSavedMsg("");
          }}
          placeholder="Type a unit, e.g. bags, tons, kg, pcs"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" disabled={saving}>
            <Plus size={16} />
            {saving ? "Saving…" : "Add unit"}
          </Button>
          <p className="text-xs text-gray-400">Saved units show below. Use trash to remove.</p>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {savedMsg && <p className="text-xs text-emerald-600">{savedMsg}</p>}
      </form>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Saved units ({units.length})
        </p>
        {units.length === 0 ? (
          <p className="text-sm text-gray-400">
            No units saved. Add a unit name above (empty list is allowed).
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <li
                key={unit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-sm text-[#0f1a35] shadow-sm"
              >
                <span>{unit}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveUnit(unit)}
                  className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                  aria-label={`Remove unit ${unit}`}
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
