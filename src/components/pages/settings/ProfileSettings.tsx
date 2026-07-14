import { useEffect, useState } from "react";
import { Camera, Shield, User } from "lucide-react";
import type { ProfileSettingsData } from "@/lib/settings/settingsTypes";

export function ProfileSettings({
  profile,
  onSave,
}: {
  profile: ProfileSettingsData;
  onSave: (patch: Partial<ProfileSettingsData> & { password?: string }) => Promise<boolean>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFullName(profile.fullName);
    setEmail(profile.email);
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSaving(true);
    const ok = await onSave({
      fullName,
      email,
      ...(password ? { password } : {}),
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white";
  const labelClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-blue-50 border-4 border-white shadow flex items-center justify-center text-2xl font-bold text-blue-600">
              {(fullName || profile.userId || "U").charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              className="absolute bottom-1 right-0 bg-blue-600 text-white p-2 rounded-full shadow"
              aria-label="Update photo"
            >
              <Camera size={14} />
            </button>
          </div>
          <h3 className="text-base font-semibold text-[#0f1a35]">{fullName || "User"}</h3>
          <p className="text-sm text-gray-500">{email || profile.email}</p>
          <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
            Active Status
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6"
      >
        <section>
          <h3 className="text-sm font-semibold text-[#0f1a35] flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <User size={16} className="text-blue-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>User ID</label>
              <input className={`${inputClass} bg-gray-50`} value={profile.userId} readOnly />
              <p className="text-[10px] text-gray-400 mt-1">Assigned at registration.</p>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#0f1a35] flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <Shield size={16} className="text-blue-600" /> Security Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved" : "Submit Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}