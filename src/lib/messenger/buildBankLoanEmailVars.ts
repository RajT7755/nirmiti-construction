import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { renderWhatsAppTemplate } from "./templates/renderTemplate";
import {
  EMAIL_BANK_LOAN_BODY_DEFAULT,
  EMAIL_BANK_LOAN_SUBJECT_DEFAULT,
} from "./templates/emailBankLoanApproval";

export function buildBankLoanEmailVariables(
  customer: CustomerDetailProfile,
  companyName: string
): Record<string, string> {
  return {
    company_name: companyName || "Company",
    customer_name: customer.name,
    flat_name: customer.flat,
    project: customer.project,
    customer_phone: customer.phone || "—",
    customer_email: customer.email || "—",
    bank_name: customer.bankName || "—",
    branch_name: customer.branchName || "—",
    bank_address: customer.bankAddress || "—",
    loan_amount:
      typeof customer.loanAmount === "number"
        ? `₹${customer.loanAmount.toLocaleString("en-IN")}`
        : "—",
    current_slab: customer.currentSlabLabel || "—",
    bank_email: customer.bankEmail || "—",
  };
}

export function renderBankLoanEmail(
  customer: CustomerDetailProfile,
  companyName: string,
  subjectTemplate: string = EMAIL_BANK_LOAN_SUBJECT_DEFAULT,
  bodyTemplate: string = EMAIL_BANK_LOAN_BODY_DEFAULT
): { subject: string; body: string; variables: Record<string, string> } {
  const variables = buildBankLoanEmailVariables(customer, companyName);
  return {
    subject: renderWhatsAppTemplate(subjectTemplate, variables),
    body: renderWhatsAppTemplate(bodyTemplate, variables),
    variables,
  };
}

/** Loan customers eligible for bank approval email. */
export function isLoanCustomer(c: CustomerDetailProfile): boolean {
  return c.loanStatus === "Yes" || c.loanStatus === "Maybe";
}
