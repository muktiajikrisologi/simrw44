import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserProfile,
  UserRole,
  Warga,
  KasRW,
  Koperasi,
  JimpitanDenda,
  Notulen,
  CombinedTagihan,
  RekapJimpitanRondaEntry,
  KelompokRonda,
  RincianKewajibanArisan,
  AgendaArisanRW,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WARGA,
  INITIAL_KAS_RW,
  INITIAL_KOPERASI,
  INITIAL_JIMPITAN,
  INITIAL_NOTULEN,
} from '../lib/initialData';
import {
  INITIAL_REKAP_JIMPITAN_RONDA,
  INITIAL_KELOMPOK_RONDA,
  INITIAL_RINCIAN_ARISAN_RW44,
  AGENDA_ARISAN_RW44,
} from '../lib/dataRW44';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

// Helper pembersih string (menghapus spasi, titik, strip, agar matching presisi)
const cleanStr = (str: any) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Helper hitung aman total kewajiban ronda berdasarkan data di Rekap Jimpitan
const hitungRondaAman = (item: RekapJimpitanRondaEntry) => {
  if (!item) return 0;
  if (item.status === 'lunas') return 0;

  const denda = Number(item.denda_ronda) || 0;
  const bagi = Number(item.bagi_jimpitan) || 0;
  const tdkIsi = Number(item.tdk_isi_jimpitan) || 0;
  const setoran = Number(item.setoran_regu) || 0;
  const tunggakan = Number(item.tunggakan_bln_lalu) || 0;

  return denda + bagi + tdkIsi + setoran + tunggakan;
};

