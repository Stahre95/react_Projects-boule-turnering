"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import HeroSection from "./components/HeroSection";  // Justera sökväg
import TournamentOverview from "./components/TournamentOverview"; // Vi skapar denna komponent snart
import LoginRegister from "./components/LoginRegister";
import { generateMatchRounds } from "./components/generateMatchRounds";
import { createEmptyPlayoffData, createInitialLeagueTable } from "./components/generatePlayoffData";

export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading, error } = useAuth();
  const [players, setPlayers] = useState(null);
  const [playoffType, setPlayoffType] = useState("kvartsfinal");
  const [initialRounds, setInitialRounds] = useState(null);
  const [resumeTournamentId, setResumeTournamentId] = useState(null);

  const handleStartTournament = (playerNames, playoff) => {
    const groupRounds = generateMatchRounds(playerNames);
    const leagueTable = createInitialLeagueTable(playerNames);
    const playoffData = createEmptyPlayoffData(playoff);
    console.log('Creating tournament with data:', {
      players: playerNames,
      playoffType: playoff,
      leagueTable,
      groupRounds,
      playoffData,
    });

    setPlayers(playerNames);
    setPlayoffType(playoff);
    setInitialRounds(groupRounds);
    // Persist active tournament locally for offline/refresh resilience
    const active = {
      players: playerNames,
      playoffType: playoff,
      leagueTable,
      groupRounds,
      playoffData,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('activeTournament', JSON.stringify(active));
    } catch (err) {
      console.warn('Failed to write activeTournament to localStorage', err);
    }

    // Persist to Firestore for the authenticated user
    (async () => {
      try {
        const docRef = await addDoc(collection(db, 'tournaments'), {
          owner: user?.uid || null,
          players: playerNames,
          playoffType: playoff,
          leagueTable,
          groupRounds,
          playoffData,
          status: 'active',
          createdAt: serverTimestamp(),
        });
        // store doc id locally so we can update/close it later
        localStorage.setItem('activeTournamentId', docRef.id);
      } catch (err) {
        console.warn('Failed to save active tournament to Firestore', err);
      }
    })();
  };

  const router = useRouter();

  const handleTournamentDeleted = () => {
    try { localStorage.removeItem('activeTournament'); localStorage.removeItem('activeTournamentId'); } catch (e) {}
    setPlayers(null);
    try { router.push('/'); } catch (e) {}
  };

  // On mount, read query param resume from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const resumeId = params.get('resume');
      if (resumeId) {
        setResumeTournamentId(resumeId);
      }
    }
  }, []);

  // On mount, restore active tournament from Firestore first, then fall back to localStorage
  useEffect(() => {
    if (players) return;

    const hydrateActiveTournament = async () => {
      try {
        const activeId = localStorage.getItem('activeTournamentId');
        if (activeId) {
          const tournamentRef = doc(db, 'tournaments', activeId);
          const snapshot = await getDoc(tournamentRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            const restoredPlayers = Array.isArray(data.players) ? data.players : [];
            if (restoredPlayers.length > 0) {
              setPlayers(restoredPlayers);
              setPlayoffType(data.playoffType || 'kvartsfinal');
              setInitialRounds(data.groupRounds || data.rounds || null);

              localStorage.setItem('activeTournament', JSON.stringify({
                players: restoredPlayers,
                playoffType: data.playoffType || 'kvartsfinal',
                leagueTable: data.leagueTable || null,
                groupRounds: data.groupRounds || data.rounds || null,
                playoffData: data.playoffData || null,
                createdAt: data.createdAt,
              }));
              return;
            }
          }
        }

        const raw = localStorage.getItem('activeTournament');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.players) {
            setPlayers(parsed.players);
            setPlayoffType(parsed.playoffType || 'kvartsfinal');
            setInitialRounds(parsed.groupRounds || parsed.rounds || null);
          }
        }
      } catch (err) {
        console.warn('Failed to restore active tournament', err);
      }
    };

    hydrateActiveTournament();
  }, [players]);

  useEffect(() => {
    if (!resumeTournamentId || players) return;

    const fetchResumeTournament = async () => {
      try {
        const tournamentRef = doc(db, 'tournaments', resumeTournamentId);
        const snapshot = await getDoc(tournamentRef);
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        if (!data || data.status !== 'active') return;

        const restoredPlayers = Array.isArray(data.players) ? data.players : [];
        if (restoredPlayers.length === 0) return;

        setPlayers(restoredPlayers);
        setPlayoffType(data.playoffType || 'kvartsfinal');
        setInitialRounds(data.groupRounds || data.rounds || null);
        localStorage.setItem('activeTournament', JSON.stringify({
          players: restoredPlayers,
          playoffType: data.playoffType || 'kvartsfinal',
          leagueTable: data.leagueTable || null,
          groupRounds: data.groupRounds || data.rounds || null,
          playoffData: data.playoffData || null,
          createdAt: data.createdAt,
        }));
        localStorage.setItem('activeTournamentId', resumeTournamentId);
      } catch (err) {
        console.warn('Failed to resume active tournament from query param', err);
      }
    };

    fetchResumeTournament();
  }, [resumeTournamentId, players]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Laddar...</p>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <>
      {!players ? (
        <HeroSection onStart={handleStartTournament} />
      ) : (
        <TournamentOverview
          players={players}
          playoffType={playoffType}
          initialRounds={initialRounds}
          onDeleteComplete={handleTournamentDeleted}
        />
      )}
    </>
  );
}
