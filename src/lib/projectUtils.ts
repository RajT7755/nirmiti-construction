import { BHK_TYPES, WING_LABELS } from "./constants";
import type { BuildingConfig, FlatUnit, PropType, WingConfig } from "./types";

export function defaultBhk() {
  return {
    "1BHK": { count: 0, area: "" },
    "2BHK": { count: 0, area: "" },
    "3BHK": { count: 0, area: "" },
    "4BHK": { count: 0, area: "" },
  };
}

export function defaultWingName(index: number): string {
  return WING_LABELS[index] ?? String(index + 1);
}

export function makeWing(id: string, wingIndex = 0): WingConfig {
  return {
    id,
    name: defaultWingName(wingIndex),
    floors: 0,
    bhk: defaultBhk(),
    shopsPerFloor: 0,
    shopArea: "",
  };
}

export function makeBuilding(id: string): BuildingConfig {
  return { id, name: "", numWings: 0, wings: [] };
}

export function wingLabel(wing: WingConfig, index: number): string {
  return wing.name?.trim() || defaultWingName(index);
}

/** Flats configured on each residential floor (sum of BHK counts). */
export function flatsPerResidentialFloor(wing: WingConfig): number {
  return Object.values(wing.bhk).reduce((s, b) => s + b.count, 0);
}

/** Mixed-use: ground floor is commercial; floors 2+ are residential. */
export function semiResidentialFloors(wing: WingConfig): number {
  return Math.max(0, wing.floors - 1);
}

export interface SemiWingTotals {
  groundFloorShops: number;
  residentialFloors: number;
  flatsPerResidentialFloor: number;
  flatsPerWing: number;
  shopsPerWing: number;
  totalUnitsPerWing: number;
}

export function calcSemiWingTotals(wing: WingConfig): SemiWingTotals {
  const groundFloorShops = wing.floors > 0 ? wing.shopsPerFloor : 0;
  const residentialFloors = semiResidentialFloors(wing);
  const flatsPerFloor = flatsPerResidentialFloor(wing);
  const flatsPerWing = residentialFloors * flatsPerFloor;
  const shopsPerWing = groundFloorShops;

  return {
    groundFloorShops,
    residentialFloors,
    flatsPerResidentialFloor: flatsPerFloor,
    flatsPerWing,
    shopsPerWing,
    totalUnitsPerWing: shopsPerWing + flatsPerWing,
  };
}

export interface SemiProjectTotals {
  numBuildings: number;
  numWings: number;
  totalShops: number;
  totalResidentialFlats: number;
  totalUnits: number;
}

/** Project-level mixed-use totals per business rules. */
export function calcSemiProjectTotals(buildings: BuildingConfig[]): SemiProjectTotals {
  let totalShops = 0;
  let totalResidentialFlats = 0;
  let numWings = 0;

  for (const bldg of buildings) {
    for (const wing of bldg.wings) {
      numWings += 1;
      const w = calcSemiWingTotals(wing);
      totalShops += w.shopsPerWing;
      totalResidentialFlats += w.flatsPerWing;
    }
  }

  return {
    numBuildings: buildings.length,
    numWings,
    totalShops,
    totalResidentialFlats,
    totalUnits: totalShops + totalResidentialFlats,
  };
}

export function countWingUnits(propType: PropType, wing: WingConfig): number {
  if (propType === "semi") return calcSemiWingTotals(wing).totalUnitsPerWing;
  const flatsPerFloor = flatsPerResidentialFloor(wing);
  if (propType === "residential") return wing.floors * flatsPerFloor;
  return wing.floors * wing.shopsPerFloor;
}

export function countBuildingUnits(propType: PropType, bldg: BuildingConfig): number {
  return bldg.wings.reduce((s, w) => s + countWingUnits(propType, w), 0);
}

export function countProjectUnits(propType: PropType, buildings: BuildingConfig[]): number {
  if (propType === "semi") return calcSemiProjectTotals(buildings).totalUnits;
  return buildings.reduce((s, b) => s + countBuildingUnits(propType, b), 0);
}

function pushFlatsForFloor(
  units: FlatUnit[],
  bLabel: string,
  wLabel: string,
  floor: number,
  wing: WingConfig
) {
  let seq = 1;
  BHK_TYPES.forEach((type) => {
    for (let u = 0; u < wing.bhk[type].count; u++) {
      units.push({
        id: `${bLabel}-W${wLabel}-F${floor}-${type}-${u}`,
        number: `${bLabel}-W${wLabel}-${floor * 100 + seq}`,
        floor,
        kind: "flat",
        bhkType: type,
        status: "available",
      });
      seq++;
    }
  });
}

export function generateUnitsFromBuildings(propType: PropType, buildings: BuildingConfig[]): FlatUnit[] {
  const units: FlatUnit[] = [];
  buildings.forEach((bldg) => {
    const bLabel = bldg.name.trim() || bldg.id;
    bldg.wings.forEach((wing, wi) => {
      const wLabel = wingLabel(wing, wi);

      if (propType === "semi") {
        if (wing.floors >= 1) {
          for (let s = 1; s <= wing.shopsPerFloor; s++) {
            units.push({
              id: `${bLabel}-W${wLabel}-F1-S${s}`,
              number: `${bLabel}-W${wLabel}-1${String(s).padStart(2, "0")}`,
              floor: 1,
              kind: "shop",
              status: "available",
            });
          }
        }
        for (let f = 2; f <= wing.floors; f++) {
          pushFlatsForFloor(units, bLabel, wLabel, f, wing);
        }
        return;
      }

      for (let f = 1; f <= wing.floors; f++) {
        if (propType === "commercial") {
          for (let s = 1; s <= wing.shopsPerFloor; s++) {
            units.push({
              id: `${bLabel}-W${wLabel}-F${f}-S${s}`,
              number: `${bLabel}-W${wLabel}-${f * 100 + s}`,
              floor: f,
              kind: "shop",
              status: "available",
            });
          }
        }
        if (propType === "residential") {
          pushFlatsForFloor(units, bLabel, wLabel, f, wing);
        }
      }
    });
  });
  return units;
}
