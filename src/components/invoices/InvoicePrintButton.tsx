import { Printer } from "lucide-react";
import "./invoicePrint.css";

export function InvoicePrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 invoice-no-print ${className}`}
    >
      <Printer size={14} /> Print
    </button>
  );
}