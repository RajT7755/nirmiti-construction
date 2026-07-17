import { useMemo, useState } from "react";
import { Pencil, Truck, UserRoundPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { AddSupplierButton } from "./buttons/AddSupplierButton";
import { ExportSuppliersButton } from "./buttons/ExportSuppliersButton";
import { ViewAllSuppliersButton } from "./buttons/ViewAllSuppliersButton";
import { SupplierStatusButtons } from "./buttons/SupplierStatusButtons";
import { DeleteSuppliersButton } from "./buttons/DeleteSuppliersButton";
import { SupplierListTable } from "./suppliers/SupplierListTable";
import { EditSupplierProfileModal } from "./suppliers/EditSupplierProfileModal";
import { useAppDataContext } from "@/app/AppDataContext";

export function Suppliers() {
  const {
    suppliers,
    setSuppliersStatus,
    updateSupplier,
    deleteSuppliers,
    purchaseOrders,
    inventorySettings,
  } = useAppDataContext();
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profileEditId, setProfileEditId] = useState<string | null>(null);

  const profileSupplier = useMemo(
    () => (profileEditId ? suppliers.find((s) => s.id === profileEditId) : undefined),
    [profileEditId, suppliers]
  );

  const poLinkCount = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    const idSet = new Set(selectedIds);
    return purchaseOrders.filter((po) => idSet.has(po.supplierId)).length;
  }, [selectedIds, purchaseOrders]);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll(selectAll: boolean) {
    setSelectedIds(selectAll ? suppliers.map((s) => s.id) : []);
  }

  function enterEdit() {
    setEditMode(true);
    setSelectedIds([]);
  }

  function exitEdit() {
    setEditMode(false);
    setSelectedIds([]);
    setProfileEditId(null);
  }

  function markInactive() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Mark ${selectedIds.length} supplier(s) inactive?`)) return;
    setSuppliersStatus(selectedIds, "inactive");
    setSelectedIds([]);
  }

  function handleDelete() {
    if (selectedIds.length === 0) return;
    const poNote =
      poLinkCount > 0
        ? `\n\n${poLinkCount} purchase order(s) reference selected supplier(s). PO history is kept.`
        : "";
    if (!window.confirm(`Delete ${selectedIds.length} supplier(s)?${poNote}`)) return;
    deleteSuppliers(selectedIds);
    setSelectedIds([]);
  }

  function openProfileEdit() {
    if (selectedIds.length !== 1) return;
    setProfileEditId(selectedIds[0]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Truck size={16} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#0f1a35]">Suppliers</h3>
            <p className="text-sm text-gray-500">
              {editMode
                ? "Edit mode — select one row for Edit profile, or multi-select for Inactive / Delete."
                : "Click Edit to change profile, mark inactive, or delete."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BackToInventoryButton />
          <ExportSuppliersButton suppliers={suppliers} />
          {editMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={selectedIds.length !== 1}
                onClick={openProfileEdit}
                className="gap-1.5"
              >
                <UserRoundPen size={16} />
                Edit profile
              </Button>
              <SupplierStatusButtons
                selectedCount={selectedIds.length}
                onSetInactive={markInactive}
              />
              <DeleteSuppliersButton
                selectedCount={selectedIds.length}
                onDelete={handleDelete}
              />
              <Button
                type="button"
                variant="outline"
                onClick={exitEdit}
                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
              >
                Done
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={enterEdit}>
              <Pencil size={16} />
              Edit
            </Button>
          )}
          <AddSupplierButton />
        </div>
      </div>

      <SupplierListTable
        title="Supplier List"
        suppliers={suppliers}
        purchaseOrders={purchaseOrders}
        selectable={editMode}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        headerActions={<ViewAllSuppliersButton />}
      />

      {profileSupplier && (
        <EditSupplierProfileModal
          supplier={profileSupplier}
          categoryOptions={inventorySettings?.workCategories ?? []}
          onSave={(patch) => {
            const saved = updateSupplier(profileSupplier.id, patch);
            return Boolean(saved);
          }}
          onClose={() => setProfileEditId(null)}
        />
      )}
    </div>
  );
}
