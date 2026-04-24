"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, loading, logout } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <aside className="hidden lg:flex fixed left-8 top-[15vh] flex-col justify-between items-center w-20 h-[70vh] px-3 py-4 bg-slate-900/10 text-white shadow-none backdrop-blur-xl border border-white/10 rounded-[32px] z-30">
        <div className="flex flex-col items-center gap-5">
          <Link href="/profile" className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 border border-white/10 transition hover:bg-white/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 text-yellow-300"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="Logga ut"
          className="flex h-12 w-12 items-center justify-center rounded-3xl bg-red-500/85 text-white transition hover:bg-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </aside>

      <Link
        href="/profile"
        aria-label="Profil"
        className="lg:hidden fixed left-4 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/80 text-white border border-white/10 shadow-xl backdrop-blur-md transition hover:bg-slate-900/95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7 text-yellow-300"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </Link>

      <button
        type="button"
        onClick={logout}
        aria-label="Logga ut"
        className="lg:hidden fixed right-4 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/80 text-white border border-white/10 shadow-xl backdrop-blur-md transition hover:bg-slate-900/95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </>
  );
}
