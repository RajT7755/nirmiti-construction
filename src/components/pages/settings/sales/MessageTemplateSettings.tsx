import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { MessageSquare } from "lucide-react";
import {
  CUSTOMER_BROADCAST_TEMPLATE_VARIABLES,
  OVERDUE_TEMPLATE_VARIABLES,
  PO_REQUEST_TEMPLATE_VARIABLES,
  renderWhatsAppTemplate,
  SLAB_TEMPLATE_VARIABLES,
  WO_REQUEST_TEMPLATE_VARIABLES,
} from "@/lib/messenger/templates";
import type { MessengerTemplateSettings } from "@/lib/settings/settingsTypes";

type TemplateTab =
  | "slab-schedule"
  | "overdue"
  | "customers"
  | "po-request"
  | "wo-request";

const SLAB_PREVIEW_VARS = {
  owner_name: "Rahul Sharma",
  flat_name: "A-101",
  payment_value: "₹2,50,000",
  due_date: "15 Aug 2026",
  build_status: "Structure complete",
};

const OVERDUE_PREVIEW_VARS = {
  owner_name: "Rahul Sharma",
  flat_name: "A-101",
  due_amount: "₹1,25,000",
  current_slab: "Slab #3 — Flooring",
  project: "Sankalp Heights",
  company_name: "Sankalp Technologies",
};

const PO_PREVIEW_VARS = {
  party_name: "Shree Cement Traders",
  phone: "+91 98765 43210",
  company_name: "Sankalp Technologies",
  request_no: "REQ-000001",
  material_name: "OPC Cement 53 Grade",
  quantity: "200",
  unit: "bags",
  product_description: "For RCC columns",
  grand_total: "₹89,680",
};

const WO_PREVIEW_VARS = {
  party_name: "Ramesh Plastering Works",
  phone: "+91 91234 56780",
  company_name: "Sankalp Technologies",
  request_no: "WOR-000001",
  work_profile: "Plastering",
  description: "Wing A floors 1–3",
  date_of_issue: "2026-07-14",
  commitment_date: "2026-07-28",
};

const CUSTOMER_PREVIEW_VARS = {
  owner_name: "Rahul Sharma",
  phone: "9123456780",
  flat_name: "A-101",
  project: "Sankalp Heights",
  company_name: "Sankalp Technologies",
};

function parseTab(tabParam: string | null): TemplateTab {
  if (tabParam === "overdue") return "overdue";
  if (tabParam === "customers") return "customers";
  if (tabParam === "po-request") return "po-request";
  if (tabParam === "wo-request") return "wo-request";
  return "slab-schedule";
}

export function MessageTemplateSettings({
  templates,
  onSave,
}: {
  templates: MessengerTemplateSettings;
  onSave: (patch: Partial<MessengerTemplateSettings>) => Promise<boolean>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<TemplateTab>(() => parseTab(tabParam));
  const [form, setForm] = useState(templates);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(templates), [templates]);

  useEffect(() => {
    setTab(parseTab(tabParam));
  }, [tabParam]);

  function selectTab(next: TemplateTab) {
    setTab(next);
    setSearchParams(next === "slab-schedule" ? {} : { tab: next });
  }

  const previewText = useMemo(() => {
    if (tab === "overdue") return renderWhatsAppTemplate(form.overdue, OVERDUE_PREVIEW_VARS);
    if (tab === "customers")
      return renderWhatsAppTemplate(form.customerBroadcast, CUSTOMER_PREVIEW_VARS);
    if (tab === "po-request")
      return renderWhatsAppTemplate(form.poRequest, PO_PREVIEW_VARS);
    if (tab === "wo-request")
      return renderWhatsAppTemplate(form.workOrderRequest, WO_PREVIEW_VARS);
    return renderWhatsAppTemplate(form.slabSchedule, SLAB_PREVIEW_VARS);
  }, [tab, form]);

  const variables =
    tab === "overdue"
      ? OVERDUE_TEMPLATE_VARIABLES
      : tab === "customers"
        ? CUSTOMER_BROADCAST_TEMPLATE_VARIABLES
        : tab === "po-request"
          ? PO_REQUEST_TEMPLATE_VARIABLES
          : tab === "wo-request"
            ? WO_REQUEST_TEMPLATE_VARIABLES
            : SLAB_TEMPLATE_VARIABLES;

  const templateValue =
    tab === "overdue"
      ? form.overdue
      : tab === "customers"
        ? form.customerBroadcast
        : tab === "po-request"
          ? form.poRequest
          : tab === "wo-request"
            ? form.workOrderRequest
            : form.slabSchedule;

  function setTemplateValue(value: string) {
    setForm((f) => {
      if (tab === "overdue") return { ...f, overdue: value };
      if (tab === "customers") return { ...f, customerBroadcast: value };
      if (tab === "po-request") return { ...f, poRequest: value };
      if (tab === "wo-request") return { ...f, workOrderRequest: value };
      return { ...f, slabSchedule: value };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const labelClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5";
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-mono";

  const tabs: { key: TemplateTab; label: string; active: string }[] = [
    { key: "slab-schedule", label: "Slab Schedule", active: "border-blue-600 text-blue-600" },
    { key: "overdue", label: "Overdue", active: "border-orange-500 text-orange-600" },
    { key: "customers", label: "Customers", active: "border-green-600 text-green-700" },
    { key: "po-request", label: "PO Request", active: "border-amber-600 text-amber-700" },
    { key: "wo-request", label: "WO Request", active: "border-teal-600 text-teal-700" },
  ];

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
      >
        <h3 className="text-base font-semibold text-[#0f1a35] flex items-center gap-2">
          <MessageSquare size={18} className="text-green-600" /> Message Templates
        </h3>
        <p className="text-sm text-gray-500">
          Defaults live in <code className="text-xs bg-gray-100 px-1">src/lib/messenger/templates/</code>
          . Phone: use {"{phone}"} for customers, suppliers, and contractors.
        </p>

        <div className="flex flex-wrap gap-1 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? t.active
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>
          <label className={labelClass}>Template Text</label>
          <textarea
            className={`${inputClass} min-h-[180px] resize-y`}
            value={templateValue}
            onChange={(e) => setTemplateValue(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 mt-1.5">
            Variables:{" "}
            {variables.map((v) => (
              <code key={v} className="bg-gray-100 px-1 rounded mr-1">
                {v}
              </code>
            ))}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Template"}
        </button>
      </form>

      <div>
        <p className="text-sm font-semibold text-[#0f1a35] mb-3">Live Preview</p>
        <div className="bg-[#e9f5e1] border border-green-200 rounded-xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-w-2xl">
          {previewText}
        </div>
      </div>
    </div>
  );
}
