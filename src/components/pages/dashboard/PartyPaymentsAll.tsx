import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Search } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { fmt } from "@/lib/utils";
import type { PartyPayType } from "@/lib/inventory/partyPaymentTypes";
import { partyPaymentsToExportRows } from "@/lib/inventory/exportPartyPayments";

/**
 * Full log of done party payments only.
 */
export function PartyPaymentsAll() {
  const navigate = useNavigate();
  const { partyReceivedPayments = [] } = useAppDataContext();
  const [filter, setFilter] = useState<"all" | PartyPayType>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let list = [...partyReceivedPayments];
    if (filter !== "all") list = list.filter((p) => p.partyType === filter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const hay = [
          p.id,
          p.partyName,
          p.partyType,
          p.sourceId,
          p.materialDescription,
          p.workDescription,
          p.method,
          p.note,
          p.date,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return list.sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
  }, [partyReceivedPayments, filter, search]);

  const exportPack = useMemo(() => partyPaymentsToExportRows(rows), [rows]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <CreditCard size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0f1a35]">All party payments</h2>
            <p className="text-xs text-gray-500">
              Done payments only · {rows.length} row{rows.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | PartyPayType)}
          >
            <option value="all">All</option>
            <option value="supplier">Suppliers</option>
            <option value="contractor">Contractors</option>
          </select>
          <ExportExcelButton
            filename="party-payments"
            headers={exportPack.headers}
            rows={exportPack.rows}
            label="Export"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/party-payments")}
          >
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt, name, PO/WO, description…"
          className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-2.5 font-semibold">Receipt No</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">PO / WO</th>
                <th className="px-3 py-2.5 font-semibold">Description</th>
                <th className="px-3 py-2.5 font-semibold text-right">Done</th>
                <th className="px-3 py-2.5 font-semibold text-right">Remaining</th>
                <th className="px-5 py-2.5 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-400">
                    No payments match.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[#0f1a35]">
                      {p.id}
                    </td>
                    <td className="px-3 py-3 text-gray-500">{p.date}</td>
                    <td className="px-3 py-3 font-medium text-[#0f1a35]">{p.partyName}</td>
                    <td className="px-3 py-3 capitalize text-gray-600">{p.partyType}</td>
                    <td className="px-3 py-3 font-mono text-xs">{p.sourceId}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[180px] truncate">
                      {p.materialDescription || p.workDescription || "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                      {fmt(p.received)}
                    </td>
                    <td className="px-3 py-3 text-right text-orange-600">
                      {fmt(p.remainingAfter)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                        onClick={() =>
                          navigate(`/dashboard/party-payments/receipt/${p.id}`)
                        }
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
