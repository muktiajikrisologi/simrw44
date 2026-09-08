import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getStoredSupabaseConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  try {
    const customUrl = localStorage.getItem('rw_supabase_url');
    const customKey = localStorage.getItem('rw_supabase_anon_key');
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return {
      url: customUrl || envUrl || '',
      key: customKey || envKey || '',
    };
  } catch {
    return { url: '', key: '' };
  }
};

let cachedClient: SupabaseClient | null = null;
let currentConfig = getStoredSupabaseConfig();

export const isSupabaseConfigured = (): boolean => {
  const cfg = getStoredSupabaseConfig();
  return Boolean(cfg.url && cfg.key && cfg.url.startsWith('https://'));
};

export const getSupabase = (): SupabaseClient | null => {
  const cfg = getStoredSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient || currentConfig.url !== cfg.url || currentConfig.key !== cfg.key) {
    try {
      cachedClient = createClient(cfg.url, cfg.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentConfig = cfg;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return cachedClient;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rw_supabase_url', url.trim());
    localStorage.setItem('rw_supabase_anon_key', key.trim());
    cachedClient = null;
    currentConfig = { url: url.trim(), key: key.trim() };
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rw_supabase_url');
    localStorage.removeItem('rw_supabase_anon_key');
    cachedClient = null;
    currentConfig = { url: '', key: '' };
  }
};
