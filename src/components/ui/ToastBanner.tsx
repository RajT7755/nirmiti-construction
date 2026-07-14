import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export function ToastBanner({
  message,
  onClose,
  durationMs = 3000,
}: {
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-lg bg-green-600/95 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md"
    >
      <CheckCircle2 size={16} className="shrink-0" />
      {message}
    </div>
  );
}