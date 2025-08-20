"use client";
import { useState, useEffect } from "react";

export default function ScoreTable({ players, matches = [], onStandingsUpdate }) {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    if (!players || players.length === 0) return;

    // Initiera standings med alla spelare
    const initialStandings = players.map((p) => ({
      id: p.id,
      name: p.name,
      points: 0,
    }));

    // Beräkna poäng från matcherna
    matches.forEach((match) => {
      if (match.winner_id) {
        const winner = initialStandings.find((p) => p.id === match.winner_id);
        if (winner) winner.points += 1;
      }
    });

    // Sortera standings (flest poäng först)
    const sortedStandings = [...initialStandings].sort((a, b) => b.points - a.points);

    setStandings(sortedStandings);

    if (onStandingsUpdate) {
      onStandingsUpdate(sortedStandings);
    }
  }, [players, matches, onStandingsUpdate]);

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Ställning</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Spelare</th>
            <th className="text-center p-2">Poäng</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((player) => (
            <tr key={player.id} className="border-b">
              <td className="p-2">{player.name}</td>
              <td className="text-center p-2">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
