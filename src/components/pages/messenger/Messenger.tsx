import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { MessageSquare } from "lucide-react";
import { SlabScheduleTab } from "./SlabScheduleTab";
import { OverdueTab } from "./OverdueTab";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Customer, SlabEntry } from "@/lib/types";

export type MessengerTab = "slab-schedule" | "overdue";

export function Messenger({
  customers,
  customerProfiles,
  slabs,
  slabTemplate,
  overdueTemplate,
  onWhatsAppSend,
}: {
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  slabs: SlabEntry[];
  slabTemplate: string;
  overdueTemplate: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<MessengerTab>(
    tabParam === "overdue" ? "overdue" : "slab-schedule"
  );

  useEffect(() => {
    if (tabParam === "overdue") setTab("overdue");
    else if (tabParam === "slab-schedule") setTab("slab-schedule");
  }, [tabParam]);

  function selectTab(next: MessengerTab) {
    setTab(next);
    setSearchParams(next === "slab-schedule" ? {} : { tab: next });
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
          <MessageSquare size={18} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f1a35]">Messenger</h2>
          <p className="text-sm text-gray-400 mt-0.5">WhatsApp reminders for slab schedules and overdue payments</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => selectTab("slab-schedule")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === "slab-schedule"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Slab Schedule
        </button>
        <button
          type="button"
          onClick={() => selectTab("overdue")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === "overdue"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Overdue
        </button>
      </div>

      {tab === "slab-schedule" ? (
        <SlabScheduleTab
          customers={customers}
          slabs={slabs}
          slabTemplate={slabTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      ) : (
        <OverdueTab
          customerProfiles={customerProfiles}
          overdueTemplate={overdueTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
    </div>
  );
}