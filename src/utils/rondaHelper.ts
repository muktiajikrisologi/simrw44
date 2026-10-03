import { IuranRondaItem } from '../hooks/useRWStore';

export const hitungTotalRonda = (item: IuranRondaItem): number => {
  const denda = Number(item.denda) || 0;
  const bagiJimpitan = Number(item.bagiJimpitan) || 0;
  const tdkIsiJimpitan = Number(item.tdkIsiJimpitan) || 0;
  const tunggakan = Number(item.tunggakan) || 0;

  // Nilai JUMLAH di Iuran Ronda = Denda + Bagi Jimpitan + Tidak Isi Jimpitan + Tunggakan
  return denda + bagiJimpitan + tdkIsiJimpitan + tunggakan;
};