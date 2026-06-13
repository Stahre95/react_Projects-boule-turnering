import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { generateMatchRounds } from "../components/generateMatchRounds";
import { createSeededPlayoffData } from "../components/generatePlayoffData";
import { calculateLeagueTable } from "../components/calculateLeagueTable";
import MatchResultForm from "./MatchResultForm";
import ScoreTable from "./ScoreTable";
import PlayoffBracket from "./PlayoffBracket";

// Helper function to shorten player names to "Firstname L."
function shortenName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function TournamentOverview({ players, playoffType, initialRounds, onDeleteComplete }) {
  const router = useRouter();
  const { user } = useAuth();
  const [rounds, setRounds] = useState(initialRounds || { round1: [], round2: [] });
  const [showForm, setShowForm] = useState(false);
  const [showPlayoff, setShowPlayoff] = useState(false);
  const [playoffData, setPlayoffData] = useState(null);
  const [playoffSize, setPlayoffSize] = useState(0);
  const [standings, setStandings] = useState([]);
  const [deletingTournament, setDeletingTournament] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Generera matcher när players ändras
  useEffect(() => {
    if (!players) return;

    if (initialRounds) {
      setRounds(initialRounds);
      setShowPlayoff(false);
      setPlayoffData(null);
      setPlayoffSize(0);
      return;
    }

    const generated = generateMatchRounds(players);
    setRounds(generated);
    setShowPlayoff(false);
    setPlayoffData(null);
    setPlayoffSize(0);
  }, [players, initialRounds]);

  // Kontrollera om alla gruppmatcher är spelade
  function allGroupMatchesPlayed(rounds) {
    const allMatches = [...rounds.round1, ...rounds.round2];
    return allMatches.every(
      (match) => match.score1 !== null && match.score2 !== null
    );
  }

  // Spara resultat från MatchResultForm
  const handleSaveResults = async (updatedRounds) => {
    setRounds(updatedRounds);
    setShowForm(false);
    const leagueTable = calculateLeagueTable(players, updatedRounds);

    try {
      const activeId = localStorage.getItem('activeTournamentId');
      if (activeId && user) {
        const tRef = doc(db, 'tournaments', activeId);
        await updateDoc(tRef, {
          groupRounds: updatedRounds,
          leagueTable,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Failed to persist group round results to Firestore', err);
    }
  };

  // Beräkna och visa slutspel
  async function handleShowPlayoff() {
    const allMatches = [...rounds.round1, ...rounds.round2];

    console.log('Group matches before playoff creation:', {
      round1: rounds.round1,
      round2: rounds.round2,
    });

    // Beräkna poäng och målskillnad
    const playerStats = players.map((player) => {
      const playerName = typeof player === "object" ? player.player : player;
      let points = 0;
      let goalDifference = 0;

      allMatches.forEach((match) => {
        if (match.score1 !== null && match.score2 !== null) {
          if (match.player1 === playerName || match.player2 === playerName) {
            const goalsFor = match.player1 === playerName ? match.score1 : match.score2;
            const goalsAgainst = match.player1 === playerName ? match.score2 : match.score1;
            goalDifference += goalsFor - goalsAgainst;

            if (match.score1 === match.score2) {
              points += 0.5;
            } else if (
              (match.player1 === playerName && match.score1 > match.score2) ||
              (match.player2 === playerName && match.score2 > match.score1)
            ) {
              points += 1;
            }
          }
        }
      });

      return { player: playerName, points, goalDifference };
    });

    // Sortera från bäst till sämst
    playerStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return a.player.localeCompare(b.player);
    });

    setStandings(playerStats);

    // Bestäm antal spelare i slutspel
    const cutoff = playoffType === "sextondelsfinal" ? 32 : playoffType === "åttondelsfinal" ? 16 : playoffType === "kvartsfinal" ? 8 : playoffType === "semifinal" ? 4 : 2;

    const seededPlayoffData = createSeededPlayoffData(playoffType, playerStats.map((entry) => entry.player));
    if (seededPlayoffData) {
      console.log('Seeded playoff bracket created:', seededPlayoffData);
      setPlayoffData(seededPlayoffData);
      try {
        const activeId = localStorage.getItem('activeTournamentId');
        if (activeId && user) {
          const tRef = doc(db, 'tournaments', activeId);
          await updateDoc(tRef, {
            leagueTable: playerStats,
            playoffData: seededPlayoffData,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn('Failed to persist seeded playoff bracket to Firestore', err);
      }
    }

    setPlayoffSize(cutoff);
    setShowPlayoff(true);
  }

  const handleSavePlayoffResults = (updatedData) => {
    setPlayoffData(updatedData);

    // If finals are complete, finalize tournament in Firestore and clear local active tournament
    try {
      const finalMatch = (updatedData.finals && updatedData.finals[0]) || null;
      const winner = finalMatch ? (finalMatch.score1 > finalMatch.score2 ? finalMatch.player1 : finalMatch.score2 > finalMatch.score1 ? finalMatch.player2 : null) : null;
      if (finalMatch && finalMatch.score1 != null && finalMatch.score2 != null && winner) {
        const activeId = localStorage.getItem('activeTournamentId');
        if (activeId && user) {
          const tRef = doc(db, 'tournaments', activeId);
          updateDoc(tRef, {
            status: 'finished',
            playoffData: updatedData,
            winner: winner,
            finishedAt: serverTimestamp(),
          }).catch((err) => console.warn('Failed to finalize tournament in Firestore', err));
        }
        // remove local active tournament
        try { localStorage.removeItem('activeTournament'); localStorage.removeItem('activeTournamentId'); } catch (e) {}
      }
    } catch (err) {
      console.warn('Error while finalizing tournament:', err);
    }
  };

  const handleDeleteTournament = async () => {
    setDeletingTournament(true);

    try {
      const activeId = localStorage.getItem('activeTournamentId');
      if (activeId && user) {
        await deleteDoc(doc(db, 'tournaments', activeId));
      }
      localStorage.removeItem('activeTournament');
      localStorage.removeItem('activeTournamentId');
      setShowDeleteConfirm(false);

      // Prefer app-level handler to avoid full reloads (falls back to navigation)
      if (typeof onDeleteComplete === 'function') {
        try {
          await onDeleteComplete();
        } catch (e) {
          // ignore handler errors and fallback to navigation
          try { await router.replace('/'); } catch (err) {}
        }
      } else {
        try { await router.replace('/'); } catch (e) {}
        if (typeof window !== 'undefined') window.location.href = '/';
      }
    } catch (err) {
      console.warn('Failed to delete active tournament', err);
      setShowDeleteConfirm(false);
      window.alert('Kunde inte ta bort turneringen. Försök igen senare.');
    } finally {
      setDeletingTournament(false);
    }
  };

  const confirmDelete = () => {
    handleDeleteTournament();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start text-white px-4 sm:px-6 md:px-10 pt-24 pb-8 sm:pb-12"
      style={{ backgroundImage: "url('/images/hero_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="rounded-[36px] border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-8rem)] p-8 sm:p-10">
            <div className="pb-8 border-b border-white/10 mb-8">
              <p className="text-sm uppercase tracking-[0.35em] text-yellow-300 mb-3">Turneringsöversikt</p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Din turnering
              </h1>
              <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-3xl">
                Här kan du se alla matcher, uppdatera resultat och följa poängställningen i realtid. När alla gruppmatcher är spelade kan du gå vidare till slutspel.
              </p>
            </div>

            <div className="mb-8">
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
                {players.map((name, index) => (
                  <li
                    key={index}
                    className="bg-slate-950/70 text-white px-3 py-1 rounded-full border border-white/10 text-sm font-medium truncate max-w-full"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-slate-950/50 border border-white/10 rounded-[28px] p-5 overflow-hidden">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Omgång 1</h2>
                  <div className="space-y-3 pr-2">
                    {rounds.round1.map((match, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-3xl bg-white/5 border border-white/10 transition hover:bg-white/10"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <p className="font-medium text-white">{shortenName(match.player1)} vs {shortenName(match.player2)}</p>
                          {match.score1 !== null && match.score2 !== null ? (
                            <span className="text-sm font-semibold text-yellow-300">
                              {match.score1} - {match.score2}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-red-400">
                              Ej spelad
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-950/50 border border-white/10 rounded-[28px] p-5 overflow-hidden">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Omgång 2</h2>
                  <div className="space-y-3 pr-2">
                    {rounds.round2.map((match, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-3xl bg-white/5 border border-white/10 transition hover:bg-white/10"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <p className="font-medium text-white">{shortenName(match.player1)} vs {shortenName(match.player2)}</p>
                          {match.score1 !== null && match.score2 !== null ? (
                            <span className="text-sm font-semibold text-yellow-300">
                              {match.score1} - {match.score2}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-red-400">
                              Ej spelad
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-950/55 border border-white/10 rounded-[28px] p-5 overflow-x-auto">
                <ScoreTable
                  players={players}
                  rounds={rounds}
                  onStandingsUpdate={setStandings}
                  playoffType={playoffType}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2 mb-12">
              <button
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-full shadow-xl transition"
                onClick={() => setShowForm(!showForm)}
                disabled={showPlayoff}
              >
                {showForm ? "Dölj formulär" : "Registrera resultat"}
              </button>

              {allGroupMatchesPlayed(rounds) && !showPlayoff && (
                <button
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-full shadow-xl transition"
                  onClick={handleShowPlayoff}
                >
                  Till slutspel
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deletingTournament}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-xl transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingTournament ? "Tar bort..." : "Ta bort turnering"}
              </button>
            </div>

            {showForm && (
              <div className="mt-6">
                <MatchResultForm
                  rounds={rounds}
                  players={players}
                  onSave={handleSaveResults}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {showPlayoff && (
              <div className="mt-10">
                <PlayoffBracket
                  playoffData={playoffData}
                  onSaveResults={handleSavePlayoffResults}
                  playoffType={playoffType}
                  players={standings}
                />
              </div>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8 max-w-md w-full">
              <h2 className="text-2xl font-semibold text-white mb-3">Bekräfta borttagning</h2>
              <p className="text-gray-300 mb-6">
                Är du säker på att du vill ta bort den här turneringen? Denna åtgärd går inte att ångra.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  disabled={deletingTournament}
                  className="px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white font-semibold transition hover:bg-white/10 disabled:opacity-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingTournament}
                  className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingTournament ? "Tar bort..." : "Ta bort turnering"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
