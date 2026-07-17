/** Global default — edit here or via Settings → Message Templates. */
export const WA_PO_REQUEST_TEMPLATE_DEFAULT = `Hello {party_name},

This is a purchase request notification from {company_name}.

Request No: *{request_no}*
Phone: *{phone}*
Material: *{material_name}*
Qty: *{quantity}* {unit}
Description: {product_description}
Grand total: *{grand_total}*

Please confirm. Thank you!`;

export const PO_REQUEST_TEMPLATE_VARIABLES = [
  "{party_name}",
  "{phone}",
  "{company_name}",
  "{request_no}",
  "{material_name}",
  "{quantity}",
  "{unit}",
  "{product_description}",
  "{grand_total}",
] as const;
