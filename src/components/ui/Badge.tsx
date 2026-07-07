const BADGE: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-200 text-gray-600",
  temporary: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
  overdue: "bg-orange-100 text-orange-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  equity: "bg-indigo-100 text-indigo-700",
  debt: "bg-slate-100 text-slate-600",
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${BADGE[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
