/**
 * Email to bank for loan approval — includes current slab.
 * Edit this file to change the global default (or override later via settings).
 */

export const EMAIL_BANK_LOAN_SUBJECT_DEFAULT =
  "Loan approval request — {customer_name} / {flat_name} — {company_name}";

export const EMAIL_BANK_LOAN_BODY_DEFAULT = `Dear Sir/Madam,

We request loan approval for the following customer of {company_name}.

Customer: {customer_name}
Flat / Unit: {flat_name}
Project: {project}
Phone: {customer_phone}
Email: {customer_email}

Bank: {bank_name}
Branch: {branch_name}
Bank address: {bank_address}
Loan amount: {loan_amount}

Current payment slab: {current_slab}

Please process the approval at your earliest convenience.

Regards,
{company_name}`;

export const EMAIL_BANK_LOAN_VARIABLES = [
  "{company_name}",
  "{customer_name}",
  "{flat_name}",
  "{project}",
  "{customer_phone}",
  "{customer_email}",
  "{bank_name}",
  "{branch_name}",
  "{bank_address}",
  "{loan_amount}",
  "{current_slab}",
  "{bank_email}",
] as const;
