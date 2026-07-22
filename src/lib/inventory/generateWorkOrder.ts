import type { WorkOrder, WorkOrderRequest } from "./inventoryTypes";
import { formatWorkOrderId } from "@/lib/settings/defaultSettings";

/**
 * Build Work Order from request. Work amount starts at 0 (edit after generate).
 * Does not write contractor master payment fields.
 */
export function workOrderFromRequest(
  request: WorkOrderRequest,
  woIdPrefix: string,
  woIdNext: number
): WorkOrder {
  const id = formatWorkOrderId(woIdPrefix, woIdNext);
  const title =
    request.description.length > 80
      ? `${request.description.slice(0, 77)}…`
      : request.description || "Work order";
  const issues = request.materialIssues?.map((l) => ({ ...l })) ?? [];

  return {
    id,
    contractorId: request.contractorId,
    contractorName: request.contractorName,
    title,
    description: request.description,
    workProfile: request.workProfile,
    workLines: request.workLines?.map((l) => ({ ...l })),
    workCategories: [...(request.workCategories ?? [])],
    trade: request.workProfile || undefined,
    materialIds: issues.map((l) => l.materialId),
    dateOfIssue: request.dateOfIssue,
    commitmentDate: request.commitmentDate,
    startDate: request.dateOfIssue,
    status: "open",
    amountTotal: 0,
    amountPaid: 0,
    requestId: request.id,
    requestNo: request.requestNo,
    materialIssues: issues.length ? issues : undefined,
    materialReturns: [],
    payable: false,
  };
}

export function markRequestGenerated(
  request: WorkOrderRequest,
  woId: string
): WorkOrderRequest {
  return {
    ...request,
    status: "generated",
    generatedWoId: woId,
  };
}
