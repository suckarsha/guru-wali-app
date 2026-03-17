import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage session on mount
    const savedSession = localStorage.getItem('authSession');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setLoading(false);
  }, []);

  const loginWithPassword = async (username, password, selectedRole) => {
    setLoading(true);
    try {
      // Simulate network wait
      await new Promise(resolve => setTimeout(resolve, 800));

      let matchedUser = null;

      if (selectedRole === 'admin') {
        if (username === 'admin' && password === 'admin') {
          matchedUser = {
            id: 'admin-id',
            nama: 'Administrator',
            role: 'admin',
            username: 'admin',
            nip: '-'
          };
        }
      } else {
        // Find in dataGuru from local storage
        const usersStr = localStorage.getItem('dataGuru');
        if (usersStr) {
          const users = JSON.parse(usersStr);
          matchedUser = users.find(u => u.username === username && u.password === password);
          if (matchedUser) {
            matchedUser.role = 'guru';
          }
        } else {
          // Check initialGuru if it hasn't been saved to localstorage yet
          const initialGuru = [
            { id: 1, nama: 'I Kadek Sukarsa, S.Pd., M.Pd.', nip: '198501012010011001', username: 'kadeksukarsa', kelas: 'X MIPA 1' },
            { id: 2, nama: 'Ni Luh Putu Sari, S.Pd.', nip: '198703152012042001', username: 'putusari', kelas: 'XI IPS 1' },
            { id: 3, nama: 'I Made Budi Artawan, S.Pd.', nip: '199005202014031002', username: 'budiartawan', kelas: 'XII Bahasa' },
            { id: 4, nama: 'Ni Wayan Rai, S.Pd., M.Pd.', nip: '198209102008042003', username: 'wayanrai', kelas: 'X MIPA 2' },
            { id: 5, nama: 'I Gede Arya, S.Pd.', nip: '199112252015041001', username: 'gedearya', kelas: 'XI IPS 2' },
          ];
          const found = initialGuru.find(u => u.username === username);
          
          // Fallback password for initial gurus if not yet changed in Data Guru is '123456'
          if (found && password === '123456') {
             matchedUser = { ...found, role: 'guru' };
          }
        }
      }

      if (!matchedUser) {
        throw new Error('Username atau password salah.');
      }

      setUser(matchedUser);
      localStorage.setItem('authSession', JSON.stringify(matchedUser));
      return matchedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    localStorage.removeItem('authSession');
    
    // Clear old auth token if exists
    localStorage.removeItem('sb-xyegrzqazawquesjmapq-auth-token');
    
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginWithPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
