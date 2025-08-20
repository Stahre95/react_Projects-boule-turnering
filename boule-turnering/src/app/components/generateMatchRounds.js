// src/app/lib/generateMatchRound.js

// En funktion som tar en lista med spelare och skapar 2 omgångar med matcher
export function generateMatchRounds(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Skapa par för en omgång (1 match per spelare)
  function createRoundPairs(playerList, roundNumber) {
    const pairs = [];
    for (let i = 0; i < playerList.length; i += 2) {
      if (playerList[i + 1]) {
        pairs.push({
          id: `${roundNumber}-${i / 2}`, // unikt match-ID
          player1_id: playerList[i].id,
          player2_id: playerList[i + 1].id,
          round: roundNumber,
          winner_id: null,
        });
      }
    }
    return pairs;
  }

  // Omgång 1 med de slumpade spelarna
  const round1 = createRoundPairs(shuffled, 1);

  // Omgång 2: flytta sista spelaren längst fram och para igen
  const shifted = [shuffled[shuffled.length - 1], ...shuffled.slice(0, shuffled.length - 1)];
  const round2 = createRoundPairs(shifted, 2);

  return { round1, round2 };
}
