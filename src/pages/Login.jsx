import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { UserCircle, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guru');
  const [isVisible, setIsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const appName = localStorage.getItem('GuruWali_AppName') || 'Guru Wali App.';
  const appLogo = localStorage.getItem('GuruWali_AppLogo') || null;

  // Trigger entrance animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // If already logged in, redirect
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username || !password) return;
    
    setIsLoading(true);
    try {
      await login(username, password, role);
      // AuthContext will automatically redirect because user state changes and the component re-renders
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal login. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark transition-colors duration-300">
      
      {/* Clean White Card */}
      <div 
        className={`w-full max-w-[450px] bg-white dark:bg-surface-dark rounded-[20px] shadow-soft-lg border border-gray-100 dark:border-gray-800 p-8 sm:p-10 relative z-10 transform transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="text-center mb-8">
          {/* Logo Placeholder */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {appLogo ? (
              <img src={appLogo} alt="App Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-primary/30">
                G
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight line-clamp-2">
              {appName}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-[15px]">
            Aplikasi Pendampingan Siswa Terpadu
          </p>
        </div>

        <div className="flex p-1 mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-transform duration-300 ease-out flex items-center justify-center ${
              role === 'admin' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
            }`}
          />
          <button
            type="button"
            onClick={() => {
              setRole('guru');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px] font-medium z-10 transition-colors duration-300 ${
              role === 'guru' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <UserCircle size={18} />
            Guru Wali
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14px] font-medium z-10 transition-colors duration-300 ${
              role === 'admin' ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Shield size={18} />
            Administrator
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl text-center border border-red-100 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-primary transition-all duration-200 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[15px]"
              placeholder="Masukkan username..."
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-primary transition-all duration-200 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[15px]"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-[15px] transition-all duration-200 text-white bg-primary hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 shadow-md shadow-primary/20 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
