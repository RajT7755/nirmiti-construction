import { useState, useRef, useEffect, type ReactNode } from "react";
import { CheckCircle2, Plus, X, Building2, ArrowRight, Trash2 } from "lucide-react";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { BHK_TYPES, PROP_TYPE_TAG } from "@/lib/constants";
import {
  makeWing,
  makeBuilding,
  generateUnitsFromBuildings,
  calcSemiWingTotals,
  calcSemiProjectTotals,
  countBuildingUnits,
  countProjectUnits,
  flatsPerResidentialFloor,
  semiResidentialFloors,
} from "@/lib/projectUtils";
import type { BuildingConfig, ProjectData, PropType, WingConfig } from "@/lib/types";
import type { BhkEntry } from "@/lib/types";

function Counter({
  value,
  onChange,
  min = 0,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function clamp(n: number): number {
    let next = Math.max(min, n);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  }

  function commitDraft(raw: string) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      onChange(min);
      setDraft(String(min));
      return;
    }
    const next = clamp(parsed);
    onChange(next);
    setDraft(String(next));
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-base leading-none"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitDraft(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="w-12 border border-gray-200 rounded-lg px-1 py-0.5 text-sm font-semibold text-[#0f1a35] text-center focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold text-base leading-none"
      >
        +
      </button>
    </div>
  );
}

function LevelCard({ level, title, locked, completed, children }: {
  level: number; title: string; locked: boolean; completed: boolean; children?: ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
        completed
          ? "border-green-200 scale-[0.98] opacity-75"
          : locked
          ? "border-gray-100 opacity-40 pointer-events-none select-none"
          : "border-gray-100"
      }`}
    >
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        completed ? "bg-green-50 border-green-100" : locked ? "bg-gray-50 border-gray-100" : "bg-white border-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            completed ? "bg-green-500 text-white" : locked ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white"
          }`}>
            {completed ? "✓" : level}
          </span>
          <h3 className="text-sm font-semibold text-[#0f1a35]">{title}</h3>
        </div>
        {completed && <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Completed</span>}
        {locked   && <span className="text-[10px] font-semibold text-gray-400  bg-gray-100  px-2 py-0.5 rounded-full">Locked</span>}
      </div>
      {!locked && <div className="p-5">{children}</div>}
    </div>
  );
}

