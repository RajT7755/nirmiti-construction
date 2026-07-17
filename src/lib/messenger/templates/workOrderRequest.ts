/** Global default — edit here or via Settings → Message Templates. */
export const WA_WO_REQUEST_TEMPLATE_DEFAULT = `Hello {party_name},

Work order request from {company_name}.

Request No: *{request_no}*
Phone: *{phone}*
Work profile: *{work_profile}*
Description: {description}
Issue date: {date_of_issue}
Commitment: {commitment_date}

Please confirm. Thank you!`;

export const WO_REQUEST_TEMPLATE_VARIABLES = [
  "{party_name}",
  "{phone}",
  "{company_name}",
  "{request_no}",
  "{work_profile}",
  "{description}",
  "{date_of_issue}",
  "{commitment_date}",
] as const;
