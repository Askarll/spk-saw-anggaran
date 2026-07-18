import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import DataKriteria from "./pages/DataKriteria";
import DataAlternatif from "./pages/DataAlternatif";
import InputPenilaian from "./pages/InputPenilaian";
import PerhitunganSAW from "./pages/PerhitunganSAW";
import Riwayat from "./pages/Riwayat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="kriteria" element={<DataKriteria />} />
          <Route path="alternatif" element={<DataAlternatif />} />
          <Route path="penilaian" element={<InputPenilaian />} />
          <Route path="perhitungan" element={<PerhitunganSAW />} />
          <Route path="riwayat" element={<Riwayat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