function WingPanel({ wing, propType, onChange }: {
  wing: WingConfig; propType: PropType;
  onChange: (patch: Partial<WingConfig>) => void;
}) {
  const flatsPerFloor = flatsPerResidentialFloor(wing);
  const semiTotals = propType === "semi" ? calcSemiWingTotals(wing) : null;
  const totalFlats =
    propType === "semi"
      ? (semiTotals?.flatsPerWing ?? 0)
      : wing.floors * flatsPerFloor;
  const totalShops =
    propType === "semi"
      ? (semiTotals?.shopsPerWing ?? 0)
      : wing.floors * wing.shopsPerFloor;

  function updateBhk(type: string, patch: Partial<BhkEntry>) {
    onChange({ bhk: { ...wing.bhk, [type]: { ...wing.bhk[type], ...patch } } });
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50/60 p-4 space-y-4">
      <div>
        <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Wing Name</label>
        <input
          type="text"
          value={wing.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="e.g. A"
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* Floors */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Number of Floors</label>
          <Counter value={wing.floors} onChange={v => onChange({ floors: v })} />
        </div>
        {wing.floors > 0 && (
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full mt-4">
            {wing.floors} floor{wing.floors !== 1 ? "s" : ""}
            {propType === "semi" && semiTotals && (
              <span className="text-gray-500 font-normal">
                {" "}· {semiTotals.residentialFloors} residential
              </span>
            )}
          </span>
        )}
      </div>

      {propType === "semi" && wing.floors > 0 && semiTotals && (
        <div className="rounded-lg border border-green-100 bg-green-50/60 px-3 py-2 text-[10px] text-green-800 space-y-0.5">
          <p><span className="font-semibold">Ground floor shops:</span> {semiTotals.groundFloorShops}</p>
          <p><span className="font-semibold">Residential floors:</span> {semiTotals.residentialFloors} (total − 1)</p>
          <p><span className="font-semibold">Flats / wing:</span> {semiTotals.residentialFloors} × {semiTotals.flatsPerResidentialFloor} = {semiTotals.flatsPerWing}</p>
        </div>
      )}

      {/* Commercial / ground floor shops */}
      {(propType === "commercial" || propType === "semi") && (
        <div className={`rounded-xl border p-4 space-y-3 ${
          propType === "semi"
            ? "border-indigo-100 bg-indigo-50/50"
            : "border-gray-100 bg-white"
        }`}>
          {propType === "semi" ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-widest">Ground Floor</p>
              <span className="text-[10px] font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                OK — commercial
              </span>
            </div>
          ) : (
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Shops per Floor</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">No. of Shops</label>
              <Counter value={wing.shopsPerFloor} onChange={v => onChange({ shopsPerFloor: v })} />
            </div>
            {totalShops > 0 && (
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full mt-4">
                {totalShops} shop{totalShops !== 1 ? "s" : ""}
                {propType === "semi" ? " on ground floor" : " total"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Residential BHK config */}
      {(propType === "residential" || propType === "semi") && (
        <div>
          {propType === "semi" && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Flats per Residential Floor (floors 2+)
            </p>
          )}
          <div className="space-y-2">
            {BHK_TYPES.map(type => (
              <div key={type} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-11 text-center shrink-0">{type}</span>
                <Counter value={wing.bhk[type].count} onChange={v => updateBhk(type, { count: v })} />
                <span className="text-[10px] text-gray-400">flats</span>
              </div>
            ))}
          </div>
          {totalFlats > 0 && (
            <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full mt-2 inline-block">
              {propType === "semi" ? (
                <>
                  {semiTotals?.residentialFloors ?? 0} res. floor{(semiTotals?.residentialFloors ?? 0) !== 1 ? "s" : ""} × {flatsPerFloor} flat{flatsPerFloor !== 1 ? "s" : ""} = {totalFlats} flats
                </>
              ) : (
                <>
                  {flatsPerFloor} flat{flatsPerFloor !== 1 ? "s" : ""} / floor · {totalFlats} total
                </>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function BuildingPanel({ bldg, bi, propType, onChange }: {
  bldg: BuildingConfig; bi: number; propType: PropType;
  onChange: (patch: Partial<BuildingConfig>) => void;
}) {
  function setWings(numWings: number) {
    const current = bldg.wings;
    const wings: WingConfig[] = Array.from({ length: numWings }, (_, i) =>
      current[i] ?? makeWing(`w-${bldg.id}-${i}`, i)
    );
    onChange({ numWings, wings });
  }
  function updateWing(i: number, patch: Partial<WingConfig>) {
    const wings = bldg.wings.map((w, j) => j === i ? { ...w, ...patch } : w);
    onChange({ wings });
  }
  const totalUnits = countBuildingUnits(propType, bldg);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Building header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-[#f8f9fb] border-b border-gray-100">
        <span className="text-[10px] font-bold text-[#1e3a5f] bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Building {bi + 1}
        </span>
        <div className="flex-1">
          <input
            type="text"
            value={bldg.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder={`e.g. Tower ${String.fromCharCode(65 + bi)}`}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0f1a35] focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-semibold text-gray-500">Wings:</label>
          <Counter value={bldg.numWings} onChange={setWings} />
        </div>
        {totalUnits > 0 && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full shrink-0">
            {totalUnits} units
          </span>
        )}
      </div>

      {/* Wings */}
      {bldg.wings.length > 0 && (
        <div className="p-4 grid gap-3" style={{ gridTemplateColumns: bldg.wings.length > 1 ? "1fr 1fr" : "1fr" }}>
          {bldg.wings.map((wing, wi) => (
            <WingPanel key={wing.id} wing={wing} propType={propType}
              onChange={patch => updateWing(wi, patch)} />
          ))}
        </div>
      )}
      {bldg.numWings === 0 && (
        <p className="text-xs text-gray-400 text-center py-5">Set the number of wings above to configure floors & units.</p>
      )}
    </div>
  );
}

function formatBhkSummary(wing: WingConfig): string {
  const parts = BHK_TYPES
    .filter(type => wing.bhk[type].count > 0)
    .map(type => `${wing.bhk[type].count}×${type}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

const PAGE_BG =
  "min-h-[calc(100dvh-3.5rem)] w-full";

const GLASS_CARD =
  "bg-white/75 backdrop-blur-md border border-white/60 shadow-sm";

export function ProjectDetailCard({
  project,
  onDelete,
  onDeleted,
}: {
  project: ProjectData;
  onDelete?: (project: ProjectData) => Promise<boolean>;
  onDeleted?: (projectName: string) => void;
}) {
  const buildings = project.buildings ?? [];
  const propTag = PROP_TYPE_TAG[project.propType];
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDeleteConfirm() {
    if (!onDelete) return;
    setDeleting(true);
    setDeleteError("");
    const ok = await onDelete(project);
    setDeleting(false);
    if (ok) {
      setDeleteOpen(false);
      onDeleted?.(project.name);
    } else {
      setDeleteError("Failed to delete project. Please try again.");
    }
  }

  return (
    <div className={`rounded-xl border border-green-200/80 ${GLASS_CARD}`}>
      <div className="flex items-start gap-4 border-b border-green-100/80 bg-green-50/50 px-5 py-4 backdrop-blur-sm">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0f1a35]">{project.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${propTag}`}>
              {project.propType}
            </span>
            <span className="rounded-full border border-green-100 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">Saved</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {project.totalFlats > 0 && <span className="mr-3">{project.totalFlats} flats</span>}
            {project.totalShops > 0 && <span className="mr-3">{project.totalShops} shops</span>}
            {buildings.length > 0 && <span>{buildings.length} building{buildings.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>

      {buildings.length > 0 && (
        <div className="px-5 py-4 space-y-3">
          {buildings.map((bldg, bi) => (
            <div key={bldg.id} className="border border-gray-100 rounded-lg bg-gray-50/50 p-3">
              <p className="text-xs font-semibold text-[#0f1a35] mb-2">
                {bldg.name.trim() || `Building ${bi + 1}`}
                <span className="text-gray-400 font-normal ml-2">
                  · {bldg.wings.length} wing{bldg.wings.length !== 1 ? "s" : ""}
                </span>
              </p>
              {bldg.wings.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {bldg.wings.map((wing) => (
                    <div key={wing.id} className="text-[11px] text-gray-600 bg-white rounded-md border border-gray-100 px-3 py-2">
                      <span className="font-semibold text-[#1e3a5f]">Wing {wing.name.trim() || "—"}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span>{wing.floors} floor{wing.floors !== 1 ? "s" : ""}</span>
                      {(project.propType === "residential" || project.propType === "semi") && (
                        <>
                          <span className="text-gray-400 mx-1">·</span>
                          <span>{formatBhkSummary(wing)}</span>
                        </>
                      )}
                      {(project.propType === "commercial" || project.propType === "semi") && wing.shopsPerFloor > 0 && (
                        <>
                          <span className="text-gray-400 mx-1">·</span>
                          <span>
                            {project.propType === "semi"
                              ? `${wing.shopsPerFloor} ground shop${wing.shopsPerFloor !== 1 ? "s" : ""}`
                              : `${wing.shopsPerFloor} shop${wing.shopsPerFloor !== 1 ? "s" : ""}/floor`}
                          </span>
                        </>
                      )}
                      {project.propType === "semi" && wing.floors > 0 && (
                        <>
                          <span className="text-gray-400 mx-1">·</span>
                          <span>{semiResidentialFloors(wing)} res. floors · {calcSemiWingTotals(wing).flatsPerWing} flats</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">No wings configured</p>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteOpen && onDelete && (
        <DeleteConfirmation
          project={project}
          loading={deleting}
          apiError={deleteError}
          onClose={() => {
            if (!deleting) {
              setDeleteOpen(false);
              setDeleteError("");
            }
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export function ProjectSetup({
  onCreate,
  onBack,
  onSubmitted,
}: {
  onCreate: (p: ProjectData) => void;
  onBack?: () => void;
  onSubmitted?: () => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [propType, setPropType]       = useState<PropType | null>(null);
  const [numBuildings, setNumBuildings] = useState(0);
  const [buildings, setBuildings]      = useState<BuildingConfig[]>([]);

  // Level unlock
  const lvl2 = projectName.trim().length > 0;
  const lvl3 = lvl2 && propType !== null;
  const lvl4 = lvl3 && numBuildings > 0;

  // Animate
  const [animLvl, setAnimLvl] = useState<number | null>(null);
  const prev2 = useRef(false); const prev3 = useRef(false); const prev4 = useRef(false);
  useEffect(() => { if (lvl2 && !prev2.current) { setAnimLvl(2); setTimeout(() => setAnimLvl(null), 350); } prev2.current = lvl2; }, [lvl2]);
  useEffect(() => { if (lvl3 && !prev3.current) { setAnimLvl(3); setTimeout(() => setAnimLvl(null), 350); } prev3.current = lvl3; }, [lvl3]);
  useEffect(() => { if (lvl4 && !prev4.current) { setAnimLvl(4); setTimeout(() => setAnimLvl(null), 350); } prev4.current = lvl4; }, [lvl4]);

  function changeNumBuildings(n: number) {
    setNumBuildings(n);
    setBuildings(prev => Array.from({ length: n }, (_, i) => prev[i] ?? makeBuilding(`b-${Date.now()}-${i}`)));
  }
  function updateBuilding(i: number, patch: Partial<BuildingConfig>) {
    setBuildings(bs => bs.map((b, j) => j === i ? { ...b, ...patch } : b));
  }

  function resetForm() {
    setProjectName("");
    setPropType(null);
    setNumBuildings(0);
    setBuildings([]);
  }

  const totalUnits = propType ? countProjectUnits(propType, buildings) : 0;
  const semiProjectTotals = propType === "semi" ? calcSemiProjectTotals(buildings) : null;

  function handleSubmit() {
    if (!projectName.trim() || !propType || buildings.length === 0) return;
    const units = generateUnitsFromBuildings(propType, buildings);
    const totalF = units.filter(u => u.kind === "flat").length;
    const totalS = units.filter(u => u.kind === "shop").length;
    onCreate({
      id: `prj-${Date.now()}`,
      name: projectName.trim(),
      propType,
      totalFlats: totalF,
      totalShops: totalS,
      buildings,
      units,
      createdAt: new Date().toISOString(),
    });
    resetForm();
    onSubmitted?.();
  }

  const propOptions: { type: PropType; icon: string; label: string; tag: string }[] = [
    { type: "residential", icon: "🏠", label: "Residential",     tag: "bg-blue-100 text-blue-700"    },
    { type: "commercial",  icon: "🏢", label: "Commercial",      tag: "bg-indigo-100 text-indigo-700" },
    { type: "semi",        icon: "🏘️", label: "Semi (Mixed-Use)", tag: "bg-green-100 text-green-700"  },
  ];

  return (
    <>
      <style>{`
        @keyframes levelIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .level-animate { animation: levelIn 300ms cubic-bezier(0.215,0.610,0.355,1.000) both; }
      `}</style>

      <div className="max-w-5xl space-y-4 p-6">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700">
            ← Back to Sales
          </button>
        )}

        {/* Level 1 — Project Name */}
        <LevelCard level={1} title="Project / Site Name" locked={false} completed={lvl2}>
          <label className="text-[11px] font-semibold text-gray-500 block mb-1">Project Name</label>
          <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
            placeholder="e.g., Skyrise Heights"
            className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </LevelCard>

        {/* Level 2 — Property Type */}
        <div className={animLvl === 2 ? "level-animate" : ""}>
          <LevelCard level={2} title="Property Category" locked={!lvl2} completed={lvl3}>
            <p className="text-[11px] text-gray-400 mb-4">Select the property type for this project.</p>
            <div className="grid grid-cols-3 gap-3 max-w-lg">
              {propOptions.map(opt => (
                <button key={opt.type} onClick={() => setPropType(opt.type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${propType === opt.type ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"}`}>
                  <span className="text-2xl block mb-2">{opt.icon}</span>
                  <p className="text-sm font-semibold text-[#0f1a35]">{opt.label}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 inline-block ${opt.tag}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </LevelCard>
        </div>

        {/* Level 3 — Number of Buildings */}
        <div className={animLvl === 3 ? "level-animate" : ""}>
          <LevelCard level={3} title="Buildings" locked={!lvl3} completed={lvl4}>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1.5">Number of Buildings</label>
                <Counter value={numBuildings} onChange={changeNumBuildings} />
              </div>
              {numBuildings > 0 && (
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full mt-4">
                  {numBuildings} building{numBuildings !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </LevelCard>
        </div>

        {/* Level 4 — Building Detail (Wings → Floors → Units) */}
        <div className={animLvl === 4 ? "level-animate" : ""}>
          <LevelCard level={4} title="Wings, Floors & Units" locked={!lvl4} completed={false}>
            {propType === "semi" && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4 space-y-1.5">
                <p className="text-xs font-semibold text-amber-900">Mixed-Use calculation</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Ground floor = shops only · Floors 2+ = residential flats
                </p>
                <ul className="text-[10px] text-amber-700 list-disc list-inside space-y-0.5">
                  <li>Ground floor → No. of Shops (commercial only)</li>
                  <li>Shops / wing = Ground floor shop count</li>
                  <li>Residential floors = Total floors − 1</li>
                  <li>Flats / wing = Residential floors × Flats per residential floor</li>
                  <li>Total shops = Buildings × Wings × Ground floor shops (per wing)</li>
                  <li>Total flats = Σ (Residential floors × Flats per residential floor)</li>
                </ul>
              </div>
            )}
            <div className="space-y-4">
              {buildings.map((bldg, bi) => (
                <BuildingPanel key={bldg.id} bldg={bldg} bi={bi} propType={propType!}
                  onChange={patch => updateBuilding(bi, patch)} />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={!projectName.trim() || !propType || buildings.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={15} /> Submit Project
              </button>
              {totalUnits > 0 && (
                <div className="text-[11px] text-gray-400">
                  {semiProjectTotals ? (
                    <span>
                      <span className="font-semibold text-indigo-700">{semiProjectTotals.totalShops}</span> shops ·{" "}
                      <span className="font-semibold text-green-700">{semiProjectTotals.totalResidentialFlats}</span> flats ·{" "}
                      <span className="font-semibold text-[#1e3a5f]">{semiProjectTotals.totalUnits}</span> total units
                    </span>
                  ) : (
                    <span>
                      <span className="font-semibold text-[#1e3a5f]">{totalUnits}</span> total units configured
                    </span>
                  )}
                </div>
              )}
            </div>
          </LevelCard>
        </div>

      </div>
    </>
  );
}

export function ProjectsPage({
  projects,
  onCreate,
  onDelete,
  onBack,
  onEnterDashboard,
}: {
  projects: ProjectData[];
  onCreate: (p: ProjectData) => void;
  onDelete?: (project: ProjectData) => Promise<boolean>;
  onBack?: () => void;
  onEnterDashboard?: () => void;
}) {
  const [showForm, setShowForm] = useState(projects.length === 0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) setShowForm(true);
  }, [projects.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className={`${PAGE_BG} p-6`}>
      <div className="relative mx-auto max-w-5xl">
      {toast && (
        <div className="fixed top-20 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-green-600/95 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
          {toast}
        </div>
      )}
      <div className={`mb-6 rounded-2xl p-5 ${GLASS_CARD}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0f1a35]">Projects & Sites</h1>
          <p className="text-sm text-gray-400 mt-0.5">Add your projects and configure buildings, wings, and units.</p>
        </div>
        <div className="flex items-center gap-2">
          {onEnterDashboard && projects.length > 0 && (
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 bg-[#0f1a35] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1a2847] transition-colors"
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Add Project / Site
            </button>
          )}
        </div>
      </div>
      </div>

      {projects.length > 0 && (
        <div className="space-y-3 mb-6">
          {projects.map(p => (
            <ProjectDetailCard
              key={p.id}
              project={p}
              onDelete={onDelete}
              onDeleted={(name) => setToast(`Project "${name}" deleted successfully`)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className={`rounded-2xl overflow-hidden ${GLASS_CARD}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/60 bg-white/50 backdrop-blur-sm">
            <p className="text-sm font-semibold text-[#0f1a35]">New Project / Site</p>
            {projects.length > 0 && (
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
          <ProjectSetup
            onCreate={onCreate}
            onBack={onBack}
            onSubmitted={() => setShowForm(false)}
          />
        </div>
      )}

      {!showForm && projects.length === 0 && (
        <div className={`rounded-2xl py-16 text-center ${GLASS_CARD}`}>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 size={22} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No projects yet</p>
          <p className="mt-1 text-xs text-gray-400">Click &quot;Add Project / Site&quot; to get started.</p>
        </div>
      )}
      </div>
    </div>
  );
}

/** @deprecated Use ProjectsPage — kept for import compatibility */
export const Projects = ProjectsPage;
