import { useEffect, useState } from "react";
import { db } from "../db";
import {
  hitungSAW, validasiBobot,
  type Kriteria, type Alternatif, type Penilaian, type HasilSAW,
} from "../saw-engine";
import { exportHasilPDF } from "../export-pdf";

export default function PerhitunganSAW() {
  const [kriteria, setKriteria] = useState<Kriteria[]>([]);
  const [alternatif, setAlternatif] = useState<Alternatif[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [hasil, setHasil] = useState<HasilSAW[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [krit, alt, pen] = await Promise.all([
        db.getKriteria(),
        db.getAlternatif(),
        db.getPenilaian(),
      ]);
      setKriteria(krit);
      setAlternatif(alt);
      setPenilaian(pen);
      setHasil(hitungSAW(krit, alt, pen));
      setLoading(false);
    })();
  }, []);

  const getNilai = (altId: string, kritId: string) =>
    penilaian.find((p) => p.alternatif_id === altId && p.kriteria_id === kritId)?.nilai ?? 0;

  const bobotCheck = validasiBobot(kriteria);

  const handleSimpanHasil = async () => {
    try {
      await db.saveHasil(hasil);
      setPesan("Hasil perhitungan disimpan ke Riwayat ✔");
    } catch (err: any) {
      console.error("Gagal menyimpan hasil:", err);
      setPesan(`Gagal menyimpan hasil: ${err?.message ?? String(err)}`);
    }
  };

  if (loading) return <div className="p-6">Memuat data…</div>;

  if (kriteria.length === 0 || alternatif.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        Data kriteria atau alternatif masih kosong. Silakan isi terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Perhitungan Metode SAW</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSimpanHasil}
            className="rounded-lg border border-blue-900 px-4 py-2 text-blue-900 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300"
          >
            Simpan ke Riwayat
          </button>
          <button
            onClick={() => exportHasilPDF(kriteria, hasil)}
            className="rounded-lg bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
          >
            Export PDF
          </button>
        </div>
      </div>

      {pesan && <p className="text-green-600">{pesan}</p>}
      {!bobotCheck.valid && (
        <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-800">⚠️ {bobotCheck.pesan}</div>
      )}

      {/* 1. Matriks Keputusan */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">1. Matriks Keputusan (X)</h2>
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left">Alternatif</th>
                {kriteria.map((k) => (
                  <th key={k.id} className="px-4 py-2 text-center">
                    {k.kode_kriteria}
                    <span className="block text-xs font-normal text-slate-400">({k.atribut})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatif.map((a) => (
                <tr key={a.id} className="border-t dark:border-slate-700">
                  <td className="px-4 py-2 font-medium">{a.nama_pengeluaran}</td>
                  {kriteria.map((k) => (
                    <td key={k.id} className="px-4 py-2 text-center">{getNilai(a.id, k.id)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Bobot Kriteria */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">2. Bobot Kriteria (W)</h2>
        <div className="flex flex-wrap gap-3">
          {kriteria.map((k) => (
            <div key={k.id} className="rounded-lg border bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
              <span className="font-semibold">{k.kode_kriteria}</span>: {k.bobot}{" "}
              <span className="text-xs text-slate-400">({k.atribut})</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Matriks Normalisasi */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">3. Matriks Normalisasi (R)</h2>
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left">Alternatif</th>
                {kriteria.map((k) => (
                  <th key={k.id} className="px-4 py-2 text-center">{k.kode_kriteria}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hasil.map((h) => (
                <tr key={h.alternatif_id} className="border-t dark:border-slate-700">
                  <td className="px-4 py-2 font-medium">{h.nama_pengeluaran}</td>
                  {kriteria.map((k) => (
                    <td key={k.id} className="px-4 py-2 text-center">
                      {h.nilai_normalisasi[k.id]?.toFixed(4) ?? "0.0000"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Hasil Ranking */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">4. Nilai Preferensi & Ranking</h2>
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-2 text-center">Ranking</th>
                <th className="px-4 py-2 text-left">Pengeluaran</th>
                <th className="px-4 py-2 text-center">Nilai Preferensi (V)</th>
                <th className="px-4 py-2 text-center">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {hasil.map((h) => (
                <tr
                  key={h.alternatif_id}
                  className={`border-t dark:border-slate-700 ${
                    h.ranking === 1 ? "bg-green-50 dark:bg-green-900/20" : ""
                  }`}
                >
                  <td className="px-4 py-2 text-center font-bold">{h.ranking}</td>
                  <td className="px-4 py-2">{h.nama_pengeluaran}</td>
                  <td className="px-4 py-2 text-center">{h.nilai_preferensi.toFixed(4)}</td>
                  <td className="px-4 py-2 text-center">{h.persentase}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
