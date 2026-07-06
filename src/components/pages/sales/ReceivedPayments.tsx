import { useState } from "react";
import { Plus, Download, CreditCard, X, Search, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";
import type { Customer, ProjectData, ReceivedPayment } from "@/lib/types";

export function ReceivedPayments({ projects, customers, receivedPayments }: { projects: ProjectData[]; customers: Customer[]; receivedPayments: ReceivedPayment[] }) {
  const [showForm, setShowForm] = useState(false);
  const [searchQ, setSearchQ]   = useState("");
  const [selCustomer, setSelCustomer] = useState<Customer | null>(null);
  const [propType, setPropType] = useState<"residential" | "commercial">("residential");
  const [payCategory, setPayCategory] = useState<"flat" | "gst" | "legal" | "stamp">("flat");
  const [receivedAmt, setReceivedAmt] = useState("");
  const [method, setMethod]           = useState("cash");
  const [receivedDate, setReceivedDate] = useState("");
  const [submitted, setSubmitted]     = useState(false);

  const suggestions = searchQ.length >= 1
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQ.toLowerCase())
      )
    : [];

  const categoryLabel: Record<string, string> = {
    flat: "Flat Payment", gst: "GST", legal: "Legal", stamp: "Stamp Duty",
  };

  const totalForCategory = selCustomer
    ? payCategory === "flat"  ? Math.round(selCustomer.amount * 0.10)
    : payCategory === "gst"   ? Math.round(selCustomer.amount * 0.05)
    : payCategory === "legal" ? Math.round(selCustomer.amount * 0.02)
    :                           Math.round(selCustomer.amount * 0.03)
    : 0;

  function handleSubmit() {
    if (!selCustomer || !receivedAmt || !receivedDate) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false); setShowForm(false);
      setSelCustomer(null); setSearchQ(""); setReceivedAmt(""); setReceivedDate("");
    }, 1800);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Received Payments</h2>
          <p className="text-sm text-gray-400 mt-0.5">Log and track all incoming payments per customer</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Add Received Payment
        </button>
      </div>

      {/* Recent log */}
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
            {receivedPayments.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
            )}
            {receivedPayments.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{r.category}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">{fmt(r.amount)}</td>
                <td className="px-5 py-3 text-sm font-semibold text-green-700">{r.received > 0 ? fmt(r.received) : "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.method}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.date}</td>
                <td className="px-5 py-3"><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#0f1a35]">Add Received Payment</h3>
              </div>
              <button onClick={() => { setShowForm(false); setSelCustomer(null); setSearchQ(""); }} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"><X size={16} /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Step 1+2: Customer search */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                  Step 1 — Search Customer
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => { setSearchQ(e.target.value); setSelCustomer(null); }}
                    placeholder="Name, Customer ID, or Phone…"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                {suggestions.length > 0 && !selCustomer && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {suggestions.map(c => (
                      <button key={c.id}
                        onClick={() => { setSelCustomer(c); setSearchQ(c.name); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.id} · Flat {c.flat} · {c.project}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selCustomer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-2">
                    {[
                      { k: "Customer ID", v: selCustomer.id },
                      { k: "Flat No.",    v: selCustomer.flat },
                      { k: "Project",     v: selCustomer.project },
                      { k: "Total Amt",   v: fmt(selCustomer.amount) },
                    ].map(row => (
                      <div key={row.k}>
                        <p className="text-[10px] text-blue-500 font-semibold uppercase">{row.k}</p>
                        <p className="text-sm font-semibold text-[#0f1a35]">{row.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Property type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Step 3 — Property Type</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["residential","commercial"] as const).map(t => (
                    <button key={t}
                      onClick={() => setPropType(t)}
                      className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                        propType === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Step 4: Payment category */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Step 4 — Payment Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["flat","gst","legal","stamp"] as const).map(cat => (
                    <button key={cat}
                      onClick={() => setPayCategory(cat)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        payCategory === cat
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"
                      }`}>
                      {categoryLabel[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Payment details */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-3">Step 5 — Payment Details</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Total Payment (from active slab) <span className="text-blue-400 font-normal">Auto</span>
                    </label>
                    <input readOnly
                      value={totalForCategory > 0 ? `₹${totalForCategory.toLocaleString("en-IN")}` : "—"}
                      className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Received Amount (₹)</label>
                    <input type="number" value={receivedAmt} onChange={e => setReceivedAmt(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Method</label>
                      <select value={method} onChange={e => setMethod(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date Received</label>
                      <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                  </div>
                </div>
              </div>

              {submitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Payment recorded successfully!
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={handleSubmit}
                  disabled={!selCustomer || !receivedAmt || !receivedDate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Record Payment
                </button>
                <button onClick={() => { setShowForm(false); setSelCustomer(null); setSearchQ(""); }}
                  className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
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
