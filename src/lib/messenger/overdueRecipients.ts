import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { renderWhatsAppTemplate } from "./messageTemplates";

export interface OverdueMessageRecipient {
  id: string;
  name: string;
  flat: string;
  project: string;
  phone: string;
  currentSlab: string;
  dueAmount: number;
  previewMessage: string;
}

export function filterOverdueProfiles(profiles: CustomerDetailProfile[]): CustomerDetailProfile[] {
  return profiles.filter((p) => p.status === "overdue");
}

export function estimateOverdueAmount(profile: CustomerDetailProfile): number {
  const flatCategory = profile.categories.find((c) => c.key === "flat");
  if (flatCategory && flatCategory.remaining > 0) return flatCategory.remaining;
  return Math.round(profile.amount * 0.1);
}

export function buildOverdueRecipients(
  profiles: CustomerDetailProfile[],
  template: string
): OverdueMessageRecipient[] {
  return filterOverdueProfiles(profiles).map((p) => {
    const dueAmount = estimateOverdueAmount(p);
    const previewMessage = renderWhatsAppTemplate(template, {
      owner_name: p.name,
      flat_name: p.flat,
      due_amount: `₹${dueAmount.toLocaleString("en-IN")}`,
      current_slab: p.currentSlabLabel,
      project: p.project,
    });
    return {
      id: p.id,
      name: p.name,
      flat: p.flat,
      project: p.project,
      phone: p.phone,
      currentSlab: p.currentSlabLabel,
      dueAmount,
      previewMessage,
    };
  });
}