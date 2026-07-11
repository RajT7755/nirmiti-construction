import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { ProjectData } from "@/lib/types";

export interface DeleteConfirmationProps {
  project: ProjectData;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
  apiError?: string;
}

export function DeleteConfirmation({
  project,
  onConfirm,
  onClose,
  loading = false,
  apiError,
}: DeleteConfirmationProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [mounted, setMounted] = useState(false);

  const buildings = project.buildings ?? [];
  const unitCount = project.units?.length ?? project.totalFlats + project.totalShops;

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function handleConfirm() {
    if (!acknowledged) return;
    await onConfirm();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-project-title"
    >
      {/* Full-screen frosted backdrop */}
      <div
        className="absolute inset-0 bg-[#0f1a35]/45 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="relative z-10 flex w-full max-w-lg max-h-[90dvh] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-red-100/80 bg-red-50/90 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-red-600" />
            <h3 id="delete-project-title" className="text-base font-bold text-red-800">
              Delete Project?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/95 p-4 text-sm leading-relaxed text-amber-900">
            <p className="font-bold text-amber-950">Disclaimer</p>
            <p>
              This will permanently delete <strong>&quot;{project.name}&quot;</strong> including:
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-800">
              <li>
                {buildings.length} building{buildings.length !== 1 ? "s" : ""} and all wing
                configurations
              </li>
              <li>
                {unitCount} unit record{unitCount !== 1 ? "s" : ""} (flats &amp; shops)
              </li>
              <li>All project metadata — cannot be undone</li>
            </ul>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-300"
            />
            <span className="text-xs text-gray-600">
              I understand this action is permanent and cannot be recovered.
            </span>
          </label>

          {apiError && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {apiError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white/80 p-5 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !acknowledged}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Trash2 size={14} />
                Delete
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}