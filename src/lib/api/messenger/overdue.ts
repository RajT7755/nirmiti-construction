import { buildOverdueRecipients } from "@/lib/messenger/overdueRecipients";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { whatsappBulkApi, type WhatsAppBulkRecipient } from "../whatsapp/whatsappBulk";

export const messengerOverdueApi = {
  sendReminders: (input: {
    template: string;
    templateName: string;
    profiles: CustomerDetailProfile[];
  }) => {
    const built = buildOverdueRecipients(input.profiles, input.template);
    const recipients: WhatsAppBulkRecipient[] = built.map((r) => ({
      customerId: r.id,
      phone: r.phone,
      variables: {
        owner_name: r.name,
        flat_name: r.flat,
        due_amount: `₹${r.dueAmount.toLocaleString("en-IN")}`,
        current_slab: r.currentSlab,
        project: r.project,
      },
    }));

    return whatsappBulkApi.sendBulk({
      templateName: input.templateName,
      recipients,
    });
  },
};