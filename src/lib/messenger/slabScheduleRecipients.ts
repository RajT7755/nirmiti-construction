import type { Customer, SlabEntry } from "@/lib/types";
import { renderWhatsAppTemplate } from "./messageTemplates";

export interface SlabMessageRecipient {
  id: string;
  name: string;
  flat: string;
  phone: string;
  paymentValue: number;
  previewMessage: string;
}

export function slabPaymentForCustomer(customer: Customer, slab: SlabEntry): number {
  return Math.round(customer.amount * slab.percentage / 100);
}

export function buildSlabScheduleRecipients(
  customers: Customer[],
  slab: SlabEntry,
  template: string
): SlabMessageRecipient[] {
  return customers.map((c) => {
    const paymentValue = slabPaymentForCustomer(c, slab);
    const previewMessage = renderWhatsAppTemplate(template, {
      owner_name: c.name,
      flat_name: c.flat,
      payment_value: `₹${paymentValue.toLocaleString("en-IN")}`,
      due_date: slab.dueDate,
      build_status: slab.stage,
    });
    return {
      id: c.id,
      name: c.name,
      flat: c.flat,
      phone: c.phone ?? "",
      paymentValue,
      previewMessage,
    };
  });
}