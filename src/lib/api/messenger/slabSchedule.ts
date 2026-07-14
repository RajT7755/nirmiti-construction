import { buildSlabScheduleRecipients } from "@/lib/messenger/slabScheduleRecipients";
import type { Customer, SlabEntry } from "@/lib/types";
import { whatsappBulkApi, type WhatsAppBulkRecipient } from "../whatsapp/whatsappBulk";

export const messengerSlabScheduleApi = {
  sendReminders: (input: {
    template: string;
    templateName: string;
    slab: SlabEntry;
    customers: Customer[];
  }) => {
    const recipients: WhatsAppBulkRecipient[] = buildSlabScheduleRecipients(
      input.customers,
      input.slab,
      input.template
    ).map((r) => ({
      customerId: r.id,
      phone: r.phone,
      variables: {
        owner_name: r.name,
        flat_name: r.flat,
        payment_value: `₹${r.paymentValue.toLocaleString("en-IN")}`,
        due_date: input.slab.dueDate,
        build_status: input.slab.stage,
      },
    }));

    return whatsappBulkApi.sendBulk({
      templateName: input.templateName,
      slabId: input.slab.id,
      recipients,
    });
  },
};