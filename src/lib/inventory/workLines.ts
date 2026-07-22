import type {
  WorkDescriptionLine,
  WorkOrder,
  WorkOrderRequest,
} from "./inventoryTypes";

/** Normalize work request/order into work lines. */
export function resolveWorkLines(
  doc: Pick<WorkOrderRequest | WorkOrder, "workLines" | "description" | "workProfile">
): WorkDescriptionLine[] {
  if (doc.workLines && doc.workLines.length > 0) {
    return doc.workLines.map((l) => ({
      workProfile: l.workProfile?.trim() || undefined,
      description: l.description?.trim() || "",
    }));
  }
  const desc = (doc.description ?? "").trim();
  if (!desc && !(doc.workProfile ?? "").trim()) {
    return [{ description: "" }];
  }
  return [
    {
      workProfile: doc.workProfile?.trim() || undefined,
      description: desc,
    },
  ];
}

export function summarizeWorkLines(lines: WorkDescriptionLine[]): {
  description: string;
  workProfile: string;
} {
  const clean = lines.filter((l) => l.description.trim() || l.workProfile?.trim());
  const list = clean.length ? clean : lines;
  const description = list
    .map((l) => {
      const p = l.workProfile?.trim();
      const d = l.description.trim();
      if (p && d) return `${p}: ${d}`;
      return d || p || "";
    })
    .filter(Boolean)
    .join("\n");
  const workProfile = list[0]?.workProfile?.trim() || "";
  return { description, workProfile };
}
