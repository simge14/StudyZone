import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

/* All keys written by this app — cleared on logout */
const AUTH_KEYS     = ['sz_token', 'sz_user'];
const LEGACY_KEYS   = ['UserEmail', 'loginStatus', 'token', 'user'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sz_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData, token) => {
    localStorage.setItem('sz_token', token);
    localStorage.setItem('sz_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    /* Clear all auth-related localStorage keys */
    [...AUTH_KEYS, ...LEGACY_KEYS].forEach((k) => localStorage.removeItem(k));
    /* Clear any session-only data */
    sessionStorage.clear();
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('sz_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
