import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { MessageSquare } from "lucide-react";
import { SlabScheduleTab } from "./SlabScheduleTab";
import { OverdueTab } from "./OverdueTab";
import { PoRequestTab } from "./PoRequestTab";
import { WoRequestTab } from "./WoRequestTab";
import { CustomerBroadcastTab } from "./CustomerBroadcastTab";
import { EmailTab } from "./EmailTab";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import type { Customer, SlabEntry } from "@/lib/types";
import type {
  Contractor,
  PurchaseRequest,
  Supplier,
  WorkOrderRequest,
} from "@/lib/inventory/inventoryTypes";

export type MessengerTab =
  | "slab-schedule"
  | "overdue"
  | "customers"
  | "po-request"
  | "wo-request"
  | "email";

const HEAD_TABS: { key: MessengerTab; label: string; activeClass: string }[] = [
  { key: "slab-schedule", label: "Slab Schedule", activeClass: "border-blue-600 text-blue-600" },
  { key: "overdue", label: "Overdue", activeClass: "border-orange-500 text-orange-600" },
  { key: "customers", label: "Customers", activeClass: "border-green-600 text-green-700" },
  { key: "po-request", label: "PO Request", activeClass: "border-amber-600 text-amber-700" },
  { key: "wo-request", label: "WO Request", activeClass: "border-teal-600 text-teal-700" },
  { key: "email", label: "Email", activeClass: "border-indigo-600 text-indigo-700" },
];

function parseTab(tabParam: string | null): MessengerTab {
  if (tabParam === "overdue") return "overdue";
  if (tabParam === "customers") return "customers";
  if (tabParam === "po-request") return "po-request";
  if (tabParam === "wo-request") return "wo-request";
  if (tabParam === "email") return "email";
  return "slab-schedule";
}

export function Messenger({
  customers,
  customerProfiles,
  slabs,
  slabTemplate,
  overdueTemplate,
  poRequestTemplate,
  woRequestTemplate,
  customerBroadcastTemplate,
  suppliers = [],
  purchaseRequests = [],
  contractors = [],
  workOrderRequests = [],
  companyName = "",
  onWhatsAppSend,
}: {
  customers: Customer[];
  customerProfiles: CustomerDetailProfile[];
  slabs: SlabEntry[];
  slabTemplate: string;
  overdueTemplate: string;
  poRequestTemplate: string;
  woRequestTemplate: string;
  customerBroadcastTemplate: string;
  suppliers?: Supplier[];
  purchaseRequests?: PurchaseRequest[];
  contractors?: Contractor[];
  workOrderRequests?: WorkOrderRequest[];
  companyName?: string;
  onWhatsAppSend: (templateName: string, recipientCount: number) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<MessengerTab>(() => parseTab(tabParam));

  useEffect(() => {
    setTab(parseTab(tabParam));
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
          <p className="text-sm text-gray-400 mt-0.5">
            WhatsApp + Email (bank loan approval) — email is separate from WhatsApp
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-gray-200">
        {HEAD_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? t.activeClass
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "slab-schedule" && (
        <SlabScheduleTab
          customers={customers}
          slabs={slabs}
          slabTemplate={slabTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
      {tab === "overdue" && (
        <OverdueTab
          customerProfiles={customerProfiles}
          overdueTemplate={overdueTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
      {tab === "customers" && (
        <CustomerBroadcastTab
          customerProfiles={customerProfiles}
          companyName={companyName}
          template={customerBroadcastTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
      {tab === "po-request" && (
        <PoRequestTab
          suppliers={suppliers}
          purchaseRequests={purchaseRequests}
          companyName={companyName}
          template={poRequestTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
      {tab === "wo-request" && (
        <WoRequestTab
          contractors={contractors}
          workOrderRequests={workOrderRequests}
          companyName={companyName}
          template={woRequestTemplate}
          onWhatsAppSend={onWhatsAppSend}
        />
      )}
      {tab === "email" && (
        <EmailTab
          customerProfiles={customerProfiles}
          companyName={companyName}
        />
      )}
    </div>
  );
}
