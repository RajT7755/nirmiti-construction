const SESSION_KEY = "nirmiti_session";
const CREDENTIALS_KEY = "nirmiti_credentials";

export interface SessionCredentials {
  username: string;
  password: string;
}

export function isLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLoggedIn(credentials?: SessionCredentials): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
    if (credentials?.username && credentials.password) {
      sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    }
  } catch {
    /* ignore */
  }
}

export function getSessionCredentials(): SessionCredentials | null {
  try {
    const raw = sessionStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionCredentials;
    if (!parsed.username || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function verifySessionCredentials(username: string, password: string): boolean {
  const stored = getSessionCredentials();
  if (!stored) return username.trim().length > 0 && password.length > 0;
  return (
    stored.username.trim().toLowerCase() === username.trim().toLowerCase() &&
    stored.password === password
  );
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CREDENTIALS_KEY);
  } catch {
    /* ignore */
  }
}
