// Data layer aplikasi.
//
// Secara default aplikasi berjalan OFFLINE memakai localStorage + seed data,
// sehingga bisa langsung dijalankan tanpa konfigurasi apa pun.
//
// Jika ingin memakai Supabase, isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
// di file .env lalu sesuaikan implementasi pada src/supabaseClient.ts.

import type { Kriteria, Alternatif, Penilaian, HasilSAW } from "./saw-engine";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const KEY = {
  kriteria: "spk_kriteria",
  alternatif: "spk_alternatif",
  penilaian: "spk_penilaian",
  hasil: "spk_hasil",
};

export interface HasilTersimpan extends HasilSAW {
  tanggal_hitung: string;
}

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Inisialisasi data kosong saat aplikasi pertama kali dibuka
// ---------------------------------------------------------------------------
function seed(): void {
  write(KEY.kriteria, []);
  write(KEY.alternatif, []);
  write(KEY.penilaian, []);
  write(KEY.hasil, []);
}

seed();

// ---------------------------------------------------------------------------
// API (async agar mudah diganti ke Supabase suatu saat)
// ---------------------------------------------------------------------------
export const db = {
  // Implementation switches to Supabase when configured, otherwise uses localStorage.
  // ----- Kriteria -----
  async getKriteria(): Promise<Kriteria[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("kriteria")
        .select("id, kode_kriteria, nama_kriteria, bobot, atribut")
        .order("kode_kriteria", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Kriteria[];
    }
    return read<Kriteria[]>(KEY.kriteria, []).sort((a, b) =>
      a.kode_kriteria.localeCompare(b.kode_kriteria)
    );
  },
  async addKriteria(data: Omit<Kriteria, "id">): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").insert([data]);
      return;
    }
    const list = read<Kriteria[]>(KEY.kriteria, []);
    list.push({ ...data, id: uid() });
    write(KEY.kriteria, list);
  },
  async updateKriteria(id: string, data: Omit<Kriteria, "id">): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").update(data).eq("id", id);
      return;
    }
    const list = read<Kriteria[]>(KEY.kriteria, []).map((k) =>
      k.id === id ? { ...data, id } : k
    );
    write(KEY.kriteria, list);
  },
  async deleteKriteria(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").delete().eq("id", id);
      await supabase.from("penilaian").delete().eq("kriteria_id", id);
      return;
    }
    write(
      KEY.kriteria,
      read<Kriteria[]>(KEY.kriteria, []).filter((k) => k.id !== id)
    );
    // hapus penilaian terkait
    write(
      KEY.penilaian,
      read<Penilaian[]>(KEY.penilaian, []).filter((p) => p.kriteria_id !== id)
    );
  },

  // ----- Alternatif -----
  async getAlternatif(): Promise<Alternatif[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("alternatif")
        .select("id, kode_alternatif, nama_pengeluaran, kategori, estimasi_biaya, deskripsi")
        .order("kode_alternatif", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Alternatif[];
    }
    return read<Alternatif[]>(KEY.alternatif, []).sort((a, b) =>
      a.kode_alternatif.localeCompare(b.kode_alternatif)
    );
  },
  async addAlternatif(data: Omit<Alternatif, "id">): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").insert([data]);
      return;
    }
    const list = read<Alternatif[]>(KEY.alternatif, []);
    list.push({ ...data, id: uid() });
    write(KEY.alternatif, list);
  },
  async updateAlternatif(id: string, data: Omit<Alternatif, "id">): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").update(data).eq("id", id);
      return;
    }
    const list = read<Alternatif[]>(KEY.alternatif, []).map((a) =>
      a.id === id ? { ...data, id } : a
    );
    write(KEY.alternatif, list);
  },
  async deleteAlternatif(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").delete().eq("id", id);
      await supabase.from("penilaian").delete().eq("alternatif_id", id);
      return;
    }
    write(
      KEY.alternatif,
      read<Alternatif[]>(KEY.alternatif, []).filter((a) => a.id !== id)
    );
    write(
      KEY.penilaian,
      read<Penilaian[]>(KEY.penilaian, []).filter((p) => p.alternatif_id !== id)
    );
  },

  // ----- Penilaian -----
  async getPenilaian(): Promise<Penilaian[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("penilaian").select("alternatif_id, kriteria_id, nilai");
      if (error) throw error;
      return (data ?? []) as Penilaian[];
    }
    return read<Penilaian[]>(KEY.penilaian, []);
  },
  async savePenilaian(rows: Penilaian[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Use upsert to insert or update penilaian by unique (alternatif_id,kriteria_id)
      try {
        if (rows.length === 0) {
          // nothing to do
          return;
        }
        const { data, error } = await supabase
          .from("penilaian")
          .upsert(rows, { onConflict: "alternatif_id,kriteria_id" })
          .select();
        if (error) {
          console.error("Supabase upsert penilaian error:", error);
          throw error;
        }
        return;
      } catch (e) {
        console.error("Supabase savePenilaian failed:", e);
        throw e;
      }
    }
    write(KEY.penilaian, rows);
  },

  // ----- Hasil perhitungan -----
  async getHasil(): Promise<HasilTersimpan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("hasil_perhitungan")
        .select("*")
        .order("tanggal_hitung", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HasilTersimpan[];
    }
    return read<HasilTersimpan[]>(KEY.hasil, []);
  },
  async saveHasil(hasil: HasilSAW[]): Promise<void> {
    const tanggal = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const rows = hasil.map((h) => ({ ...h, tanggal_hitung: tanggal }));
      const { data, error } = await supabase.from("hasil_perhitungan").insert(rows).select();
      if (error) {
        console.error("Supabase saveHasil error:", error);
        throw error;
      }
      return;
    }
    write(
      KEY.hasil,
      hasil.map((h) => ({ ...h, tanggal_hitung: tanggal }))
    );
  },
  async clearHasil(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // fetch ids then delete by ids to avoid DELETE without WHERE errors
      const { data: rows, error: selErr } = await supabase.from('hasil_perhitungan').select('id');
      if (selErr) {
        console.error('Supabase select hasil_perhitungan error:', selErr);
        throw selErr;
      }
      const ids = (rows ?? []).map((r: any) => r.id).filter(Boolean);
      if (ids.length) {
        const { error: delErr } = await supabase.from('hasil_perhitungan').delete().in('id', ids);
        if (delErr) {
          console.error('Supabase delete hasil_perhitungan error:', delErr);
          throw delErr;
        }
      }
      return;
    }
    write(KEY.hasil, []);
  },
};
