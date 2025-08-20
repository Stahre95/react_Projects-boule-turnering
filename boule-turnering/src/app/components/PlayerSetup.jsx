"use client";
import { useState } from "react";
import { createTournament, savePlayers } from "../lib/db";

export default function PlayerSetup({ onTournamentCreated }) {
  const [tournamentName, setTournamentName] = useState("");
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);

  const handleNumPlayersChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumPlayers(count);

    // Anpassa arrayen med namn så den matchar antalet spelare
    const newPlayers = [...playerNames];
    while (newPlayers.length < count) {
      newPlayers.push("");
    }
    setPlayerNames(newPlayers.slice(0, count));
  };

  const handlePlayerNameChange = (index, value) => {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tournamentName.trim()) {
      alert("Du måste ange ett turneringsnamn!");
      return;
    }

    // 🔹 1. Skapa turnering
    const tournament = await createTournament(tournamentName);
    if (!tournament) {
      alert("Kunde inte skapa turnering.");
      return;
    }

    // 🔹 2. Spara spelare
    const players = playerNames.filter((name) => name.trim() !== "");
    await savePlayers(players, tournament.id);

    // 🔹 3. Skicka info tillbaka till Appen
    onTournamentCreated(tournament.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium">Turneringsnamn</label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Antal spelare</label>
        <select
          value={numPlayers}
          onChange={handleNumPlayersChange}
          className="border rounded p-2 w-full"
        >
          {[4, 6, 8, 10, 12, 16, 20, 24, 28, 30].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {Array.from({ length: numPlayers }).map((_, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Spelare ${i + 1}`}
            value={playerNames[i] || ""}
            onChange={(e) => handlePlayerNameChange(i, e.target.value)}
            className="border rounded p-2 w-full"
          />
        ))}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Skapa turnering
      </button>
    </form>
  );
}
