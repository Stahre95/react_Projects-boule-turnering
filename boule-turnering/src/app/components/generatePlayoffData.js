function createRoundMatches(prefix, count) {
  if (prefix === "semi") {
    return [
      { id: "sf1", player1: "Vinnare kvartsfinal 1", player2: "Vinnare kvartsfinal 4", score1: null, score2: null },
      { id: "sf2", player1: "Vinnare kvartsfinal 2", player2: "Vinnare kvartsfinal 3", score1: null, score2: null },
    ];
  }

  if (prefix === "final") {
    return [
      { id: "final1", player1: "Vinnare semifinal 1", player2: "Vinnare semifinal 2", score1: null, score2: null },
    ];
  }

  return Array.from({ length: count }, (_, i) => {
    const firstSeed = i + 1;
    const secondSeed = count * 2 - i;

    return {
      id: `${prefix}${i + 1}`,
      player1: `Vinnare ${prefix} ${firstSeed}`,
      player2: `Vinnare ${prefix} ${secondSeed}`,
      score1: null,
      score2: null,
    };
  });
}

export function createEmptyPlayoffData(playoffType) {
  if (playoffType === "sextondelsfinal") {
    return {
      roundOf32: createRoundMatches("r32", 16),
      roundOf16: createRoundMatches("sextondelsfinal", 8),
      quarterfinals: createRoundMatches("åttondelsfinal", 4),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "åttondelsfinal") {
    return {
      roundOf32: [],
      roundOf16: createRoundMatches("r16", 8),
      quarterfinals: createRoundMatches("åttondelsfinal", 4),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "kvartsfinal") {
    return {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: createRoundMatches("qf", 4),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "semifinal") {
    return {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: [],
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  return {
    roundOf32: [],
    roundOf16: [],
    quarterfinals: [],
    semifinals: [],
    finals: createRoundMatches("final", 1),
  };
}

export function createSeededPlayoffData(playoffType, playerNames) {
  if (playoffType === "sextondelsfinal") {
    const top32 = playerNames.slice(0, 32);
    if (top32.length < 32) return null;

    return {
      roundOf32: top32.slice(0, 16).map((_, index) => ({
        id: `r32-${index + 1}`,
        player1: top32[index],
        player2: top32[31 - index],
        score1: null,
        score2: null,
      })),
      roundOf16: createRoundMatches("sextondelsfinal", 8),
      quarterfinals: createRoundMatches("åttondelsfinal", 4),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "åttondelsfinal") {
    const top16 = playerNames.slice(0, 16);
    if (top16.length < 16) return null;

    return {
      roundOf32: [],
      roundOf16: top16.slice(0, 8).map((_, index) => ({
        id: `r16-${index + 1}`,
        player1: top16[index],
        player2: top16[15 - index],
        score1: null,
        score2: null,
      })),
      quarterfinals: createRoundMatches("åttondelsfinal", 4),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "kvartsfinal") {
    const top8 = playerNames.slice(0, 8);
    if (top8.length < 8) return null;

    return {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: top8.slice(0, 4).map((_, index) => ({
        id: `qf${index + 1}`,
        player1: top8[index],
        player2: top8[7 - index],
        score1: null,
        score2: null,
      })),
      semifinals: createRoundMatches("semi", 2),
      finals: createRoundMatches("final", 1),
    };
  }

  if (playoffType === "semifinal") {
    const top4 = playerNames.slice(0, 4);
    if (top4.length < 4) return null;

    return {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: [],
      semifinals: [
        { id: "sf1", player1: top4[0], player2: top4[3], score1: null, score2: null },
        { id: "sf2", player1: top4[1], player2: top4[2], score1: null, score2: null },
      ],
      finals: createRoundMatches("final", 1),
    };
  }

  return {
    roundOf32: [],
    roundOf16: [],
    quarterfinals: [],
    semifinals: [],
    finals: createRoundMatches("final", 1),
  };
}

export function createInitialLeagueTable(playerNames) {
  return playerNames.map((player) => ({
    player,
    points: 0,
    goalDifference: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }));
}