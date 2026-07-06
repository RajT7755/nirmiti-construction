import type { PropType } from "./types";

export const WING_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const BHK_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"] as const;

export const PROP_TYPE_TAG: Record<PropType, string> = {
  residential: "bg-blue-100 text-blue-700",
  commercial: "bg-indigo-100 text-indigo-700",
  semi: "bg-green-100 text-green-700",
};

export const WA_TEMPLATE_DEFAULT = `Hello {owner_name}, this is a payment reminder from Nirmit Developer.\n\nYour flat *{flat_name}* has a payment of *{payment_value}* due on *{due_date}*.\n\nCurrent build status: {build_status}.\n\nPlease make the payment at your earliest convenience. Thank you for your cooperation! 🙏`;

export const DONUT_COLORS = ["#1e3a5f", "#2563eb", "#60a5fa", "#93c5fd", "#dbeafe"];
