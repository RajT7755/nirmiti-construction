import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { InvoicePrintButton } from "@/components/invoices/InvoicePrintButton";
import type { BusinessProfileData, InvoiceTemplateSettings } from "@/lib/settings/settingsTypes";
import type { Invoice, ReceivedPayment } from "@/lib/types";

export function InvoicePreviewPage({
  invoice,
  payment,
  businessProfile,
  invoiceTemplate,
  previousInvoice,
}: {
  invoice: Invoice | undefined;
  payment: ReceivedPayment | undefined;
  businessProfile: BusinessProfileData;
  invoiceTemplate: InvoiceTemplateSettings;
  previousInvoice?: Invoice;
}) {
  const navigate = useNavigate();

  if (!invoice) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Invoice not found.</p>
        <button
          onClick={() => navigate("/received-payment")}
          className="mt-4 text-sm text-blue-600 font-medium"
        >
          Back to Received Payments
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 print:p-0 print:space-y-0">
      <div className="invoice-no-print flex items-center justify-between">
        <button
          onClick={() => navigate("/received-payment")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f1a35]"
        >
          <ArrowLeft size={16} /> Back to payments
        </button>
        <InvoicePrintButton />
      </div>

      <div id="invoice-print-root">
        <InvoiceDocument
          invoice={invoice}
          payment={payment}
          businessProfile={businessProfile}
          invoiceTemplate={invoiceTemplate}
          previousInvoice={previousInvoice}
        />
      </div>
    </div>
  );
}