import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RequestWorkOrderButton({
  label = "Add work request",
  variant = "primary",
  className = "",
}: {
  label?: string;
  variant?: "primary" | "outline" | "secondary" | "ghost" | "danger";
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant={variant}
      className={`gap-1.5 shrink-0 ${className}`}
      onClick={() => navigate("/inventory/work-orders/request")}
    >
      <Plus size={16} />
      {label}
    </Button>
  );
}
