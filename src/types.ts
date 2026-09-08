export type UserRole =
  | 'super_admin'
  | 'sekretaris'
  | 'bendahara_rw'
  | 'bendahara_koperasi'
  | 'perekap_jimpitan'
  | 'warga';

export interface UserProfile {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  password?: string; // Penambahan kolom password untuk otentikasi
  no_hp?: string;
  warga_id?: string;
  created_at: string;
}

export interface Warga {
  id: string;
  nik: string;
  nama: string;
  no_rumah: string;
  rt: string;
  rw: string;
  blok?: string;
  status_hunian: 'Tetap' | 'Kontrak' | 'Kos';
  no_hp: string;
  status_aktif: boolean;
  created_at: string;
}

export interface KasRW {
  id: string;
  tanggal: string;
  kategori: string;
  jenis: 'masuk' | 'keluar' | 'pemasukan' | 'pengeluaran';
  nominal: number;
  keterangan: string;
  penanggung_jawab?: string;
  no_bukti?: string;
  bukti_url?: string;
  created_by?: string;
  created_at: string;
}

export interface Koperasi {
  id: string;
  warga_id: string;
  nama_warga?: string;
  no_rumah?: string;
  rt?: string;
  jenis?: 'simpanan_pokok' | 'simpanan_wajib' | 'simpanan_sukarela' | 'pinjaman' | 'angsuran';
  jenis_transaksi?: 'simpanan_pokok' | 'simpanan_wajib' | 'simpanan_sukarela' | 'angsuran_pinjaman' | 'jasa_pinjaman' | string;
  periode?: string;
  bulan_tahun?: string;
  nominal: number;
  status: 'lunas' | 'belum_lunas' | 'proses';
  jatuh_tempo?: string;
  tanggal_bayar?: string;
  keterangan?: string;
  created_by?: string;
  created_at: string;
}

export interface JimpitanDenda {
  id: string;
  tanggal: string;
  warga_id?: string;
  nama_warga: string;
  no_rumah: string;
  rt: string;
  jenis: 'jimpitan' | 'denda_ronda';
  nominal: number;
  status: 'lunas' | 'terutang' | 'disetor';
  petugas_rekap?: string;
  petugas_perekap?: string;
  sumber?: 'manual' | 'csv_import';
  keterangan?: string;
  catatan?: string;
  created_by?: string;
  created_at: string;
}

export interface Notulen {
  id: string;
  judul: string;
  kategori: 'Rapat Rutin' | 'Rapat Koordinasi' | 'Pengumuman' | 'Kerja Bakti' | 'Keamanan' | 'Lain-lain';
  tanggal: string;
  lokasi: string;
  agenda: string;
  isi_notulen: string;
  kesepakatan?: string;
  lampiran_url?: string;
  status: 'draft' | 'published';
  penulis: string;
  created_by?: string;
  created_at: string;
}

export interface CombinedTagihan {
  warga_id: string;
  nama: string;
  no_rumah: string;
  rt: string;
  total_jimpitan_terutang: number;
  total_denda_terutang: number;
  total_koperasi_terutang: number;
  total_tagihan: number;
  status_pembayaran: 'Lunas' | 'Ada Tunggakan';
}

export interface RekapJimpitanRondaEntry {
  id: string;
  no: number;
  nama: string;
  blok: string;
  denda_ronda: number;
  bagi_jimpitan: number;
  tdk_isi_jimpitan: number;
  setoran_regu: number;
  tunggakan_bln_lalu: number;
  jumlah: number;
  status: 'lunas' | 'terutang';
  bulan: string;
  tahun: string;
  catatan?: string;
}

export interface KelompokRonda {
  hari: 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU' | 'MINGGU' | 'SENIN' | 'SELASA';
  ketua: string;
  nominal_setoran: number;
  status: 'sudah_setor' | 'belum_setor';
  tanggal_setor?: string;
  keterangan?: string;
}

export interface RincianKewajibanArisan {
  id: string;
  no: number;
  nama: string;
  blok_rumah: string;
  angsuran_ke?: string;
  tgl_cair?: string;
  angsuran_koperasi: number;
  denda_ronda: number;
  bagi_jimpitan: number;
  tdk_isi_jimpitan: number;
  tunggakan_bln_lalu: number;
  jmlh_kewajiban_ronda: number;
  arisan: number;
  iuran_rt: number;
  jumlah_kewajiban: number;
  status_bayar: 'lunas' | 'belum_lunas';
  tanggal_bayar?: string;
}

export interface AgendaArisanRW {
  hari_tanggal: string;
  tempat: string;
  catatan_kebijakan: string;
  total_koperasi: number;
  total_ronda: number;
  total_arisan: number;
  total_iuran_rt: number;
  total_keseluruhan: number;
}