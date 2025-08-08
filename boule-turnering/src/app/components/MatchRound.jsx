import React from "react";

export default function MatchRound({ title, matches }) {
  return (
    <div className="bg-white bg-opacity-90 text-black p-4 rounded shadow-md max-w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-3 text-center sm:text-left">{title}</h2>
      {matches.length === 0 ? (
        <p className="text-center text-gray-600">Matcher kommer visas här</p>
      ) : (
        <ul className="space-y-2">
          {matches.map((match, index) => (
            <li
              key={index}
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-center sm:text-left"
            >
              {match.player1} vs {match.player2}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
