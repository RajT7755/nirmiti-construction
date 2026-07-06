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

export function makeWing(id: string): WingConfig {
  return { id, floors: 0, bhk: defaultBhk(), shopsPerFloor: 0, shopArea: "" };
}

export function makeBuilding(id: string): BuildingConfig {
  return { id, name: "", numWings: 0, wings: [] };
}

export function generateUnitsFromBuildings(propType: PropType, buildings: BuildingConfig[]): FlatUnit[] {
  const units: FlatUnit[] = [];
  buildings.forEach(bldg => {
    const bLabel = bldg.name.trim() || bldg.id;
    bldg.wings.forEach((wing, wi) => {
      const wLabel = WING_LABELS[wi] ?? `W${wi + 1}`;
      for (let f = 1; f <= wing.floors; f++) {
        if (propType === "commercial" || propType === "semi") {
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
        if (propType === "residential" || propType === "semi") {
          let seq = 1;
          BHK_TYPES.forEach(type => {
            for (let u = 0; u < wing.bhk[type].count; u++) {
              units.push({
                id: `${bLabel}-W${wLabel}-F${f}-${type}-${u}`,
                number: `${bLabel}-W${wLabel}-${f * 100 + seq}`,
                floor: f,
                kind: "flat",
                bhkType: type,
                status: "available",
              });
              seq++;
            }
          });
        }
      }
    });
  });
  return units;
}
