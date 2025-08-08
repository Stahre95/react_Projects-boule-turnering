import React, { useState, useEffect } from "react";

export default function PlayoffBracket({ playoffData, onSaveResults, playoffSize, players }) {
  const [quarterfinals, setQuarterfinals] = useState([]);
  const [semifinals, setSemifinals] = useState([]);
  const [finals, setFinals] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  function createEmptyMatches(count, prefix) {
    return Array.from({ length: count }, (_, i) => ({
      id: `${prefix}${i + 1}`,
      player1:
        prefix === "semi"
          ? `Vinnare ${playoffSize === 8 ? `kvartsfinal ${i * 2 + 1}` : `semifinal ${i + 1}`}`
          : `Vinnare semifinal 1`,
      player2:
        prefix === "semi"
          ? `Vinnare ${playoffSize === 8 ? `kvartsfinal ${i * 2 + 2}` : `semifinal ${i + 2}`}`
          : `Vinnare semifinal 2`,
      score1: null,
      score2: null,
    }));
  }

  function getWinner(match) {
    if (match.score1 === null || match.score2 === null) return null;
    if (match.score1 > match.score2) return match.player1;
    if (match.score2 > match.score1) return match.player2;
    return null;
  }

  function updateMatch(roundSetter, matchId, playerNum, value) {
    roundSetter((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? {
              ...match,
              [playerNum === 1 ? "score1" : "score2"]: value === "" ? null : Number(value),
            }
          : match
      )
    );
  }

  useEffect(() => {
    if (!playoffData) {
      if (playoffSize === 8) {
        const matchups = [
          [0, 7],
          [1, 6],
          [2, 5],
          [3, 4],
        ];
        setQuarterfinals(
          matchups.map((pair, i) => ({
            id: `qf${i + 1}`,
            player1: players[pair[0]],
            player2: players[pair[1]],
            score1: null,
            score2: null,
          }))
        );
        setSemifinals(createEmptyMatches(2, "semi"));
      } else if (playoffSize === 4) {
        const matchups = [
          [0, 3],
          [1, 2],
        ];
        setSemifinals(
          matchups.map((pair, i) => ({
            id: `sf${i + 1}`,
            player1: players[pair[0]],
            player2: players[pair[1]],
            score1: null,
            score2: null,
          }))
        );
      }
      setFinals(createEmptyMatches(1, "final"));
    } else {
      setQuarterfinals(playoffData.quarterfinals || []);
      setSemifinals(playoffData.semifinals || []);
      setFinals(playoffData.finals || []);
    }
  }, [players, playoffData, playoffSize]);

  useEffect(() => {
    if (playoffSize === 8) {
      const winners = quarterfinals.map(getWinner);
      setSemifinals((prev) =>
        prev.map((match, i) => ({
          ...match,
          player1: winners[i * 2] || match.player1,
          player2: winners[i * 2 + 1] || match.player2,
        }))
      );
    }
  }, [quarterfinals, playoffSize]);

  useEffect(() => {
    const winners = semifinals.map(getWinner);
    setFinals((prev) =>
      prev.map((match) => ({
        ...match,
        player1: winners[0] || match.player1,
        player2: winners[1] || match.player2,
      }))
    );
  }, [semifinals]);

  function handleSave() {
    onSaveResults({
      quarterfinals,
      semifinals,
      finals,
    });

    const finalMatch = finals[0];
    const winner = getWinner(finalMatch);

    if (!finalMatch || finalMatch.score1 === null || finalMatch.score2 === null || !winner) {
      setStatusMessage("❌ Alla matcher är inte färdigspelade.");
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage(`🏆 ${winner} är vinnaren!`);
    }
  }

  const renderMatch = (match, roundSetter) => (
    <div
      key={match.id}
      className="flex flex-wrap items-center justify-between mb-3 p-3 border rounded"
    >
      <div className="w-full sm:w-40 truncate mb-1 sm:mb-0">{match.player1}</div>
      <input
        type="number"
        min="0"
        className="w-16 p-1 border rounded text-center mx-1"
        value={match.score1 === null ? "" : match.score1}
        onChange={(e) => updateMatch(roundSetter, match.id, 1, e.target.value)}
      />
      <span className="mx-2 font-bold">-</span>
      <input
        type="number"
        min="0"
        className="w-16 p-1 border rounded text-center mx-1"
        value={match.score2 === null ? "" : match.score2}
        onChange={(e) => updateMatch(roundSetter, match.id, 2, e.target.value)}
      />
      <div className="w-full sm:w-40 truncate text-right mt-1 sm:mt-0">{match.player2}</div>
    </div>
  );

  return (
    <div className="bg-white bg-opacity-90 text-black p-6 rounded max-w-full mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
        Slutspel (Top {playoffSize})
      </h2>

      {playoffSize === 8 && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Kvartsfinaler</h3>
          {quarterfinals.map((match) => renderMatch(match, setQuarterfinals))}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Semifinaler</h3>
        {semifinals.map((match) => renderMatch(match, setSemifinals))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Final</h3>
        {finals.map((match) => renderMatch(match, setFinals))}
      </div>

      <button
        onClick={handleSave}
        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded block mx-auto"
      >
        Spara slutspelsresultat
      </button>

      {statusMessage && (
        <div className="mt-4 text-center text-base sm:text-lg font-medium">{statusMessage}</div>
      )}
    </div>
  );
}
