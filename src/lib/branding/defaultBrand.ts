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