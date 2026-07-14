export { TERMS_AND_CONDITIONS } from "./termsAndConditions";
export { PRIVACY_POLICY } from "./privacyPolicy";

export const LEGAL_META = {
  companyName: "Sankalp Enterprises",
  effectiveDate: "July 14, 2026",
  lastUpdated: "July 14, 2026",
  customerCareEmail: "customercare01@sankalpenterprises.info",
  grievanceAddress: "Ashoknagar, Baramati, Maharashtra, India",
} as const;

export type LegalDocumentTab = "terms" | "privacy";