export function useRWStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('simrw_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca current user dari localStorage', e);
    }
    return INITIAL_USERS[0] || {
      id: 'usr-default',
      nama: 'Pengguna',
      email: 'admin@rw05.id',
      role: 'super_admin',
    };
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca users dari localStorage', e);
    }
    return (INITIAL_USERS || []).map((u) => ({
      ...u,
      password: u.password || 'password123',
    }));
  });

  const [warga, setWarga] = useState<Warga[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_warga');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_WARGA || [];
  });

  const [kasRW, setKasRW] = useState<KasRW[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_kas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_KAS_RW || [];
  });

  const [koperasi, setKoperasi] = useState<Koperasi[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_koperasi');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_KOPERASI || [];
  });

  const [jimpitan, setJimpitan] = useState<JimpitanDenda[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_jimpitan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_JIMPITAN || [];
  });

  const [notulen, setNotulen] = useState<Notulen[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_notulen');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_NOTULEN || [];
  });

  // --- STATE PENGUMUMAN ---
  const [pengumuman, setPengumuman] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_pengumuman');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [rekapJimpitan, setRekapJimpitan] = useState<RekapJimpitanRondaEntry[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_rekap_jimpitan_rw44');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_REKAP_JIMPITAN_RONDA || [];
  });

  const [kelompokRonda, setKelompokRonda] = useState<KelompokRonda[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_kelompok_ronda_rw44');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_KELOMPOK_RONDA || [];
  });

  const [rincianArisan, setRincianArisan] = useState<RincianKewajibanArisan[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_rincian_arisan_rw44');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_RINCIAN_ARISAN_RW44 || [];
  });

  const [agendaArisan, setAgendaArisan] = useState<AgendaArisanRW>(() => {
    try {
      const saved = localStorage.getItem('simrw_agenda_arisan_rw44');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return AGENDA_ARISAN_RW44 || {};
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());

  // Dynamic Link: Menghubungkan rekapJimpitan (ronda) ke rincianArisan secara real-time
  const rincianArisanTerhubung = useMemo(() => {
    return (rincianArisan || []).map((w) => {
      const namaW = cleanStr(w.nama);
      const blokW = cleanStr(w.blok_rumah);

      const matchRonda = (rekapJimpitan || []).find((r) => {
        const namaR = cleanStr(r.nama_warga || r.nama);
        const blokR = cleanStr(r.no_rumah || r.blok);

        return (namaW && namaR && namaW === namaR) || (blokW && blokR && blokW === blokR);
      });

      const rondaVal = matchRonda ? hitungRondaAman(matchRonda) : 0;
      const kopVal = Number(w.angsuran_koperasi) || 0;
      const arisanVal = Number(w.arisan) || 0;
      const rtVal = Number(w.iuran_rt) || 0;

      return {
        ...w,
        jmlh_kewajiban_ronda: rondaVal,
        jumlah_kewajiban: kopVal + rondaVal + arisanVal + rtVal,
      };
    });
  }, [rincianArisan, rekapJimpitan]);

  // Simpan perubahan state ke LocalStorage secara aman
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('simrw_current_user', JSON.stringify(currentUser));
      if (users) localStorage.setItem('simrw_users', JSON.stringify(users));
      if (warga) localStorage.setItem('simrw_warga', JSON.stringify(warga));
      if (kasRW) localStorage.setItem('simrw_kas', JSON.stringify(kasRW));
      if (koperasi) localStorage.setItem('simrw_koperasi', JSON.stringify(koperasi));
      if (jimpitan) localStorage.setItem('simrw_jimpitan', JSON.stringify(jimpitan));
      if (notulen) localStorage.setItem('simrw_notulen', JSON.stringify(notulen));
      if (pengumuman) localStorage.setItem('simrw_pengumuman', JSON.stringify(pengumuman));
      if (rekapJimpitan) localStorage.setItem('simrw_rekap_jimpitan_rw44', JSON.stringify(rekapJimpitan));
      if (kelompokRonda) localStorage.setItem('simrw_kelompok_ronda_rw44', JSON.stringify(kelompokRonda));
      if (rincianArisan) localStorage.setItem('simrw_rincian_arisan_rw44', JSON.stringify(rincianArisan));
      if (agendaArisan) localStorage.setItem('simrw_agenda_arisan_rw44', JSON.stringify(agendaArisan));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [currentUser, users, warga, kasRW, koperasi, jimpitan, notulen, pengumuman, rekapJimpitan, kelompokRonda, rincianArisan, agendaArisan]);

  // Sinkronisasi data dari Supabase dengan penanganan error terisolasi
  const syncWithSupabase = useCallback(async () => {
    const client = getSupabase();
    if (!client) {
      setSupabaseConnected(false);
      return;
    }
    setIsSyncing(true);
    try {
      const [uRes, wRes, kRes, kopRes, jRes, nRes, pRes] = await Promise.allSettled([
        client.from('users').select('*').limit(1000),
        client.from('warga').select('*').order('nama', { ascending: true }),
        client.from('kas_rw').select('*').limit(1000),
        client.from('koperasi').select('*').limit(1000),
        client.from('jimpitan_denda').select('*').limit(1000),
        client.from('notulen').select('*').limit(1000),
        client.from('pengumuman').select('*').order('created_at', { ascending: false }),
      ]);

      let fetchedWarga: Warga[] = [];
      if (wRes.status === 'fulfilled' && wRes.value.data && wRes.value.data.length > 0) {
        fetchedWarga = wRes.value.data;
        setWarga(fetchedWarga);
      }

      if (uRes.status === 'fulfilled' && uRes.value.data && uRes.value.data.length > 0) {
        setUsers(uRes.value.data);
      }
      if (kRes.status === 'fulfilled' && kRes.value.data && kRes.value.data.length > 0) {
        setKasRW(kRes.value.data);
      }
      if (kopRes.status === 'fulfilled' && kopRes.value.data && kopRes.value.data.length > 0) {
        setKoperasi(kopRes.value.data);
      }

      if (pRes.status === 'fulfilled' && pRes.value.data) {
        setPengumuman(pRes.value.data);
      }

      if (jRes.status === 'fulfilled' && jRes.value.data && jRes.value.data.length > 0) {
        const jData = jRes.value.data;
        setJimpitan(jData);

        const mappedRekap: RekapJimpitanRondaEntry[] = jData.map((item: any, index: number) => {
          const namaVal = item.nama_warga || item.nama || '-';
          const blokVal = item.no_rumah || item.blok || '-';
          const denda = Number(item.denda_ronda) || 0;
          const bagi = Number(item.bagi_jimpitan) || 0;
          const tdkIsi = Number(item.tdk_isi_jimpitan) || 0;
          const setoran = Number(item.setoran_regu) || 0;
          const tunggakan = Number(item.tunggakan_bln_lalu) || 0;

          return {
            id: item.id || `jr-${index}`,
            no: index + 1,
            nama: namaVal,
            nama_warga: namaVal,
            blok: blokVal,
            no_rumah: blokVal,
            denda_ronda: denda,
            bagi_jimpitan: bagi,
            tdk_isi_jimpitan: tdkIsi,
            setoran_regu: setoran,
            tunggakan_bln_lalu: tunggakan,
            jumlah: denda + bagi + tdkIsi + setoran + tunggakan,
            status: item.status === 'lunas' ? 'lunas' : 'terutang',
            keterangan: item.keterangan || '',
          };
        });

        setRekapJimpitan(mappedRekap);
      } else if (fetchedWarga.length > 0) {
        const defaultRekap: RekapJimpitanRondaEntry[] = fetchedWarga.map((w, index) => ({
          id: w.id,
          no: index + 1,
          nama: w.nama,
          nama_warga: w.nama,
          blok: w.no_rumah || '-',
          no_rumah: w.no_rumah || '-',
          denda_ronda: 0,
          bagi_jimpitan: 0,
          tdk_isi_jimpitan: 0,
          setoran_regu: 0,
          tunggakan_bln_lalu: 0,
          jumlah: 0,
          status: 'lunas',
        }));
        setRekapJimpitan(defaultRekap);
      }

      if (nRes.status === 'fulfilled' && nRes.value.data && nRes.value.data.length > 0) {
        setNotulen(nRes.value.data);
      }
      setSupabaseConnected(true);
    } catch (err) {
      console.warn('Supabase sync note: fallback to local cache', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      syncWithSupabase().catch((e) => console.error('Error saat sync awal:', e));
    }
  }, [syncWithSupabase]);

  const loginWithEmail = (email: string, pass: string): boolean => {
    if (!email || !users) return false;
    const found = users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      if (found.password && found.password !== pass) {
        return false;
      }
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const switchUser = (user: UserProfile) => {
    if (user) setCurrentUser(user);
  };

  const switchRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const newUser: UserProfile = {
        id: `usr-${role}-${Date.now()}`,
        nama: `Pengguna ${role.toUpperCase()}`,
        email: `${role}@rw05.id`,
        password: 'password123',
        role,
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
    }
  };

  const addUser = (newUser: Omit<UserProfile, 'id' | 'created_at'>) => {
    const created: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
      password: newUser.password || 'password123',
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [created, ...prev]);
    return created;
  };

  const updateUser = (userId: string, updatedData: Partial<UserProfile> & { newPassword?: string }) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updatedData };
          if (updatedData.newPassword) {
            updated.password = updatedData.newPassword;
          }
          delete (updated as any).newPassword;
          return updated;
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => {
        const updated = { ...prev, ...updatedData };
        if (updatedData.newPassword) {
          updated.password = updatedData.newPassword;
        }
        delete (updated as any).newPassword;
        return updated;
      });
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    updateUser(userId, { role: newRole });
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const addWarga = (newWarga: Omit<Warga, 'id' | 'created_at'>) => {
    const item: Warga = {
      ...newWarga,
      id: `wrg-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setWarga((prev) => [item, ...prev]);
    return item;
  };

  const updateWarga = (id: string, data: Partial<Warga>) => {
    setWarga((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data } : w))
    );
  };

  const deleteWarga = (id: string) => {
    setWarga((prev) => prev.filter((w) => w.id !== id));
  };

  const addKasRW = (data: Omit<KasRW, 'id' | 'created_at'>) => {
    const item: KasRW = {
      ...data,
      id: `kas-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || 'sys',
    };
    setKasRW((prev) => [item, ...prev]);
    return item;
  };

  const deleteKasRW = (id: string) => {
    setKasRW((prev) => prev.filter((k) => k.id !== id));
  };

  const addKoperasi = (data: Omit<Koperasi, 'id' | 'created_at'>) => {
    const item: Koperasi = {
      ...data,
      id: `kop-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || 'sys',
    };
    setKoperasi((prev) => [item, ...prev]);
    return item;
  };

  const markKoperasiLunas = (id: string) => {
    setKoperasi((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status: 'lunas',
              tanggal_bayar: new Date().toISOString().split('T')[0],
            }
          : k
      )
    );
  };

  const addJimpitan = (data: Omit<JimpitanDenda, 'id' | 'created_at'>) => {
    const item: JimpitanDenda = {
      ...data,
      id: `jmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || 'sys',
    };
    setJimpitan((prev) => [item, ...prev]);
    return item;
  };

  const importJimpitanCsv = (
    items: Array<Omit<JimpitanDenda, 'id' | 'created_at' | 'created_by'>>
  ) => {
    const newItems: JimpitanDenda[] = items.map((it, idx) => ({
      ...it,
      id: `jmp-csv-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || 'sys',
    }));
    setJimpitan((prev) => [...newItems, ...prev]);
    return newItems.length;
  };

  const markJimpitanLunas = (id: string) => {
    setJimpitan((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'lunas' } : j))
    );
  };

  // --- HENDEL NOTULEN DAN PENGUMUMAN ---
  const addNotulen = (data: Omit<Notulen, 'id' | 'created_at'>) => {
    const item: Notulen = {
      ...data,
      id: `not-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || 'sys',
    };
    setNotulen((prev) => [item, ...prev]);
    return item;
  };

  const updateNotulen = (id: string, data: Partial<Notulen>) => {
    setNotulen((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...data } : n))
    );
  };

  const updateNotulenStatus = (id: string, status: 'draft' | 'published') => {
    setNotulen((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status } : n))
    );
  };

  const deleteNotulen = (id: string) => {
    setNotulen((prev) => prev.filter((n) => n.id !== id));
  };

  // --- FUNGSI CRUD PENGUMUMAN ---
  const addPengumuman = (data: any) => {
    const item = {
      ...data,
      id: data.id || `pgm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setPengumuman((prev) => [item, ...prev]);
    return item;
  };

  const updatePengumuman = (id: string, data: any) => {
    setPengumuman((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deletePengumuman = (id: string) => {
    setPengumuman((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    
    const initialWithPwd = (INITIAL_USERS || []).map((u) => ({
      ...u,
      password: u.password || 'password123',
    }));

    setUsers(initialWithPwd);
    setCurrentUser(initialWithPwd[0]);
    setWarga(INITIAL_WARGA || []);
    setKasRW(INITIAL_KAS_RW || []);
    setKoperasi(INITIAL_KOPERASI || []);
    setJimpitan(INITIAL_JIMPITAN || []);
    setNotulen(INITIAL_NOTULEN || []);
    setPengumuman([]);
    setRekapJimpitan(INITIAL_REKAP_JIMPITAN_RONDA || []);
    setKelompokRonda(INITIAL_KELOMPOK_RONDA || []);
    setRincianArisan(INITIAL_RINCIAN_ARISAN_RW44 || []);
    setAgendaArisan(AGENDA_ARISAN_RW44 || {});
  };

  const updateRekapJimpitanItem = (id: string, updated: Partial<RekapJimpitanRondaEntry>) => {
    setRekapJimpitan((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = { ...item, ...updated };
          next.jumlah =
            (Number(next.denda_ronda) || 0) +
            (Number(next.bagi_jimpitan) || 0) +
            (Number(next.tdk_isi_jimpitan) || 0) +
            (Number(next.setoran_regu) || 0) +
            (Number(next.tunggakan_bln_lalu) || 0);
          return next;
        }
        return item;
      })
    );
  };

  const addRekapJimpitanItem = (entry: Omit<RekapJimpitanRondaEntry, 'id'>) => {
    const newItem: RekapJimpitanRondaEntry = {
      ...entry,
      id: 'jr-' + Date.now(),
      jumlah:
        (Number(entry.denda_ronda) || 0) +
        (Number(entry.bagi_jimpitan) || 0) +
        (Number(entry.tdk_isi_jimpitan) || 0) +
        (Number(entry.setoran_regu) || 0) +
        (Number(entry.tunggakan_bln_lalu) || 0),
    };
    setRekapJimpitan((prev) => [...prev, newItem]);
    return newItem;
  };

  const toggleRekapJimpitanStatus = (id: string) => {
    setRekapJimpitan((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'lunas' ? 'terutang' : 'lunas' }
          : item
      )
    );
  };

  const updateKelompokRondaItem = (hari: string, updated: Partial<KelompokRonda>) => {
    setKelompokRonda((prev) =>
      prev.map((k) => (k.hari === hari ? { ...k, ...updated } : k))
    );
  };

  const updateRincianArisanItem = (id: string, updated: Partial<RincianKewajibanArisan>) => {
    setRincianArisan((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = { ...item, ...updated };
          const ronda =
            (Number(next.denda_ronda) || 0) +
            (Number(next.bagi_jimpitan) || 0) +
            (Number(next.tdk_isi_jimpitan) || 0) +
            (Number(next.tunggakan_bln_lalu) || 0);
          next.jmlh_kewajiban_ronda = ronda;
          next.jumlah_kewajiban =
            (Number(next.angsuran_koperasi) || 0) +
            ronda +
            (Number(next.arisan) || 0) +
            (Number(next.iuran_rt) || 0);
          return next;
        }
        return item;
      })
    );
  };

  const addRincianArisanItem = (entry: Omit<RincianKewajibanArisan, 'id'>) => {
    const ronda =
      (Number(entry.denda_ronda) || 0) +
      (Number(entry.bagi_jimpitan) || 0) +
      (Number(entry.tdk_isi_jimpitan) || 0) +
      (Number(entry.tunggakan_bln_lalu) || 0);
    const newItem: RincianKewajibanArisan = {
      ...entry,
      id: 'ar-' + Date.now(),
      jmlh_kewajiban_ronda: ronda,
      jumlah_kewajiban:
        (Number(entry.angsuran_koperasi) || 0) +
        ronda +
        (Number(entry.arisan) || 0) +
        (Number(entry.iuran_rt) || 0),
    };
    setRincianArisan((prev) => [...prev, newItem]);
    return newItem;
  };

  const toggleRincianArisanStatus = (id: string) => {
    setRincianArisan((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status_bayar: item.status_bayar === 'lunas' ? 'belum_lunas' : 'lunas',
              tanggal_bayar:
                item.status_bayar === 'lunas'
                  ? undefined
                  : new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const importRincianArisanCsvData = (newItems: RincianKewajibanArisan[]) => {
    setRincianArisan(newItems);
    return newItems.length;
  };

  const importRekapJimpitanCsvData = (newItems: RekapJimpitanRondaEntry[]) => {
    setRekapJimpitan(newItems);
    return newItems.length;
  };

  const updateAgendaArisan = (updated: Partial<AgendaArisanRW>) => {
    setAgendaArisan((prev) => ({ ...prev, ...updated }));
  };

  const getCombinedTagihan = useCallback((): CombinedTagihan[] => {
    if (!Array.isArray(warga)) return [];
    return warga.map((w) => {
      const wJimpitan = (jimpitan || []).filter(
        (j) =>
          (j.warga_id === w.id || j.no_rumah === w.no_rumah) &&
          j.status === 'terutang'
      );
      const totalJimpitan = wJimpitan
        .filter((j) => j.jenis === 'jimpitan')
        .reduce((sum, j) => sum + (Number(j.nominal) || 0), 0);
      const totalDenda = wJimpitan
        .filter((j) => j.jenis === 'denda_ronda')
        .reduce((sum, j) => sum + (Number(j.nominal) || 0), 0);

      const wKoperasi = (koperasi || []).filter(
        (k) => k.warga_id === w.id && k.status === 'belum_lunas'
      );
      const totalKoperasi = wKoperasi.reduce((sum, k) => sum + (Number(k.nominal) || 0), 0);

      const totalAll = totalJimpitan + totalDenda + totalKoperasi;

      return {
        warga_id: w.id,
        nama: w.nama,
        no_rumah: w.no_rumah,
        rt: w.rt,
        total_jimpitan_terutang: totalJimpitan,
        total_denda_terutang: totalDenda,
        total_koperasi_terutang: totalKoperasi,
        total_tagihan: totalAll,
        status_pembayaran: totalAll === 0 ? 'Lunas' : 'Ada Tunggakan',
      };
    });
  }, [warga, jimpitan, koperasi]);

  return {
    currentUser,
    users,
    warga,
    kasRW,
    koperasi,
    jimpitan,
    notulen,
    pengumuman,
    isSyncing,
    supabaseConnected,
    loginWithEmail,
    switchUser,
    switchRole,
    addUser,
    updateUser,
    updateUserRole,
    deleteUser,
    addWarga,
    updateWarga,
    deleteWarga,
    addKasRW,
    deleteKasRW,
    addKoperasi,
    markKoperasiLunas,
    addJimpitan,
    importJimpitanCsv,
    markJimpitanLunas,
    rekapJimpitan,
    kelompokRonda,
    rincianArisan: rincianArisanTerhubung,
    agendaArisan,
    updateRekapJimpitanItem,
    addRekapJimpitanItem,
    toggleRekapJimpitanStatus,
    updateKelompokRondaItem,
    updateRincianArisanItem,
    addRincianArisanItem,
    toggleRincianArisanStatus,
    importRincianArisanCsvData,
    importRekapJimpitanCsvData,
    updateAgendaArisan,
    addNotulen,
    updateNotulen,
    updateNotulenStatus,
    deleteNotulen,
    addPengumuman,
    updatePengumuman,
    deletePengumuman,
    resetToDemoData,
    syncWithSupabase,
    getCombinedTagihan,
  };
}