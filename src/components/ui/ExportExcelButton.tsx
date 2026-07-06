import { Download } from "lucide-react";
import { downloadExcel } from "@/lib/export/excel";

interface ExportExcelButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  label?: string;
}

export function ExportExcelButton({ filename, headers, rows, label = "Export to Excel" }: ExportExcelButtonProps) {
  return (
    <button
      onClick={() => downloadExcel(filename, headers, rows)}
      className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Download size={14} /> {label}
    </button>
  );
}
