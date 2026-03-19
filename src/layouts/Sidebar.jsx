import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, UserCircle, Settings, ClipboardList, 
  BarChart3, School, ListChecks, FileText, CalendarCheck, Database, PieChart, Megaphone
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminMenu = [
    { type: 'label', title: 'UTAMA' },
    { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { type: 'label', title: 'MASTER DATA' },
    { title: 'Data Guru', path: '/guru', icon: <UserCircle size={20} /> },
    { title: 'Data Siswa', path: '/siswa', icon: <Users size={20} /> },
    { title: 'Data Kelas', path: '/kelas', icon: <BookOpen size={20} /> },
    { type: 'label', title: 'LAPORAN' },
    { title: 'Monitoring', path: '/monitoring', icon: <BarChart3 size={20} /> },
    { type: 'label', title: 'PENGATURAN' },
    { title: 'Kelola Pengumuman', path: '/pengumuman', icon: <Megaphone size={20} /> },
    { title: 'Data Sekolah', path: '/sekolah', icon: <School size={20} /> },
    { title: 'Pengaturan', path: '/settings', icon: <Settings size={20} /> },
  ];

  const guruMenu = [
    { type: 'label', title: 'UTAMA' },
    { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { title: 'Program Kegiatan', path: '/program', icon: <ListChecks size={20} /> },
    { type: 'label', title: 'BIMBINGAN' },
    { title: 'Murid Bimbingan', path: '/murid-bimbingan', icon: <Users size={20} /> },
    { type: 'label', title: 'INPUT' },
    { title: 'Jurnal Guru Wali', path: '/jurnal', icon: <ClipboardList size={20} /> },
    { title: 'Rekap Kehadiran', path: '/kehadiran', icon: <CalendarCheck size={20} /> },
    { type: 'label', title: 'DATA' },
    { title: 'Data Bimbingan', path: '/data-bimbingan', icon: <FileText size={20} /> },
    { title: 'Data Kehadiran', path: '/data-kehadiran', icon: <PieChart size={20} /> },
  ];

  const menuItems = isAdmin ? adminMenu : guruMenu;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[270px] bg-white dark:bg-surface-dark shadow-soft-lg border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center px-6 h-[76px]">
          <img src="/logo.png" alt="Guru Wali App" className="h-9 w-auto object-contain" />
        </div>

        <nav className="p-4 space-y-0.5 mt-1 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 140px)' }}>
          {menuItems.map((item, index) => {
            if (item.type === 'label') {
              return (
                <p key={index} className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 pt-5 pb-2">
                  {item.title}
                </p>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-primary text-white font-medium shadow-md shadow-primary/30'
                      : 'text-gray-600 dark:text-gray-400 hover:translate-x-1.5 focus:outline-none'
                  }`
                }
              >
                <div className="group-hover:text-primary transition-colors duration-200">
                  {item.icon}
                </div>
                <span className="text-[15px] group-hover:text-primary transition-colors duration-200">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Credit */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm flex justify-center items-center">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            created with <span className="text-red-500 animate-pulse inline-block">❤</span> by{' '}
            <a 
              href="https://www.instagram.com/suckarsha/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:text-primary-hover font-bold transition-colors underline decoration-primary/30 hover:decoration-primary decoration-2 underline-offset-2"
            >
              IKS
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

