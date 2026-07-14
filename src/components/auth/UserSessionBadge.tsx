import { Link } from "react-router";
import type { ProfileSettingsData } from "@/lib/settings/settingsTypes";

function initials(profile: ProfileSettingsData): string {
  const source = profile.fullName?.trim() || profile.userId?.trim() || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserSessionBadge({
  profile,
  variant = "topbar",
}: {
  profile: ProfileSettingsData;
  variant?: "topbar" | "sidebar";
}) {
  const displayName = profile.fullName?.trim() || profile.userId || "User";
  const userId = profile.userId?.trim();

  if (variant === "sidebar") {
    return (
      <Link
        to="/settings/profile"
        className="flex items-center gap-3 rounded-lg hover:bg-white/5 transition-colors p-1 -m-1"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials(profile)}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold truncate">{displayName}</div>
          {userId && (
            <div className="text-blue-300/60 text-[10px] truncate">ID: {userId}</div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/settings/profile"
      className="flex items-center gap-2 pl-3 border-l border-gray-200 hover:opacity-80 transition-opacity"
      title={userId ? `User ID: ${userId}` : undefined}
    >
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
        {initials(profile)}
      </div>
      <div className="text-left min-w-0 hidden sm:block">
        <div className="text-sm text-gray-700 font-medium truncate max-w-[120px]">{displayName}</div>
        {userId && <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{userId}</div>}
      </div>
    </Link>
  );
}