// components/MatchRound.jsx
import React from "react";

export default function MatchRound({ title, matches }) {
  return (
    <div className="bg-white bg-opacity-90 text-black p-4 rounded">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {matches.length === 0 ? (
        <p>Matcher kommer visas här</p>
      ) : (
        <ul>
          {matches.map((match, index) => (
            <li key={index}>
              {match.player1} vs {match.player2}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
