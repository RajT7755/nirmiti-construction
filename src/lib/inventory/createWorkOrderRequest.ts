import type {
  WorkDescriptionLine,
  WorkMaterialLine,
  WorkOrderRequest,
} from "./inventoryTypes";
import { formatWorkRequestId } from "@/lib/settings/defaultSettings";
import { summarizeWorkLines } from "./workLines";

export interface AddWorkOrderRequestFormInput {
  contractorId: string;
  contractorName: string;
  workCategories: string[];
  workProfile: string;
  description: string;
  workLines?: WorkDescriptionLine[];
  dateOfIssue: string;
  commitmentDate: string;
  materialIssues?: WorkMaterialLine[];
  workRequestIdPrefix: string;
  workRequestIdNext: number;
}

export function buildWorkOrderRequestFromForm(
  input: AddWorkOrderRequestFormInput
): WorkOrderRequest {
  const requestNo = formatWorkRequestId(
    input.workRequestIdPrefix,
    input.workRequestIdNext
  );
  const issues = (input.materialIssues ?? [])
    .filter((l) => l.materialId && (Number(l.quantity) || 0) > 0)
    .map((l) => ({
      materialId: l.materialId,
      materialName: l.materialName.trim(),
      unit: l.unit.trim() || "nos",
      quantity: Math.max(0, Number(l.quantity) || 0),
    }));

  let workLines: WorkDescriptionLine[] | undefined;
  if (input.workLines && input.workLines.length > 0) {
    workLines = input.workLines
      .map((l) => ({
        workProfile: l.workProfile?.trim() || undefined,
        description: l.description.trim(),
      }))
      .filter((l) => l.description || l.workProfile);
  }
  const summary = workLines?.length
    ? summarizeWorkLines(workLines)
    : {
        description: input.description.trim(),
        workProfile: input.workProfile.trim(),
      };

  return {
    id: requestNo,
    requestNo,
    contractorId: input.contractorId,
    contractorName: input.contractorName.trim(),
    workCategories: [...input.workCategories],
    workProfile: summary.workProfile || input.workProfile.trim(),
    description: summary.description || input.description.trim(),
    workLines: workLines?.length ? workLines : undefined,
    dateOfIssue: input.dateOfIssue,
    commitmentDate: input.commitmentDate,
    materialIssues: issues.length ? issues : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}
