import { useState } from "react";
import { Layers } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { fmt } from "@/lib/utils";
import {
  getSlabPaymentDistribution,
  getDistributionSummary,
  getSlabColors,
} from "@/lib/customers/paymentDistribution";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { RecentPayments } from "./RecentPayments";
import { RecentInvoices } from "./RecentInvoices";
import type { Customer, Invoice, Page, ProjectData, ReceivedPayment } from "@/lib/types";

export function Sales({
  projects,
  customers,
  customerProfiles,
  receivedPayments,
  invoices,
  onNav,
}: {
  projects: ProjectData[];
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  receivedPayments: ReceivedPayment[];
  invoices: Invoice[];
  onNav: (p: Page) => void;
}) {
  const [propView, setPropView] = useState<"residential" | "commercial">("residential");

  const allUnits  = projects.flatMap(p => p.units);
  const flats     = allUnits.filter(u => u.kind === "flat");
  const shops     = allUnits.filter(u => u.kind === "shop");

  const totalFlats      = flats.length  || projects.reduce((s,p) => s + p.totalFlats, 0);
  const totalShops      = shops.length  || projects.reduce((s,p) => s + p.totalShops, 0);
  const tempBookedFlats = flats.filter(u => u.status === "overdue").length;
  const remainFlats     = flats.filter(u => u.status === "available").length;
  const tempBookedShops = shops.filter(u => u.status === "overdue").length;
  const remainShops     = shops.filter(u => u.status === "available").length;

  const totalSales    = customers.reduce((s, c) => s + c.amount, 0);
  const totalGst      = Math.round(totalSales * 0.05);
  const collectedGst  = Math.round(totalGst * 0.62);
  const totalStamp    = Math.round(totalSales * 0.03);
  const receivedStamp = Math.round(totalStamp * 0.50);
  const totalAgree    = Math.round(totalSales * 0.015);
  const collectedAgree = Math.round(totalAgree * 0.78);

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

  const slabDistSlices = getSlabPaymentDistribution(customerProfiles, propView);
  const slabDistSummary = getDistributionSummary(slabDistSlices);
  const slabDistColors = getSlabColors(slabDistSlices.length);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Sales Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Property sales overview and payment tracking</p>
        </div>
        <button
          onClick={() => onNav("payment-slabs")}
          className="flex items-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Layers size={14} /> Payment Slabs
        </button>
      </div>

      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {(["residential","commercial"] as const).map(t => (
          <button key={t} onClick={() => setPropView(t)}
            className={`px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              propView === t ? "bg-[#0f1a35] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            }`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-3">{c.label}</p>
            <p className={`text-4xl font-bold ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
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

      <div className="grid grid-cols-2 gap-5">
        <RecentPayments
          payments={receivedPayments}
          onViewAll={() => onNav("received-payment")}
        />
        <RecentInvoices invoices={invoices} />
      </div>
    </div>
  );
}