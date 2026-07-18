// Engine perhitungan Simple Additive Weighting (SAW)

export type Atribut = "benefit" | "cost";

export interface Kriteria {
  id: string;
  kode_kriteria: string;
  nama_kriteria: string;
  bobot: number; // contoh: 0.30
  atribut: Atribut;
}

export interface Alternatif {
  id: string;
  kode_alternatif: string;
  nama_pengeluaran: string;
  kategori?: string;
  estimasi_biaya?: number;
  deskripsi?: string;
}

export interface Penilaian {
  alternatif_id: string;
  kriteria_id: string;
  nilai: number;
}

export interface HasilSAW {
  alternatif_id: string;
  kode_alternatif: string;
  nama_pengeluaran: string;
  nilai_normalisasi: Record<string, number>;
  nilai_preferensi: number;
  ranking: number;
  persentase: number;
}

/**
 * Menghitung ranking SAW.
 * Langkah: matriks keputusan -> normalisasi -> nilai preferensi -> ranking.
 */
export function hitungSAW(
  kriteriaList: Kriteria[],
  alternatifList: Alternatif[],
  penilaianList: Penilaian[]
): HasilSAW[] {
  if (kriteriaList.length === 0 || alternatifList.length === 0) {
    return [];
  }

  // Map cepat: penilaian[alternatifId][kriteriaId] = nilai
  const matriks: Record<string, Record<string, number>> = {};
  for (const alt of alternatifList) matriks[alt.id] = {};
  for (const p of penilaianList) {
    if (!matriks[p.alternatif_id]) matriks[p.alternatif_id] = {};
    matriks[p.alternatif_id][p.kriteria_id] = p.nilai;
  }

  // Hitung min & max tiap kriteria untuk normalisasi
  const maxPerKriteria: Record<string, number> = {};
  const minPerKriteria: Record<string, number> = {};

  for (const k of kriteriaList) {
    const nilaiKolom = alternatifList.map((alt) => matriks[alt.id]?.[k.id] ?? 0);
    maxPerKriteria[k.id] = Math.max(...nilaiKolom);
    const positif = nilaiKolom.filter((v) => v > 0);
    minPerKriteria[k.id] = positif.length ? Math.min(...positif) : 0;
  }

  // Normalisasi + hitung nilai preferensi
  const hasil: HasilSAW[] = alternatifList.map((alt) => {
    const normalisasi: Record<string, number> = {};
    let preferensi = 0;

    for (const k of kriteriaList) {
      const x = matriks[alt.id]?.[k.id] ?? 0;
      let r = 0;

      if (k.atribut === "benefit") {
        r = maxPerKriteria[k.id] > 0 ? x / maxPerKriteria[k.id] : 0;
      } else {
        r = x > 0 ? minPerKriteria[k.id] / x : 0;
      }

      normalisasi[k.id] = Number(r.toFixed(4));
      preferensi += k.bobot * r;
    }

    return {
      alternatif_id: alt.id,
      kode_alternatif: alt.kode_alternatif,
      nama_pengeluaran: alt.nama_pengeluaran,
      nilai_normalisasi: normalisasi,
      nilai_preferensi: Number(preferensi.toFixed(6)),
      ranking: 0,
      persentase: 0,
    };
  });

  hasil.sort((a, b) => b.nilai_preferensi - a.nilai_preferensi);

  const totalPreferensi = hasil.reduce((s, h) => s + h.nilai_preferensi, 0);
  hasil.forEach((h, i) => {
    h.ranking = i + 1;
    h.persentase =
      totalPreferensi > 0
        ? Number(((h.nilai_preferensi / totalPreferensi) * 100).toFixed(2))
        : 0;
  });

  return hasil;
}

/** Validasi total bobot kriteria harus = 1 (toleransi kecil). */
export function validasiBobot(kriteriaList: Kriteria[]): {
  valid: boolean;
  total: number;
  pesan: string;
} {
  const total = kriteriaList.reduce((s, k) => s + k.bobot, 0);
  const valid = Math.abs(total - 1) < 0.001;
  return {
    valid,
    total: Number(total.toFixed(4)),
    pesan: valid
      ? "Total bobot valid (= 1)."
      : `Total bobot = ${total.toFixed(2)}, seharusnya 1 (100%).`,
  };
}
