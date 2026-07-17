import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getLoginLogoUrl } from "@/lib/auth/loginLogo";
import { DEFAULT_LOGO_SRC } from "@/lib/branding/defaultBrand";
import {
  LEGAL_META,
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
  type LegalDocumentTab,
} from "@/content/legal";
import { LOGIN_ABOUT_CUSTOMER_CARE_EMAIL } from "@/lib/settings/defaultSettings";
import { resolveCompanyName, resolveTagline } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

function ModalShell({
  title,
  titleId,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-[#0f1a35]/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border border-white/30 bg-white shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 id={titleId} className="text-base font-bold text-[#0f1a35]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

function useBodyScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

export function LoginAboutModal({
  businessProfile,
  onClose,
  onOpenPrivacy,
}: {
  businessProfile: BusinessProfileData;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [logoSrc, setLogoSrc] = useState(() => getLoginLogoUrl(businessProfile) || DEFAULT_LOGO_SRC);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogoSrc(getLoginLogoUrl(businessProfile) || DEFAULT_LOGO_SRC);
  }, [businessProfile]);

  useBodyScrollLock();

  if (!mounted) return null;

  const companyName = resolveCompanyName(businessProfile);
  const tagline = resolveTagline(businessProfile);
  const addressLine = [businessProfile.address, businessProfile.city, businessProfile.state, businessProfile.pinCode]
    .filter(Boolean)
    .join(", ");

  const rows = [
    { label: "Customer Care", value: LOGIN_ABOUT_CUSTOMER_CARE_EMAIL },
    { label: "Phone", value: businessProfile.phone },
    { label: "Website", value: businessProfile.website },
    { label: "GSTIN", value: businessProfile.gstin },
    { label: "PAN", value: businessProfile.pan },
  ].filter((r) => r.value?.trim());

  return (
    <ModalShell title="About Us" titleId="login-about-title" onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex flex-col items-center text-center gap-3 pb-2">
          <div className="w-28 h-28 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-center p-2">
            <img
              src={logoSrc}
              alt={companyName || "Sankalp logo"}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onError={() => {
                if (logoSrc !== DEFAULT_LOGO_SRC) setLogoSrc(DEFAULT_LOGO_SRC);
              }}
            />
          </div>
          <div>
            <p className="text-base font-bold text-[#0f1a35]">{companyName}</p>
            {tagline && <p className="text-xs text-gray-500 mt-0.5">{tagline}</p>}
          </div>
        </div>

        {addressLine && <p className="text-sm text-gray-600 leading-relaxed text-center">{addressLine}</p>}

        {rows.length > 0 && (
          <dl className="space-y-2 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex gap-2">
                <dt className="text-gray-400 w-24 shrink-0">{row.label}</dt>
                <dd className="text-gray-700 font-medium break-all">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {onOpenPrivacy && (
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrivacy();
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Privacy Policy
            </button>
          </p>
        )}
      </div>
    </ModalShell>
  );
}

export function LegalDocumentsModal({
  onClose,
  initialTab = "terms",
}: {
  onClose: () => void;
  initialTab?: LegalDocumentTab;
}) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<LegalDocumentTab>(initialTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useBodyScrollLock();

  if (!mounted) return null;

  const content = tab === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;

  return (
    <ModalShell title="Legal Documents" titleId="legal-documents-title" onClose={onClose} wide>
      <div className="px-5 pt-4 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("terms")}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              tab === "terms"
                ? "bg-white text-[#0f1a35] border border-gray-200 border-b-white -mb-px"
                : "text-gray-500 hover:text-[#0f1a35]"
            }`}
          >
            Terms and Conditions
          </button>
          <button
            type="button"
            onClick={() => setTab("privacy")}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              tab === "privacy"
                ? "bg-white text-[#0f1a35] border border-gray-200 border-b-white -mb-px"
                : "text-gray-500 hover:text-[#0f1a35]"
            }`}
          >
            Privacy Policy
          </button>
        </div>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <p className="text-[10px] text-gray-400 mb-3">
          Last updated: {LEGAL_META.lastUpdated}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </ModalShell>
  );
}

export function AuthTermsAcceptance({
  accepted,
  onAcceptedChange,
  onOpenLegal,
}: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onOpenLegal: (tab: LegalDocumentTab) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 text-xs text-gray-600 select-none">
      <input
        id="auth-terms-checkbox"
        type="checkbox"
        checked={accepted}
        onChange={(e) => onAcceptedChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-300 cursor-pointer"
      />
      <label htmlFor="auth-terms-checkbox" className="leading-relaxed cursor-pointer">
        I have read and agree to the{" "}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onOpenLegal("terms");
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Terms and Conditions
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onOpenLegal("privacy");
          }}
          className="text-blue-600 hover:underline font-semibold"
        >
          Privacy Policy
        </button>
      </label>
    </div>
  );
}

export function LoginCornerBranding({
  businessProfile,
  onAboutClick,
  variant = "dark",
}: {
  businessProfile?: Partial<BusinessProfileData> | null;
  onAboutClick: () => void;
  variant?: "dark" | "light";
}) {
  const [logo, setLogo] = useState(() => getLoginLogoUrl(businessProfile) || DEFAULT_LOGO_SRC);
  const aboutClass =
    variant === "dark"
      ? "text-gray-500 hover:text-[#0f1a35] lg:text-blue-300/70 lg:hover:text-blue-200"
      : "text-gray-500 hover:text-[#0f1a35]";

  useEffect(() => {
    setLogo(getLoginLogoUrl(businessProfile) || DEFAULT_LOGO_SRC);
  }, [businessProfile]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <img
        src={logo}
        alt="Company logo"
        className="w-11 h-11 rounded-lg object-contain bg-white/95 p-1 shadow-sm border border-white/20"
        onError={() => {
          if (logo !== DEFAULT_LOGO_SRC) setLogo(DEFAULT_LOGO_SRC);
        }}
      />
      <button
        type="button"
        onClick={onAboutClick}
        className={`text-[10px] font-semibold uppercase tracking-widest hover:underline transition-colors ${aboutClass}`}
      >
        About Us
      </button>
    </div>
  );
}