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
      className="bg-white text-black p-6 rounded-xl shadow-lg space-y-8 max-w-md mx-auto"
    >
      {Object.entries(updatedRounds).map(([roundName, matches]) => (
        <div key={roundName}>
          <h3 className="text-xl font-bold mb-4 capitalize text-center">{roundName}</h3>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_40px_40px_40px_1fr] items-center gap-2"
              >
                <span className="truncate text-right pr-2">{match.player1}</span>

                <input
                  type="number"
                  value={match.score1 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score1", e.target.value)
                  }
                  className="w-10 border rounded px-2 py-1 text-center text-sm"
                  min="0"
                />

                <span className="text-center font-bold">-</span>

                <input
                  type="number"
                  value={match.score2 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score2", e.target.value)
                  }
                  className="w-10 border rounded px-2 py-1 text-center text-sm"
                  min="0"
                />

                <span className="truncate pl-2">{match.player2}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 text-center">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition text-lg font-semibold"
        >
          Spara resultat
        </button>
      </div>
    </form>
  );
};

export default MatchResultForm;
