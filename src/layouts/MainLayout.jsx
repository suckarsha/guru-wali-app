import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { settingService } from '../services/settingService';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  
  const [appInfo, setAppInfo] = useState({
    name: localStorage.getItem('GuruWali_AppName_Cache') || 'Guru Wali App.',
    logo: localStorage.getItem('GuruWali_AppLogo_Cache') || '/logo.png'
  });

  useEffect(() => {
    if (user) {
      settingService.getSettings()
        .then(data => {
          if (data) {
            const fetchedName = data.app_name || 'Guru Wali App.';
            const fetchedLogo = data.app_logo_url || '/logo.png';
            setAppInfo({ name: fetchedName, logo: fetchedLogo });
            localStorage.setItem('GuruWali_AppName_Cache', fetchedName);
            localStorage.setItem('GuruWali_AppLogo_Cache', fetchedLogo);
          }
        })
        .catch(err => console.error('Failed to load global app settings:', err));
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Protected Route logic inside MainLayout (or wrapper)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} appInfo={appInfo} />
      
      <div className="md:ml-[270px] flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 lg:p-8">
          {/* Main content area */}
          <div className="w-full max-w-[1200px] mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
