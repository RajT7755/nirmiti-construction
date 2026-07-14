import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { WhatsAppMessagePanel } from "./WhatsAppMessagePanel";
import { SLAB_TEMPLATE_VARIABLES } from "@/lib/messenger/messageTemplates";
import { buildSlabScheduleRecipients } from "@/lib/messenger/slabScheduleRecipients";
import { DESIGN_PREVIEW_SLABS } from "@/lib/messenger/slabPreviewSlabs";
import type { Customer, SlabEntry } from "@/lib/types";

export function SlabScheduleTab({
  customers,
  slabs,
  slabTemplate,
  onWhatsAppSend,
}: {
  customers: Customer[];
  slabs: SlabEntry[];
  slabTemplate: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const displaySlabs = slabs.length > 0 ? slabs : DESIGN_PREVIEW_SLABS;
  const isPreview = slabs.length === 0;
  const [selSlab, setSelSlab] = useState<SlabEntry | null>(null);

  const avgAmount = customers.reduce((s, c) => s + c.amount, 0) / (customers.length || 1);

  const recipients = useMemo(() => {
    if (!selSlab) return [];
    return buildSlabScheduleRecipients(customers, selSlab, slabTemplate);
  }, [customers, selSlab, slabTemplate]);

  const previewText = recipients[0]?.previewMessage ?? slabTemplate;

  const slabStatusBadge: Record<SlabEntry["status"], string> = {
    draft: "bg-gray-100 text-gray-500",
    sent: "bg-blue-100 text-blue-600",
    received: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-[#0f1a35]">Slab Schedule</h3>
          {isPreview && (
            <p className="text-[11px] text-orange-500 mt-0.5">Design preview — create slabs in Payment Slabs</p>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3">Slab No.</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">%</th>
              <th className="px-5 py-3">Avg. Amount</th>
              <th className="px-5 py-3">Generated</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displaySlabs.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-bold text-[#0f1a35]">#{s.slabNo}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{s.stage}</td>
                <td className="px-5 py-3 text-sm font-semibold text-blue-600">{s.percentage}%</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#1e3a5f]">
                  ₹{Math.round(avgAmount * s.percentage / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dateGenerated}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{s.dueDate}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${slabStatusBadge[s.status]}`}>
                    {s.status}
                  </span>
                  {isPreview && idx === 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-100 text-purple-700">
                      Auto-settled
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {isPreview && idx === 0 ? (
                    <span className="text-[10px] text-gray-400 italic">No message</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelSlab(s)}
                      className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageSquare size={11} /> Message
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selSlab && (
        <WhatsAppMessagePanel
          title={`WhatsApp — Slab #${selSlab.slabNo} (${selSlab.stage})`}
          variables={SLAB_TEMPLATE_VARIABLES}
          recipients={recipients}
          previewText={previewText}
          onSend={() => onWhatsAppSend(slabTemplate.slice(0, 40), recipients.length)}
          onClose={() => setSelSlab(null)}
        />
      )}
    </div>
  );
}
