import { useState } from "react";
import {
  Layers, Plus, CreditCard, X, Search, CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { fmt } from "@/lib/utils";
import {
  getSlabPaymentDistribution,
  getDistributionSummary,
  getSlabColors,
} from "@/lib/customers/paymentDistribution";
import type {
  CustomerDetailProfile,
  PaymentCategoryKey,
  ActiveSlabInfo,
} from "@/lib/customers/customerDetailTypes";
import type { AllocatePaymentInput } from "@/lib/storage/storeOperations";
import type { Customer, Page, ProjectData, ReceivedPayment, SlabEntry } from "@/lib/types";

type PayCategory = PaymentCategoryKey;

const PMT_CATEGORIES: { key: PayCategory; label: string }[] = [
  { key: "flat", label: "Flat Payment" },
  { key: "gst", label: "GST" },
  { key: "stamp", label: "Stamp Duty" },
  { key: "agreement", label: "Agreement" },
  { key: "parking", label: "Parking" },
  { key: "electrical", label: "Electrical Bill" },
];

export function Sales({
  projects,
  customers,
  customerProfiles,
  slabs,
  receivedPayments,
  getActiveSlab,
  getCategoryDueFor,
  onAllocatePayment,
  onNav,
}: {
  projects: ProjectData[];
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  slabs: SlabEntry[];
  receivedPayments: ReceivedPayment[];
  getActiveSlab: (id: string) => ActiveSlabInfo | null;
  getCategoryDueFor: (id: string, cat: PaymentCategoryKey) => number;
  onAllocatePayment: (input: AllocatePaymentInput) => void;
  onNav: (p: Page) => void;
}) {
  const [propView, setPropView] = useState<"residential" | "commercial">("residential");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Derive project metrics
  const allUnits  = projects.flatMap(p => p.units);
  const flats     = allUnits.filter(u => u.kind === "flat");
  const shops     = allUnits.filter(u => u.kind === "shop");

  const totalFlats      = flats.length  || projects.reduce((s,p) => s + p.totalFlats, 0);
  const totalShops      = shops.length  || projects.reduce((s,p) => s + p.totalShops, 0);
  const bookedFlats     = flats.filter(u => u.status === "booked" || u.status === "overdue").length;
  const tempBookedFlats = flats.filter(u => u.status === "overdue").length;
  const remainFlats     = flats.filter(u => u.status === "available").length;
  const bookedShops     = shops.filter(u => u.status === "booked" || u.status === "overdue").length;
  const tempBookedShops = shops.filter(u => u.status === "overdue").length;
  const remainShops     = shops.filter(u => u.status === "available").length;

  const totalSales    = customers.reduce((s, c) => s + c.amount, 0);
  const totalGst      = Math.round(totalSales * 0.05);
  const collectedGst  = Math.round(totalGst * 0.62);
  const totalStamp    = Math.round(totalSales * 0.03);
  const receivedStamp = Math.round(totalStamp * 0.50);
  const totalAgree    = Math.round(totalSales * 0.015);
  const collectedAgree = Math.round(totalAgree * 0.78);

  const latestSlab    = slabs[slabs.length - 1];
  const totalSlabAmt  = Math.round(totalSales * (latestSlab?.percentage ?? 10) / 100);
  const receivedSlabAmt = Math.round(totalSlabAmt * 0.65);
  const remainingSlabAmt = totalSlabAmt - receivedSlabAmt;

  const cards = propView === "residential"
    ? [
        { label: "Total Flats",       value: totalFlats || "—",      accent: "text-[#1e3a5f]", bg: "bg-blue-50",   border: "border-blue-200" },
        { label: "Temp. Booked Flats",value: tempBookedFlats || "—", accent: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        { label: "Remaining Flats",   value: remainFlats || "—",     accent: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
      ]
    : [
        { label: "Total Shops",       value: totalShops || "—",      accent: "text-[#1e3a5f]", bg: "bg-blue-50",   border: "border-blue-200" },
        { label: "Temp. Booked Shops",value: tempBookedShops || "—", accent: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        { label: "Remaining Shops",   value: remainShops || "—",     accent: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
      ];

  // ── Received payment modal state (inline) ──
  const [searchQ, setSearchQ]         = useState("");
  const [selCustomer, setSelCustomer] = useState<Customer | null>(null);
  const [pmtType, setPmtType]         = useState<"residential"|"commercial">("residential");
  const [pmtCat, setPmtCat]           = useState<PayCategory>("flat");
  const [selMockId, setSelMockId]     = useState<string | null>(null);
  const [receivedAmt, setReceivedAmt] = useState("");
  const [pmtMethod, setPmtMethod]     = useState("cash");
  const [pmtDate, setPmtDate]         = useState("");
  const [pmtSubmitted, setPmtSubmitted] = useState(false);

  const payCustomers = customerProfiles.filter(
    (c) => c.status !== "inactive" && c.unitType.toLowerCase() === pmtType
  );
  const pmtSuggestions = searchQ.length >= 1
    ? payCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQ.toLowerCase())
      )
    : [];
  const selMock = selMockId ? payCustomers.find((c) => c.id === selMockId) : null;
  const activeSlab = selMockId ? getActiveSlab(selMockId) : null;
  const pmtTotal = selMockId
    ? pmtCat === "flat"
      ? activeSlab?.remainingAmount ?? 0
      : getCategoryDueFor(selMockId, pmtCat)
    : 0;

  const slabDistSlices = getSlabPaymentDistribution(customerProfiles, propView);
  const slabDistSummary = getDistributionSummary(slabDistSlices);
  const slabDistColors = getSlabColors(slabDistSlices.length);

  function handlePmtSubmit() {
    if (!selMock || !receivedAmt || !pmtDate) return;
    onAllocatePayment({
      customerId: selMock.id,
      category: pmtCat,
      amount: Number(receivedAmt),
      method: pmtMethod,
      date: pmtDate,
    });
    setPmtSubmitted(true);
    setTimeout(() => {
      setPmtSubmitted(false);
      setShowPaymentModal(false);
      setSelCustomer(null);
      setSelMockId(null);
      setSearchQ("");
      setReceivedAmt("");
      setPmtDate("");
    }, 1800);
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Sales Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Property sales overview and payment tracking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNav("payment-slabs")}
            className="flex items-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Layers size={14} /> Payment Slabs
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            <CreditCard size={14} /> Add Received Payment
          </button>
        </div>
      </div>

      {/* ── Property Toggle ── */}
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(["residential","commercial"] as const).map(t => (
          <button key={t} onClick={() => setPropView(t)}
            className={`px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              propView === t ? "bg-[#0f1a35] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Top Metric Master Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3">{c.label}</p>
            <p className={`text-4xl font-bold ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Middle Section ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Left — Slab Payment Distribution Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-[#0f1a35]">Payment Distribution</p>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">By Slab Stage</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-4 capitalize">
            {propView} · slab payments received across customers
          </p>
          {slabDistSlices.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No slab payments recorded yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="shrink-0 relative">
                <PieChart width={180} height={180}>
                  <Pie
                    data={slabDistSlices}
                    cx={90}
                    cy={90}
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    paddingAngle={2}
                  >
                    {slabDistSlices.map((_, i) => (
                      <Cell key={i} fill={slabDistColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, name: string) => [fmt(v), name]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 uppercase">Total</p>
                    <p className="text-xs font-bold text-[#0f1a35]">{fmt(slabDistSummary.total)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 flex-1 max-h-44 overflow-y-auto">
                {slabDistSlices.map((slice, i) => {
                  const pct = slabDistSummary.total > 0
                    ? Math.round((slice.value / slabDistSummary.total) * 100)
                    : 0;
                  return (
                    <div key={slice.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ background: slabDistColors[i] }}
                      />
                      <span className="text-xs text-gray-600 flex-1 truncate">{slice.name}</span>
                      <span className="text-xs font-semibold text-gray-700 shrink-0">{pct}%</span>
                      <span className="text-[10px] text-green-700 font-medium shrink-0">{fmt(slice.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — Admin Dues */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-[#0f1a35] mb-4">Administrative Dues</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "GST",        total: totalGst,      collected: collectedGst,    subLabel: "Collected / Received" },
              { label: "Stamp Duty", total: totalStamp,    collected: receivedStamp,   subLabel: "Received Stamp Duty"  },
              { label: "Agreement",  total: totalAgree,    collected: collectedAgree,  subLabel: "Collected"            },
            ].map(a => (
              <div key={a.label} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-[#0f1a35] px-3 py-2.5 text-center">
                  <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">{a.label}</p>
                  <p className="text-base font-bold text-white mt-0.5">{fmt(a.total)}</p>
                  <p className="text-[9px] text-blue-300 mt-0.5">Total Due</p>
                </div>
                <div className="bg-green-50 px-3 py-2.5 text-center border-t border-gray-100">
                  <p className="text-[9px] text-gray-400 font-semibold">{a.subLabel}</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">{fmt(a.collected)}</p>
                  <p className="text-[9px] text-gray-400">{Math.round(a.collected / a.total * 100)}% collected</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Left — Recent Payments Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0f1a35]">Recent Payments</h3>
            <button className="text-[10px] text-blue-600 font-semibold hover:underline">View all</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5">#</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Flat</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {receivedPayments.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
              )}
              {receivedPayments.slice(0, 5).map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.customer}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.flat}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700">{fmt(r.received > 0 ? r.received : r.amount)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right — Payment Slab Summary */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-[#0f1a35]">Payment Slab Generation</h3>
            </div>
            <button
              onClick={() => onNav("payment-slabs")}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {slabs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
            )}
            {slabs.map(s => (
              <div key={s.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">#{s.slabNo}</span>
                    <span className="text-xs font-semibold text-gray-700">{s.stage}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Recent slab: <span className="font-bold text-[#0f1a35]">{s.percentage}%</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Total payment: <span className="font-bold text-green-600">{fmt(Math.round(totalSales * s.percentage / 100))}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Remaining: <span className="font-semibold text-orange-600">
                      {fmt(Math.round(totalSales * s.percentage / 100) - Math.round(totalSales * s.percentage / 100 * 0.65))}
                    </span>
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  s.status === "received" ? "bg-green-100 text-green-700"
                  : s.status === "sent"   ? "bg-blue-100 text-blue-600"
                  :                        "bg-gray-100 text-gray-500"
                }`}>{s.status}</span>
              </div>
            ))}
            <button onClick={() => onNav("payment-slabs")}
              className="w-full mt-1 py-2 border-2 border-dashed border-blue-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5">
              <Plus size={13} /> Add New Slab
            </button>
          </div>
        </div>
      </div>

      {/* ── Inline Add Received Payment Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                <h3 className="text-base font-bold text-[#0f1a35]">Add Received Payment</h3>
              </div>
              <button onClick={() => { setShowPaymentModal(false); setSelCustomer(null); setSelMockId(null); setSearchQ(""); }} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Property Type</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["residential","commercial"] as const).map(t => (
                    <button key={t} onClick={() => { setPmtType(t); setSelMockId(null); setSelCustomer(null); setSearchQ(""); }}
                      className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${pmtType === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Search Customer</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchQ} onChange={e => { setSearchQ(e.target.value); setSelMockId(null); setSelCustomer(null); }}
                    placeholder="Name or Customer ID…"
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                {pmtSuggestions.length > 0 && !selMock && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {pmtSuggestions.map(c => (
                      <button key={c.id} onClick={() => { setSelMockId(c.id); setSelCustomer(customers.find(x => x.id === c.id) ?? null); setSearchQ(c.name); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.id} · Flat {c.flat} · {c.project}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selMock && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 gap-2">
                    {[{ k:"Customer ID",v:selMock.id },{ k:"Flat No.",v:selMock.flat },{ k:"Project",v:selMock.project },{ k:"Total Amt",v:fmt(selMock.amount) }].map(r => (
                      <div key={r.k}>
                        <p className="text-[10px] text-blue-500 font-semibold uppercase">{r.k}</p>
                        <p className="text-sm font-semibold text-[#0f1a35]">{r.v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selMock && (
              <>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-2">Payment Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {PMT_CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setPmtCat(cat.key)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${pmtCat === cat.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:border-blue-300"}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              {pmtCat === "flat" && activeSlab && (
                <div className="p-3 bg-[#0f1a35] rounded-xl text-white text-[11px] space-y-1">
                  <p className="text-blue-300 uppercase text-[10px]">Active Slab</p>
                  <p className="font-bold">#{activeSlab.slabNo} — {activeSlab.stage} ({activeSlab.percentage}%)</p>
                  <p>Remaining: <span className="text-orange-300 font-bold">{fmt(activeSlab.remainingAmount)}</span></p>
                </div>
              )}
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">Payment Details</label>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Total Payment Due <span className="text-blue-400 font-normal">Auto</span></label>
                  <input readOnly value={pmtTotal > 0 ? fmt(pmtTotal) : "—"}
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Received Amount (₹)</label>
                  <input type="number" value={receivedAmt} onChange={e => setReceivedAmt(e.target.value)} placeholder="Enter amount received"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Method</label>
                    <select value={pmtMethod} onChange={e => setPmtMethod(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Date Received</label>
                    <input type="date" value={pmtDate} onChange={e => setPmtDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
              </div>
              {pmtSubmitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Payment recorded successfully!
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={handlePmtSubmit} disabled={!selMock || !receivedAmt || !pmtDate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Record Payment
                </button>
                <button onClick={() => { setShowPaymentModal(false); setSelCustomer(null); setSelMockId(null); setSearchQ(""); }}
                  className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Received Payment ──────────────────────────────────────────────────────

