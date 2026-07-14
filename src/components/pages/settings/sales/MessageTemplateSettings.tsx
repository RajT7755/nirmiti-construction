import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { MessageSquare } from "lucide-react";
import {
  OVERDUE_TEMPLATE_VARIABLES,
  renderWhatsAppTemplate,
  SLAB_TEMPLATE_VARIABLES,
} from "@/lib/messenger/messageTemplates";
import type { MessengerTemplateSettings } from "@/lib/settings/settingsTypes";

type TemplateTab = "slab-schedule" | "overdue";

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
};

export function MessageTemplateSettings({
  templates,
  onSave,
}: {
  templates: MessengerTemplateSettings;
  onSave: (patch: Partial<MessengerTemplateSettings>) => Promise<boolean>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<TemplateTab>(
    tabParam === "overdue" ? "overdue" : "slab-schedule"
  );
  const [form, setForm] = useState(templates);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(templates), [templates]);

  useEffect(() => {
    if (tabParam === "overdue") setTab("overdue");
    else if (tabParam === "slab-schedule") setTab("slab-schedule");
  }, [tabParam]);

  function selectTab(next: TemplateTab) {
    setTab(next);
    setSearchParams(next === "slab-schedule" ? {} : { tab: next });
  }

  const previewText = useMemo(() => {
    if (tab === "overdue") {
      return renderWhatsAppTemplate(form.overdue, OVERDUE_PREVIEW_VARS);
    }
    return renderWhatsAppTemplate(form.slabSchedule, SLAB_PREVIEW_VARS);
  }, [tab, form.overdue, form.slabSchedule]);

  const variables = tab === "overdue" ? OVERDUE_TEMPLATE_VARIABLES : SLAB_TEMPLATE_VARIABLES;
  const templateValue = tab === "overdue" ? form.overdue : form.slabSchedule;

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
          WhatsApp message templates used in Messenger for slab schedules and overdue reminders.
        </p>

        <div className="flex gap-1 border-b border-gray-200">
          <button
            type="button"
            onClick={() => selectTab("slab-schedule")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
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
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === "overdue"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overdue
          </button>
        </div>

        <div>
          <label className={labelClass}>Template Text</label>
          <textarea
            className={`${inputClass} min-h-[180px] resize-y`}
            value={templateValue}
            onChange={(e) =>
              setForm((f) =>
                tab === "overdue"
                  ? { ...f, overdue: e.target.value }
                  : { ...f, slabSchedule: e.target.value }
              )
            }
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