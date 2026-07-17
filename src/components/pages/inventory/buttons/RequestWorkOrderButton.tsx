import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RequestWorkOrderButton() {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      className="gap-1.5 shrink-0"
      onClick={() => navigate("/inventory/work-orders/request")}
    >
      <Plus size={16} />
      Request Order
    </Button>
  );
}
