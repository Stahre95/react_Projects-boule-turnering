import React from "react";

export default function ScoreTable({ players, rounds }) {
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

  playerStats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;

    // Slumpmässig sortering vid lika poäng och målskillnad
    return Math.random() < 0.5 ? -1 : 1;
  });

  const lineAfter = players.length <= 15 ? 4 : 8;

  return (
    <div className="bg-white bg-opacity-90 text-black p-4 rounded">
      <h2 className="text-xl font-semibold mb-2">Live tabell</h2>
      {playerStats.length === 0 ? (
        <p>Poängställning kommer visas här</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b px-2 py-1">#</th>
              <th className="border-b px-2 py-1">Spelare</th>
              <th className="border-b px-2 py-1">Poäng</th>
              <th className="border-b px-2 py-1">Målskillnad</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map(({ player, points, goalDifference }, index) => {
              const borderClass = (index + 1) === lineAfter ? "border-b-4 border-yellow-500" : "border-b";

              return (
                <tr key={player} className={borderClass}>
                  <td className="px-2 py-1 font-semibold">{index + 1}.</td>
                  <td className="px-2 py-1">{player}</td>
                  <td className="px-2 py-1">{points}</td>
                  <td className="px-2 py-1">{goalDifference}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
