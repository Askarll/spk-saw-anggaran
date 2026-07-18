import { useEffect, useState } from "react";
import { db } from "../db";
import type { Alternatif } from "../saw-engine";

interface FormState {
  id?: string;
  kode_alternatif: string;
  nama_pengeluaran: string;
  kategori: string;
  estimasi_biaya: string;
  deskripsi: string;
}

const emptyForm: FormState = {
  kode_alternatif: "",
  nama_pengeluaran: "",
  kategori: "",
  estimasi_biaya: "",
  deskripsi: "",
};

export default function DataAlternatif() {
  const [list, setList] = useState<Alternatif[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterKategori, setFilterKategori] = useState("");
  const [error, setError] = useState("");

  const load = async () => setList(await db.getAlternatif());

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.kode_alternatif || !form.nama_pengeluaran) {
      setError("Kode dan nama pengeluaran wajib diisi.");
      return;
    }
    const biaya = form.estimasi_biaya ? parseFloat(form.estimasi_biaya) : 0;
    if (isNaN(biaya) || biaya < 0) {
      setError("Estimasi biaya harus berupa angka positif.");
      return;
    }

    const payload = {
      kode_alternatif: form.kode_alternatif,
      nama_pengeluaran: form.nama_pengeluaran,
      kategori: form.kategori,
      estimasi_biaya: biaya,
      deskripsi: form.deskripsi,
    };

    if (form.id) await db.updateAlternatif(form.id, payload);
    else await db.addAlternatif(payload);

    setForm(emptyForm);
    load();
  };

  const handleEdit = (a: Alternatif) =>
    setForm({
      id: a.id,
      kode_alternatif: a.kode_alternatif,
      nama_pengeluaran: a.nama_pengeluaran,
      kategori: a.kategori ?? "",
      estimasi_biaya: (a.estimasi_biaya ?? 0).toString(),
      deskripsi: a.deskripsi ?? "",
    });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alternatif ini? Penilaian terkait juga akan terhapus.")) return;
    await db.deleteAlternatif(id);
    if (form.id === id) setForm(emptyForm);
    load();
  };

  const kategoriList = Array.from(
    new Set(list.map((a) => a.kategori).filter(Boolean))
  ) as string[];

  const filtered = filterKategori
    ? list.filter((a) => a.kategori === filterKategori)
    : list;

  const formatRupiah = (n?: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n ?? 0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        Data Alternatif Pengeluaran
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Kode (A1)"
          value={form.kode_alternatif}
          onChange={(e) => setForm({ ...form, kode_alternatif: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Nama Pengeluaran"
          value={form.nama_pengeluaran}
          onChange={(e) => setForm({ ...form, nama_pengeluaran: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Kategori"
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
        />
        <input
          type="number"
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Estimasi Biaya (Rp)"
          value={form.estimasi_biaya}
          onChange={(e) => setForm({ ...form, estimasi_biaya: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Deskripsi (opsional)"
          value={form.deskripsi}
          onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
        />
        <div className="flex gap-2">
          <button className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-white hover:bg-blue-800">
            {form.id ? "Update" : "Tambah"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-lg border px-3 py-2 dark:border-slate-600"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <select
        className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
        value={filterKategori}
        onChange={(e) => setFilterKategori(e.target.value)}
      >
        <option value="">Semua Kategori</option>
        {kategoriList.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Kode</th>
              <th className="px-4 py-2 text-left">Nama Pengeluaran</th>
              <th className="px-4 py-2 text-left">Kategori</th>
              <th className="px-4 py-2 text-left">Deskripsi</th>
              <th className="px-4 py-2 text-right">Estimasi Biaya</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t dark:border-slate-700">
                <td className="px-4 py-2">{a.kode_alternatif}</td>
                <td className="px-4 py-2">{a.nama_pengeluaran}</td>
                <td className="px-4 py-2">{a.kategori || "-"}</td>
                <td className="max-w-xs px-4 py-2 text-slate-600 dark:text-slate-300">
                  {a.deskripsi || "-"}
                </td>
                <td className="px-4 py-2 text-right">{formatRupiah(a.estimasi_biaya)}</td>
                <td className="space-x-2 px-4 py-2 text-center">
                  <button onClick={() => handleEdit(a)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data alternatif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
