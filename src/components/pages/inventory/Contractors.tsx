import { useMemo, useState } from "react";
import { HardHat, Pencil, UserRoundPen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BackToInventoryButton } from "./buttons/BackToInventoryButton";
import { AddContractorButton } from "./buttons/AddContractorButton";
import { ExportContractorsButton } from "./buttons/ExportContractorsButton";
import { ViewAllContractorsButton } from "./buttons/ViewAllContractorsButton";
import { ContractorStatusButtons } from "./buttons/ContractorStatusButtons";
import { DeleteContractorsButton } from "./buttons/DeleteContractorsButton";
import { ContractorListTable } from "./contractors/ContractorListTable";
import { EditContractorProfileModal } from "./contractors/EditContractorProfileModal";
import { useAppDataContext } from "@/app/AppDataContext";

export function Contractors() {
  const {
    contractors,
    setContractorsStatus,
    updateContractor,
    deleteContractors,
    workOrders,
    inventorySettings,
  } = useAppDataContext();
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [profileEditId, setProfileEditId] = useState<string | null>(null);

  const profileContractor = useMemo(
    () =>
      profileEditId ? contractors.find((c) => c.id === profileEditId) : undefined,
    [profileEditId, contractors]
  );

  const woLinkCount = useMemo(() => {
    if (selectedIds.length === 0) return 0;
    const idSet = new Set(selectedIds);
    return workOrders.filter((wo) => idSet.has(wo.contractorId)).length;
  }, [selectedIds, workOrders]);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll(selectAll: boolean) {
    setSelectedIds(selectAll ? contractors.map((c) => c.id) : []);
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
    if (!window.confirm(`Mark ${selectedIds.length} contractor(s) inactive?`)) return;
    setContractorsStatus(selectedIds, "inactive");
    setSelectedIds([]);
  }

  function handleDelete() {
    if (selectedIds.length === 0) return;
    const woNote =
      woLinkCount > 0
        ? `\n\n${woLinkCount} work order(s) reference selected contractor(s). History is kept.`
        : "";
    if (!window.confirm(`Delete ${selectedIds.length} contractor(s)?${woNote}`)) return;
    deleteContractors(selectedIds);
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
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <HardHat size={16} className="text-violet-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#0f1a35]">Contractors</h3>
            <p className="text-sm text-gray-500">
              {editMode
                ? "Edit mode — select one row for Edit profile, or multi-select for Inactive / Delete."
                : "Click Edit to change profile, mark inactive, or delete."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BackToInventoryButton />
          <ExportContractorsButton contractors={contractors} />
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
              <ContractorStatusButtons
                selectedCount={selectedIds.length}
                onSetInactive={markInactive}
              />
              <DeleteContractorsButton
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
          <AddContractorButton />
        </div>
      </div>

      <ContractorListTable
        title="Contractor List"
        contractors={contractors}
        workOrders={workOrders}
        selectable={editMode}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        headerActions={<ViewAllContractorsButton />}
      />

      {profileContractor && (
        <EditContractorProfileModal
          contractor={profileContractor}
          categoryOptions={inventorySettings?.workCategories ?? []}
          onSave={(patch) => {
            const saved = updateContractor(profileContractor.id, patch);
            return Boolean(saved);
          }}
          onClose={() => setProfileEditId(null)}
        />
      )}
    </div>
  );
}
