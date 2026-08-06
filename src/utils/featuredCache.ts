const KEY = 'featured_talents';
const store = new Map<string, any>();

export const getCachedFeaturedTalents = (): any[] | null => {
  if (store.has(KEY)) return store.get(KEY);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      store.set(KEY, data);
      return data;
    }
  } catch {}
  return null;
};

export const setCachedFeaturedTalents = (data: any[]) => {
  store.set(KEY, data);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
};

export const clearCachedFeaturedTalents = () => {
  store.delete(KEY);
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
};
