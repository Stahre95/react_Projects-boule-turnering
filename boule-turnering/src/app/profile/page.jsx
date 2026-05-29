"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteUser, updateEmail, updateProfile } from 'firebase/auth';

function formatDate(value) {
  if (!value) return '-';
  const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const fetchData = async () => {
      setProfileLoading(true);
      setError('');
      try {
        const tournamentsQuery = query(
          collection(db, 'tournaments'),
          where('owner', '==', user.uid)
        );
        const snap = await getDocs(tournamentsQuery);
        const items = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
            const bTime = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
            return bTime - aTime;
          });
        setTournaments(items);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profileData = userDoc.exists() ? userDoc.data() : {};
        setFormState({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: user.email || profileData.email || '',
          phoneNumber: profileData.phoneNumber || '',
        });
      } catch (err) {
        console.error('Failed to load profile or tournament history', err);
        setError('Kunde inte ladda profilinformation. Försök igen senare.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    setSuccess('');
    setError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const displayName = `${formState.firstName || ''} ${formState.lastName || ''}`.trim();

      if (formState.email !== user.email) {
        await updateEmail(user, formState.email);
      }

      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      await setDoc(
        userDocRef,
        {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phoneNumber: formState.phoneNumber,
          displayName,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccess('Din profil har sparats.');
    } catch (err) {
      console.error('Failed to save profile', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Uppdatering av e-post kräver att du loggar in igen. Logga ut och logga in på nytt.');
      } else {
        setError('Kunde inte spara profilen. Försök igen senare.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Är du säker? Detta tar bort ditt konto och alla sparade turneringar permanent.'
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const tournamentsQuery = query(
        collection(db, 'tournaments'),
        where('owner', '==', user.uid)
      );
      const snap = await getDocs(tournamentsQuery);
      const batch = writeBatch(db);
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      batch.delete(doc(db, 'users', user.uid));
      await batch.commit();

      await deleteUser(user);
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Failed to delete account', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Kontoborttagning kräver att du loggar in igen. Logga ut och logga in innan du försöker igen.');
      } else {
        setError('Kunde inte ta bort kontot just nu. Försök igen senare.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const activeTournament = tournaments.find((t) => t.status === 'active');
  const finishedTournaments = tournaments.filter((t) => t.status === 'finished');

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start pt-24 sm:pt-28 text-white px-4 sm:px-6"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80"></div>

      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg tracking-wide">
            First Camp Västerås
          </h1>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl text-gray-200 font-semibold">
            Din profil och turneringshistorik
          </h2>
        </div>

        <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl mb-6">
          <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4">Profilinformation</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-gray-300">
                Förnamn
                <input
                  value={formState.firstName}
                  onChange={handleChange('firstName')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-yellow-300"
                  placeholder="Förnamn"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Efternamn
                <input
                  value={formState.lastName}
                  onChange={handleChange('lastName')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-yellow-300"
                  placeholder="Efternamn"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-gray-300">
                E-postadress
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleChange('email')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-yellow-300"
                  placeholder="E-post"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Telefonnummer
                <input
                  value={formState.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-yellow-300"
                  placeholder="Telefonnummer"
                />
              </label>
            </div>

            {success && <p className="text-green-300">{success}</p>}
            {error && <p className="text-red-300">{error}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-black font-semibold shadow-xl transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex w-full items-center justify-center rounded-full border border-red-500 bg-transparent px-6 py-3 text-red-300 font-semibold shadow-xl transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deleting ? 'Tar bort...' : 'Ta bort konto'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4">Din turneringshistorik</h3>

            {profileLoading ? (
              <div className="text-gray-300">Laddar turneringar...</div>
            ) : error ? (
              <div className="rounded-3xl bg-red-500/20 border border-red-400 p-4 text-red-100">{error}</div>
            ) : (
              <div className="space-y-4">
                {activeTournament && (
                  <Link
                    href={`/tournament/${activeTournament.id}`}
                    className="block w-full text-left rounded-3xl border border-white/10 bg-slate-950/40 p-4 transition hover:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-yellow-300 uppercase tracking-[0.2em] mb-2">Aktiv turnering</p>
                        <p className="text-white font-semibold">{activeTournament.players.length} spelare</p>
                        <p className="text-sm text-gray-300">{activeTournament.playoffType}</p>
                        <p className="text-sm text-gray-400">Skapad {formatDate(activeTournament.createdAt)}</p>
                      </div>
                      <div className="text-right text-sm font-semibold text-yellow-300">Visa detaljer →</div>
                    </div>
                  </Link>
                )}

                {finishedTournaments.length > 0 ? (
                  <div className="space-y-3">
                    {finishedTournaments.map((tournament) => (
                      <Link
                        key={tournament.id}
                        href={`/tournament/${tournament.id}`}
                        className="block w-full text-left rounded-3xl border border-white/10 bg-slate-950/40 p-4 transition hover:bg-slate-950/60"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-white font-semibold">{tournament.players.length} spelare</p>
                            <p className="text-sm text-gray-300 capitalize">{tournament.playoffType}</p>
                            <p className="text-sm text-gray-400">Avslutad {formatDate(tournament.finishedAt ?? tournament.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">Vinnare</p>
                            <p className="text-yellow-300">{tournament.winner || 'Ej fastställd'}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-4 text-gray-300">
                    Ingen avslutad turnering hittades ännu.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4">Kontodetaljer</h3>
            <div className="space-y-4 text-gray-300">
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-4">
                <p className="text-xs sm:text-sm text-gray-400">Kontot skapades</p>
                <p className="text-white font-medium">{formatDate(user?.metadata?.creationTime)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-4">
                <p className="text-xs sm:text-sm text-gray-400">Antal sparade turneringar</p>
                <p className="text-white font-medium">{tournaments.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-4">
                <p className="text-xs sm:text-sm text-gray-400">Aktiv sparad turnering</p>
                <p className="text-white font-medium">{activeTournament ? 'Ja' : 'Nej'}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-4">
                <p className="text-xs sm:text-sm text-gray-400">Senaste turnering</p>
                <p className="text-white font-medium">{tournaments[0] ? formatDate(tournaments[0].finishedAt ?? tournaments[0].createdAt) : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-black font-semibold shadow-xl transition hover:bg-yellow-300"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </section>
  );
}

