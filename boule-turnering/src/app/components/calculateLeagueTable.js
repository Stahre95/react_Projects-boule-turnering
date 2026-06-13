export function calculateLeagueTable(players, rounds) {
  const allMatches = [...(rounds?.round1 || []), ...(rounds?.round2 || [])];

  return players.map((player) => {
    const playerName = typeof player === "object" && player !== null ? player.player ?? "" : player;
    let points = 0;
    let goalDifference = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    allMatches.forEach((match) => {
      if (match.score1 !== null && match.score2 !== null) {
        if (match.player1 === playerName || match.player2 === playerName) {
          const scorePlayer1 = match.player1 === playerName ? match.score1 : match.score2;
          const scorePlayer2 = match.player1 === playerName ? match.score2 : match.score1;

          goalsFor += scorePlayer1;
          goalsAgainst += scorePlayer2;
          goalDifference += scorePlayer1 - scorePlayer2;

          if (scorePlayer1 === scorePlayer2) {
            points += 0.5;
          } else if (
            (match.player1 === playerName && match.score1 > match.score2) ||
            (match.player2 === playerName && match.score2 > match.score1)
          ) {
            points += 1;
          }
        }
      }
    });

    return { player: playerName, points, goalDifference, goalsFor, goalsAgainst };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.goalsAgainst - b.goalsAgainst;
  });
}