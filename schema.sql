-- =====================================================
-- SPK Alokasi Anggaran Rumah Tangga - Metode SAW
-- Schema untuk Supabase / PostgreSQL (opsional)
-- =====================================================

-- create extension if missing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they do not exist (idempotent)
CREATE TABLE IF NOT EXISTS kriteria (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_kriteria   VARCHAR(10) NOT NULL UNIQUE,
    nama_kriteria   VARCHAR(100) NOT NULL,
    bobot           DECIMAL(5,4) NOT NULL CHECK (bobot >= 0 AND bobot <= 1),
    atribut         VARCHAR(10) NOT NULL CHECK (atribut IN ('benefit','cost')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alternatif (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_alternatif  VARCHAR(10) NOT NULL UNIQUE,
    nama_pengeluaran VARCHAR(150) NOT NULL,
    kategori         VARCHAR(50),
    estimasi_biaya   DECIMAL(15,2) DEFAULT 0,
    deskripsi        TEXT,
    created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS penilaian (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alternatif_id  UUID NOT NULL REFERENCES alternatif(id) ON DELETE CASCADE,
    kriteria_id    UUID NOT NULL REFERENCES kriteria(id) ON DELETE CASCADE,
    nilai          DECIMAL(15,4) NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT now(),
    UNIQUE (alternatif_id, kriteria_id)
);

CREATE TABLE IF NOT EXISTS hasil_perhitungan (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alternatif_id      UUID NOT NULL REFERENCES alternatif(id) ON DELETE CASCADE,
    kode_alternatif    VARCHAR(10),
    nama_pengeluaran   VARCHAR(150),
    nilai_normalisasi  JSONB,
    nilai_preferensi   DECIMAL(10,6) NOT NULL,
    ranking            INTEGER,
    persentase         NUMERIC(6,2) DEFAULT 0,
    tanggal_hitung     TIMESTAMPTZ DEFAULT now()
);

-- Ensure any missing columns on existing table are added (safe)
ALTER TABLE IF EXISTS hasil_perhitungan ADD COLUMN IF NOT EXISTS kode_alternatif VARCHAR(10);
ALTER TABLE IF EXISTS hasil_perhitungan ADD COLUMN IF NOT EXISTS nama_pengeluaran VARCHAR(150);
ALTER TABLE IF EXISTS hasil_perhitungan ADD COLUMN IF NOT EXISTS persentase NUMERIC(6,2) DEFAULT 0;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_penilaian_alternatif ON penilaian(alternatif_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_kriteria   ON penilaian(kriteria_id);
CREATE INDEX IF NOT EXISTS idx_hasil_ranking        ON hasil_perhitungan(ranking);

-- Enable RLS safely if tables exist (demo only)
ALTER TABLE IF EXISTS kriteria          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alternatif        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS penilaian         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hasil_perhitungan ENABLE ROW LEVEL SECURITY;

-- Create/replace permissive demo policies (only for demo/learning environments)
DROP POLICY IF EXISTS public_all_kriteria ON kriteria;
CREATE POLICY public_all_kriteria ON kriteria FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_all_alternatif ON alternatif;
CREATE POLICY public_all_alternatif ON alternatif FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_all_penilaian ON penilaian;
CREATE POLICY public_all_penilaian ON penilaian FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS public_all_hasil ON hasil_perhitungan;
CREATE POLICY public_all_hasil ON hasil_perhitungan FOR ALL USING (true) WITH CHECK (true);
