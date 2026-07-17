import { fmt } from "@/lib/utils";
import type { InventoryKpis } from "@/lib/inventory/inventoryTypes";

export function InventoryKpiGrid({ kpis }: { kpis: InventoryKpis }) {
  const cards: { label: string; value: React.ReactNode; accent?: string }[] = [
    { label: "Low Materials", value: kpis.lowStockCount, accent: "text-red-500" },
    { label: "Total Materials", value: kpis.totalMaterials, accent: "text-blue-600" },
    { label: "Total Suppliers", value: kpis.supplierCount, accent: "text-indigo-600" },
    { label: "Total Contractors", value: kpis.contractorCount, accent: "text-violet-600" },
    { label: "Total Material Costing", value: fmt(kpis.totalMaterialCost), accent: "text-[#1e3a5f]" },
    { label: "Total Payment", value: fmt(kpis.pendingBillsTotal), accent: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center"
        >
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">
            {card.label}
          </p>
          <p className={`text-2xl font-bold ${card.accent ?? "text-[#0f1a35]"}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
