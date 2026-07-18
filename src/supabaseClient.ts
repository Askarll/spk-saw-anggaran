// Opsional: koneksi Supabase.
//
// Secara default aplikasi memakai data layer offline (src/db.ts).
// Jika ingin memakai Supabase:
//   1. Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env
//   2. Jalankan schema.sql di Supabase SQL Editor
//   3. Ganti pemanggilan db.* pada komponen dengan query supabase ini.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function hasValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return /^https?:\/\/[^\s]+$/i.test(trimmed);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = hasValidHttpUrl(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? (() => {
      try {
        return createClient(supabaseUrl as string, supabaseAnonKey as string);
      } catch (error) {
        console.warn("Supabase config tidak valid, memakai mode offline.", error);
        return null;
      }
    })()
  : null;
