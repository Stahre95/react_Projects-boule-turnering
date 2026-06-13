import React, { useEffect } from "react";
import { calculateLeagueTable } from "./calculateLeagueTable";

export default function ScoreTable({ players, rounds, onStandingsUpdate, playoffType }) {
  const sortedStats = calculateLeagueTable(players, rounds);

  useEffect(() => {
    if (onStandingsUpdate) {
      onStandingsUpdate(sortedStats);
    }
  }, [rounds, onStandingsUpdate]);

  const cutoffMap = {
    final: 2,
    semifinal: 4,
    kvartsfinal: 8,
    "åttondelsfinal": 16,
    sextondelsfinal: 32,
  };
  const lineAfter = cutoffMap[playoffType] || 0;

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Live tabell</h2>
      {sortedStats.length === 0 ? (
        <p className="text-center text-gray-600">Poängställning kommer visas här</p>
      ) : (
        <table className="w-full text-center sm:text-left border border-gray-200 rounded-lg shadow-sm min-w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border-b px-2 sm:px-3 py-2">#</th>
              <th className="border-b px-2 sm:px-3 py-2 text-left">Spelare</th>
              <th className="border-b px-2 sm:px-3 py-2">Poäng</th>
              <th className="border-b px-2 sm:px-3 py-2">MS</th>
              <th className="border-b px-2 sm:px-3 py-2">GM</th>
              <th className="border-b px-2 sm:px-3 py-2">IM</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map(({ player, points, goalDifference, goalsFor, goalsAgainst }, index) => {
              const borderClass =
                index + 1 === lineAfter ? "border-b-4 border-yellow-500" : "border-b";
              return (
                <tr key={player} className={`${borderClass} hover:bg-white hover:text-black transition`}>
                  <td className="px-2 sm:px-3 py-2 font-semibold">{index + 1}.</td>
                  <td className="px-2 sm:px-3 py-2 truncate max-w-[120px] sm:max-w-none">{player}</td>
                  <td className="px-2 sm:px-3 py-2 text-center">{points}</td>
                  <td className="px-2 sm:px-3 py-2 text-center">{goalDifference}</td>
                  <td className="px-2 sm:px-3 py-2 text-center">{goalsFor}</td>
                  <td className="px-2 sm:px-3 py-2 text-center">{goalsAgainst}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
