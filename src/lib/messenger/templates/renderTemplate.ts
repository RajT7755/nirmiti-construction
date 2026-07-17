/** Shared WhatsApp template renderer — replace {key} placeholders. */
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
