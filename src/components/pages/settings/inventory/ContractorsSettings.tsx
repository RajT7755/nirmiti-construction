import { useState } from "react";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppDataContext } from "@/app/AppDataContext";
import { formatContractorId } from "@/lib/settings/defaultSettings";

/** Settings → Inventory → Contractors: ID prefix (categories shared with Suppliers). */
export function ContractorsSettings() {
  const { inventorySettings, updateInventorySettings } = useAppDataContext();
  const [prefix, setPrefix] = useState(inventorySettings.contractorIdPrefix ?? "CON");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const nextPreview = formatContractorId(
    inventorySettings.contractorIdPrefix ?? "CON",
    inventorySettings.contractorIdNext ?? 1
  );

  async function handleSavePrefix(e: React.FormEvent) {
    e.preventDefault();
    const p = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "CON";
    setPrefix(p);
    setSaving(true);
    setError("");
    setSavedMsg("");
    const updated = await updateInventorySettings({ contractorIdPrefix: p });
    setSaving(false);
    if (!updated) {
      setError("Could not save.");
      return;
    }
    setSavedMsg(
      `Prefix saved. Next id: ${formatContractorId(p, inventorySettings.contractorIdNext ?? 1)}`
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
          <HardHat size={16} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0f1a35]">Contractors Settings</h3>
          <p className="text-sm text-gray-500">
            ID prefix for new contractors. Work categories are managed under Suppliers settings
            (shared).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSavePrefix}
        className="space-y-3 max-w-lg rounded-xl border border-gray-100 bg-gray-50/50 p-4"
      >
        <label
          htmlFor="contractor-id-prefix"
          className="block text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          Contractor ID prefix
        </label>
        <input
          id="contractor-id-prefix"
          type="text"
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value);
            setError("");
            setSavedMsg("");
          }}
          placeholder="CON"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-mono text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
        />
        <p className="text-xs text-gray-500">
          Next id preview:{" "}
          <span className="font-mono font-semibold text-[#0f1a35]">{nextPreview}</span>
        </p>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save prefix"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {savedMsg && <p className="text-xs text-emerald-600">{savedMsg}</p>}
      </form>
    </div>
  );
}
