const storage = typeof chrome !== "undefined" && chrome.storage?.local;

export function getStorage(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!storage) {
      const result: Record<string, unknown> = {};
      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        result[key] = value ? JSON.parse(value) : undefined;
      });
      resolve(result);
      return;
    }
    storage.get(keys, resolve);
  });
}

export function setStorage(values: Record<string, unknown>): Promise<void> {
  if (!storage) {
    Object.entries(values).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    return Promise.resolve();
  }
  return storage.set(values);
}
