"use client";

import { useState } from "react";
import HeroSection from "./components/HeroSection";  // Justera sökväg
import TournamentOverview from "./components/TournamentOverview"; // Vi skapar denna komponent snart

export default function Home() {
  const [players, setPlayers] = useState(null);
  const [playoffType, setPlayoffType] = useState("kvartsfinal")

  const handleStartTournament = (playerNames, playoff) => {
    setPlayers(playerNames);
    setPlayoffType(playoff);
  };

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
