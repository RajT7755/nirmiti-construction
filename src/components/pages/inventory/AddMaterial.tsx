import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Boxes } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";

/**
 * Add Material form.
 * Unit options from Settings → Inventory → Materials.
 * Saved material gets a stable `id` used as PurchaseOrder.materialId for PO pipeline.
 * Route: /inventory/materials/add
 */
export function AddMaterial() {
  const navigate = useNavigate();
  const { inventorySettings, addMaterial } = useAppDataContext();
  const units = inventorySettings.units ?? [];
  const workCategoryOptions = inventorySettings.workCategories ?? [];

  const unitOptions = useMemo(
    () => (units.length > 0 ? units : ["bags", "tons", "kg"]),
    [units]
  );

  const categoryOptions = useMemo(
    () =>
      workCategoryOptions.length > 0
        ? workCategoryOptions
        : ["Civil", "Structural", "Plastering", "Finishing", "Masonry"],
    [workCategoryOptions]
  );

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [unit, setUnit] = useState(unitOptions[0] ?? "");
  const [customUnit, setCustomUnit] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  useEffect(() => {
    if (!customUnit && unitOptions.length > 0 && !unitOptions.includes(unit)) {
      setUnit(unitOptions[0]);
    }
  }, [unitOptions, unit, customUnit]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Material name is required.");
      return;
    }
    if (!type.trim()) {
      setError("Type is required.");
      return;
    }
    const resolvedUnit = customUnit.trim() || unit.trim();
    if (!resolvedUnit) {
      setError("Unit is required. Pick from the list or type a custom unit.");
      return;
    }

    setSaving(true);
    const created = addMaterial({
      name: name.trim(),
      type: type.trim(),
      workCategories: selectedCats,
      unit: resolvedUnit,
    });
    setSaving(false);

    if (!created) {
      setError("Could not save material. Try again.");
      return;
    }

    navigate("/inventory/materials");
  }

  const fieldClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Boxes size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">Add Material</h3>
            <p className="text-sm text-gray-500">
              Creates a catalog id for purchase order linking (materialId).
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate("/inventory/materials")}>
          <ArrowLeft size={16} />
          Back to Material List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label htmlFor="mat-name" className={labelClass}>
            Material name
          </label>
          <input
            id="mat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. OPC Cement 53 Grade"
            className={fieldClass}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="mat-type" className={labelClass}>
            Type
          </label>
          <input
            id="mat-type"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. Cement, Steel, Aggregate"
            className={fieldClass}
            autoComplete="off"
          />
        </div>

        <div>
          <p className={labelClass}>Work categories</p>
          <div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50/40 p-3">
            {categoryOptions.map((cat) => {
              const on = selectedCats.includes(cat);
              return (
                <label
                  key={cat}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm cursor-pointer transition-colors ${
                    on
                      ? "border-blue-300 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleCat(cat)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {cat}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Same list as Suppliers — manage under Settings → Inventory → Suppliers.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Unit
          </p>
          <div>
            <label htmlFor="mat-unit" className="block text-xs text-gray-500 mb-1">
              From settings
            </label>
            <select
              id="mat-unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setCustomUnit("");
              }}
              className={fieldClass}
              disabled={!!customUnit.trim()}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {units.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No units in settings — showing defaults. Manage under Settings → Inventory →
                Materials.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="mat-unit-custom" className="block text-xs text-gray-500 mb-1">
              Or type a custom unit
            </label>
            <input
              id="mat-unit-custom"
              type="text"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="e.g. pcs (overrides dropdown if filled)"
              className={fieldClass}
              autoComplete="off"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save material"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/materials")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
