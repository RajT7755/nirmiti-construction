import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export function ViewAllWorkOrdersButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant="outline"
      className={`shrink-0 text-xs !px-3 !py-1.5 ${className}`}
      onClick={() => navigate("/inventory/work-orders/all")}
    >
      View all
    </Button>
  );
}
