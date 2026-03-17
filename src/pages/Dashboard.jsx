import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Users, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [bimbinganCount, setBimbinganCount] = useState(2); // default match empty state

  useEffect(() => {
    const saved = localStorage.getItem('selectedMuridBimbingan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBimbinganCount(parsed.length);
      } catch (e) {
        setBimbinganCount(2);
      }
    }
  }, []);

  const adminStats = [
    { title: 'Total Siswa', value: '1,245', icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Kelas', value: '36', icon: <GraduationCap size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Jurnal Hari Ini', value: '128', icon: <BookOpen size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Siswa Bermasalah', value: '12', icon: <AlertCircle size={24} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ];

  const guruStats = [
    { title: 'Murid Bimbingan', value: bimbinganCount.toString(), icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Jurnal Saya', value: '128', icon: <BookOpen size={24} />, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Kehadiran Siswa', value: '98%', icon: <GraduationCap size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Perlu Perhatian', value: '3', icon: <AlertCircle size={24} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
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
             <div className="p-4 bg-primary-light dark:bg-gray-800 rounded-xl">
               <h4 className="font-semibold text-primary dark:text-blue-400 text-sm mb-1">Rapat Evaluasi Bulanan</h4>
               <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Jumat, 24 Maret 2026 - 13:00 WIB</p>
               <span className="inline-block px-2 py-1 bg-white dark:bg-gray-700 text-primary text-[10px] font-bold rounded-md">PENTING</span>
             </div>
             <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
               <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Batas Pengisian Jurnal</h4>
               <p className="text-xs text-gray-600 dark:text-gray-400">Mohon lengkapi jurnal minggu ini sebelum hari Sabtu.</p>
             </div>
           </div>
        </div>
      </div>
    </>
  );
}
