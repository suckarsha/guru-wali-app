import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Users, GraduationCap, BookOpen, AlertCircle, UserCircle, X, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { guidanceService } from '../services/guidanceService';
import { studentService } from '../services/studentService';
import { classService } from '../services/classService';
import { journalService } from '../services/journalService';
import { attendanceService } from '../services/attendanceService';
import { announcementService } from '../services/announcementService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [bimbinganCount, setBimbinganCount] = useState(0);
  const [totalGuru, setTotalGuru] = useState(0);
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalKelas, setTotalKelas] = useState(0);
  const [totalJurnal, setTotalJurnal] = useState(0);
  const [pengumuman, setPengumuman] = useState([]);
  const [selectedPengumuman, setSelectedPengumuman] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [recentJurnals, setRecentJurnals] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const [kehadiranSiswa, setKehadiranSiswa] = useState('100%');
  const [perluPerhatian, setPerluPerhatian] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchAllData = async () => {
      try {
        // Fetch Bimbingan Count
        if (user.role === 'guru') {
          const bimbingan = await guidanceService.getByGuru(user.id);
          setBimbinganCount(bimbingan.length);
        }

        // Fetch Total Guru
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'guru');
        if (!error && count !== null) setTotalGuru(count);

        // Fetch Siswa and Kelas
        const [siswaRes, kelasRes] = await Promise.all([
          studentService.getAll(),
          classService.getAll()
        ]);
        setTotalSiswa(siswaRes.length);
        setTotalKelas(kelasRes.length);

        // Fetch Jurnal
        const jurnalRes = await journalService.getAll();
        setTotalJurnal(jurnalRes.length);
        setRecentJurnals(jurnalRes.slice(0, 5));

        // Aggregate Chart Data
        const typeCount = {};
        jurnalRes.forEach(j => {
          const jns = j.jenis || 'Lainnya';
          typeCount[jns] = (typeCount[jns] || 0) + 1;
        });
        const formattedChartData = Object.keys(typeCount).map(k => ({ name: k, total: typeCount[k] }));
        formattedChartData.sort((a, b) => b.total - a.total);
        setChartData(formattedChartData);

        // Fetch Kehadiran (Monthly Summaries for Semua)
        const kehadiranRes = await attendanceService.getMonthlySummaries('Semua');
        if (kehadiranRes.length > 0) {
          let totalSakit = 0, totalIzin = 0, totalTk = 0;
          let muridKritis = new Set();
          
          kehadiranRes.forEach(k => {
            totalSakit += k.sakit;
            totalIzin += k.izin;
            totalTk += k.tk;
            if (k.tk > 0) muridKritis.add(k.murid);
          });
          
          const totalHariEfektif = kehadiranRes.length * 26;
          const totalAbsen = totalSakit + totalIzin + totalTk;
          const totalHadir = totalHariEfektif - totalAbsen;
          
          if (totalHariEfektif > 0) {
            const pct = Math.round((totalHadir / totalHariEfektif) * 100);
            setKehadiranSiswa(`${pct}%`);
          }
          setPerluPerhatian(muridKritis.size);
        }

        // Fetch Pengumuman
        const pengumumanRes = await announcementService.getAll();
        setPengumuman(pengumumanRes.slice(0, 3).map(a => ({
           id: a.id,
           judul: a.title,
           isi: a.content,
           tanggal: a.date,
           prioritas: a.type
        })));
        
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      }
    };

    fetchAllData();
  }, [user]);

  const adminStats = [
    { title: 'Total Guru', value: totalGuru.toString(), icon: <UserCircle size={24} />, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { title: 'Total Siswa', value: totalSiswa.toString(), icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Kelas', value: totalKelas.toString(), icon: <GraduationCap size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Jurnal Masuk', value: totalJurnal.toString(), icon: <BookOpen size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  const guruStats = [
    { title: 'Murid Bimbingan', value: bimbinganCount.toString(), icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Jurnal Saya', value: totalJurnal.toString(), icon: <BookOpen size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Kehadiran Siswa', value: kehadiranSiswa, icon: <GraduationCap size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Perlu Perhatian', value: perluPerhatian.toString(), icon: <AlertCircle size={24} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ];

  const stats = user?.role === 'admin' ? adminStats : guruStats;

  return (
    <>
      <PageHeader 
        title={`Selamat Datang, ${user?.nama || user?.username || 'User'}! 👋`}
        breadcrumbs={[
          { label: 'Aplikasi Guru Wali' },
          { label: 'Dashboard' }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1.5 cursor-default group">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white leading-none">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 mb-6 transition-all duration-300">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Analitik Jenis Jurnal Bimbingan</h3>
        <div className="h-[320px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    // Assign colors based on typical categories or just alternating
                    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Belum ada data jurnal yang cukup untuk grafik.</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Charts / Lists */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 min-h-[400px]">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Aktivitas Jurnal Terkini</h3>
           {recentJurnals.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
               <BookOpen size={40} className="mb-3 opacity-50" />
               <p className="text-sm">Belum ada jurnal. Mulai catat bimbingan Anda.</p>
             </div>
           ) : (
             <div className="space-y-3">
               {recentJurnals.map((j, idx) => (
                 <div key={j.id || idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group cursor-pointer">
                   <div className="w-10 h-10 rounded-lg bg-primary-light dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                     {j.murid ? j.murid.charAt(0) : '?'}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                       <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{j.murid || 'Unknown'}</h4>
                       <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2"><Calendar size={12} /> {j.tanggal}</span>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">{j.topik || 'Tidak ada topik'}</p>
                     <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                       j.jenis?.includes('Akademik') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                       j.jenis?.includes('Kompetensi') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                       j.jenis?.includes('Keterampilan') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                       j.jenis?.includes('Karakter') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                       'bg-gray-100 text-gray-600'
                     }`}>{j.jenis}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
        
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 min-h-[400px]">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Pengumuman</h3>
           <div className="space-y-4">
             {pengumuman.length === 0 ? (
               <p className="text-sm text-gray-500">Belum ada pengumuman.</p>
             ) : (
               pengumuman.map((item, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => { setSelectedPengumuman(item); setShowModal(true); }}
                   className={`p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${item.prioritas === 'penting' ? 'bg-primary-light/50 dark:bg-gray-800 hover:bg-primary-light cursor-pointer' : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-white'}`}
                 >
                   <h4 className={`font-semibold text-sm mb-1 ${item.prioritas === 'penting' ? 'text-primary dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{item.judul}</h4>
                   <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.tanggal}</p>
                   {item.prioritas === 'penting' && <span className="inline-block px-2 py-1 bg-white dark:bg-gray-700 text-primary text-[10px] font-bold rounded-md uppercase">{item.prioritas}</span>}
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Modal Pengumuman */}
      {showModal && selectedPengumuman && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Pengumuman</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{selectedPengumuman.judul}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{selectedPengumuman.tanggal}</span>
                  {selectedPengumuman.prioritas === 'penting' && (
                    <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-md uppercase">Penting</span>
                  )}
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                {selectedPengumuman.isi}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
