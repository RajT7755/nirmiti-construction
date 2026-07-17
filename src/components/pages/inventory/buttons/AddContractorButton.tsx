import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export function AddContractorButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant="primary"
      className={`shrink-0 ${className}`}
      onClick={() => navigate("/inventory/contractors/add")}
    >
      <Plus size={16} />
      Add Contractor
    </Button>
  );
}
