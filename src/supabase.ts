import { createClient } from '@supabase/supabase-js';

// Menggunakan import.meta.env yang merupakan standar Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log untuk membantu debugging (hanya di development)
if (import.meta.env.DEV) {
  if (!supabaseUrl) console.error('Peringatan: VITE_SUPABASE_URL tidak ditemukan di Secrets!');
  if (!supabaseAnonKey) console.error('Peringatan: VITE_SUPABASE_ANON_KEY tidak ditemukan di Secrets!');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL atau Anon Key tidak ditemukan! Pastikan nama di menu Secrets AI Studio ADALAH: VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (tanpa tanda baca tambahan).');
}

// Inisialisasi client. Jika URL kosong, createClient akan melempar error saat dipanggil, 
// jadi kita berikan string kosong sebagai fallback agar tidak crash saat load modul.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
