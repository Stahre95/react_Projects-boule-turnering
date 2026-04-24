"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
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
  };

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
