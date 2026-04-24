import React, { useState, useEffect } from "react";

export default function PlayoffBracket({ playoffData, onSaveResults, playoffType, players }) {
  const [quarterfinals, setQuarterfinals] = useState([]);
  const [semifinals, setSemifinals] = useState([]);
  const [finals, setFinals] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const createEmptyMatches = (prefix) => {
    if (prefix === "semi") {
      return [
        { id: "sf1", player1: "Vinnare kvartsfinal 1", player2: "Vinnare kvartsfinal 4", score1: null, score2: null },
        { id: "sf2", player1: "Vinnare kvartsfinal 2", player2: "Vinnare kvartsfinal 3", score1: null, score2: null },
      ];
    } else if (prefix === "final") {
      return [
        { id: "final1", player1: "Vinnare semifinal 1", player2: "Vinnare semifinal 2", score1: null, score2: null },
      ];
    }
    return [];
  };

  const getWinner = (match) => {
    if (match.score1 == null || match.score2 == null) return null;
    if (match.score1 > match.score2) return match.player1;
    if (match.score2 > match.score1) return match.player2;
    return null;
  };

  const updateMatch = (roundSetter, matchId, playerNum, value) => {
    roundSetter((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? { ...match, [playerNum === 1 ? "score1" : "score2"]: value === "" ? null : Number(value) }
          : match
      )
    );
  };


  //bugtest
  
  // Initiera slutspel
  useEffect(() => {
    console.log("spelare:", players)
    if (!players || players.length === 0) return;

    if (!playoffData) {
      if (playoffType === "kvartsfinal") {
        const top8 = players.slice(0, 8);
        console.log("top8:", top8)
        if (top8.length < 8) return; 
        const matchups = [
  [top8[0].player, top8[7].player],
  [top8[1].player, top8[6].player],
  [top8[2].player, top8[5].player],
  [top8[3].player, top8[4].player],
];
        setQuarterfinals(
          matchups.map((pair, i) => ({
            id: `qf${i + 1}`,
            player1: pair[0],
            player2: pair[1],
            score1: null,
            score2: null,
          }))
        );
        setSemifinals(createEmptyMatches("semi"));
        setFinals(createEmptyMatches("final"));
      } else if (playoffType === "semifinal") {
        const top4 = playerNames.slice(0, 4);
        if (top4.length < 4) return;
        const matchups = [
          [top4[0], top4[3]],
          [top4[1], top4[2]],
        ];
        setSemifinals(
          matchups.map((pair, i) => ({
            id: `sf${i + 1}`,
            player1: pair[0],
            player2: pair[1],
            score1: null,
            score2: null,
          }))
        );
        setFinals(createEmptyMatches("final"));
      } else if (playoffType === "final") {
        setFinals(createEmptyMatches("final"));
      }
    } else {
      setQuarterfinals(playoffData.quarterfinals || []);
      setSemifinals(playoffData.semifinals || []);
      setFinals(playoffData.finals || []);
    }
  }, [players, playoffData, playoffType]);

  // Uppdatera semifinaler automatiskt efter kvartsfinal
  useEffect(() => {
    if (playoffType !== "kvartsfinal") return;
    const winners = quarterfinals.map(getWinner).filter(Boolean);
    if (winners.length === 0) return;
    setSemifinals((prev) =>
      prev.map((match, i) => ({
        ...match,
        player1: winners[i * 2] || match.player1,
        player2: winners[i * 2 + 1] || match.player2,
      }))
    );
  }, [quarterfinals, playoffType]);

  // Uppdatera final automatiskt efter semifinal
  useEffect(() => {
    const winners = semifinals.map(getWinner).filter(Boolean);
    if (winners.length === 0) return;
    setFinals((prev) =>
      prev.map((match) => ({
        ...match,
        player1: winners[0] || match.player1,
        player2: winners[1] || match.player2,
      }))
    );
  }, [semifinals]);

  const handleSave = () => {
    onSaveResults({ quarterfinals, semifinals, finals });
    const finalMatch = finals[0];
    const winner = getWinner(finalMatch);
    if (!finalMatch || finalMatch.score1 == null || finalMatch.score2 == null || !winner) {
      setStatusMessage("❌ Alla matcher är inte färdigspelade.");
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage(`🏆 ${winner} är vinnaren!`);
    }
  };

  const renderMatch = (match, roundSetter) => (
    <div
      key={match.id}
      className="grid grid-cols-[1fr_auto_20px_auto_1fr] items-center gap-3 p-4 bg-slate-950/40 rounded-3xl border border-white/10 hover:bg-slate-950/60 transition mb-4"
    >
      <span className="truncate text-right pr-2 font-medium text-white">{match.player1}</span>
      <input
        type="number"
        min="0"
        className="w-10 sm:w-12 border border-white/10 rounded-3xl px-2 py-2 text-center text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={match.score1 ?? ""}
        onChange={(e) => updateMatch(roundSetter, match.id, 1, e.target.value)}
      />
      <span className="text-center font-bold text-gray-300">-</span>
      <input
        type="number"
        min="0"
        className="w-10 sm:w-12 border border-white/10 rounded-3xl px-2 py-2 text-center text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={match.score2 ?? ""}
        onChange={(e) => updateMatch(roundSetter, match.id, 2, e.target.value)}
      />
      <span className="truncate pl-2 font-medium text-white">{match.player2}</span>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl p-6 sm:p-8 max-w-full mx-auto text-white">
      <div className="text-center mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300 mb-3">Slutspel</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {playoffType === "kvartsfinal" ? "Top 8" : playoffType === "semifinal" ? "Top 4" : "Final"}
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          Ange resultat för varje match i turneringens slutspel.
        </p>
      </div>

      {playoffType === "kvartsfinal" && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Kvartsfinaler</h3>
          {quarterfinals.map((match) => renderMatch(match, setQuarterfinals))}
        </div>
      )}

      {(playoffType === "kvartsfinal" || playoffType === "semifinal") && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Semifinaler</h3>
          {semifinals.map((match) => renderMatch(match, setSemifinals))}
        </div>
      )}

      {(playoffType === "kvartsfinal" || playoffType === "semifinal" || playoffType === "final") && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Final</h3>
          {finals.map((match) => renderMatch(match, setFinals))}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleSave}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full shadow-xl font-semibold text-lg transition"
        >
          Spara slutspel
        </button>
      </div>

      {statusMessage && <div className="mt-4 text-center text-base sm:text-lg font-medium text-white">{statusMessage}</div>}
    </div>
  );
}
