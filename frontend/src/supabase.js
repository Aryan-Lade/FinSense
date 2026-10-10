import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

<<<<<<< HEAD
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabaseClient = () => supabase;
=======
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase client instance (initialized if credentials provided)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch bills/invoices directly from Supabase if configured,
 * otherwise fall back gracefully.
 */
export async function fetchSupabaseInvoices() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('invoices')
    .select('*, suppliers(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase fetch error:', error);
    return null;
  }
  return data;
}

/**
 * Upload a file directly to Supabase storage bucket.
 */
export async function uploadToSupabaseBucket(file, bucket = 'finsense-files') {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { path: filePath, url: publicUrl };
}
>>>>>>> main
