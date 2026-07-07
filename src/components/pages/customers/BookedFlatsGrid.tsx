import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { flatData } from "@/lib/mockData";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import {
  resolveFlatGridStatus,
  flatGridColorClass,
  flatGridStatusLabel,
  type FlatGridStatus,
} from "@/lib/customers/resolveFlatGridStatus";
import type { ProjectData } from "@/lib/types";

export interface GridNavigation {
  project: string;
  buildingIdx: number;
  wingIdx: number;
  floor: number;
}

interface BookedFlatsGridProps {
  projects: ProjectData[];
  customerProfiles: CustomerDetailProfile[];
  checkFlatReleased?: (flatNo: string) => boolean;
  defaultProject?: string;
  controlledNavigation?: GridNavigation;
  onNavigationChange?: (nav: GridNavigation) => void;
  onViewCustomer?: (customerId: string) => void;
  compact?: boolean;
  className?: string;
}

interface GridUnit {
  number: string;
  type: string;
  status: FlatGridStatus;
  floor: number;
  occupant: string | null;
  customerId?: string;
}

export function BookedFlatsGrid({
  projects,
  customerProfiles = [],
  checkFlatReleased,
  defaultProject,
  controlledNavigation,
  onNavigationChange,
  onViewCustomer,
  compact = false,
  className = "",
}: BookedFlatsGridProps) {
  const projectNames = projects.length > 0
    ? projects.map((p) => p.name)
    : ["Sunrise Heights", "Green Valley", "Blue Horizon"];

  const [internalNav, setInternalNav] = useState<GridNavigation>({
    project: defaultProject ?? projectNames[0],
    buildingIdx: 0,
    wingIdx: 0,
    floor: 0,
  });

  const nav = controlledNavigation ?? internalNav;

  const updateNav = (patch: Partial<GridNavigation>) => {
    const next = { ...nav, ...patch };
    if (controlledNavigation) {
      onNavigationChange?.(next);
    } else {
      setInternalNav(next);
    }
  };

  useEffect(() => {
    if (!controlledNavigation && defaultProject) {
      setInternalNav((n) => ({ ...n, project: defaultProject }));
    }
  }, [defaultProject, controlledNavigation]);

  const [modalFlat, setModalFlat] = useState<{
    number: string;
    type: string;
    status: FlatGridStatus;
    floor: number;
    occupant?: string | null;
    customerId?: string;
  } | null>(null);

  const activePrj = projects.find((p) => p.name === nav.project);

  const { buildings, selBldg, wings, selWing, maxFloor } = useMemo(() => {
    const getBuildings = () => {
      if (!activePrj) return ["Block A", "Block B"];
      const set = new Set(
        activePrj.units.map((u) => {
          const idx = u.number.indexOf("-W");
          return idx >= 0 ? u.number.substring(0, idx) : u.number.split("-")[0];
        })
      );
      return set.size > 0 ? Array.from(set) : ["Block A"];
    };
    const getWings = (bldg: string) => {
      if (!activePrj) return ["A", "B"];
      const set = new Set(
        activePrj.units
          .filter((u) => u.number.startsWith(bldg + "-W"))
          .map((u) => u.number.substring(bldg.length + 2).split("-")[0])
      );
      return set.size > 0 ? Array.from(set) : ["A"];
    };
    const getMaxFloor = (bldg: string, wing: string) => {
      if (!activePrj) return 5;
      const floors = activePrj.units
        .filter((u) => u.number.startsWith(`${bldg}-W${wing}-`))
        .map((u) => u.floor);
      return floors.length > 0 ? Math.max(...floors) : 5;
    };

    const bldgs = getBuildings();
    const bldg = bldgs[Math.min(nav.buildingIdx, bldgs.length - 1)];
    const wngs = getWings(bldg);
    const wing = wngs[Math.min(nav.wingIdx, wngs.length - 1)];
    const max = getMaxFloor(bldg, wing);

    return { buildings: bldgs, selBldg: bldg, wings: wngs, selWing: wing, maxFloor: max };
  }, [activePrj, nav.buildingIdx, nav.wingIdx]);

  const gridUnits: GridUnit[] = useMemo(() => {
    if (activePrj) {
      return activePrj.units
        .filter(
          (u) =>
            u.number.startsWith(`${selBldg}-W${selWing}-`) &&
            (nav.floor === 0 || u.floor === nav.floor)
        )
        .map((u) => {
          const shortNum = String(u.number).split("-").pop() ?? u.number;
          const released = checkFlatReleased?.(shortNum) ?? false;
          const resolved = resolveFlatGridStatus(
            shortNum,
            u.number,
            customerProfiles,
            released,
            nav.project
          );
          return {
            number: u.number,
            type: u.bhkType ?? "Shop",
            status: resolved.status,
            floor: u.floor,
            occupant: resolved.occupant,
            customerId: resolved.customerId,
          };
        });
    }
    return flatData
      .filter((f) => nav.floor === 0 || Math.floor(Number(f.number) / 100) === nav.floor)
      .map((f) => {
        const shortNum = String(f.number);
        const released = checkFlatReleased?.(shortNum) ?? false;
        const resolved = resolveFlatGridStatus(
          shortNum,
          shortNum,
          customerProfiles,
          released,
          nav.project
        );
        return {
          number: shortNum,
          type: f.type,
          status: resolved.status,
          floor: Math.floor(Number(f.number) / 100),
          occupant: resolved.occupant,
          customerId: resolved.customerId,
        };
      });
  }, [
    activePrj,
    selBldg,
    selWing,
    nav.floor,
    nav.project,
    customerProfiles,
    checkFlatReleased,
  ]);

  const availFloors: number[] = activePrj
    ? Array.from(
        new Set(
          activePrj.units
            .filter((u) => u.number.startsWith(`${selBldg}-W${selWing}-`))
            .map((u) => u.floor)
        )
      ).sort((a, b) => a - b)
    : Array.from({ length: Math.max(maxFloor, 1) }, (_, i) => i + 1);

  const listId = `building-options-${compact ? "compact" : "full"}`;
  const wingListId = `wing-options-${compact ? "compact" : "full"}`;

  return (
    <>
      <div
        className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Booked Flats Grid</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Navigate by Building → Wing → Floor</p>
        </div>

        {projects.length > 1 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/60">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Project</p>
            <select
              value={nav.project}
              onChange={(e) =>
                updateNav({ project: e.target.value, buildingIdx: 0, wingIdx: 0, floor: 0 })
              }
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {projectNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-2.5 bg-gray-50/60">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Building</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateNav({ buildingIdx: Math.max(0, nav.buildingIdx - 1), wingIdx: 0, floor: 0 })}
                disabled={nav.buildingIdx === 0}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                −
              </button>
              <input
                type="text"
                value={selBldg}
                onChange={(e) => {
                  const idx = buildings.indexOf(e.target.value);
                  if (idx >= 0) updateNav({ buildingIdx: idx, wingIdx: 0, floor: 0 });
                }}
                list={listId}
                placeholder="Type or use +/−"
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <datalist id={listId}>
                {buildings.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <button
                onClick={() =>
                  updateNav({
                    buildingIdx: Math.min(buildings.length - 1, nav.buildingIdx + 1),
                    wingIdx: 0,
                    floor: 0,
                  })
                }
                disabled={nav.buildingIdx >= buildings.length - 1}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wing</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateNav({ wingIdx: Math.max(0, nav.wingIdx - 1), floor: 0 })}
                disabled={nav.wingIdx === 0}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                −
              </button>
              <input
                type="text"
                value={selWing}
                onChange={(e) => {
                  const idx = wings.indexOf(e.target.value);
                  if (idx >= 0) updateNav({ wingIdx: idx, floor: 0 });
                }}
                list={wingListId}
                placeholder="Type or use +/−"
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <datalist id={wingListId}>
                {wings.map((w) => (
                  <option key={w} value={w} />
                ))}
              </datalist>
              <button
                onClick={() =>
                  updateNav({
                    wingIdx: Math.min(wings.length - 1, nav.wingIdx + 1),
                    floor: 0,
                  })
                }
                disabled={nav.wingIdx >= wings.length - 1}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Floor</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateNav({ floor: Math.max(0, nav.floor - 1) })}
                disabled={nav.floor === 0}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                −
              </button>
              <input
                type="text"
                value={nav.floor === 0 ? "" : String(nav.floor)}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val === "" || val === "0") {
                    updateNav({ floor: 0 });
                    return;
                  }
                  const n = parseInt(val, 10);
                  if (!isNaN(n) && n >= 1 && n <= maxFloor) updateNav({ floor: n });
                }}
                placeholder="All floors"
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={() => updateNav({ floor: Math.min(maxFloor, nav.floor + 1) })}
                disabled={nav.floor >= maxFloor}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {availFloors.length > 0 && (
          <div className="flex gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto bg-white">
            <button
              onClick={() => updateNav({ floor: 0 })}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                nav.floor === 0
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              All
            </button>
            {availFloors.map((f) => (
              <button
                key={f}
                onClick={() => updateNav({ floor: f })}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  nav.floor === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                F{f}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
          {[
            { cls: "bg-green-100 border-green-300", label: "Confirmed Customer" },
            { cls: "bg-orange-100 border-orange-300", label: "Temporary Booking" },
            { cls: "bg-white border-gray-200", label: "Available" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded border ${l.cls}`} />
              <span className="text-[9px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>

        <div
          className={`p-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 overflow-y-auto ${
            compact ? "max-h-[320px]" : "max-h-[380px]"
          }`}
        >
          {gridUnits.length === 0 && (
            <div className="col-span-full text-center py-10 text-sm text-gray-400">
              No units for this selection.
            </div>
          )}
          {gridUnits.map((flat, idx) => (
            <button
              key={`${flat.number}-${idx}`}
              onClick={() =>
                setModalFlat({
                  number: flat.number,
                  type: flat.type,
                  status: flat.status,
                  floor: flat.floor,
                  occupant: flat.occupant,
                  customerId: flat.customerId,
                })
              }
              title={
                flat.occupant
                  ? `${flat.occupant} · ${flatGridStatusLabel(flat.status)}`
                  : flatGridStatusLabel(flat.status)
              }
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-[10px] font-semibold transition-all ${flatGridColorClass(flat.status)}`}
            >
              <span className="text-[8px] opacity-60">F{flat.floor}</span>
              <span>{String(flat.number).split("-").pop()}</span>
              {flat.occupant ? (
                <span className="text-[7px] font-normal opacity-80 truncate w-full text-center px-0.5">
                  {flat.occupant.split(" ")[0]}
                </span>
              ) : (
                <span className="text-[8px] font-normal opacity-60">{flat.type}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {modalFlat && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setModalFlat(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-72 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#0f1a35]">
                Unit {String(modalFlat.number).split("-").pop()}
              </h3>
              <button
                onClick={() => setModalFlat(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={15} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { k: "Full No.", v: modalFlat.number },
                { k: "Type", v: modalFlat.type },
                { k: "Floor", v: `Floor ${modalFlat.floor}` },
                ...(modalFlat.occupant ? [{ k: "Customer", v: modalFlat.occupant }] : []),
                { k: "Status", v: null as string | null },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0"
                >
                  <span className="text-gray-400">{row.k}</span>
                  {row.v ? (
                    <span className="font-semibold text-gray-800">{row.v}</span>
                  ) : (
                    <Badge
                      status={modalFlat.status === "confirmed" ? "confirmed" : modalFlat.status}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              {modalFlat.status === "available" ? (
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Book This Unit
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (modalFlat.customerId && onViewCustomer) {
                      onViewCustomer(modalFlat.customerId);
                      setModalFlat(null);
                    }
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
              )}
              <button
                onClick={() => setModalFlat(null)}
                className="px-4 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}