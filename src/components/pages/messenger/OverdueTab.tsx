import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { WhatsAppMessagePanel } from "./WhatsAppMessagePanel";
import { OVERDUE_TEMPLATE_VARIABLES } from "@/lib/messenger/messageTemplates";
import { buildOverdueRecipients } from "@/lib/messenger/overdueRecipients";
import { fmt } from "@/lib/utils";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";

export function OverdueTab({
  customerProfiles,
  overdueTemplate,
  onWhatsAppSend,
}: {
  customerProfiles: CustomerDetailProfile[];
  overdueTemplate: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const [showPanel, setShowPanel] = useState(false);

  const recipients = useMemo(
    () => buildOverdueRecipients(customerProfiles, overdueTemplate),
    [customerProfiles, overdueTemplate]
  );

  const previewText = recipients[0]?.previewMessage ?? overdueTemplate;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-orange-800">Overdue Customers</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            disabled={recipients.length === 0}
            className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-40"
          >
            Send WhatsApp to All ({recipients.length})
          </button>
        </div>

        {recipients.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No overdue customers.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recipients.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{r.name}</p>
                  <p className="text-[11px] text-gray-400">
                    Flat {r.flat} · {r.project}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.currentSlab}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{fmt(r.dueAmount)}</p>
                  <p className="text-[10px] text-gray-400">{r.phone || "No phone"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPanel && (
        <WhatsAppMessagePanel
          title="WhatsApp — Overdue Reminders"
          variables={OVERDUE_TEMPLATE_VARIABLES}
          recipients={recipients}
          previewText={previewText}
          onSend={() => onWhatsAppSend(overdueTemplate.slice(0, 40), recipients.length)}
          onClose={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}
