import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Kriteria, HasilSAW } from "./saw-engine";

export function exportHasilPDF(kriteria: Kriteria[], hasil: HasilSAW[]) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Laporan Hasil Perhitungan SAW", 105, 18, { align: "center" });
  doc.setFontSize(10);
  doc.text("Alokasi Anggaran Rumah Tangga", 105, 25, { align: "center" });
  doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 105, 31, {
    align: "center",
  });

  autoTable(doc, {
    startY: 40,
    head: [["Kode", "Kriteria", "Bobot", "Atribut"]],
    body: kriteria.map((k) => [
      k.kode_kriteria,
      k.nama_kriteria,
      k.bobot.toString(),
      k.atribut,
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138] },
  });

  const lastY = (doc as any).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: lastY,
    head: [["Ranking", "Pengeluaran", "Nilai Preferensi", "Persentase"]],
    body: hasil.map((h) => [
      h.ranking.toString(),
      h.nama_pengeluaran,
      h.nilai_preferensi.toFixed(4),
      `${h.persentase}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138] },
  });

  const recY = (doc as any).lastAutoTable.finalY + 10;
  const top = hasil.find((h) => h.ranking === 1);
  if (top) {
    doc.setFontSize(10);
    doc.text(
      `Rekomendasi: Prioritas pengeluaran utama adalah "${top.nama_pengeluaran}" ` +
        `dengan nilai preferensi ${top.nilai_preferensi.toFixed(4)}.`,
      14,
      recY,
      { maxWidth: 180 }
    );
  }

  doc.save("laporan-saw.pdf");
}
