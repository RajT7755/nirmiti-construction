import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/utils";
import { isPoPayable } from "@/lib/inventory/poTotals";
import { isWoPayable } from "@/lib/inventory/workOrderStock";
import type { PartyPayType } from "@/lib/inventory/partyPaymentTypes";

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

/**
 * Received payment for supplier PO / contractor WO — like customer form without GST.
 */
export function ReceivePartyPayment() {
  const navigate = useNavigate();
  const {
    suppliers,
    contractors,
    purchaseOrders,
    workOrders,
    addPartyReceivedPayment,
  } = useAppDataContext();

  const [partyType, setPartyType] = useState<PartyPayType>("supplier");
  const [searchQ, setSearchQ] = useState("");
  const [partyId, setPartyId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [receivedAmt, setReceivedAmt] = useState("");
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  const parties = useMemo(() => {
    if (partyType === "supplier") {
      return suppliers.filter((s) => s.status !== "inactive");
    }
    return contractors.filter((c) => c.status !== "inactive");
  }, [partyType, suppliers, contractors]);

  const suggestions = useMemo(() => {
    if (searchQ.length < 1) return [];
    const q = searchQ.toLowerCase();
    return parties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [searchQ, parties]);

  const selectedParty = partyId
    ? parties.find((p) => p.id === partyId)
    : null;

  const openPayables = useMemo(() => {
    if (!partyId) return [] as {
      id: string;
      label: string;
      total: number;
      paid: number;
      remaining: number;
    }[];

    if (partyType === "supplier") {
      return purchaseOrders
        .filter((po) => po.supplierId === partyId && isPoPayable(po))
        .map((po) => {
          const total = po.grandTotal ?? po.amountTotal ?? 0;
          const paid = po.amountPaid ?? 0;
          return {
            id: po.id,
            label: `${po.id} — ${po.materialName}`,
            total,
            paid,
            remaining: Math.max(0, total - paid),
          };
        })
        .filter((p) => p.remaining > 0);
    }

    return workOrders
      .filter((wo) => wo.contractorId === partyId && isWoPayable(wo))
      .map((wo) => {
        const total = wo.amountTotal ?? 0;
        const paid = wo.amountPaid ?? 0;
        return {
          id: wo.id,
          label: `${wo.id} — ${wo.title}`,
          total,
          paid,
          remaining: Math.max(0, total - paid),
        };
      })
      .filter((p) => p.remaining > 0);
  }, [partyType, partyId, purchaseOrders, workOrders]);

  const selectedPayable = openPayables.find((p) => p.id === sourceId);

  function selectParty(id: string, name: string) {
    setPartyId(id);
    setSearchQ(name);
    setSourceId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavedId(null);
    if (!selectedParty || !selectedPayable) {
      setError("Select party and payable PO / work order.");
      return;
    }
    const received = Number(receivedAmt);
    if (!received || received <= 0) {
      setError("Enter done payment amount > 0.");
      return;
    }
    if (received > selectedPayable.remaining) {
      setError("Done payment cannot exceed remaining.");
      return;
    }

    const entry = addPartyReceivedPayment({
      partyType,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      sourceType: partyType === "supplier" ? "purchase_order" : "work_order",
      sourceId: selectedPayable.id,
      received,
      method,
      date,
      note: note.trim() || undefined,
    });

    if (!entry) {
      setError("Could not record payment.");
      return;
    }
    setSavedId(entry.id);
    setReceivedAmt("");
    setNote("");
  }

  return (
    <div className="p-6 space-y-5 max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <CreditCard size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0f1a35]">Received Payment</h2>
            <p className="text-xs text-gray-500">
              Supplier PO / Contractor WO — total, remaining, done payment only
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard/party-payments")}
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        <div className="flex gap-2">
          {(["supplier", "contractor"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setPartyType(t);
                setPartyId(null);
                setSearchQ("");
                setSourceId("");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
                partyType === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t === "supplier" ? "Suppliers" : "Contractors"}
            </button>
          ))}
        </div>

        <div className="relative">
          <label className={labelClass}>Search {partyType}</label>
          <input
            className={fieldClass}
            value={searchQ}
            onChange={(e) => {
              setSearchQ(e.target.value);
              setPartyId(null);
              setSourceId("");
            }}
            placeholder="Name or id…"
          />
          {suggestions.length > 0 && !partyId && (
            <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                    onClick={() => selectParty(p.id, p.name)}
                  >
                    {p.name}{" "}
                    <span className="text-xs text-gray-400 font-mono">{p.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedParty && (
          <p className="text-sm text-gray-600">
            Selected: <strong>{selectedParty.name}</strong>
          </p>
        )}

        <div>
          <label className={labelClass}>
            {partyType === "supplier" ? "PO (payable)" : "Work order (payable)"}
          </label>
          <select
            className={fieldClass}
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            disabled={!partyId}
          >
            <option value="">Select…</option>
            {openPayables.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} · rem {fmt(p.remaining)}
              </option>
            ))}
          </select>
          {partyId && openPayables.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No open payable with remaining &gt; 0.</p>
          )}
        </div>

        {selectedPayable && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase text-gray-400 font-semibold">Total</p>
              <p className="font-bold text-[#0f1a35]">{fmt(selectedPayable.total)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-[10px] uppercase text-gray-400 font-semibold">Remaining</p>
              <p className="font-bold text-orange-600">{fmt(selectedPayable.remaining)}</p>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Done payment (₹) *</label>
          <input
            type="number"
            min="0"
            step="any"
            className={fieldClass}
            value={receivedAmt}
            onChange={(e) => setReceivedAmt(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Method</label>
            <select
              className={fieldClass}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              className={fieldClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Note (optional)</label>
          <input
            className={fieldClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {savedId && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-green-700 font-semibold">
            <CheckCircle2 size={16} /> Payment recorded.
            <button
              type="button"
              className="text-blue-600 underline font-medium"
              onClick={() =>
                navigate(`/dashboard/party-payments/receipt/${savedId}`)
              }
            >
              Print receipt
            </button>
          </div>
        )}

        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
      </form>
    </div>
  );
}
