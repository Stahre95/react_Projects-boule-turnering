"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import ScoreTable from '../../components/ScoreTable';

function formatDate(value) {
  if (!value) return '-';
  const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatScore(match) {
  if (match.score1 != null && match.score2 != null) {
    return `${match.score1} - ${match.score2}`;
  }
  return 'Ej registrerat';
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [deletingTournament, setDeletingTournament] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !params?.id) return;

    const fetchTournament = async () => {
      setLoadingTournament(true);
      setError('');

      try {
        const tournamentRef = doc(db, 'tournaments', params.id);
        const snapshot = await getDoc(tournamentRef);

        if (!snapshot.exists()) {
          setError('Turneringen hittades inte.');
          setTournament(null);
          return;
        }

        setTournament({ id: snapshot.id, ...snapshot.data() });
      } catch (err) {
        console.error('Failed to load tournament', err);
        setError('Kunde inte ladda turneringen. Kontrollera att du har tillgång och försök igen senare.');
        setTournament(null);
      } finally {
        setLoadingTournament(false);
      }
    };

    fetchTournament();
  }, [params?.id, user]);

  const handleDeleteTournament = async () => {
    if (!user || !tournament?.id) return;

    const confirmed = window.confirm(
      'Är du säker på att du vill ta bort hela turneringen och all dess data? Detta kan inte ångras.'
    );
    if (!confirmed) return;

    setDeletingTournament(true);
    setError('');

    try {
      await deleteDoc(doc(db, 'tournaments', tournament.id));
      router.push('/profile');
    } catch (err) {
      console.error('Failed to delete tournament', err);
      setError('Kunde inte ta bort turneringen. Försök igen senare.');
    } finally {
      setDeletingTournament(false);
    }
  };

  const renderMatchGroup = (title, matches) => (
    <div className="rounded-[32px] bg-white/5 border border-white/10 p-4 sm:p-6 shadow-inner shadow-black/20">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {matches.length === 0 ? (
        <p className="text-gray-400">Inga matcher sparade för {title.toLowerCase()}.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div
              key={`${match.player1}-${match.player2}-${index}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4"
            >
              <span className="text-sm text-gray-200 truncate">{match.player1}</span>
              <span className="text-sm font-semibold text-yellow-300">{formatScore(match)}</span>
              <span className="text-sm text-gray-200 text-right truncate">{match.player2}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlayoffSection = (playoffData) => {
    if (!playoffData) {
      return <p className="text-gray-400">Ingen slutspelsdata sparad för den här turneringen.</p>;
    }

    const rounds = [
      { title: 'Round of 32', key: 'roundOf32' },
      { title: 'Round of 16', key: 'roundOf16' },
      { title: 'Kvartsfinal', key: 'quarterfinals' },
      { title: 'Semifinal', key: 'semifinals' },
      { title: 'Final', key: 'finals' },
    ];

    return (
      <div className="space-y-6">
        {rounds.map(({ title, key }) => {
          const matches = playoffData[key] || [];
          return (
            <div key={key} className="rounded-[32px] bg-white/5 border border-white/10 p-4 sm:p-6 shadow-inner shadow-black/20">
              <h4 className="text-base font-semibold text-white mb-3">{title}</h4>
              {matches.length === 0 ? (
                <p className="text-gray-400">Ingen data sparad för {title.toLowerCase()}.</p>
              ) : (
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <div
                      key={`${match.player1}-${match.player2}-${index}`}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <span className="text-sm text-gray-200 truncate">{match.player1}</span>
                      <span className="text-sm font-semibold text-yellow-300">{formatScore(match)}</span>
                      <span className="text-sm text-gray-200 text-right truncate">{match.player2}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading || loadingTournament) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <p className="text-xl font-semibold">Laddar turnering...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-950 px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl rounded-[32px] bg-white/5 border border-white/10 p-8 shadow-2xl">
          <h1 className="text-3xl font-semibold mb-4">Kunde inte ladda turneringen</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/profile" className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-black font-semibold transition hover:bg-yellow-300">
              Tillbaka till profilen
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/80 px-6 py-3 text-white transition hover:bg-slate-900">
              Till startsidan
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const rawRounds = tournament.groupRounds || tournament.rounds || { round1: [], round2: [] };
  const rounds = {
    round1: Array.isArray(rawRounds?.round1) ? rawRounds.round1 : [],
    round2: Array.isArray(rawRounds?.round2) ? rawRounds.round2 : [],
  };
  const players = Array.isArray(tournament.players) ? tournament.players : [];
  const playoffData = tournament.playoffData || null;
  const statusLabel = tournament.status === 'finished' ? 'Avslutad' : 'Aktiv';
  const winnerLabel = tournament.winner || 'Ej fastställd';

  return (
    <section className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start pt-24 sm:pt-28 text-white px-4 sm:px-6" style={{ backgroundImage: "url('/images/hero_background.jpg')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80"></div>
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-300 mb-3">Turneringsdetaljer</p>
              <h1 className="text-3xl sm:text-4xl font-bold">{players.length} spelare · {tournament.playoffType}</h1>
              <p className="mt-3 text-gray-300 max-w-2xl">Visa resultat och tabell för den valda turneringen. Detta är en readonly-översikt.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4 text-center">
                <p className="text-xs uppercase text-gray-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-white">{statusLabel}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4 text-center">
                <p className="text-xs uppercase text-gray-400">Skapad</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatDate(tournament.createdAt)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4 text-center">
                <p className="text-xs uppercase text-gray-400">Vinnare</p>
                <p className="mt-2 text-lg font-semibold text-yellow-300">{winnerLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Gruppmatcher</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderMatchGroup('Omgång 1', rounds.round1 || [])}
                {renderMatchGroup('Omgång 2', rounds.round2 || [])}
              </div>
            </div>

            <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Slutspel</h2>
              {renderPlayoffSection(playoffData)}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <ScoreTable players={players} rounds={rounds} playoffType={tournament.playoffType} />
            </div>

            <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Snabbinfo</h2>
              <div className="space-y-4 text-gray-300">
                <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4">
                  <p className="text-sm text-gray-400">Antal spelare</p>
                  <p className="mt-2 text-lg font-semibold text-white">{players.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4">
                  <p className="text-sm text-gray-400">Playoff</p>
                  <p className="mt-2 text-lg font-semibold text-white capitalize">{tournament.playoffType}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/70 border border-white/10 p-4">
                  <p className="text-sm text-gray-400">Turneringsstatus</p>
                  <p className="mt-2 text-lg font-semibold text-white">{statusLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteTournament}
                disabled={deletingTournament}
                className="mt-6 w-full inline-flex items-center justify-center rounded-full border border-red-500 bg-transparent px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingTournament ? 'Tar bort...' : 'Ta bort turnering'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link href="/profile" className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-black font-semibold transition hover:bg-yellow-300">
            Tillbaka till profilen
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-950/80 px-6 py-3 text-white transition hover:bg-slate-900">
            Till startsidan
          </Link>
        </div>
      </div>
    </section>
  );
}
