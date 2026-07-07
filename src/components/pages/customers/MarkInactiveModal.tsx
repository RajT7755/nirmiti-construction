import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface MarkInactiveModalProps {
  customerName: string;
  flatNo: string;
  isTemporary?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function MarkInactiveModal({
  customerName,
  flatNo,
  isTemporary,
  onConfirm,
  onClose,
}: MarkInactiveModalProps) {
  const [reason, setReason] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="text-base font-bold text-red-800">Mark Customer Inactive</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 leading-relaxed">
            {isTemporary ? (
              <>
                <strong>Disclaimer:</strong> This is a <strong>temporary booking</strong>. {customerName}{" "}
                (Flat {flatNo}) will be released and marked <strong>available</strong>. The hold will
                be removed and <strong>not saved</strong> to inactive customer records.
              </>
            ) : (
              <>
                <strong>Disclaimer:</strong> {customerName} (Flat {flatNo}) will be discontinued from
                further payment slabs. Their flat will be released and marked <strong>available</strong>.
                No new slab messages will be sent. This action is recorded with your reason.
              </>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
              Reason for discontinuation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer cancelled due to job transfer…"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <p className="text-[10px] text-gray-400">Inactive date: {today} (auto)</p>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onConfirm(reason.trim())}
              disabled={!reason.trim()}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40"
            >
              Submit — Mark Inactive
            </button>
            <button
              onClick={onClose}
              className="px-5 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}