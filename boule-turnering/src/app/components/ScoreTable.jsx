import React, { useEffect } from "react";

export default function ScoreTable({ players, rounds, onStandingsUpdate }) {
  const allMatches = [...rounds.round1, ...rounds.round2];

  const playerStats = players.map((player) => {
    let points = 0;
    let goalDifference = 0;

    allMatches.forEach((match) => {
      if (match.score1 !== null && match.score2 !== null) {
        if (match.player1 === player || match.player2 === player) {
          const goalsFor = match.player1 === player ? match.score1 : match.score2;
          const goalsAgainst = match.player1 === player ? match.score2 : match.score1;
          goalDifference += goalsFor - goalsAgainst;

          if (match.score1 === match.score2) {
            points += 0.5;
          } else if (
            (match.player1 === player && match.score1 > match.score2) ||
            (match.player2 === player && match.score2 > match.score1)
          ) {
            points += 1;
          }
        }
      }
    });

    return { player, points, goalDifference };
  });

  const sortedStats = [...playerStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return Math.random() < 0.5 ? -1 : 1;
  });

  useEffect(() => {
    if (onStandingsUpdate) {
      onStandingsUpdate(sortedStats.map((p) => p.player));
    }
  }, [rounds, onStandingsUpdate]);

  const lineAfter = players.length <= 15 ? 4 : 8;

  return (
    <div className="bg-white bg-opacity-90 text-black p-4 rounded shadow-md max-w-full">
      <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Live tabell</h2>
      {sortedStats.length === 0 ? (
        <p className="text-center text-gray-600">Poängställning kommer visas här</p>
      ) : (
        <table className="min-w-[320px] w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="border-b px-3 py-2">#</th>
              <th className="border-b px-3 py-2">Spelare</th>
              <th className="border-b px-3 py-2">Poäng</th>
              <th className="border-b px-3 py-2">Målskillnad</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map(({ player, points, goalDifference }, index) => {
              const borderClass =
                index + 1 === lineAfter ? "border-b-4 border-yellow-500" : "border-b";
              return (
                <tr key={player} className={borderClass}>
                  <td className="px-3 py-2 font-semibold">{index + 1}.</td>
                  <td className="px-3 py-2 truncate max-w-xs">{player}</td>
                  <td className="px-3 py-2 text-center">{points}</td>
                  <td className="px-3 py-2 text-center">{goalDifference}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
