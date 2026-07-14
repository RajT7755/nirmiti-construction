import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import type { LegalDocumentTab } from "@/content/legal";
import {
  AuthTermsAcceptance,
  LegalDocumentsModal,
  LoginAboutModal,
  LoginCornerBranding,
} from "@/components/auth/LoginAboutModal";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

export function Registration({
  businessProfile,
  onRegister,
  onBackToLogin,
}: {
  businessProfile?: Partial<BusinessProfileData> | null;
  onRegister: (input: {
    userId: string;
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onBackToLogin: () => void;
}) {
  const resolvedProfile = resolveBusinessProfile(businessProfile);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalDocumentTab>("terms");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function openLegal(tab: LegalDocumentTab) {
    setLegalTab(tab);
    setShowLegal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please read and accept the Terms and Conditions and Privacy Policy.");
      return;
    }
    if (!userId.trim() || !fullName.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onRegister({
        userId: userId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white";
  const labelClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5";

  return (
    <div className="min-h-screen flex relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-6">
        <LoginCornerBranding
          businessProfile={businessProfile}
          onAboutClick={() => setShowAbout(true)}
          variant="dark"
        />
      </div>

      {showAbout && (
        <LoginAboutModal
          businessProfile={resolvedProfile}
          onClose={() => setShowAbout(false)}
          onOpenPrivacy={() => openLegal("privacy")}
        />
      )}

      {showLegal && (
        <LegalDocumentsModal initialTab={legalTab} onClose={() => setShowLegal(false)} />
      )}

      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden"
        style={{ background: "#0f1a35" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, #2563eb 0%, transparent 60%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            Create your CMS account to get started.
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f0f2f7] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1a35] leading-tight">
                Create your CMS account to get started.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>User ID</label>
                <input
                  className={inputClass}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. admin01"
                />
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className={`${inputClass} pr-10`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <AuthTermsAcceptance
                accepted={acceptedTerms}
                onAcceptedChange={setAcceptedTerms}
                onOpenLegal={openLegal}
              />

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full text-sm text-gray-500 hover:text-blue-600 py-2"
              >
                Already have an account? Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}