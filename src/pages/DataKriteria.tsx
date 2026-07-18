import { useEffect, useState } from "react";
import { db } from "../db";
import { validasiBobot, type Kriteria, type Atribut } from "../saw-engine";

interface FormState {
  id?: string;
  kode_kriteria: string;
  nama_kriteria: string;
  bobot: string;
  atribut: Atribut;
}

const emptyForm: FormState = {
  kode_kriteria: "",
  nama_kriteria: "",
  bobot: "",
  atribut: "benefit",
};

export default function DataKriteria() {
  const [list, setList] = useState<Kriteria[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = async () => setList(await db.getKriteria());

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const bobotNum = parseFloat(form.bobot);
    if (!form.kode_kriteria || !form.nama_kriteria) {
      setError("Kode dan nama kriteria wajib diisi.");
      return;
    }
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 1) {
      setError("Bobot harus berupa angka antara 0 dan 1.");
      return;
    }

    const payload = {
      kode_kriteria: form.kode_kriteria,
      nama_kriteria: form.nama_kriteria,
      bobot: bobotNum,
      atribut: form.atribut,
    };

    if (form.id) await db.updateKriteria(form.id, payload);
    else await db.addKriteria(payload);

    setForm(emptyForm);
    load();
  };

  const handleEdit = (k: Kriteria) =>
    setForm({
      id: k.id,
      kode_kriteria: k.kode_kriteria,
      nama_kriteria: k.nama_kriteria,
      bobot: k.bobot.toString(),
      atribut: k.atribut,
    });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kriteria ini? Penilaian terkait juga akan terhapus.")) return;
    await db.deleteKriteria(id);
    if (form.id === id) setForm(emptyForm);
    load();
  };

  const filtered = list.filter((k) =>
    k.nama_kriteria.toLowerCase().includes(search.toLowerCase())
  );
  const bobotCheck = validasiBobot(list);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Data Kriteria</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Kode (C1)"
          value={form.kode_kriteria}
          onChange={(e) => setForm({ ...form, kode_kriteria: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Nama Kriteria"
          value={form.nama_kriteria}
          onChange={(e) => setForm({ ...form, nama_kriteria: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          placeholder="Bobot (0-1)"
          value={form.bobot}
          onChange={(e) => setForm({ ...form, bobot: e.target.value })}
        />
        <select
          className="rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
          value={form.atribut}
          onChange={(e) => setForm({ ...form, atribut: e.target.value as Atribut })}
        >
          <option value="benefit">Benefit</option>
          <option value="cost">Cost</option>
        </select>
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
      <p className={bobotCheck.valid ? "text-green-600" : "text-amber-600"}>{bobotCheck.pesan}</p>

      <input
        className="w-full max-w-sm rounded-lg border px-3 py-2 dark:bg-slate-700 dark:border-slate-600"
        placeholder="Cari kriteria…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Kode</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-center">Bobot</th>
              <th className="px-4 py-2 text-center">Atribut</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k) => (
              <tr key={k.id} className="border-t dark:border-slate-700">
                <td className="px-4 py-2">{k.kode_kriteria}</td>
                <td className="px-4 py-2">{k.nama_kriteria}</td>
                <td className="px-4 py-2 text-center">{k.bobot}</td>
                <td className="px-4 py-2 text-center capitalize">{k.atribut}</td>
                <td className="space-x-2 px-4 py-2 text-center">
                  <button onClick={() => handleEdit(k)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data kriteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
