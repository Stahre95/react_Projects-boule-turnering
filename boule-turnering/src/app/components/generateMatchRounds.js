// En funktion som tar en lista med spelare och skapar 2 omgångar med matcher
export function generateMatchRounds(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Skapa par för en omgång (1 match per spelare)
  function createRoundPairs(playerList) {
    const pairs = [];
    for (let i = 0; i < playerList.length; i += 2) {
      pairs.push({
        player1: playerList[i],
        player2: playerList[i + 1],
        score1: null,
        score2: null,
      });
    }
    return pairs;
  }

  // Omgång 1 med de slumpade spelarna
  const round1 = createRoundPairs(shuffled);

  // Omgång 2, vi flyttar sista spelaren längst fram och parar igen
  const shifted = [shuffled[shuffled.length - 1], ...shuffled.slice(0, shuffled.length - 1)];
  const round2 = createRoundPairs(shifted);

  return { round1, round2 };
}
