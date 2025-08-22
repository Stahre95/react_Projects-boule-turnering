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
      className="bg-white text-black p-6 rounded-2xl shadow-xl space-y-8 max-w-lg mx-auto"
    >
      {Object.entries(updatedRounds).map(([roundName, matches]) => (
        <div key={roundName}>
          <h3 className="text-2xl font-bold mb-4 capitalize text-center">
            {roundName.replace("round", "Omgång ")}
          </h3>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_50px_30px_50px_1fr] items-center gap-3 p-2 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span className="truncate text-right pr-2 font-medium">
                  {match.player1}
                </span>

                <input
                  type="number"
                  value={match.score1 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score1", e.target.value)
                  }
                  className="w-12 border rounded-lg px-2 py-1 text-center text-sm"
                  min="0"
                />

                <span className="text-center font-bold text-gray-700">-</span>

                <input
                  type="number"
                  value={match.score2 ?? ""}
                  onChange={(e) =>
                    handleInputChange(roundName, index, "score2", e.target.value)
                  }
                  className="w-12 border rounded-lg px-2 py-1 text-center text-sm"
                  min="0"
                />

                <span className="truncate pl-2 font-medium">{match.player2}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 text-center">
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl shadow-md font-semibold text-lg transition"
        >
          Spara resultat
        </button>
      </div>
    </form>
  );
};

export default MatchResultForm;
