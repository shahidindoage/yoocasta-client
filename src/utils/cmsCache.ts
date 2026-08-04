const store = new Map<string, any>();

export const getCachedCms = (key: string): any | null => {
  if (store.has(key)) return store.get(key);
  try {
    const raw = sessionStorage.getItem(`cms_${key}`);
    if (raw) {
      const data = JSON.parse(raw);
      store.set(key, data);
      return data;
    }
  } catch {}
  return null;
};

export const setCachedCms = (key: string, data: any) => {
  store.set(key, data);
  try {
    sessionStorage.setItem(`cms_${key}`, JSON.stringify(data));
  } catch {}
};
