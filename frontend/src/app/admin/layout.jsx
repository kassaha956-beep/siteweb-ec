'use client';

import React from 'react';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/AdminLayout';

export default function RootAdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}
