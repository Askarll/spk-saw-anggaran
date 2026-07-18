// Opsional: koneksi Supabase.
//
// Secara default aplikasi memakai data layer offline (src/db.ts).
// Jika ingin memakai Supabase:
//   1. Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env
//   2. Jalankan schema.sql di Supabase SQL Editor
//   3. Ganti pemanggilan db.* pada komponen dengan query supabase ini.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
