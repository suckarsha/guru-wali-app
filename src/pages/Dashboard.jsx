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
  const [recentActivities, setRecentActivities] = useState([]);
  
  const [kehadiranSiswa, setKehadiranSiswa] = useState('100%');
  const [perluPerhatian, setPerluPerhatian] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchAllData = async () => {
      try {
        // Fetch Bimbingan Count
        let bimbinganList = [];
        if (user.role === 'guru') {
          bimbinganList = await guidanceService.getByGuru(user.id);
          setBimbinganCount(bimbinganList.length);
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
        setTotalJurnal(user.role === 'admin' ? jurnalRes.length : jurnalRes.filter(j => j.guru_id === user.id).length);

        // Fetch Recent Activities (Mixed Jurnal & Kehadiran)
        try {
           let jData = [];
           let aData = [];
           
           const jq = supabase.from('guidance_journals').select('*, students(name), profiles(nama)').order('created_at', { ascending: false }).limit(10);
           if (user.role === 'guru') jq.eq('guru_id', user.id);
           const { data: jd } = await jq;
           if (jd) jData = jd.map(j => ({ type: 'jurnal', timestamp: j.created_at, data: j }));
           
           const aq = supabase.from('attendance_records').select('*, students(name), profiles(nama)').order('created_at', { ascending: false }).limit(20);
           const { data: ad } = await aq;
           if (ad) {
              const bimbinganIds = bimbinganList.map(b => b.id);
              const filteredAd = user.role === 'admin' ? ad : ad.filter(a => bimbinganIds.includes(a.student_id));
              aData = filteredAd.map(a => ({ type: 'kehadiran', timestamp: a.created_at, data: a }));
           }
           
           const mixed = [...jData, ...aData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
           setRecentActivities(mixed);
        } catch (e) {
           console.error('Error fetching activities:', e);
        }

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

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Charts / Lists */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 min-h-[400px]">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Aktivitas Terkini</h3>
           {recentActivities.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
               <BookOpen size={40} className="mb-3 opacity-50" />
               <p className="text-sm">Belum ada aktivitas.</p>
             </div>
           ) : (
             <div className="space-y-3">
               {recentActivities.map((act, idx) => {
                 const isJurnal = act.type === 'jurnal';
                 const mName = act.data.students?.name || act.data.murid || 'Unknown';
                 const gName = act.data.profiles?.nama || 'Guru';
                 const initial = mName.charAt(0);
                 
                 // Date Formatting
                 const dateObj = new Date(act.timestamp || act.data.tanggal);
                 const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                 return (
                   <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group cursor-default">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${isJurnal ? 'bg-primary-light dark:bg-primary/20 text-primary' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'}`}>
                       {initial}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                         <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                           {user.role === 'admin' ? `${gName} ➔ ` : ''}{mName}
                         </h4>
                         <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2"><Calendar size={12} /> {dateStr}</span>
                       </div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">
                         {isJurnal 
                           ? `Menambahkan Jurnal Topik: ${act.data.topik || 'Tidak ada topik'}` 
                           : `Memasukkan data Kehadiran: ${act.data.status || 'Tidak ada keterangan'} di tanggal ${act.data.tanggal}`}
                       </p>
                       <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${isJurnal ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                         {isJurnal ? act.data.jenis || 'Jurnal' : 'Kehadiran'}
                       </span>
                     </div>
                   </div>
                 );
               })}
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
