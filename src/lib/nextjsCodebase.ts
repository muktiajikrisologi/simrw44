import { getSupabase } from './supabase';

export interface NextjsFile {
  path: string;
  content: string;
}

// Fungsi ekspor yang aman (memakai getSupabase)
export function createClient() {
  return getSupabase();
}

export const NEXTJS_PROJECT_FILES: NextjsFile[] = [
  {
    path: 'lib/supabase.ts',
    content: `import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);`,
  },
];