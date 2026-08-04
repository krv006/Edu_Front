function getBrowserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

/** localStorage o‘chirilgan / private rejimda ham xato tashlamaydigan o‘ram. */
export const storage = {
  get(key: string, fallback: string | null = null): string | null {
    try {
      const value = getBrowserStorage()?.getItem(key);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },

  getJson<T>(key: string, fallback: T | null = null): T | null {
    const value = this.get(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: string | number | boolean): boolean {
    try {
      getBrowserStorage()?.setItem(key, String(value));
      return true;
    } catch {
      return false;
    }
  },

  setJson(key: string, value: unknown): boolean {
    return this.set(key, JSON.stringify(value));
  },

  remove(key: string): boolean {
    try {
      getBrowserStorage()?.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
