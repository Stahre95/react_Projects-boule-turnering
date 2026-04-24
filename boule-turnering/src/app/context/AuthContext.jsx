"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      console.error('Auth not initialized - auth is falsy');
      setError('Authentication service not initialized');
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Firebase auth timeout - connection blocked or delayed');
        setError('Firebase connection blocked or unavailable.');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        clearTimeout(timeout);
        setUser(currentUser);
        setLoading(false);
      },
      (authError) => {
        clearTimeout(timeout);
        console.error('Auth state change error:', authError);
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, firstName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (firstName && result.user) {
        await updateProfile(result.user, { displayName: firstName });
      }
      return result;
    } catch (err) {
      console.error('Register error:', err.code, err.message);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err.message);
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}