/**
 * Global message template defaults + variables.
 * Edit individual files under this folder; settings store can override at runtime.
 * Email templates are separate from WhatsApp.
 */
export { renderWhatsAppTemplate } from "./renderTemplate";
export {
  WA_SLAB_TEMPLATE_DEFAULT,
  SLAB_TEMPLATE_VARIABLES,
} from "./slabSchedule";
export {
  WA_OVERDUE_TEMPLATE_DEFAULT,
  OVERDUE_TEMPLATE_VARIABLES,
} from "./overdue";
export {
  WA_PO_REQUEST_TEMPLATE_DEFAULT,
  PO_REQUEST_TEMPLATE_VARIABLES,
} from "./poRequest";
export {
  WA_WO_REQUEST_TEMPLATE_DEFAULT,
  WO_REQUEST_TEMPLATE_VARIABLES,
} from "./workOrderRequest";
export {
  WA_CUSTOMER_BROADCAST_TEMPLATE_DEFAULT,
  CUSTOMER_BROADCAST_TEMPLATE_VARIABLES,
} from "./customerBroadcast";
export {
  EMAIL_BANK_LOAN_SUBJECT_DEFAULT,
  EMAIL_BANK_LOAN_BODY_DEFAULT,
  EMAIL_BANK_LOAN_VARIABLES,
} from "./emailBankLoanApproval";

