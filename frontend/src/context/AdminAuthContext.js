'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage or cookies
    const storedAdmin = localStorage.getItem('biyodo_admin_user');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {}
    }

    authService.getMe()
      .then((res) => {
        if (res.data && res.data.success) {
          setAdmin(res.data.admin);
          localStorage.setItem('biyodo_admin_user', JSON.stringify(res.data.admin));
        }
      })
      .catch(() => {
        setAdmin(null);
        localStorage.removeItem('biyodo_admin_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data && res.data.success) {
      setAdmin(res.data.admin);
      localStorage.setItem('biyodo_admin_user', JSON.stringify(res.data.admin));
      if (res.data.token) {
        localStorage.setItem('biyodo_admin_token', res.data.token);
      }
      return res.data;
    }
    throw new Error('Erreur de connexion');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    setAdmin(null);
    localStorage.removeItem('biyodo_admin_user');
    localStorage.removeItem('biyodo_admin_token');
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
