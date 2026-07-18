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

const DEVICE_KEY = "spk_device_id";

function getDeviceId(): string {
  if (typeof window === "undefined") return "default";
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const generated = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(DEVICE_KEY, generated);
  return generated;
}

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
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("kriteria")
        .select("id, kode_kriteria, nama_kriteria, bobot, atribut, device_id")
        .eq("device_id", deviceId)
        .order("kode_kriteria", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Kriteria[];
    }
    return read<Kriteria[]>(KEY.kriteria, []).sort((a, b) =>
      a.kode_kriteria.localeCompare(b.kode_kriteria)
    );
  },
  async addKriteria(data: Omit<Kriteria, "id">): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").insert([{ ...data, device_id: deviceId }]);
      return;
    }
    const list = read<Kriteria[]>(KEY.kriteria, []);
    list.push({ ...data, id: uid() });
    write(KEY.kriteria, list);
  },
  async updateKriteria(id: string, data: Omit<Kriteria, "id">): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").update({ ...data, device_id: deviceId }).eq("id", id).eq("device_id", deviceId);
      return;
    }
    const list = read<Kriteria[]>(KEY.kriteria, []).map((k) =>
      k.id === id ? { ...data, id } : k
    );
    write(KEY.kriteria, list);
  },
  async deleteKriteria(id: string): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("kriteria").delete().eq("id", id).eq("device_id", deviceId);
      await supabase.from("penilaian").delete().eq("kriteria_id", id).eq("device_id", deviceId);
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
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("alternatif")
        .select("id, kode_alternatif, nama_pengeluaran, kategori, estimasi_biaya, deskripsi, device_id")
        .eq("device_id", deviceId)
        .order("kode_alternatif", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Alternatif[];
    }
    return read<Alternatif[]>(KEY.alternatif, []).sort((a, b) =>
      a.kode_alternatif.localeCompare(b.kode_alternatif)
    );
  },
  async addAlternatif(data: Omit<Alternatif, "id">): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").insert([{ ...data, device_id: deviceId }]);
      return;
    }
    const list = read<Alternatif[]>(KEY.alternatif, []);
    list.push({ ...data, id: uid() });
    write(KEY.alternatif, list);
  },
  async updateAlternatif(id: string, data: Omit<Alternatif, "id">): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").update({ ...data, device_id: deviceId }).eq("id", id).eq("device_id", deviceId);
      return;
    }
    const list = read<Alternatif[]>(KEY.alternatif, []).map((a) =>
      a.id === id ? { ...data, id } : a
    );
    write(KEY.alternatif, list);
  },
  async deleteAlternatif(id: string): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      await supabase.from("alternatif").delete().eq("id", id).eq("device_id", deviceId);
      await supabase.from("penilaian").delete().eq("alternatif_id", id).eq("device_id", deviceId);
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
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("penilaian")
        .select("alternatif_id, kriteria_id, nilai, device_id")
        .eq("device_id", deviceId);
      if (error) throw error;
      return (data ?? []) as Penilaian[];
    }
    return read<Penilaian[]>(KEY.penilaian, []);
  },
  async savePenilaian(rows: Penilaian[]): Promise<void> {
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      try {
        if (rows.length === 0) {
          return;
        }
        const rowsWithDevice = rows.map((row) => ({ ...row, device_id: deviceId }));
        const { data, error } = await supabase
          .from("penilaian")
          .upsert(rowsWithDevice, { onConflict: "alternatif_id,kriteria_id,device_id" })
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
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("hasil_perhitungan")
        .select("*")
        .eq("device_id", deviceId)
        .order("tanggal_hitung", { ascending: false });
      if (error) throw error;
      return (data ?? []) as HasilTersimpan[];
    }
    return read<HasilTersimpan[]>(KEY.hasil, []);
  },
  async saveHasil(hasil: HasilSAW[]): Promise<void> {
    const tanggal = new Date().toISOString();
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const rows = hasil.map((h) => ({ ...h, tanggal_hitung: tanggal, device_id: deviceId }));
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
    const deviceId = getDeviceId();
    if (isSupabaseConfigured && supabase) {
      const { data: rows, error: selErr } = await supabase.from('hasil_perhitungan').select('id').eq('device_id', deviceId);
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
