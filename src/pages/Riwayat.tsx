import { useEffect, useState } from "react";
import { db, type HasilTersimpan } from "../db";

export default function Riwayat() {
  const [hasil, setHasil] = useState<HasilTersimpan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setHasil(await db.getHasil());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Memuat riwayat…</div>;

  const tanggal = hasil[0]?.tanggal_hitung
    ? new Date(hasil[0].tanggal_hitung).toLocaleString("id-ID")
    : null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Riwayat Perhitungan</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={async () => {
            if (!confirm('Hapus semua riwayat perhitungan? Tindakan ini tidak bisa dibatalkan.')) return;
            try {
              await db.clearHasil();
              setHasil([]);
            } catch (err: any) {
              console.error('Gagal membersihkan riwayat:', err);
              alert('Gagal membersihkan riwayat: ' + (err?.message ?? String(err)));
            }
          }}
          className="rounded-lg border px-3 py-2 text-red-600 hover:bg-red-50"
        >
          Bersihkan Riwayat
        </button>
      </div>

      {hasil.length === 0 ? (
        <p className="text-slate-500">
          Belum ada riwayat. Buka halaman Perhitungan SAW lalu klik "Simpan ke Riwayat".
        </p>
      ) : (
        <>
          {tanggal && (
            <p className="text-sm text-slate-500">Perhitungan terakhir: {tanggal}</p>
          )}
          <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-center">Ranking</th>
                  <th className="px-4 py-2 text-left">Pengeluaran</th>
                  <th className="px-4 py-2 text-center">Nilai Preferensi</th>
                  <th className="px-4 py-2 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {hasil
                  .slice()
                  .sort((a, b) => a.ranking - b.ranking)
                  .map((h) => (
                    <tr key={h.alternatif_id} className="border-t dark:border-slate-700">
                      <td className="px-4 py-2 text-center font-bold">{h.ranking}</td>
                      <td className="px-4 py-2">{h.nama_pengeluaran}</td>
                      <td className="px-4 py-2 text-center">{h.nilai_preferensi.toFixed(4)}</td>
                      <td className="px-4 py-2 text-center">{h.persentase}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
