// Simple in-memory cache for optimizations. Useful for Vercel edge/serverless caching across a short lifespan.
// In a full production scenario, consider Redis or Supabase edge caching.

const CACHE = new Map<string, any>();

export function getCache(key: string) {
    return CACHE.get(key);
}

export function setCache(key: string, value: any) {
    CACHE.set(key, value);
}
