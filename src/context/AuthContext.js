import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

/* All keys written by this app — cleared on logout */
const AUTH_KEYS     = ['sz_token', 'sz_user'];
const LEGACY_KEYS   = ['UserEmail', 'loginStatus', 'token', 'user'];

export function AuthProvider({ children }) {
  /* Hydrate auth state from localStorage on cold start — lazy initializer runs once */
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sz_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null; /* corrupted storage — start unauthenticated */
    }
  });

  /* Persist token + user object and update React state */
  const login = (userData, token) => {
    localStorage.setItem('sz_token', token);
    localStorage.setItem('sz_user', JSON.stringify(userData));
    setUser(userData);
  };

  /* Wipe all auth keys (current + legacy) and session storage, then clear state */
  const logout = () => {
    [...AUTH_KEYS, ...LEGACY_KEYS].forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    setUser(null);
  };

  /* Sync profile edits to localStorage so state survives a hard refresh */
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
