import { useEffect, useState } from "react";
import { db } from "../db";
import type { Kriteria, Alternatif, Penilaian } from "../saw-engine";

type Matriks = Record<string, Record<string, number>>;

export default function InputPenilaian() {
  const [kriteria, setKriteria] = useState<Kriteria[]>([]);
  const [alternatif, setAlternatif] = useState<Alternatif[]>([]);
  const [matriks, setMatriks] = useState<Matriks>({});
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    (async () => {
      const [krit, alt, pen] = await Promise.all([
        db.getKriteria(),
        db.getAlternatif(),
        db.getPenilaian(),
      ]);
      setKriteria(krit);
      setAlternatif(alt);

      const m: Matriks = {};
      for (const al of alt) m[al.id] = {};
      for (const p of pen) {
        if (!m[p.alternatif_id]) m[p.alternatif_id] = {};
        m[p.alternatif_id][p.kriteria_id] = p.nilai;
      }
      setMatriks(m);
    })();
  }, []);

  const setNilai = (altId: string, kritId: string, val: string) => {
    const num = val === "" ? 0 : Number(val);
    setMatriks((prev) => ({
      ...prev,
      [altId]: { ...prev[altId], [kritId]: num },
    }));
  };

  const handleSimpan = async () => {
    setSaving(true);
    setPesan("");

    const rows: Penilaian[] = [];
    for (const al of alternatif) {
      for (const k of kriteria) {
        rows.push({
          alternatif_id: al.id,
          kriteria_id: k.id,
          nilai: matriks[al.id]?.[k.id] ?? 0,
        });
      }
    }

    try {
      await db.savePenilaian(rows);
      setPesan("Penilaian berhasil disimpan ✔");
    } catch (err: any) {
      console.error("Gagal menyimpan penilaian:", err);
      setPesan(`Gagal menyimpan penilaian: ${err?.message ?? String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (kriteria.length === 0 || alternatif.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        Lengkapi data kriteria dan alternatif terlebih dahulu sebelum mengisi penilaian.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Input Penilaian Alternatif
      </h1>
      <p className="text-sm text-slate-500">
        Isi nilai tiap pengeluaran terhadap setiap kriteria (skala 1–5).
      </p>

      <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
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
                  <td key={k.id} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-20 rounded-lg border px-2 py-1 text-center dark:bg-slate-700 dark:border-slate-600"
                      value={matriks[a.id]?.[k.id] ?? ""}
                      onChange={(e) => setNilai(a.id, k.id, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSimpan}
          disabled={saving}
          className="rounded-lg bg-blue-900 px-5 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan Penilaian"}
        </button>
        {pesan && <span className="text-green-600">{pesan}</span>}
      </div>
    </div>
  );
}
