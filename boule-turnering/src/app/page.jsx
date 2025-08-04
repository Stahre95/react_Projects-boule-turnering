"use client";

import { useState } from "react";
import HeroSection from "./components/HeroSection";  // Justera sökväg
import TournamentOverview from "./components/TournamentOverview"; // Vi skapar denna komponent snart

export default function Home() {
  const [players, setPlayers] = useState(null);

  const handleStartTournament = (playerNames) => {
    setPlayers(playerNames);
  };

  return (
    <>
      {!players ? (
        <HeroSection onStart={handleStartTournament} />
      ) : (
        <TournamentOverview players={players} />
      )}
    </>
  );
}
