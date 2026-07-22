import { useCallback, useEffect, useState } from "react";
import { Building2, Lock, Upload } from "lucide-react";
import { readDigitalSignDataUrl, readLogoDataUrl } from "@/lib/branding/defaultBrand";
import { resolveLogoUrl } from "@/lib/settings/defaultSettings";
import { EditButton } from "@/components/ui/EditButton";
import { ToastBanner } from "@/components/ui/ToastBanner";
import type { BusinessProfileData } from "@/lib/settings/settingsTypes";

export function BusinessProfileSettings({
  profile,
  canEdit,
  onSave,
}: {
  profile: BusinessProfileData;
  canEdit: boolean;
  onSave: (patch: Partial<BusinessProfileData>) => Promise<boolean>;
}) {
  const [form, setForm] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [signError, setSignError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const isEditing = canEdit && editing;
  const fieldsDisabled = !isEditing;
  const signSrc = form.digitalSignUrl?.trim() || "";

  useEffect(() => setForm(profile), [profile]);

  const dismissToast = useCallback(() => setToast(null), []);

  function setField<K extends keyof BusinessProfileData>(key: K, value: BusinessProfileData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogoChange(file: File | null) {
    if (!file) return;
    setLogoError("");
    try {
      const dataUrl = await readLogoDataUrl(file);
      setField("logoUrl", dataUrl);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Invalid logo file");
    }
  }

  async function handleDigitalSignChange(file: File | null) {
    if (!file) return;
    setSignError("");
    try {
      const dataUrl = await readDigitalSignDataUrl(file);
      setField("digitalSignUrl", dataUrl);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Invalid digital sign file");
    }
  }

  function handleCancel() {
    setForm(profile);
    setEditing(false);
    setSaveError("");
    setLogoError("");
    setSignError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEditing) return;
    setSaveError("");
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) {
      setToast("Business Profile saved successfully");
      setEditing(false);
    } else {
      setSaveError("Could not save Business Profile. Please try again.");
    }
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white";
  const labelClass =
    "text-[11px] font-semibold text-gray-500 uppercase tracking-widest block mb-1.5";
  const lockedInputClass = `${inputClass} opacity-70 cursor-not-allowed`;

  return (
    <>
      <ToastBanner message={toast} onClose={dismissToast} />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <h3 className="text-base font-semibold text-[#0f1a35] flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" /> Business Profile
          </h3>
          {canEdit && !editing && <EditButton onClick={() => setEditing(true)} />}
        </div>

        {!canEdit && profile.ownerEmail && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
            <Lock size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm">
              Only the registered owner (<strong>{profile.ownerEmail}</strong>) can edit Business Profile.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
          <div className="flex flex-wrap items-start gap-4">
            <img
              src={resolveLogoUrl(form.logoUrl)}
              alt={form.companyName}
              className="w-20 h-20 rounded-xl object-contain border border-gray-100 bg-white p-1"
            />
            <div>
              <h3 className="text-sm font-semibold text-[#0f1a35]">Company Logo</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                PNG or JPEG. Used on sidebar, login, and invoices.
              </p>
              {isEditing && (
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload size={14} />
                  Upload logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
              {logoError && <p className="text-xs text-red-600 mt-2">{logoError}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <div className="w-40 h-20 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
              {signSrc ? (
                <img
                  src={signSrc}
                  alt="Digital signature"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-400 text-center px-2">No signature</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0f1a35]">Digital signature</h3>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                PNG, JPEG, or WebP (max 2 MB). Used as authorised signature on PO, WO, invoice,
                and payment receipt.
              </p>
              {isEditing && (
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload size={14} />
                    Upload digital sign
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleDigitalSignChange(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {signSrc && (
                    <button
                      type="button"
                      onClick={() => {
                        setField("digitalSignUrl", "");
                        setSignError("");
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
              {signError && <p className="text-xs text-red-600 mt-2">{signError}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["companyName", "Company Name"],
              ["tagline", "Tagline"],
              ["address", "Address", true],
              ["city", "City"],
              ["state", "State"],
              ["pinCode", "PIN Code"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["website", "Website"],
              ["gstin", "GSTIN"],
              ["pan", "PAN"],
              ["bankName", "Bank Name"],
              ["accountNo", "Account No"],
              ["ifsc", "IFSC"],
            ] as const
          ).map(([key, label, fullWidth]) => (
            <div key={key} className={fullWidth ? "md:col-span-2" : undefined}>
              <label className={labelClass}>{label}</label>
              <input
                className={fieldsDisabled ? lockedInputClass : inputClass}
                disabled={fieldsDisabled}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}

        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Business Profile"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}