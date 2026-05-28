import React, { useState, useEffect } from "react";

export default function PlayoffBracket({ playoffData, onSaveResults, playoffType, players }) {
  const [roundOf32, setRoundOf32] = useState([]);
  const [roundOf16, setRoundOf16] = useState([]);
  const [quarterfinals, setQuarterfinals] = useState([]);
  const [semifinals, setSemifinals] = useState([]);
  const [finals, setFinals] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const createEmptyMatches = (prefix, count) => {
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

    return Array.from({ length: count }, (_, i) => ({
      id: `${prefix}${i + 1}`,
      player1: `Vinnare ${prefix} ${i * 2 + 1}`,
      player2: `Vinnare ${prefix} ${i * 2 + 2}`,
      score1: null,
      score2: null,
    }));
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

  const playerNames = Array.isArray(players)
    ? players.map((p) => (typeof p === "object" && p !== null ? p.player ?? "" : p))
    : [];

  // Initiera slutspel
  useEffect(() => {
    if (!playerNames || playerNames.length === 0) return;

    if (!playoffData) {
      if (playoffType === "sextondelsfinal") {
        const top32 = playerNames.slice(0, 32);
        if (top32.length < 32) return;
        const matchups = [];
        for (let i = 0; i < 16; i++) {
          matchups.push([top32[i], top32[31 - i]]);
        }
        setRoundOf32(
          matchups.map((pair, i) => ({
            id: `r32-${i + 1}`,
            player1: pair[0],
            player2: pair[1],
            score1: null,
            score2: null,
          }))
        );
        setRoundOf16(createEmptyMatches("sextondelsfinal", 8));
        setQuarterfinals(createEmptyMatches("åttondelsfinal", 4));
        setSemifinals(createEmptyMatches("semi", 2));
        setFinals(createEmptyMatches("final", 1));
      } else if (playoffType === "åttondelsfinal") {
        const top16 = playerNames.slice(0, 16);
        if (top16.length < 16) return;
        const matchups = [
          [top16[0], top16[15]],
          [top16[1], top16[14]],
          [top16[2], top16[13]],
          [top16[3], top16[12]],
          [top16[4], top16[11]],
          [top16[5], top16[10]],
          [top16[6], top16[9]],
          [top16[7], top16[8]],
        ];
        setRoundOf16(
          matchups.map((pair, i) => ({
            id: `r16-${i + 1}`,
            player1: pair[0],
            player2: pair[1],
            score1: null,
            score2: null,
          }))
        );
        setQuarterfinals(createEmptyMatches("åttondelsfinal", 4));
        setSemifinals(createEmptyMatches("semi", 2));
        setFinals(createEmptyMatches("final", 1));
      } else if (playoffType === "kvartsfinal") {
        const top8 = playerNames.slice(0, 8);
        if (top8.length < 8) return;
        const matchups = [
          [top8[0], top8[7]],
          [top8[1], top8[6]],
          [top8[2], top8[5]],
          [top8[3], top8[4]],
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
        setSemifinals(createEmptyMatches("semi", 2));
        setFinals(createEmptyMatches("final", 1));
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
        setFinals(createEmptyMatches("final", 1));
      } else if (playoffType === "final") {
        setFinals(createEmptyMatches("final", 1));
      }
    } else {
      setRoundOf32(playoffData.roundOf32 || []);
      setRoundOf16(playoffData.roundOf16 || []);
      setQuarterfinals(playoffData.quarterfinals || []);
      setSemifinals(playoffData.semifinals || []);
      setFinals(playoffData.finals || []);
    }
  }, [players, playoffData, playoffType]);

  // Uppdatera åttondelsfinal automatiskt efter sextondelsfinal
  useEffect(() => {
    if (playoffType !== "sextondelsfinal") return;
    const winners = roundOf32.map(getWinner).filter(Boolean);
    if (winners.length === 0) return;
    setRoundOf16((prev) =>
      prev.map((match, i) => ({
        ...match,
        player1: winners[i * 2] || match.player1,
        player2: winners[i * 2 + 1] || match.player2,
      }))
    );
  }, [roundOf32, playoffType]);

  // Uppdatera kvartsfinal automatiskt efter åttondelsfinal
  useEffect(() => {
    if (!["sextondelsfinal", "åttondelsfinal"].includes(playoffType)) return;
    const winners = roundOf16.map(getWinner).filter(Boolean);
    if (winners.length === 0) return;
    setQuarterfinals((prev) =>
      prev.map((match, i) => ({
        ...match,
        player1: winners[i * 2] || match.player1,
        player2: winners[i * 2 + 1] || match.player2,
      }))
    );
  }, [roundOf16, playoffType]);

  // Uppdatera semifinaler automatiskt efter kvartsfinal
  useEffect(() => {
    if (!["sextondelsfinal", "åttondelsfinal", "kvartsfinal"].includes(playoffType)) return;
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
    onSaveResults({ roundOf32, roundOf16, quarterfinals, semifinals, finals });
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
          {playoffType === "sextondelsfinal" ? "Top 32" : playoffType === "åttondelsfinal" ? "Top 16" : playoffType === "kvartsfinal" ? "Top 8" : playoffType === "semifinal" ? "Top 4" : "Final"}
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          Ange resultat för varje match i turneringens slutspel.
        </p>
      </div>

      {playoffType === "sextondelsfinal" && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Sextondelsfinal</h3>
          {roundOf32.map((match) => renderMatch(match, setRoundOf32))}
        </div>
      )}

      {(playoffType === "sextondelsfinal" || playoffType === "åttondelsfinal") && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Åttondelsfinal</h3>
          {roundOf16.map((match) => renderMatch(match, setRoundOf16))}
        </div>
      )}

      {(playoffType === "sextondelsfinal" || playoffType === "åttondelsfinal" || playoffType === "kvartsfinal") && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Kvartsfinaler</h3>
          {quarterfinals.map((match) => renderMatch(match, setQuarterfinals))}
        </div>
      )}

      {(playoffType === "sextondelsfinal" || playoffType === "åttondelsfinal" || playoffType === "kvartsfinal" || playoffType === "semifinal") && (
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">Semifinaler</h3>
          {semifinals.map((match) => renderMatch(match, setSemifinals))}
        </div>
      )}

      {(playoffType === "sextondelsfinal" || playoffType === "åttondelsfinal" || playoffType === "kvartsfinal" || playoffType === "semifinal" || playoffType === "final") && (
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
