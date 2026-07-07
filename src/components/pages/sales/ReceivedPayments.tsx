import { useState } from "react";
import { Plus, Download, CreditCard, X, Search, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import type {
  CustomerDetailProfile,
  PaymentCategoryKey,
  ActiveSlabInfo,
} from "@/lib/customers/customerDetailTypes";
import type { AllocatePaymentInput } from "@/lib/storage/storeOperations";
import type { Customer, ProjectData, ReceivedPayment } from "@/lib/types";

type PayCategory = "flat" | "gst" | "stamp" | "agreement" | "parking" | "electrical";

const CATEGORIES: { key: PayCategory; label: string }[] = [
  { key: "flat", label: "Flat Payment" },
  { key: "gst", label: "GST" },
  { key: "stamp", label: "Stamp Duty" },
  { key: "agreement", label: "Agreement" },
  { key: "parking", label: "Parking" },
  { key: "electrical", label: "Electrical Bill" },
];

export function ReceivedPayments({
  projects: _projects,
  customers: _customers,
  customerProfiles,
  receivedPayments,
  getActiveSlab,
  getCategoryDueFor,
  onAllocatePayment,
}: {
  projects: ProjectData[];
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  receivedPayments: ReceivedPayment[];
  getActiveSlab: (id: string) => ActiveSlabInfo | null;
  getCategoryDueFor: (id: string, cat: PaymentCategoryKey) => number;
  onAllocatePayment: (input: AllocatePaymentInput) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [selCustomerId, setSelCustomerId] = useState<string | null>(null);
  const [propType, setPropType] = useState<"residential" | "commercial">("residential");
  const [payCategory, setPayCategory] = useState<PayCategory>("flat");
  const [receivedAmt, setReceivedAmt] = useState("");
  const [method, setMethod] = useState("cash");
  const [receivedDate, setReceivedDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const payCustomers = customerProfiles.filter(
    (c) => c.status !== "inactive" && c.unitType.toLowerCase() === propType
  );
  const selCustomer = selCustomerId ? payCustomers.find((c) => c.id === selCustomerId) : null;

  const suggestions =
    searchQ.length >= 1
      ? payCustomers.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
            c.id.toLowerCase().includes(searchQ.toLowerCase())
        )
      : [];

  const activeSlab = selCustomerId ? getActiveSlab(selCustomerId) : null;

  const totalForCategory = selCustomerId
    ? payCategory === "flat"
      ? activeSlab?.remainingAmount ?? 0
      : getCategoryDueFor(selCustomerId, payCategory)
    : 0;

  function handleSubmit() {
    if (!selCustomer || !receivedAmt || !receivedDate) return;
    onAllocatePayment({
      customerId: selCustomer.id,
      category: payCategory,
      amount: Number(receivedAmt),
      method,
      date: receivedDate,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setSelCustomerId(null);
      setSearchQ("");
      setReceivedAmt("");
      setReceivedDate("");
    }, 1800);
  }

  const displayLog = receivedPayments;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Received Payments</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            6 payment categories · slab remaining logic for Flat · saved to browser storage
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Add Received Payment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Payment Log</h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Flat</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Total Due</th>
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayLog.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{r.category}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">{fmt(r.amount)}</td>
                <td className="px-5 py-3 text-sm font-semibold text-green-700">{fmt(r.received)}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.method}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.date}</td>
                <td className="px-5 py-3">
                  <Badge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#0f1a35]">Add Received Payment</h3>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelCustomerId(null);
                  setSearchQ("");
                }}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Property Type
                </label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["residential", "commercial"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setPropType(t);
                        setSelCustomerId(null);
                        setSearchQ("");
                      }}
                      className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                        propType === t ? "bg-[#0f1a35] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Step 1 — Search Customer
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => {
                      setSearchQ(e.target.value);
                      setSelCustomerId(null);
                    }}
                    placeholder="Name or Customer ID…"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {suggestions.length > 0 && !selCustomer && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {suggestions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelCustomerId(c.id);
                          setSearchQ(c.name);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {c.id} · Flat {c.flat}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selCustomer && (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-blue-500 font-semibold uppercase">Customer</p>
                      <p className="text-sm font-semibold">{selCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-500 font-semibold uppercase">Grand Total</p>
                      <p className="text-sm font-semibold">{fmt(selCustomer.amount)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                      Step 2 — Payment Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setPayCategory(cat.key)}
                          className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                            payCategory === cat.key
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payCategory === "flat" && activeSlab && (
                    <div className="p-4 bg-[#0f1a35] rounded-xl text-white space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-blue-300">Active Slab</p>
                      <p className="text-sm font-bold">
                        #{activeSlab.slabNo} — {activeSlab.stage} ({activeSlab.percentage}%)
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-white/10">
                        <div>
                          <p className="text-white/50">Slab Amount</p>
                          <p className="font-semibold">{fmt(activeSlab.slabAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Already Paid</p>
                          <p className="font-semibold text-green-300">{fmt(activeSlab.paidAmount)}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Remaining Due</p>
                          <p className="font-bold text-orange-300 text-sm">{fmt(activeSlab.remainingAmount)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {payCategory !== "flat" && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500">
                        {CATEGORIES.find((c) => c.key === payCategory)?.label} — from customer details
                      </p>
                      <p className="text-lg font-bold text-[#0f1a35] mt-1">{fmt(totalForCategory)}</p>
                      <p className="text-[11px] text-gray-400 mt-1">Remaining due for this category</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Total Payment Due <span className="text-blue-400 font-normal">Auto</span>
                    </label>
                    <input
                      readOnly
                      value={totalForCategory > 0 ? fmt(totalForCategory) : "—"}
                      className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Received Amount (₹)</label>
                    <input
                      type="number"
                      value={receivedAmt}
                      onChange={(e) => setReceivedAmt(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Method</label>
                      <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date Received</label>
                      <input
                        type="date"
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {submitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Payment recorded and saved
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!selCustomer || !receivedAmt || !receivedDate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40"
                >
                  Record Payment
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}