import { Menu, Moon, Sun, LogOut, UserCircle, ChevronDown, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Header({ toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
          
        if (data && data.length > 0) {
          setAnnouncements(data);
          const latestId = data[0].id;
          const lastSeenId = localStorage.getItem('last_seen_announcement');
          
          if (lastSeenId !== latestId) {
            setHasNewAnnouncement(true);
            const idx = data.findIndex(a => a.id == lastSeenId);
            setUnreadCount(idx === -1 ? data.length : idx);
          } else {
            setUnreadCount(0);
          }
        }
      } catch (e) {
        console.error('Error checking announcements', e);
      }
    };
    
    if (user) {
      checkAnnouncements();
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      if (user.avatar_url) {
        setProfilePic(user.avatar_url);
      } else {
        const savedPic = localStorage.getItem(`profilePic_${user.id}`);
        if (savedPic) {
          setProfilePic(savedPic);
        } else {
          setProfilePic(null);
        }
      }
    }
  }, [user, dropdownOpen]); // Refresh when dropdown opens just in case

  const displayName = user?.nama || (user?.role === 'admin' ? 'Administrator' : 'Pengguna');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-surface-dark shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-4 hidden md:block" />
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 text-gray-500 rounded-xl md:hidden hover:bg-primary-light hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-1 sm:gap-4 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const newState = !notifOpen;
              setNotifOpen(newState);
              if (newState && announcements.length > 0) {
                localStorage.setItem('last_seen_announcement', announcements[0].id);
                setHasNewAnnouncement(false);
                setUnreadCount(0);
              }
            }}
            className="relative p-2.5 text-gray-500 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {hasNewAnnouncement && (
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
          
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-soft-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-50 transform opacity-100 scale-100 transition-all origin-top-right">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                 <h3 className="font-bold text-gray-800 dark:text-gray-200">Notifikasi</h3>
                 <span className="text-xs bg-primary-light dark:bg-primary/20 text-primary px-2 py-1 rounded-md font-semibold">{unreadCount} Baru</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">Belum ada pengumuman terbaru.</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {announcements.map((ann, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => { setNotifOpen(false); navigate('/dashboard'); }}>
                        <div className="flex gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                             <Bell size={14} />
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-1">{ann.title}</p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ann.content}</p>
                             <p className="text-[10px] text-gray-400 mt-2 font-medium">{ann.date}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full py-2 text-xs font-semibold text-primary hover:text-primary-hover transition-colors text-center block"
                >
                  Lihat Semua di Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <div className={`rounded-full overflow-hidden flex items-center justify-center ${profilePic ? 'w-9 h-9 border border-gray-200 dark:border-gray-700' : 'bg-primary-light dark:bg-primary/20 text-primary p-2'}`}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={20} />
              )}
            </div>
            <div className="hidden md:flex flex-col items-start leading-none mr-1">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {displayName}
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize mt-1 uppercase tracking-wider">
                {user?.role || 'Guest'}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-surface-dark rounded-xl shadow-soft-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-50 transform opacity-100 scale-100 transition-all origin-top-right">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                 <div className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${profilePic ? 'w-11 h-11 border border-gray-200 dark:border-gray-700' : 'bg-primary-light dark:bg-primary/20 text-primary p-2.5'}`}>
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={24} />
                    )}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Guest'}</p>
                 </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-light hover:text-primary dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <UserCircle size={18} />
                  Profil
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
