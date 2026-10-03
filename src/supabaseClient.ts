import { getSupabase } from './lib/supabase';

// Menggunakan getter agar client tidak langsung dieksekusi saat module di-import
export const supabase = {
  get auth() {
    return getSupabase()?.auth;
  },
  get from() {
    const client = getSupabase();
    return client ? client.from.bind(client) : (() => ({} as any));
  },
};

export default getSupabase;