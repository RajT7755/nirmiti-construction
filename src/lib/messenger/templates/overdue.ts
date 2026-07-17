/** Global default — edit here or via Settings → Message Templates. */
export const WA_OVERDUE_TEMPLATE_DEFAULT = `Hello {owner_name}, this is an overdue payment reminder from {company_name}.

Your flat *{flat_name}* has an overdue amount of *{due_amount}* for *{current_slab}*.

Please contact us or make the payment at your earliest convenience. Thank you!`;

export const OVERDUE_TEMPLATE_VARIABLES = [
  "{owner_name}",
  "{flat_name}",
  "{due_amount}",
  "{current_slab}",
  "{project}",
  "{company_name}",
] as const;
