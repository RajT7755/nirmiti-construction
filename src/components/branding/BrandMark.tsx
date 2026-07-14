import {
  resolveCompanyName,
  resolveLogoUrl,
  resolveTagline,
} from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

type BrandVariant = "auth" | "form" | "sidebar" | "compact";

export function BrandMark({
  businessProfile,
  variant = "compact",
  showTagline = true,
}: {
  businessProfile?: Partial<BusinessProfileData> | null;
  variant?: BrandVariant;
  showTagline?: boolean;
}) {
  const logo = resolveLogoUrl(businessProfile?.logoUrl);
  const companyName = resolveCompanyName(businessProfile);
  const tagline = resolveTagline(businessProfile);

  if (variant === "auth") {
    return (
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt={companyName}
          className="w-14 h-14 rounded-xl object-contain bg-white p-1"
        />
        <div>
          <div className="text-white text-xl font-bold leading-tight">{companyName}</div>
          {showTagline && (
            <div className="text-blue-300/70 text-sm">{tagline}</div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <img
          src={logo}
          alt={companyName}
          className="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-white p-1"
        />
        <div>
          <div className="text-[#0f1a35] text-lg font-bold leading-tight">{companyName}</div>
          {showTagline && (
            <div className="text-gray-400 text-xs mt-0.5">{tagline}</div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt={companyName}
          className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
        />
        <div>
          <div className="text-white text-sm font-semibold leading-tight">
            {companyName.split(" ")[0]}
          </div>
          {showTagline && (
            <div className="text-blue-300/70 text-[10px] leading-tight">{tagline}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt={companyName}
        className="w-10 h-10 rounded-lg object-contain bg-white p-0.5"
      />
      <div>
        <div className="text-[#0f1a35] text-base font-bold leading-tight">{companyName}</div>
        {showTagline && <div className="text-gray-400 text-xs">{tagline}</div>}
      </div>
    </div>
  );
}