function getBrowserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export const storage = {
  get(key, fallback = null) {
    try {
      const value = getBrowserStorage()?.getItem(key);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },

  getJson(key, fallback = null) {
    const value = this.get(key);
    if (value === null) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      getBrowserStorage()?.setItem(key, String(value));
      return true;
    } catch {
      return false;
    }
  },

  setJson(key, value) {
    return this.set(key, JSON.stringify(value));
  },

  remove(key) {
    try {
      getBrowserStorage()?.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
