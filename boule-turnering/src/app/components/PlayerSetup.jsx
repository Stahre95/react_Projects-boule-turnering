"use client";
import { useState } from "react";

export default function PlayerSetup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(16);
  const [playerNames, setPlayerNames] = useState(Array(16).fill(""));
  const [error, setError] = useState("");

  const handlePlayerCountChange = (e) => {
    const count = Number(e.target.value);
    setPlayerCount(count);

    setPlayerNames((prevNames) => {
      if (count > prevNames.length) {
        return [...prevNames, ...Array(count - prevNames.length).fill("")];
      } else {
        return prevNames.slice(0, count);
      }
    });
  };

  const handleNameChange = (index, e) => {
    const newNames = [...playerNames];
    newNames[index] = e.target.value;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedNames = playerNames.map((n) => n.trim());
    const filledNames = trimmedNames.filter((n) => n !== "");


    const nameSet = new Set(filledNames);
    if (nameSet.size !== filledNames.length) {
      setError("Två eller flera spelare har samma namn. Namnen måste vara unika.");
      return;
    }

    onStart(filledNames);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto p-6 bg-white bg-opacity-90 rounded shadow-md text-black"
    >
      <label className="block mb-2 font-semibold" htmlFor="playerCount">
        Antal spelare: <span className="font-bold">{playerCount}</span>
      </label>
      <input
        id="playerCount"
        type="range"
        min="2"
        max="30"
        value={playerCount}
        onChange={handlePlayerCountChange}
        className="w-full mb-6 accent-emerald-600"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto">
        {playerNames.map((name, idx) => (
          <div key={idx}>
            <label
              className="block mb-1 font-medium"
              htmlFor={`playerName${idx}`}
            >
              Spelare {idx + 1}
            </label>
            <input
              type="text"
              id={`playerName${idx}`}
              value={name}
              onChange={(e) => handleNameChange(idx, e)}
              placeholder={`Namn på spelare ${idx + 1}`}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
              required
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{error}</p>
      )}

      <button
        type="submit"
        className="mt-6 w-full bg-green-600 text-white py-3 rounded hover:bg-green-800 transition"
      >
        Starta turnering
      </button>
    </form>
  );
}
