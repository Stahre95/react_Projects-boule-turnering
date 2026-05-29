"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Ange både e-post och lösenord');
      setLoading(false);
      return;
    }

    if (!isLogin && !firstName.trim()) {
      setError('Förnamn är obligatoriskt för registrering');
      setLoading(false);
      return;
    }

    if (!isLogin && !lastName.trim()) {
      setError('Efternamn är obligatoriskt för registrering');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, firstName.trim(), lastName.trim());
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Ett fel inträffade. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start pt-24 sm:pt-28 text-white px-4 sm:px-6"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      {/* Gradient + dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-5xl px-4">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg tracking-wide mb-4">
          First Camp Västerås
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl mb-8 text-gray-200 font-light">
          Bouleturnering {new Date().getFullYear()}
        </h2>

        {/* Login/Register Form */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white">
              {isLogin ? 'Logga in på ditt konto' : 'Skapa ett nytt konto'}
            </h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="firstName" className="sr-only">Förnamn</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={!isLogin}
                      disabled={loading}
                      className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                      placeholder="Förnamn"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="sr-only">Efternamn</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required={!isLogin}
                      disabled={loading}
                      className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                      placeholder="Efternamn"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="sr-only">E-postadress</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                  placeholder="E-postadress"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Lösenord</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-white/20 placeholder-white/70 text-white bg-white/10 backdrop-blur-sm rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm disabled:bg-gray-100/20"
                  placeholder="Lösenord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-400 p-4">
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Bearbetar...' : (isLogin ? 'Logga in' : 'Registrera')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsLogin(!isLogin)}
                className="text-yellow-300 hover:text-yellow-200 font-medium disabled:text-gray-400"
              >
                {isLogin ? 'Behöver du ett konto? Registrera' : 'Har du redan ett konto? Logga in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}