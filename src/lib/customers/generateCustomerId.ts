/** Compact Customer ID: project + building + floor + flat (e.g. SHB2B204) */

function projectPrefix(projectName: string): string {
  return projectName
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

function buildingPrefix(buildingName: string): string {
  const words = buildingName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }
  const cleaned = buildingName.replace(/^(tower|block|building)\s*/i, "").trim();
  return cleaned.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3) || "B";
}

function flatSuffix(flatNo: string): string {
  return flatNo.replace(/[\s\-/]/g, "").toUpperCase();
}

export function generateCustomerId(
  project: string,
  building: string,
  floor: number | string,
  flatNo: string
): string {
  if (!project || !building || !flatNo) return "";
  const f = typeof floor === "number" ? floor : parseInt(String(floor), 10) || 0;
  return `${projectPrefix(project)}${buildingPrefix(building)}${f}${flatSuffix(flatNo)}`;
}