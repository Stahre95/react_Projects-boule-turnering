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
      className="bg-white text-black p-6 rounded-xl shadow-lg space-y-6"
    >
      {Object.entries(updatedRounds).map(([roundName, matches]) => (
        <div key={roundName}>
          <h3 className="text-xl font-bold mb-3 capitalize">{roundName}</h3>
          <div className="space-y-3">
            {matches.map((match, index) => (
              <div key={index} className="flex items-center gap-4 justify-center">
                <span className="w-32">{match.player1}</span>
                <input
                  type="number"
                  value={match.score1 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score1", e.target.value)
                  }
                  className="w-16 border rounded px-2 py-1"
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  value={match.score2 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score2", e.target.value)
                  }
                  className="w-16 border rounded px-2 py-1"
                  min="0"
                />
                <span className="w-32 text-right">{match.player2}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Spara resultat
        </button>
      </div>
    </form>
  );
};

export default MatchResultForm;
