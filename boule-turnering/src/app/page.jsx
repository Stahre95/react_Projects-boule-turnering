"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import HeroSection from "./components/HeroSection";  // Justera sökväg
import TournamentOverview from "./components/TournamentOverview"; // Vi skapar denna komponent snart
import LoginRegister from "./components/LoginRegister";

export default function Home() {
  const { user, loading, error } = useAuth();
  const [players, setPlayers] = useState(null);
  const [playoffType, setPlayoffType] = useState("kvartsfinal")

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

  // On mount, restore active tournament from localStorage if present
  useEffect(() => {
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
  }, []);

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
