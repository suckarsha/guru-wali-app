import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Users, GraduationCap, BookOpen, AlertCircle, UserCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    try {
      const savedBimbingan = localStorage.getItem('selectedMuridBimbingan');
      if (savedBimbingan) setBimbinganCount(JSON.parse(savedBimbingan).length);

      // Fetch Total Guru from Supabase
      const fetchTotalGuru = async () => {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'guru');
        if (!error && count !== null) setTotalGuru(count);
      };
      fetchTotalGuru();

      const savedSiswa = localStorage.getItem('dataSiswa');
      if (savedSiswa) setTotalSiswa(JSON.parse(savedSiswa).length);

      const savedKelas = localStorage.getItem('dataKelas');
      if (savedKelas) setTotalKelas(JSON.parse(savedKelas).length);

      const savedJurnal = localStorage.getItem('jurnalData');
      if (savedJurnal) setTotalJurnal(JSON.parse(savedJurnal).length);

      const savedPengumuman = localStorage.getItem('dataPengumuman');
      if (savedPengumuman) setPengumuman(JSON.parse(savedPengumuman).slice(0, 3)); // Top 3
    } catch (e) {
      console.error(e);
    }
  }, []);

  const adminStats = [
    { title: 'Total Guru', value: totalGuru.toString(), icon: <UserCircle size={24} />, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { title: 'Total Siswa', value: totalSiswa.toString(), icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Kelas', value: totalKelas.toString(), icon: <GraduationCap size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Jurnal Masuk', value: totalJurnal.toString(), icon: <BookOpen size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  const guruStats = [
    { title: 'Murid Bimbingan', value: bimbinganCount.toString(), icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Jurnal Saya', value: totalJurnal.toString(), icon: <BookOpen size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Kehadiran Siswa', value: '100%', icon: <GraduationCap size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Perlu Perhatian', value: '0', icon: <AlertCircle size={24} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ];

  const stats = user?.role === 'admin' ? adminStats : guruStats;

  return (
    <>
      <PageHeader 
        title={`Selamat Datang, ${user?.username || 'User'}! 👋`}
        breadcrumbs={[
          { label: 'Aplikasi Guru Wali' },
          { label: 'Dashboard' }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
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
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Aktivitas Jurnal Terkini</h3>
           <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p>Area Grafik/Daftar (Belum Terintegrasi Data)</p>
           </div>
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
                   className={`p-4 rounded-xl cursor-pointer hover:shadow-md transition-all ${item.prioritas === 'penting' ? 'bg-primary-light dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
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
