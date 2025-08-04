import React, { useState, useEffect } from "react";
import { generateMatchRounds } from "../components/generateMatchRounds";
import MatchResultForm from "./MatchResultForm";
import ScoreTable from "./ScoreTable";
import PlayoffBracket from "./PlayoffBracket";

export default function TournamentOverview({ players }) {
  const [rounds, setRounds] = useState({ round1: [], round2: [] });
  const [showForm, setShowForm] = useState(false);
  const [showPlayoff, setShowPlayoff] = useState(false);
  const [playoffData, setPlayoffData] = useState(null);
  const [playoffSize, setPlayoffSize] = useState(0);

  useEffect(() => {
    const generated = generateMatchRounds(players);
    setRounds(generated);
    setShowPlayoff(false);
    setPlayoffData(null);
    setPlayoffSize(0);
  }, [players]);

  // Kolla om alla gruppspelsmatcher är spelade
  function allGroupMatchesPlayed(rounds) {
    const allMatches = [...rounds.round1, ...rounds.round2];
    return allMatches.every(
      (match) => match.score1 !== null && match.score2 !== null
    );
  }

  // Hantera när gruppspelsresultat sparas (från formuläret)
  const handleSaveResults = (updatedRounds) => {
    setRounds(updatedRounds);
    setShowForm(false);
  };

  // När man klickar på "Spara gruppspelsresultat och visa slutspel"
  function handleShowPlayoff() {
    const allMatches = [...rounds.round1, ...rounds.round2];

    // Räkna poäng och målskillnad för varje spelare
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

    // Sortera spelarna som i ScoreTable (poäng > målskillnad > namn)
    playerStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return a.player.localeCompare(b.player);
    });

    // Välj top 4 eller 8
    const cutoff = players.length < 16 ? 4 : 8;
    const topPlayers = playerStats.slice(0, cutoff).map((p) => p.player);

    setPlayoffSize(cutoff);
    setPlayoffData(null); // nollställ tidigare data, starta nytt
    setShowPlayoff(true);
  }

  // Hantera sparande av slutspelsresultat från PlayoffBracket
  const handleSavePlayoffResults = (updatedData) => {
    setPlayoffData(updatedData);
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start text-white px-4 pt-10"
      style={{ backgroundImage: "url('/images/hero_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="min-h-screen w-full relative py-16 px-6">
        <div className="relative z-10 max-w-6xl mx-auto text-white">
          <h1 className="text-3xl font-bold mb-8 text-center">Turneringsöversikt</h1>

          <p className="mb-4 text-center">Spelare som är anmälda:</p>
          <ul className="mb-8 flex flex-wrap justify-center gap-4">
            {players.map((name, index) => (
              <li
                key={index}
                className="bg-white text-black px-4 py-2 rounded shadow"
              >
                {name}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Omgång 1 */}
            <div className="bg-white bg-opacity-90 text-black p-4 rounded overflow-auto ">
              <h2 className="text-xl font-semibold mb-2">Omgång 1</h2>
              {rounds.round1.map((match, i) => (
                <div
                  key={i}
                  className="mb-3 p-2 border rounded flex justify-between items-center"
                >
                  <p>
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
            <div className="bg-white bg-opacity-90 text-black p-4 rounded overflow-auto">
              <h2 className="text-xl font-semibold mb-2">Omgång 2</h2>
              {rounds.round2.map((match, i) => (
                <div
                  key={i}
                  className="mb-3 p-2 border rounded flex justify-between items-center"
                >
                  <p>
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

            {/* Live tabell */}
            <div className="bg-white bg-opacity-90 text-black p-4 rounded flex flex-col justify-between">
              <ScoreTable players={players} rounds={rounds} />
            </div>
          </div>

          {/* Knapp för att visa/dölja formulär */}
          <div className="text-center">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded"
              onClick={() => setShowForm(!showForm)}
              disabled={showPlayoff} // Inaktivera om slutspel visas
            >
              {showForm ? "Dölj formulär" : "Registrera resultat"}
            </button>
          </div>

          {/* Visa formuläret när showForm är true */}
          {showForm && !showPlayoff && (
            <div className="mt-6 text-center">
              <MatchResultForm rounds={rounds} onSave={handleSaveResults} />
            </div>
          )}

          {/* Visa knapp för att visa slutspel om alla matcher är spelade */}
          {allGroupMatchesPlayed(rounds) && !showPlayoff && (
            <div className="text-center mt-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                onClick={handleShowPlayoff}
              >
                Spara gruppspelsresultat och visa slutspel
              </button>
            </div>
          )}

          {/* Visa slutspel när showPlayoff är true */}
          {showPlayoff && (
            <div className="mt-10">
              <PlayoffBracket
                playoffData={playoffData}
                onSaveResults={handleSavePlayoffResults}
                playoffSize={playoffSize}
                players={players}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
