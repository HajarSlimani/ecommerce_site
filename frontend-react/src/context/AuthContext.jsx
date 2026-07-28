import React, { createContext, useContext, useEffect, useState } from 'react';
import { authFetchJson, fetchJson, getStoredToken, setStoredToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await authFetchJson('/api/auth/me');
      setUser(me);
    } catch (err) {
      // Token expiré/invalide : on nettoie pour repartir propre.
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function register(email, password) {
    setError('');
    try {
      const auth = await fetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      setStoredToken(auth.token);
      setUser({ id: auth.userId, email: auth.email, role: auth.role });
      return true;
    } catch (err) {
      setError(err.message || "L'inscription a échoué.");
      return false;
    }
  }

  async function login(email, password) {
    setError('');
    try {
      const auth = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      setStoredToken(auth.token);
      setUser({ id: auth.userId, email: auth.email, role: auth.role });
      return true;
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
      return false;
    }
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
  }

  const value = { user, loading, error, register, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
