import { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { db } from "../db";
import { hitungSAW, type HasilSAW } from "../saw-engine";

const COLORS = ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-blue-900 dark:text-blue-300">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [hasil, setHasil] = useState<HasilSAW[]>([]);
  const [totalKriteria, setTotalKriteria] = useState(0);
  const [totalAlternatif, setTotalAlternatif] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [krit, alt, pen] = await Promise.all([
        db.getKriteria(),
        db.getAlternatif(),
        db.getPenilaian(),
      ]);
      setTotalKriteria(krit.length);
      setTotalAlternatif(alt.length);
      setHasil(hitungSAW(krit, alt, pen));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Memuat dashboard…</div>;

  const barData = hasil.map((h) => ({ nama: h.kode_alternatif, nilai: h.nilai_preferensi }));
  const pieData = hasil.map((h) => ({ name: h.nama_pengeluaran, value: h.persentase }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Kriteria" value={totalKriteria} />
        <StatCard label="Total Alternatif" value={totalAlternatif} />
        <StatCard label="Total Perhitungan" value={hasil.length} />
      </div>

      {hasil.length === 0 ? (
        <p className="text-slate-500">Belum ada data perhitungan untuk ditampilkan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 font-semibold">Ranking Nilai Preferensi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="nilai" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-4 font-semibold">Distribusi Prioritas Anggaran</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(e: any) => `${e.value}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasil[0] && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-900/20">
          <p className="text-sm text-slate-500">Prioritas Pengeluaran Utama</p>
          <p className="mt-1 text-xl font-bold text-green-800 dark:text-green-300">
            {hasil[0].nama_pengeluaran} — {hasil[0].nilai_preferensi.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}
