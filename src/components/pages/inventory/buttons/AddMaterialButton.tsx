import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

/** Navigates to Add Material form path (form UI designed next). */
export function AddMaterialButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="primary"
      className={`shrink-0 ${className}`}
      onClick={() => navigate("/inventory/materials/add")}
    >
      <Plus size={16} />
      Add Material
    </Button>
  );
}
