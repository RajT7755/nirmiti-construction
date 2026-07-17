import type { ReactNode } from "react";
import type { Material } from "@/lib/inventory/inventoryTypes";
import { isLowStock } from "@/lib/inventory/materialHelpers";

export function MaterialListTable({
  title,
  materials,
  highlightLow = false,
  emptyMessage = "No materials yet.",
  selectable = false,
  selectedIds = [],
  onToggle,
  onToggleAll,
  headerActions,
}: {
  title: string;
  materials: Material[];
  highlightLow?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: (selectAll: boolean) => void;
  /** e.g. View all + Export */
  headerActions?: ReactNode;
}) {
  const allSelected =
    materials.length > 0 && materials.every((m) => selectedIds.includes(m.id));
  const someSelected = materials.some((m) => selectedIds.includes(m.id));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0f1a35]">{title}</h3>
        <div className="flex items-center gap-3">
          {headerActions}
          <span className="text-[11px] font-medium text-gray-400">{materials.length} items</span>
        </div>
      </div>

      {materials.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                {selectable && (
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => onToggleAll?.(!allSelected)}
                      aria-label="Select all materials"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-5 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Work categories</th>
                <th className="px-3 py-2.5 font-semibold">Quantity</th>
                <th className="px-3 py-2.5 font-semibold">Unit</th>
                <th className="px-5 py-2.5 font-semibold">Current supplier</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const low = isLowStock(m);
                const checked = selectedIds.includes(m.id);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle?.(m.id)}
                          aria-label={`Select ${m.name}`}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-5 py-3 font-medium text-[#0f1a35]">{m.name}</td>
                    <td className="px-3 py-3 text-gray-600">{m.type}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.workCategories.length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          m.workCategories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100"
                            >
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-3 py-3 font-semibold ${
                        highlightLow || low ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {m.quantity}
                      {(highlightLow || low) && m.reorderLevel > 0 && (
                        <span className="block text-[10px] font-medium text-red-400 normal-case">
                          Reorder at {m.reorderLevel}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{m.unit}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {m.currentSupplierName?.trim() || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
