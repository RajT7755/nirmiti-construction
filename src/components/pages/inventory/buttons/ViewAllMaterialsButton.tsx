import { List } from "lucide-react";
import { useNavigate } from "react-router";

/** Opens full materials catalog with export. */
export function ViewAllMaterialsButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/inventory/materials/all")}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline ${className}`}
    >
      <List size={14} />
      View all
    </button>
  );
}
