"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import HeroSection from "./components/HeroSection";  // Justera sökväg
import TournamentOverview from "./components/TournamentOverview"; // Vi skapar denna komponent snart
import LoginRegister from "./components/LoginRegister";

export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading, error } = useAuth();
  const [players, setPlayers] = useState(null);
  const [playoffType, setPlayoffType] = useState("kvartsfinal");
  const [resumeTournamentId, setResumeTournamentId] = useState(null);

  const handleStartTournament = (playerNames, playoff) => {
    setPlayers(playerNames);
    setPlayoffType(playoff);
    // Persist active tournament locally for offline/refresh resilience
    const active = { players: playerNames, playoffType: playoff, createdAt: new Date().toISOString() };
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

  // On mount, restore active tournament from localStorage if present
  useEffect(() => {
    if (players) return;
    try {
      const raw = localStorage.getItem('activeTournament');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.players) {
          setPlayers(parsed.players);
          setPlayoffType(parsed.playoffType || 'kvartsfinal');
        }
      }
    } catch (err) {
      console.warn('Failed to read activeTournament from localStorage', err);
    }
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
        localStorage.setItem('activeTournament', JSON.stringify({
          players: restoredPlayers,
          playoffType: data.playoffType || 'kvartsfinal',
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
        <TournamentOverview players={players} playoffType={playoffType}/>
      )}
    </>
  );
}
