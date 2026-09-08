import { useState, useEffect, useCallback } from 'react';
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

export function useRWStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('simrw_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USERS[0];
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_users');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Mengisikan kata sandi default "password123" pada data awal pengguna
    return INITIAL_USERS.map((u) => ({
      ...u,
      password: u.password || 'password123',
    }));
  });

  const [warga, setWarga] = useState<Warga[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_warga');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WARGA;
  });

  const [kasRW, setKasRW] = useState<KasRW[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_kas');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KAS_RW;
  });

  const [koperasi, setKoperasi] = useState<Koperasi[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_koperasi');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KOPERASI;
  });

  const [jimpitan, setJimpitan] = useState<JimpitanDenda[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_jimpitan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_JIMPITAN;
  });

  const [notulen, setNotulen] = useState<Notulen[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_notulen');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTULEN;
  });

  const [rekapJimpitan, setRekapJimpitan] = useState<RekapJimpitanRondaEntry[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_rekap_jimpitan_rw44');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REKAP_JIMPITAN_RONDA;
  });

  const [kelompokRonda, setKelompokRonda] = useState<KelompokRonda[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_kelompok_ronda_rw44');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KELOMPOK_RONDA;
  });

  const [rincianArisan, setRincianArisan] = useState<RincianKewajibanArisan[]>(() => {
    try {
      const saved = localStorage.getItem('simrw_rincian_arisan_rw44');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RINCIAN_ARISAN_RW44;
  });

  const [agendaArisan, setAgendaArisan] = useState<AgendaArisanRW>(() => {
    try {
      const saved = localStorage.getItem('simrw_agenda_arisan_rw44');
      if (saved) return JSON.parse(saved);
    } catch {}
    return AGENDA_ARISAN_RW44;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(isSupabaseConfigured());

  useEffect(() => {
    try {
      localStorage.setItem('simrw_current_user', JSON.stringify(currentUser));
      localStorage.setItem('simrw_users', JSON.stringify(users));
      localStorage.setItem('simrw_warga', JSON.stringify(warga));
      localStorage.setItem('simrw_kas', JSON.stringify(kasRW));
      localStorage.setItem('simrw_koperasi', JSON.stringify(koperasi));
      localStorage.setItem('simrw_jimpitan', JSON.stringify(jimpitan));
      localStorage.setItem('simrw_notulen', JSON.stringify(notulen));
      localStorage.setItem('simrw_rekap_jimpitan_rw44', JSON.stringify(rekapJimpitan));
      localStorage.setItem('simrw_kelompok_ronda_rw44', JSON.stringify(kelompokRonda));
      localStorage.setItem('simrw_rincian_arisan_rw44', JSON.stringify(rincianArisan));
      localStorage.setItem('simrw_agenda_arisan_rw44', JSON.stringify(agendaArisan));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [currentUser, users, warga, kasRW, koperasi, jimpitan, notulen, rekapJimpitan, kelompokRonda, rincianArisan, agendaArisan]);

  const syncWithSupabase = useCallback(async () => {
    const client = getSupabase();
    if (!client) {
      setSupabaseConnected(false);
      return;
    }
    setIsSyncing(true);
    try {
      const [uRes, wRes, kRes, kopRes, jRes, nRes] = await Promise.all([
        client.from('users').select('*').limit(100),
        client.from('warga').select('*').limit(50),
        client.from('kas_rw').select('*').limit(50),
        client.from('koperasi').select('*').limit(50),
        client.from('jimpitan_denda').select('*').limit(50),
        client.from('notulen').select('*').limit(50),
      ]);

      if (uRes.data && uRes.data.length > 0) setUsers(uRes.data);
      if (wRes.data && wRes.data.length > 0) setWarga(wRes.data);
      if (kRes.data && kRes.data.length > 0) setKasRW(kRes.data);
      if (kopRes.data && kopRes.data.length > 0) setKoperasi(kopRes.data);
      if (jRes.data && jRes.data.length > 0) setJimpitan(jRes.data);
      if (nRes.data && nRes.data.length > 0) setNotulen(nRes.data);
      setSupabaseConnected(true);
    } catch (err) {
      console.warn('Supabase sync note: using local cache', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      syncWithSupabase();
    }
  }, [syncWithSupabase]);

  // Authenticate via Email & Password
  const loginWithEmail = (email: string, pass: string): boolean => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      // Verifikasi kata sandi
      if (found.password && found.password !== pass) {
        return false;
      }
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
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

  // Generic Update User untuk Pengubahan Data dan Password
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

    if (currentUser.id === userId) {
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
      created_by: currentUser.id,
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
      created_by: currentUser.id,
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
      created_by: currentUser.id,
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
      created_by: currentUser.id,
    }));
    setJimpitan((prev) => [...newItems, ...prev]);
    return newItems.length;
  };

  const markJimpitanLunas = (id: string) => {
    setJimpitan((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'lunas' } : j))
    );
  };

  const addNotulen = (data: Omit<Notulen, 'id' | 'created_at'>) => {
    const item: Notulen = {
      ...data,
      id: `not-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
    };
    setNotulen((prev) => [item, ...prev]);
    return item;
  };

  const updateNotulenStatus = (id: string, status: 'draft' | 'published') => {
    setNotulen((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status } : n))
    );
  };

  const deleteNotulen = (id: string) => {
    setNotulen((prev) => prev.filter((n) => n.id !== id));
  };

  const resetToDemoData = () => {
    localStorage.removeItem('simrw_users');
    localStorage.removeItem('simrw_warga');
    localStorage.removeItem('simrw_kas');
    localStorage.removeItem('simrw_koperasi');
    localStorage.removeItem('simrw_jimpitan');
    localStorage.removeItem('simrw_notulen');
    localStorage.removeItem('simrw_rekap_jimpitan_rw44');
    localStorage.removeItem('simrw_kelompok_ronda_rw44');
    localStorage.removeItem('simrw_rincian_arisan_rw44');
    localStorage.removeItem('simrw_agenda_arisan_rw44');
    
    const initialWithPwd = INITIAL_USERS.map((u) => ({
      ...u,
      password: u.password || 'password123',
    }));

    setUsers(initialWithPwd);
    setCurrentUser(initialWithPwd[0]);
    setWarga(INITIAL_WARGA);
    setKasRW(INITIAL_KAS_RW);
    setKoperasi(INITIAL_KOPERASI);
    setJimpitan(INITIAL_JIMPITAN);
    setNotulen(INITIAL_NOTULEN);
    setRekapJimpitan(INITIAL_REKAP_JIMPITAN_RONDA);
    setKelompokRonda(INITIAL_KELOMPOK_RONDA);
    setRincianArisan(INITIAL_RINCIAN_ARISAN_RW44);
    setAgendaArisan(AGENDA_ARISAN_RW44);
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

  const getCombinedTagihan = (): CombinedTagihan[] => {
    return warga.map((w) => {
      const wJimpitan = jimpitan.filter(
        (j) =>
          (j.warga_id === w.id || j.no_rumah === w.no_rumah) &&
          j.status === 'terutang'
      );
      const totalJimpitan = wJimpitan
        .filter((j) => j.jenis === 'jimpitan')
        .reduce((sum, j) => sum + j.nominal, 0);
      const totalDenda = wJimpitan
        .filter((j) => j.jenis === 'denda_ronda')
        .reduce((sum, j) => sum + j.nominal, 0);

      const wKoperasi = koperasi.filter(
        (k) => k.warga_id === w.id && k.status === 'belum_lunas'
      );
      const totalKoperasi = wKoperasi.reduce((sum, k) => sum + k.nominal, 0);

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
  };

  return {
    currentUser,
    users,
    warga,
    kasRW,
    koperasi,
    jimpitan,
    notulen,
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
    rincianArisan,
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
    updateNotulenStatus,
    deleteNotulen,
    resetToDemoData,
    syncWithSupabase,
    getCombinedTagihan,
  };
}