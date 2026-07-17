import type { WorkMaterialLine, WorkOrderRequest } from "./inventoryTypes";
import { formatWorkRequestId } from "@/lib/settings/defaultSettings";

export interface AddWorkOrderRequestFormInput {
  contractorId: string;
  contractorName: string;
  workCategories: string[];
  workProfile: string;
  description: string;
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

  return {
    id: requestNo,
    requestNo,
    contractorId: input.contractorId,
    contractorName: input.contractorName.trim(),
    workCategories: [...input.workCategories],
    workProfile: input.workProfile.trim(),
    description: input.description.trim(),
    dateOfIssue: input.dateOfIssue,
    commitmentDate: input.commitmentDate,
    materialIssues: issues.length ? issues : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}
