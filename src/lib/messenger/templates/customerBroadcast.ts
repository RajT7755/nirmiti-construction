/** Global default — customer broadcast from Messenger. Edit here or via Settings. */
export const WA_CUSTOMER_BROADCAST_TEMPLATE_DEFAULT = `Hello {owner_name},

Message from *{company_name}*.

Flat: *{flat_name}*
Phone on file: *{phone}*
Project: *{project}*

Please contact us if you have any questions. Thank you!`;

export const CUSTOMER_BROADCAST_TEMPLATE_VARIABLES = [
  "{owner_name}",
  "{phone}",
  "{flat_name}",
  "{project}",
  "{company_name}",
] as const;
