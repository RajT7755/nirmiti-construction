import { WA_TEMPLATE_DEFAULT } from "@/lib/constants";

export const WA_SLAB_TEMPLATE_DEFAULT = WA_TEMPLATE_DEFAULT;

export const WA_OVERDUE_TEMPLATE_DEFAULT = `Hello {owner_name}, this is an overdue payment reminder from Sankalp Enterprises.

Your flat *{flat_name}* has an overdue amount of *{due_amount}* for *{current_slab}*.

Please contact us or make the payment at your earliest convenience. Thank you!`;

export const SLAB_TEMPLATE_VARIABLES = [
  "{owner_name}",
  "{flat_name}",
  "{payment_value}",
  "{due_date}",
  "{build_status}",
] as const;

export const OVERDUE_TEMPLATE_VARIABLES = [
  "{owner_name}",
  "{flat_name}",
  "{due_amount}",
  "{current_slab}",
  "{project}",
] as const;

export function renderWhatsAppTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return out;
}