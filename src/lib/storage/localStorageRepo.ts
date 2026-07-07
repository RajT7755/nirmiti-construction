import { STORE_KEY } from "./storeKeys";
import type { AppStore } from "./storeTypes";
import { createSeedStore } from "./seedStore";

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const seed = createSeedStore();
      saveStore(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as AppStore;
    if (parsed.version !== 1) {
      const seed = createSeedStore();
      saveStore(seed);
      return seed;
    }
    return parsed;
  } catch {
    const seed = createSeedStore();
    saveStore(seed);
    return seed;
  }
}

export function saveStore(store: AppStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function resetStore(): AppStore {
  const seed = createSeedStore();
  saveStore(seed);
  return seed;
}