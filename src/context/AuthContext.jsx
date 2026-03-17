import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

      // First, fetch the user with matching username, password, and role
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('role', selectedRole)
        .single();
        
      if (error || !data) {
        throw new Error('Username atau password salah, atau peran tidak sesuai.');
      }
      
      const matchedUser = data;

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
