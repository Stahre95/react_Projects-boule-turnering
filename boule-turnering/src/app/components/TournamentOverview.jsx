"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPlayers,
  savePlayers,
  createTournament,
  fetchLatestTournament,
  createMatches,
  fetchMatches,
  updateMatchesScores,
} from "../lib/db";
import { generateMatchRounds } from "../components/generateMatchRounds";
import MatchResultForm from "./MatchResultForm";
import ScoreTable from "./ScoreTable";
import PlayoffBracket from "./PlayoffBracket";

export default function TournamentOverview({ players: initialPlayers }) {
  const [players, setPlayers] = useState([]);            // namn-array för UI
  const [rounds, setRounds] = useState({ round1: [], round2: [] }); // innehåller även match-id för DB
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showPlayoff, setShowPlayoff] = useState(false);
  const [playoffData, setPlayoffData] = useState(null);
  const [standings, setStandings] = useState([]);        // används för seedning i slutspel

  // Hjälp: har alla gruppmatcher resultat?
  function allGroupMatchesPlayed(r) {
    const allMatches = [...(r.round1 || []), ...(r.round2 || [])];
    return allMatches.length > 0 && allMatches.every(
      (m) => m.score1 !== null && m.score2 !== null
    );
  }

  // Init: skapa/återladda turnering, spelare, matcher
  useEffect(() => {
    async function init() {
      setLoading(true);

      // Om vi kommer från PlayerSetup med nya namn → skapa ny turnering + matcher
      if (Array.isArray(initialPlayers) && initialPlayers.length > 0) {
        // 1) Skapa turnering
        const tournament =
          (await createTournament("Boule-turnering")) || (await fetchLatestTournament());
        if (!tournament) {
          console.error("❌ Kunde inte skapa eller hämta turnering.");
          setLoading(false);
          return;
        }

        // 2) Spara spelare (globalt) om du kör utan unik constraint kommer detta skapa ev. dubletter
        await savePlayers(initialPlayers.map((n) => ({ name: n })));

        // 3) Hämta alla spelare för att få id→namn
        const playersFromDb = await fetchPlayers();
        const idByName = Object.fromEntries(playersFromDb.map((p) => [p.name, p.id]));
        const nameById = Object.fromEntries(playersFromDb.map((p) => [p.id, p.name]));

        // 4) Generera två omgångar och skriv till DB som matcher
        const generated = generateMatchRounds(initialPlayers);
        const matchList = [
          ...generated.round1.map((m) => ({
            player1_id: idByName[m.player1],
            player2_id: idByName[m.player2],
            round: 1,
          })),
          ...generated.round2.map((m) => ({
            player1_id: idByName[m.player1],
            player2_id: idByName[m.player2],
            round: 2,
          })),
        ];
        await createMatches(tournament.id, matchList);

        // 5) Läs tillbaka matcher för aktuell turnering och bygg rounds-objekt för UI
        const matches = await fetchMatches(tournament.id);
        const round1 = matches
          .filter((m) => m.round === 1)
          .map((m) => ({
            id: m.id,
            player1: nameById[m.player1_id],
            player2: nameById[m.player2_id],
            score1: m.score1,
            score2: m.score2,
          }));
        const round2 = matches
          .filter((m) => m.round === 2)
          .map((m) => ({
            id: m.id,
            player1: nameById[m.player1_id],
            player2: nameById[m.player2_id],
            score1: m.score1,
            score2: m.score2,
          }));

        setPlayers(initialPlayers);
        setRounds({ round1, round2 });
        setShowPlayoff(false);
        setPlayoffData(null);
        setLoading(false);
        return;
      }

      // Annars: återladda senaste turneringens matcher (om någon finns)
      const latest = await fetchLatestTournament();
      if (!latest) {
        setPlayers([]);
        setRounds({ round1: [], round2: [] });
        setLoading(false);
        return;
      }

      const allPlayers = await fetchPlayers();
      const nameById = Object.fromEntries(allPlayers.map((p) => [p.id, p.name]));
      const matches = await fetchMatches(latest.id);

      const round1 = matches
        .filter((m) => m.round === 1)
        .map((m) => ({
          id: m.id,
          player1: nameById[m.player1_id],
          player2: nameById[m.player2_id],
          score1: m.score1,
          score2: m.score2,
        }));
      const round2 = matches
        .filter((m) => m.round === 2)
        .map((m) => ({
          id: m.id,
          player1: nameById[m.player1_id],
          player2: nameById[m.player2_id],
          score1: m.score1,
          score2: m.score2,
        }));

      // Spelarlistan = unika namn från matcherna
      const playersInThisTournament = Array.from(
        new Set(
          [...round1, ...round2].flatMap((m) => [m.player1, m.player2]).filter(Boolean)
        )
      );

      setPlayers(playersInThisTournament);
      setRounds({ round1, round2 });
      setShowPlayoff(allGroupMatchesPlayed({ round1, round2 }));
      setPlayoffData(null);
      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // endast vid mount (prop-byggd init sker första gången)

  // Spara resultat både i state och DB
  const handleSaveResults = async (updatedRounds) => {
    setRounds(updatedRounds);

    // Plocka ut {id, score1, score2} för alla matcher
    const all = [...updatedRounds.round1, ...updatedRounds.round2]
      .filter((m) => typeof m.id !== "undefined")
      .map((m) => ({ id: m.id, score1: m.score1 ?? null, score2: m.score2 ?? null }));

    await updateMatchesScores(all);

    // När alla gruppmatcher spelade → visa slutspel
    setShowPlayoff(allGroupMatchesPlayed(updatedRounds));
  };

  // Slutspels-hantering (seedning tas från ScoreTable via onStandingsUpdate)
  const handleSavePlayoffResults = (data) => setPlayoffData(data);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Laddar turnering...</p>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start text-white px-4 sm:px-6 md:px-10 pt-10"
      style={{ backgroundImage: "url('/images/hero_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="min-h-screen w-full relative py-16 px-4 sm:px-6 md:px-10">
        <div className="relative z-10 max-w-6xl mx-auto text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            Turneringsöversikt
          </h1>

          <p className="mb-4 text-center">Spelare som är anmälda:</p>
          <ul className="mb-8 flex gap-4 overflow-x-auto px-2">
            {players.map((name, index) => (
              <li
                key={index}
                className="flex-shrink-0 bg-white text-black px-4 py-2 rounded shadow text-center min-w-[100px]"
              >
                {name}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Omgång 1 */}
            <div className="bg-white bg-opacity-90 text-black p-4 rounded overflow-auto max-h-[300px] md:max-h-[400px]">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Omgång 1</h2>
              {rounds.round1.map((match, i) => (
                <div
                  key={match.id ?? i}
                  className="mb-3 p-2 border rounded flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <p className="mb-1 sm:mb-0">
                    {match.player1} vs {match.player2}
                  </p>
                  {match.score1 !== null && match.score2 !== null ? (
                    <p>
                      Resultat: {match.score1} - {match.score2}
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold">Match ej spelad</p>
                  )}
                </div>
              ))}
            </div>

            {/* Omgång 2 */}
            <div className="bg-white bg-opacity-90 text-black p-4 rounded overflow-auto max-h-[300px] md:max-h-[400px]">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Omgång 2</h2>
              {rounds.round2.map((match, i) => (
                <div
                  key={match.id ?? i}
                  className="mb-3 p-2 border rounded flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <p className="mb-1 sm:mb-0">
                    {match.player1} vs {match.player2}
                  </p>
                  {match.score1 !== null && match.score2 !== null ? (
                    <p>
                      Resultat: {match.score1} - {match.score2}
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold">Match ej spelad</p>
                  )}
                </div>
              ))}
            </div>

            {/* Live tabell beräknas klient-side som tidigare */}
            <div className="bg-white bg-opacity-90 text-black p-4 rounded overflow-visible">
              <ScoreTable
                players={players}
                rounds={rounds}
                onStandingsUpdate={setStandings}
              />
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded text-lg"
              onClick={() => setShowForm(!showForm)}
              disabled={showPlayoff}
            >
              {showForm ? "Dölj formulär" : "Registrera resultat"}
            </button>

            {showForm && !showPlayoff && (
              <div className="mt-6 text-center px-4 sm:px-0">
                <MatchResultForm rounds={rounds} onSave={handleSaveResults} />
              </div>
            )}

            {allGroupMatchesPlayed(rounds) && !showPlayoff && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded text-lg"
                onClick={() => setShowPlayoff(true)}
              >
                Spara gruppspelsresultat och visa slutspel
              </button>
            )}
          </div>

          {showPlayoff && (
            <div className="mt-10 px-4 sm:px-0">
              <PlayoffBracket
                playoffData={playoffData}
                onSaveResults={setPlayoffData}
                playoffSize={players.length <= 15 ? 4 : 8}
                players={standings}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
