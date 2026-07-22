import defaultLogo from "@/imports/sankalplogo.jpg";

export const DEFAULT_COMPANY_NAME = "Nirmiti Developers";
export const DEFAULT_TAGLINE = "Construction Management";
export const DEFAULT_SHORT_NAME = "Nirmiti";
export const DEFAULT_LOGO_SRC = defaultLogo;

/** PNG and JPEG logos (file upload or stored data URL). */
export const ACCEPTED_LOGO_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"] as const;

export type AcceptedLogoMime = (typeof ACCEPTED_LOGO_MIME_TYPES)[number];

export function isAcceptedLogoFile(file: File): boolean {
  return ACCEPTED_LOGO_MIME_TYPES.includes(file.type as AcceptedLogoMime);
}

export function readLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isAcceptedLogoFile(file)) {
      reject(new Error("Logo must be PNG or JPEG"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read logo"));
    reader.readAsDataURL(file);
  });
}

/** Digital signature — PNG, JPEG, or WebP (photo of sign / transparent PNG). */
export const ACCEPTED_DIGITAL_SIGN_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export type AcceptedDigitalSignMime = (typeof ACCEPTED_DIGITAL_SIGN_MIME_TYPES)[number];

/** Max size for stored signature data URL (localStorage-friendly). */
export const DIGITAL_SIGN_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function isAcceptedDigitalSignFile(file: File): boolean {
  return ACCEPTED_DIGITAL_SIGN_MIME_TYPES.includes(
    file.type as AcceptedDigitalSignMime
  );
}

export function readDigitalSignDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isAcceptedDigitalSignFile(file)) {
      reject(new Error("Digital sign must be PNG, JPEG, or WebP"));
      return;
    }
    if (file.size > DIGITAL_SIGN_MAX_BYTES) {
      reject(new Error("Digital sign must be 2 MB or smaller"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read digital sign"));
    reader.readAsDataURL(file);
  });
}