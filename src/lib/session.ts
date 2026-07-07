const SESSION_KEY = "nirmiti_session";

export function isLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLoggedIn(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
