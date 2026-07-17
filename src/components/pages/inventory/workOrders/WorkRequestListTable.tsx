import type { WorkOrderRequest } from "@/lib/inventory/inventoryTypes";
import { Button } from "@/components/ui/Button";

const STATUS_STYLES: Record<WorkOrderRequest["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  generated: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function WorkRequestListTable({
  requests,
  onGenerate,
  onReject,
  onView,
}: {
  requests: WorkOrderRequest[];
  onGenerate: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No work requests yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
            <th className="px-4 py-2.5 font-semibold">Request No</th>
            <th className="px-3 py-2.5 font-semibold">Contractor</th>
            <th className="px-3 py-2.5 font-semibold">Work profile</th>
            <th className="px-3 py-2.5 font-semibold">Issue / Commit</th>
            <th className="px-3 py-2.5 font-semibold">Materials</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              <td className="px-4 py-3 font-mono text-xs font-medium text-[#0f1a35]">
                {r.requestNo}
              </td>
              <td className="px-3 py-3 text-gray-600">{r.contractorName}</td>
              <td className="px-3 py-3 text-gray-600">
                <span className="block">{r.workProfile || "—"}</span>
                <span className="text-[11px] text-gray-400 line-clamp-1">{r.description}</span>
              </td>
              <td className="px-3 py-3 text-gray-500 text-xs">
                {r.dateOfIssue}
                <br />
                → {r.commitmentDate}
              </td>
              <td className="px-3 py-3 text-gray-500 text-xs">
                {(r.materialIssues ?? []).length
                  ? (r.materialIssues ?? [])
                      .map((l) => `${l.materialName} (${l.quantity})`)
                      .join(", ")
                  : "—"}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${STATUS_STYLES[r.status]}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="!px-2.5 !py-1.5 text-xs"
                    onClick={() => onView(r.id)}
                  >
                    View
                  </Button>
                  {r.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onGenerate(r.id)}
                      >
                        Generate WO
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="!px-2.5 !py-1.5 text-xs"
                        onClick={() => onReject(r.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {r.status === "generated" && r.generatedWoId && (
                    <span className="text-[11px] text-gray-500 self-center">
                      → {r.generatedWoId}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
