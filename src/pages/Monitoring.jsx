import PageHeader from '../components/PageHeader';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const bulanKeys = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const MAX_PER_BULAN = 5; // max Sabtu dalam satu bulan

// Status based on weekly targets: 4 per month expected
// Baik >= 75% filled, Cukup >= 50%, Kurang < 50%
const getStatus = (total, bulanAktif) => {
  if (bulanAktif === 0) return { label: '—', style: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' };
  const expected = bulanAktif * 4; // 4 Sabtu per bulan
  const pct = total / expected;
  if (pct >= 0.75) return { label: 'Baik', style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (pct >= 0.5) return { label: 'Cukup', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Kurang', style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
};

const barColors = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-500',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
  'from-rose-400 to-rose-500',
  'from-teal-400 to-teal-600',
  'from-violet-400 to-violet-600',
  'from-sky-400 to-sky-600',
  'from-lime-400 to-lime-600',
];

export default function Monitoring() {
  const [dataGuru, setDataGuru] = useState([]);
  const [dataJurnal, setDataJurnal] = useState([]);
  const [filterGuru, setFilterGuru] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      // Fetch gurus from supabase
      const { data: gurus, error: guruError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'guru');
        
      if (!guruError && gurus) {
        // Use 'nama_lengkap' or 'nama', depends on PRD schema it is 'nama_lengkap' but in DataGuru.jsx it uses 'nama'
        // I will map it safely
        const validGurus = gurus.map(g => ({ ...g, nama: g.nama || g.nama_lengkap || 'Unknown' }));
        setDataGuru(validGurus);
        if (validGurus.length > 0) setFilterGuru(validGurus[0].nama);
      }

      // Fetch jurnal from local storage or supabase (if Jurnal is not yet migrated, we keep localStorage for now)
      // Todo: eventually migrate Jurnal to Supabase
      const savedJurnal = localStorage.getItem('jurnalData');
      setDataJurnal(savedJurnal ? JSON.parse(savedJurnal) : []);
    };
    
    fetchData();
  }, []);

  // Compute stats per guru
  const guruNames = dataGuru.map(g => g.nama);
  
  const generateMonthlyDataForGuru = (guruName) => {
    const monthlyCounts = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, Mei: 0, Jun: 0, Jul: 0, Ags: 0, Sep: 0, Okt: 0, Nov: 0, Des: 0 };
    const guruJurnals = dataJurnal.filter(j => j.guru === guruName);
    
    guruJurnals.forEach(j => {
      const parts = j.tanggal.split('-');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyCounts[bulanKeys[monthIndex]]++;
        }
      }
    });
    return monthlyCounts;
  };

  const guruMonthly = generateMonthlyDataForGuru(filterGuru);
  const maxVal = Math.max(...Object.values(guruMonthly), 1);

  // Count active months (months with data > 0) for status calc
  const bulanAktif = Object.values(guruMonthly).filter(v => v > 0).length;

  // Summary for the table
  const guruSummary = guruNames.map(nama => {
    const data = generateMonthlyDataForGuru(nama);
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const aktif = Object.values(data).filter(v => v > 0).length;
    return { nama, total, aktif };
  });

  return (
    <>
      <PageHeader
        title="Monitoring Jurnal"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Laporan' },
          { label: 'Monitoring' },
        ]}
      />

      {/* Chart Card */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Grafik Jurnal Per Bulan</h3>
          <div className="flex flex-wrap items-center gap-3">
            <select value={filterGuru} onChange={(e) => setFilterGuru(e.target.value)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors">
              {guruNames.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Target: 4 jurnal/bulan (setiap Sabtu)</p>

        {/* Styled Vertical Bars */}
        <div className="relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: '32px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-dashed border-gray-100 dark:border-gray-800 w-full" />
            ))}
          </div>

          <div className="relative flex items-end gap-2 sm:gap-4 h-64 px-1">
            {bulanKeys.map((bulan, idx) => {
              const val = guruMonthly[bulan] || 0;
              const heightPct = maxVal > 0 ? (val / MAX_PER_BULAN) * 100 : 0;
              const clampedHeight = Math.min(heightPct, 100);
              return (
                <div key={bulan} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-lg">
                    {val} jurnal
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-full max-w-[40px] rounded-t-xl bg-gradient-to-t ${barColors[idx]} shadow-sm transition-all duration-700 ease-out group-hover:shadow-lg group-hover:scale-105`}
                    style={{ height: val > 0 ? `${clampedHeight}%` : '3px', minHeight: val > 0 ? '16px' : '3px', opacity: val > 0 ? 1 : 0.2 }}
                  />
                  {/* Label */}
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-3">{bulan}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini legend */}
        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Jurnal Terisi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Belum Ada</span>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ringkasan Semua Guru</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Dari</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Sampai</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Guru</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Jurnal</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Bulan Aktif</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rata-rata / Bulan</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {guruSummary.map((guru, i) => {
                const status = getStatus(guru.total, guru.aktif);
                const avg = guru.aktif > 0 ? (guru.total / guru.aktif).toFixed(1) : '—';
                return (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {guru.nama.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{guru.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">{guru.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{guru.aktif} bulan</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{avg}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${status.style}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
