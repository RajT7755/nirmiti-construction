import { useState } from "react";
import { Download } from "lucide-react";
import { paymentLogExportApi } from "@/lib/api/sales/paymentLogExport";
import { downloadPaymentLogExcel } from "@/lib/sales/downloadPaymentLogExcel";
import type { Invoice, ReceivedPayment } from "@/lib/types";

const USE_API = import.meta.env.VITE_USE_API === "true";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPaymentLogButton({
  payments,
  invoices,
  disabled = false,
}: {
  payments: ReceivedPayment[];
  invoices: Invoice[];
  disabled?: boolean;
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (payments.length === 0) return;
    setExporting(true);
    try {
      if (USE_API) {
        const blob = await paymentLogExportApi.downloadExcel();
        const dateStamp = new Date().toISOString().slice(0, 10);
        triggerBlobDownload(blob, `payment-log-${dateStamp}.xlsx`);
      } else {
        downloadPaymentLogExcel(payments, invoices);
      }
    } catch (err) {
      console.error("Payment log export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || payments.length === 0 || exporting}
      className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={12} />
      {exporting ? "Exporting…" : "Export Excel"}
    </button>
  );
}