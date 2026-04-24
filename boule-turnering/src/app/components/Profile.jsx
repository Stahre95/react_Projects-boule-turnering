"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile({ onContinue }) {
  const { profile, updateUserProfile, logout, isOffline } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate required fields
    if (!formData.firstName.trim()) {
      setError('Förnamn är obligatoriskt');
      setLoading(false);
      return;
    }

    try {
      await updateUserProfile(formData);
      setSuccess('Profil uppdaterad framgångsrikt!');
    } catch (err) {
      setError(err.message || 'Ett fel inträffade vid uppdatering av profilen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!profile) {
    return <div>Laddar profil...</div>;
  }

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white px-4 sm:px-6"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      {/* Gradient + dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-5xl px-4">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl xs:text-3xl font-extrabold leading-tight drop-shadow-lg tracking-wide mb-4">
          First Camp Västerås
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl xs:text-3xl mb-8 text-gray-200 font-light">
          Min Profil
        </h2>

        {/* Profile Form */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-2xl">
          {isOffline() && (
            <div className="mb-6 rounded-md bg-yellow-500/20 border border-yellow-400 p-4">
              <div className="text-sm text-yellow-200">
                ⚠️ Offline-läge: Dina ändringar sparas lokalt och synkroniseras när anslutningen återställs.
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">
              Uppdatera din profil
            </h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-1">
                  Förnamn *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                  placeholder="Ange ditt förnamn"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-1">
                  Efternamn
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                  placeholder="Ange ditt efternamn"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  E-postadress
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                  placeholder="Ange din e-postadress"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-400 p-4">
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-500/20 border border-green-400 p-4">
                <div className="text-sm text-green-200">{success}</div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Sparar...' : 'Spara profil'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Logga ut
              </button>
              {onContinue && (
                <button
                  type="button"
                  onClick={onContinue}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Gå vidare till turnering
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}