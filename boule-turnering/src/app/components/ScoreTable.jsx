import React, { useEffect } from "react";

export default function ScoreTable({ players, rounds, onStandingsUpdate, playoffType }) {
  const allMatches = [...rounds.round1, ...rounds.round2];

  const playerStats = players.map((player) => {
    let points = 0;
    let goalDifference = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    allMatches.forEach((match) => {
      if (match.score1 !== null && match.score2 !== null) {
        if (match.player1 === player || match.player2 === player) {
          const scorePlayer1 = match.player1 === player ? match.score1 : match.score2;
          const scorePlayer2 = match.player1 === player ? match.score2 : match.score1;
          
          goalsFor += scorePlayer1;
          goalsAgainst += scorePlayer2;
          goalDifference += scorePlayer1 - scorePlayer2;

          if (scorePlayer1 === scorePlayer2) {
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

    return { player, points, goalDifference, goalsFor, goalsAgainst };
  });

  const sortedStats = [...playerStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.goalsAgainst - b.goalsAgainst;
  });

   useEffect(() => {
    console.log("Sorted standings:", sortedStats);
  }, [sortedStats]);

  useEffect(() => {
    if (onStandingsUpdate) {
      onStandingsUpdate(sortedStats);
    }
  }, [rounds, onStandingsUpdate]);

  const lineAfter = playoffType === "final" ? 2 : playoffType === "semifinal" ? 4 : 8;

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Live tabell</h2>
      {sortedStats.length === 0 ? (
        <p className="text-center text-gray-600">Poängställning kommer visas här</p>
      ) : (
        <table className="w-full text-center sm:text-left border border-gray-200 rounded-lg shadow-sm min-w-[300px]">
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
                <tr key={player} className={`${borderClass} hover:bg-gray-50`}>
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
