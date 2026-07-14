import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { DESIGN_PREVIEW_SLABS } from "@/lib/messenger/slabPreviewSlabs";
import type { Customer, ProjectData, SlabEntry } from "@/lib/types";

export function PaymentSlabs({
  projects: _projects,
  customers,
  slabs,
  setSlabs,
  onBack,
}: {
  projects: ProjectData[];
  customers: Customer[];
  slabs: SlabEntry[];
  setSlabs: Dispatch<SetStateAction<SlabEntry[]>>;
  onBack?: () => void;
}) {
  const displaySlabs = slabs.length > 0 ? slabs : DESIGN_PREVIEW_SLABS;
  const isPreview = slabs.length === 0;
  const [showNew, setShowNew] = useState(false);
  const [newStage, setNewStage] = useState("");
  const [newPct, setNewPct] = useState("");
  const [newDateGen, setNewDateGen] = useState("");
  const [newDue, setNewDue] = useState("");

  const nextSlabNo = displaySlabs.length > 0 ? Math.max(...displaySlabs.map((s) => s.slabNo)) + 1 : 1;
  const avgAmount = customers.reduce((s, c) => s + c.amount, 0) / (customers.length || 1);

  function addSlab() {
    if (!newStage.trim() || !newPct || !newDateGen || !newDue) return;
    const pct = Math.min(100, Math.max(0, Number(newPct)));
    setSlabs((prev) => [
      ...prev,
      {
        id: `S${String(nextSlabNo).padStart(3, "0")}`,
        slabNo: nextSlabNo,
        stage: newStage,
        percentage: pct,
        dateGenerated: newDateGen,
        dueDate: newDue,
        status: "draft",
      },
    ]);
    setNewStage("");
    setNewPct("");
    setNewDateGen("");
    setNewDue("");
    setShowNew(false);
  }

  const slabStatusBadge: Record<SlabEntry["status"], string> = {
    draft: "bg-gray-100 text-gray-500",
    sent: "bg-blue-100 text-blue-600",
    received: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-5">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to Sales
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Payment Slabs</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Define construction-stage payment slabs
            {isPreview && <span className="text-orange-500"> · Design preview mode</span>}
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> New Slab
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-4">
          <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">New Payment Slab</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                Slab No. <span className="text-blue-400 font-normal">Auto</span>
              </label>
              <input
                readOnly
                value={nextSlabNo}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Stage</label>
              <input
                type="text"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="e.g. Plinth, 1st Slab, Roof Slab…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Payment Percentage (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={newPct}
                onChange={(e) => setNewPct(e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                Avg. Amount per Customer <span className="text-blue-400 font-normal">Auto</span>
              </label>
              <input
                readOnly
                value={newPct ? `₹${Math.round(avgAmount * Number(newPct) / 100).toLocaleString("en-IN")}` : "—"}
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date of Generation</label>
              <input
                type="date"
                value={newDateGen}
                onChange={(e) => setNewDateGen(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1">Due Date</label>
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
          {newPct && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-[10px] text-blue-600 font-semibold mb-1">
                Per-Customer Breakdown ({newPct}% of flat value, excl. GST/stamp/agreement)
              </p>
              {customers.length === 0 ? (
                <p className="text-xs text-gray-400">No customers yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {customers.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-white rounded-lg px-2 py-1.5 border border-blue-100">
                      <p className="text-[10px] text-gray-500">{c.name.split(" ")[0]}</p>
                      <p className="text-sm font-bold text-[#0f1a35]">
                        ₹{Math.round(c.amount * Number(newPct) / 100).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={addSlab}
              disabled={!newStage.trim() || !newPct || !newDateGen || !newDue}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create Slab
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Slab Schedule</h3>
          <p className="text-[10px] text-gray-400">Send WhatsApp reminders from Messenger</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Slab No.</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">%</th>
              <th className="px-5 py-3">Avg. Amount</th>
              <th className="px-5 py-3">Generated</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displaySlabs.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-bold text-[#0f1a35]">#{s.slabNo}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{s.stage}</td>
                <td className="px-5 py-3 text-sm font-semibold text-blue-600">{s.percentage}%</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">
                  ₹{Math.round(avgAmount * s.percentage / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dateGenerated}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dueDate}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${slabStatusBadge[s.status]}`}>
                    {s.status}
                  </span>
                  {isPreview && idx === 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-100 text-purple-700">
                      Auto-settled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}