import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { clearSession } from "@/lib/session";

type LogoutVariant = "topbar" | "sidebar";

const VARIANTS: Record<LogoutVariant, string> = {
  topbar:
    "inline-flex items-center gap-1.5 pl-3 border-l border-gray-200 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors",
  sidebar:
    "w-full flex items-center justify-center gap-1.5 mt-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-200/80 border border-white/10 hover:bg-white/5 hover:text-white transition-colors",
};

export function LogoutButton({ variant = "topbar" }: { variant?: LogoutVariant }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/logout", { replace: true });
  }

  return (
    <button type="button" onClick={handleLogout} className={VARIANTS[variant]}>
      <LogOut size={variant === "topbar" ? 14 : 12} />
      Logout
    </button>
  );
}