import { ChevronDown, ChevronUp } from "lucide-react";
import type { BookedFlatsSummary } from "@/lib/customers/customerDetailTypes";

interface TemporaryBookingCardProps {
  summary: BookedFlatsSummary;
  onViewTemporary?: () => void;
  onOpenGrid?: () => void;
  gridOpen?: boolean;
}

export function TemporaryBookingCard({
  summary,
  onViewTemporary,
  onOpenGrid,
  gridOpen = false,
}: TemporaryBookingCardProps) {
  const { total, temporary, confirmed } = summary;

  return (
    <button
      type="button"
      onClick={onOpenGrid}
      className="bg-white rounded-xl p-4 border border-green-200 shadow-sm flex flex-col justify-center relative overflow-hidden text-left w-full hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full" />
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Booked Flats</p>
      <p className="text-2xl font-bold text-green-600">{total}</p>
      <p className="text-[11px] text-gray-500 mt-1">
        <span className="text-orange-600 font-semibold">{temporary} temporary</span>
        {" · "}
        <span className="text-green-600 font-semibold">{confirmed} confirmed</span>
      </p>
      <p className="text-[10px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
        {gridOpen ? (
          <>
            <ChevronUp size={12} /> Hide flat grid
          </>
        ) : (
          <>
            <ChevronDown size={12} /> View flat grid
          </>
        )}
      </p>
      {temporary > 0 && onViewTemporary && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onViewTemporary();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onViewTemporary();
            }
          }}
          className="text-[10px] text-orange-600 font-semibold mt-1 hover:underline"
        >
          View temporary bookings →
        </span>
      )}
    </button>
  );
}