import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import type { WorkMaterialLine } from "@/lib/inventory/inventoryTypes";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

/**
 * Request Order form — no work amount (set after Generate Work Order).
 */
export function AddWorkOrderRequest() {
  const navigate = useNavigate();
  const { contractors, materials, inventorySettings, addWorkOrderRequest } =
    useAppDataContext();

  const activeContractors = useMemo(
    () => contractors.filter((c) => c.status !== "inactive"),
    [contractors]
  );
  const categories = inventorySettings.workCategories ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const [contractorId, setContractorId] = useState("");
  const [workCategories, setWorkCategories] = useState<string[]>([]);
  const [workProfile, setWorkProfile] = useState("");
  const [description, setDescription] = useState("");
  const [dateOfIssue, setDateOfIssue] = useState(today);
  const [commitmentDate, setCommitmentDate] = useState(today);
  const [issueMaterials, setIssueMaterials] = useState(false);
  const [materialLines, setMaterialLines] = useState<
    { materialId: string; quantity: string }[]
  >([{ materialId: "", quantity: "1" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedContractor = activeContractors.find((c) => c.id === contractorId);

  function onContractorChange(id: string) {
    setContractorId(id);
    const c = activeContractors.find((x) => x.id === id);
    if (c) {
      setWorkProfile(c.workProfile || c.trade || "");
      if (c.workCategories?.length) {
        setWorkCategories([...c.workCategories]);
      }
    }
  }

  function toggleCategory(cat: string) {
    setWorkCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!contractorId || !selectedContractor) {
      setError("Select a contractor.");
      return;
    }
    if (!description.trim()) {
      setError("Enter description.");
      return;
    }
    if (!dateOfIssue || !commitmentDate) {
      setError("Enter issue and commitment dates.");
      return;
    }

    let materialIssues: WorkMaterialLine[] | undefined;
    if (issueMaterials) {
      materialIssues = materialLines
        .map((row) => {
          const mat = materials.find((m) => m.id === row.materialId);
          if (!mat) return null;
          const qty = Number(row.quantity) || 0;
          if (qty <= 0) return null;
          return {
            materialId: mat.id,
            materialName: mat.name,
            unit: mat.unit,
            quantity: qty,
          };
        })
        .filter(Boolean) as WorkMaterialLine[];
    }

    setSaving(true);
    const created = addWorkOrderRequest({
      contractorId: selectedContractor.id,
      contractorName: selectedContractor.name,
      workCategories,
      workProfile: workProfile.trim() || selectedContractor.workProfile || "",
      description: description.trim(),
      dateOfIssue,
      commitmentDate,
      materialIssues,
    });
    setSaving(false);
    if (!created) {
      setError("Could not save request.");
      return;
    }
    navigate("/inventory/work-orders");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <Wrench size={16} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0f1a35]">Request Order</h3>
            <p className="text-xs text-gray-500">
              Work amount is set after you generate the Work Order (not on request).
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/inventory/work-orders")}
        >
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 border-t border-gray-100 pt-4">
        <div>
          <label className={labelClass} htmlFor="wor-contractor">
            Contractor name *
          </label>
          <select
            id="wor-contractor"
            className={fieldClass}
            value={contractorId}
            onChange={(e) => onContractorChange(e.target.value)}
            required
          >
            <option value="">Select contractor…</option>
            {activeContractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className={labelClass}>Work categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <span className="text-xs text-gray-400">
                No categories — set under Settings → Inventory
              </span>
            ) : (
              categories.map((cat) => (
                <label
                  key={cat}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={workCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  {cat}
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="wor-profile">
            Work profile
          </label>
          <input
            id="wor-profile"
            className={fieldClass}
            value={workProfile}
            onChange={(e) => setWorkProfile(e.target.value)}
            placeholder="Trade / work profile"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="wor-desc">
            Description *
          </label>
          <textarea
            id="wor-desc"
            className={fieldClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="wor-issue">
              Date of issue *
            </label>
            <input
              id="wor-issue"
              type="date"
              className={fieldClass}
              value={dateOfIssue}
              onChange={(e) => setDateOfIssue(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="wor-commit">
              Commitment date *
            </label>
            <input
              id="wor-commit"
              type="date"
              className={fieldClass}
              value={commitmentDate}
              onChange={(e) => setCommitmentDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg p-3 space-y-3">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={issueMaterials}
              onChange={(e) => setIssueMaterials(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            Issue materials (reduces stock when WO is generated)
          </label>

          {issueMaterials && (
            <div className="space-y-2">
              {materialLines.map((row, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <label className={labelClass}>Material name</label>
                    <select
                      className={fieldClass}
                      value={row.materialId}
                      onChange={(e) => {
                        const next = [...materialLines];
                        next[i] = { ...next[i], materialId: e.target.value };
                        setMaterialLines(next);
                      }}
                    >
                      <option value="">Select…</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (stock {m.quantity} {m.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className={labelClass}>Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={fieldClass}
                      value={row.quantity}
                      onChange={(e) => {
                        const next = [...materialLines];
                        next[i] = { ...next[i], quantity: e.target.value };
                        setMaterialLines(next);
                      }}
                    />
                  </div>
                  {materialLines.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="!px-2 !py-2"
                      onClick={() =>
                        setMaterialLines(materialLines.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="text-xs !py-1.5"
                onClick={() =>
                  setMaterialLines([...materialLines, { materialId: "", quantity: "1" }])
                }
              >
                <Plus size={14} /> Add material line
              </Button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save request"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory/work-orders")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
