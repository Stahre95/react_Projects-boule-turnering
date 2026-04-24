"use client";

import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}