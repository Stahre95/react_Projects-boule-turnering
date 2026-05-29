"use client";
import React, { useState } from "react";

const MatchResultForm = ({ rounds, onSave }) => {
  const [updatedRounds, setUpdatedRounds] = useState(rounds);

  const handleInputChange = (roundName, matchIndex, field, value) => {
    const newRounds = { ...updatedRounds };
    newRounds[roundName][matchIndex][field] = Number(value);
    setUpdatedRounds(newRounds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(updatedRounds);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-8 max-w-4xl mx-auto text-white"
    >
      <div className="text-center mb-6">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300 mb-3">Registrera resultat</p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Uppdatera matcher
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          Ange poäng för varje match i omgångarna nedan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Ensure rounds stack vertically so Omgång 2 appears below Omgång 1 */}
        {['round1', 'round2'].map((roundName) => {
          const matches = updatedRounds[roundName] || [];
          return (
            <div key={roundName}>
              <h3 className="text-xl font-semibold mb-4 capitalize text-center">
                {roundName.replace('round', 'Omgång ')}
              </h3>
              <div className="space-y-4">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_auto_20px_auto_1fr] items-center gap-3 p-4 bg-slate-950/40 rounded-3xl border border-white/10 hover:bg-slate-950/60 transition"
                  >
                    <span className="truncate text-right pr-2 font-medium text-white">
                      {match.player1}
                    </span>

                    <input
                      type="number"
                      value={match.score1 ?? ''}
                      onChange={(e) =>
                        handleInputChange(roundName, index, 'score1', e.target.value)
                      }
                      className="w-12 sm:w-14 border border-white/10 rounded-3xl px-2 py-2 text-center text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="0"
                    />

                    <span className="text-center font-bold text-gray-300">-</span>

                    <input
                      type="number"
                      value={match.score2 ?? ''}
                      onChange={(e) =>
                        handleInputChange(roundName, index, 'score2', e.target.value)
                      }
                      className="w-12 sm:w-14 border border-white/10 rounded-3xl px-2 py-2 text-center text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="0"
                    />

                    <span className="truncate pl-2 font-medium text-white">{match.player2}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 text-center">
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full shadow-xl font-semibold text-lg transition"
        >
          Spara resultat
        </button>
      </div>
    </form>
  );
};

export default MatchResultForm;
