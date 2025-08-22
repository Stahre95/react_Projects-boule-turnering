import React, { useState, useEffect } from "react";
import { generateMatchRounds } from "../components/generateMatchRounds";
import MatchResultForm from "./MatchResultForm";
import ScoreTable from "./ScoreTable";
import PlayoffBracket from "./PlayoffBracket";

export default function TournamentOverview({ players, playoffType }) {
  const [rounds, setRounds] = useState({ round1: [], round2: [] });
  const [showForm, setShowForm] = useState(false);
  const [showPlayoff, setShowPlayoff] = useState(false);
  const [playoffData, setPlayoffData] = useState(null);
  const [playoffSize, setPlayoffSize] = useState(0);
  const [standings, setStandings] = useState([]);

  // Generera matcher när players ändras
  useEffect(() => {
    const generated = generateMatchRounds(players);
    setRounds(generated);
    setShowPlayoff(false);
    setPlayoffData(null);
    setPlayoffSize(0);
  }, [players]);

  // Kontrollera om alla gruppmatcher är spelade
  function allGroupMatchesPlayed(rounds) {
    const allMatches = [...rounds.round1, ...rounds.round2];
    return allMatches.every(
      (match) => match.score1 !== null && match.score2 !== null
    );
  }

  // Spara resultat från MatchResultForm
  const handleSaveResults = (updatedRounds) => {
    setRounds(updatedRounds);
    setShowForm(false);
  };

  // Beräkna och visa slutspel
  function handleShowPlayoff() {
  const allMatches = [...rounds.round1, ...rounds.round2];

  // Beräkna poäng och målskillnad
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

  // Sortera från bäst till sämst
  playerStats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return a.player.localeCompare(b.player);
  });

  // Bestäm antal spelare i slutspel
  const cutoff = playoffType === "kvartsfinal" ? 8 : playoffType === "semifinal" ? 4 : 2;



  setPlayoffSize(cutoff);
  setPlayoffData(null);
  setShowPlayoff(true);
}

  const handleSavePlayoffResults = (updatedData) => {
    setPlayoffData(updatedData);
  };

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

          {/* ✅ Minimalistisk spelarlista */}
          <div className="mb-10">
            <ul className="flex flex-wrap justify-center gap-2">
              {players.map((name, index) => (
                <li
                  key={index}
                  className="bg-white text-black px-3 py-1 rounded-full shadow-sm text-sm font-medium"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Matcher & tabell */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
            {/* Omgång 1 */}
            <div className="md:col-span-2 bg-white bg-opacity-90 text-black p-4 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Omgång 1</h2>
              {rounds.round1.map((match, i) => (
                <div
                  key={i}
                  className="mb-3 p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {match.player1} vs {match.player2}
                    </p>
                    {match.score1 !== null && match.score2 !== null ? (
                      <span className="text-sm font-semibold text-gray-700">
                        {match.score1} - {match.score2}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-500">
                        Ej spelad
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Omgång 2 */}
            <div className="md:col-span-2 bg-white bg-opacity-90 text-black p-4 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Omgång 2</h2>
              {rounds.round2.map((match, i) => (
                <div
                  key={i}
                  className="mb-3 p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {match.player1} vs {match.player2}
                    </p>
                    {match.score1 !== null && match.score2 !== null ? (
                      <span className="text-sm font-semibold text-gray-700">
                        {match.score1} - {match.score2}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-red-500">
                        Ej spelad
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Live tabell */}
            <div className="md:col-span-3 bg-white bg-opacity-90 text-black p-4 rounded-lg shadow overflow-x-auto">
              <ScoreTable
                players={players}
                rounds={rounds}
                onStandingsUpdate={setStandings}
                playoffType={playoffType}
              />
            </div>
          </div>

          {/* Knappar */}
          <div className="text-center flex flex-col sm:flex-row justify-center gap-4 mt-6">
            {/* Registrera resultat */}
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-xl text-lg shadow-md transition"
              onClick={() => setShowForm(!showForm)}
              disabled={showPlayoff}
            >
              {showForm ? "Dölj formulär" : "Registrera resultat"}
            </button>

            {/* Spara gruppspel och visa slutspel */}
            {allGroupMatchesPlayed(rounds) && !showPlayoff && (
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-md transition"
                onClick={handleShowPlayoff}
              >
                Till slutspel
              </button>
            )}
          </div>

          {/* ✅ MatchResultForm */}
          {showForm && (
            <div className="mt-6">
              <MatchResultForm
                rounds={rounds}
                players={players}
                onSave={handleSaveResults}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* ✅ Slutspel */}
          {showPlayoff && (
            <div className="mt-10 px-4 sm:px-0">
              <PlayoffBracket
                playoffData={playoffData}
                onSaveResults={handleSavePlayoffResults}
                playoffType={playoffType}
                players={standings}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
