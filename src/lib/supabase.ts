import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __SUPABASE_CLIENT__?: SupabaseClient | null;
  }
}

const getStoredSupabaseConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  try {
    const customUrl = localStorage.getItem('rw_supabase_url');
    const customKey = localStorage.getItem('rw_supabase_anon_key');

    // Wajib diakses secara statis tanpa (import.meta as any) agar Vite membacanya
    const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    return {
      url: (customUrl || envUrl || '').trim(),
      key: (customKey || envKey || '').trim(),
    };
  } catch {
    return { url: '', key: '' };
  }
};

const isValidUrl = (urlString: string): boolean => {
  if (!urlString || !urlString.startsWith('https://')) return false;
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const cfg = getStoredSupabaseConfig();
  return Boolean(isValidUrl(cfg.url) && cfg.key);
};

export const getSupabase = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null;

  const cfg = getStoredSupabaseConfig();
  if (!isSupabaseConfigured()) {
    window.__SUPABASE_CLIENT__ = null;
    return null;
  }

  if (window.__SUPABASE_CLIENT__) {
    return window.__SUPABASE_CLIENT__;
  }

  try {
    window.__SUPABASE_CLIENT__ = createClient(cfg.url, cfg.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        isSingleton: true,
      },
    });
    return window.__SUPABASE_CLIENT__;
  } catch (err) {
    console.error('Gagal menginisialisasi client Supabase:', err);
    window.__SUPABASE_CLIENT__ = null;
    return null;
  }
};

// Helper proxy rekursif untuk menangani method chaining tanpa membuat aplikasi crash
const createDummyChain = (): any => {
  const dummyFn = () => createDummyChain();
  // Mengembalikan Promise yang bisa di-then/catch sekaligus berlanjut chaining-nya
  return new Proxy(dummyFn, {
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: Function) =>
          resolve({
            data: null,
            error: new Error('Supabase URL/Key belum dikonfigurasi.'),
          });
      }
      return createDummyChain();
    },
  });
};

// Proxy utama yang dipanggil oleh komponen
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    const client = getSupabase();
    if (!client) {
      console.warn(
        '⚠️ Supabase belum dikonfigurasi! Periksa file .env atau simpan URL/Key di settings.'
      );
      return createDummyChain();
    }
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('rw_supabase_url', url.trim());
      localStorage.setItem('rw_supabase_anon_key', key.trim());
    } catch (e) {
      console.warn('Gagal menyimpan konfigurasi Supabase:', e);
    }
    window.__SUPABASE_CLIENT__ = null;
    getSupabase();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('rw_supabase_url');
      localStorage.removeItem('rw_supabase_anon_key');
    } catch (e) {
      console.warn('Gagal menghapus konfigurasi Supabase:', e);
    }
    window.__SUPABASE_CLIENT__ = null;
  }
};
