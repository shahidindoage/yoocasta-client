const CACHE_NAME = 'yocasta-videos';

const blobUrlCache = new Map<string, string>();

export const getCachedVideoUrlSync = (url: string): string | null => {
  if (!url) return null;
  if (blobUrlCache.has(url)) return blobUrlCache.get(url) as string;
  return null;
};

export const getCachedVideoUrl = async (url: string): Promise<string> => {
  if (!url) return url;
  if (blobUrlCache.has(url)) return blobUrlCache.get(url) as string;

  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        if (blob.size > 0) {
          const objUrl = URL.createObjectURL(blob);
          blobUrlCache.set(url, objUrl);
          return objUrl;
        }
      }
    }
  } catch {}

  try {
    const res = await fetch(url);
    if (res.ok) {
      const clone = res.clone();
      if ('caches' in window) {
        caches.open(CACHE_NAME).then(cache => cache.put(url, clone)).catch(() => {});
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      blobUrlCache.set(url, objUrl);
      return objUrl;
    }
  } catch {}

  return url;
};
