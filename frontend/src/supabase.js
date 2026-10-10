import { createClient } from '@supabase/supabase-js';

// Default to user's configured project if environment variables are not set on Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mhxkftnldxziqhydyfbf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjM5NDIsImV4cCI6MjEwNzE5OTk0Mn0.3PSHd6qK3WuhN69gXZhcC_yTmHwmFf5sEwyVTdMe714';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all invoices directly from Supabase.
 */
export async function fetchSupabaseInvoices() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase fetch exception:', e);
    return null;
  }
}

/**
 * Fetch a single invoice by ID directly from Supabase.
 */
export async function fetchSupabaseInvoice(id) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('Supabase fetch single error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase fetch single exception:', e);
    return null;
  }
}

/**
 * Update an invoice directly in Supabase.
 */
export async function updateSupabaseInvoice(id, updates) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase update error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase update exception:', e);
    return null;
  }
}

/**
 * Fetch all suppliers from Supabase.
 */
export async function fetchSupabaseSuppliers() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Upload a file directly to Supabase storage bucket.
 */
export async function uploadToSupabaseBucket(file, bucket = 'finsense-files') {
  if (!supabase) throw new Error('Supabase is not configured.');
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { path: filePath, url: publicUrl };
}
