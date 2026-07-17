import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

/** Returns to inventory home (`/inventory`) with KPI cards + activity tabs. */
export function BackToInventoryButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="outline"
      className={`shrink-0 ${className}`}
      onClick={() => navigate("/inventory")}
    >
      <ArrowLeft size={16} />
      Back to Inventory
    </Button>
  );
}
