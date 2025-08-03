"use client";
import { useState } from "react";

export default function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState(16);
  const [playerNames, setPlayerNames] = useState(Array(16).fill(""));
  const [errorMessage, setErrorMessage] = useState(""); // 🆕 felmeddelande

  const handlePlayerCountChange = (e) => {
    const count = Number(e.target.value);
    setPlayerCount(count);
    setPlayerNames((prevNames) => {
      const newNames = [...prevNames];
      if (count > prevNames.length) {
        return newNames.concat(Array(count - prevNames.length).fill(""));
      } else {
        return newNames.slice(0, count);
      }
    });
    setErrorMessage(""); // Rensa ev. tidigare fel
  };

  const handleNameChange = (index, e) => {
    const newNames = [...playerNames];
    newNames[index] = e.target.value;
    setPlayerNames(newNames);
    setErrorMessage(""); // Rensa ev. tidigare fel
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedNames = playerNames.map((name) => name.trim());
    const nameSet = new Set(trimmedNames.filter((n) => n));
    if (nameSet.size < trimmedNames.filter((n) => n).length) {
      setErrorMessage("Två eller flera spelare har samma namn. Namnen måste vara unika.");
      return;
    }

    setErrorMessage(""); // Allt ok
    // Fortsätt med turneringslogik
    console.log("Startar turnering med spelare:", trimmedNames);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto p-6 bg-white bg-opacity-90 rounded shadow-md"
    >
      <label className="block mb-2 font-semibold text-gray-900" htmlFor="playerCount">
        Antal spelare: <span className="font-bold">{playerCount}</span>
      </label>
      <input
        id="playerCount"
        type="range"
        min="2"
        max="30"
        value={playerCount}
        onChange={handlePlayerCountChange}
        className="w-full mb-6 accent-indigo-600"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {playerNames.map((name, idx) => (
          <div key={idx}>
            <label
              className="block mb-1 text-gray-900 font-medium"
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-black"
              required
            />
          </div>
        ))}
      </div>

      {/* 🔴 Felmeddelande */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
      >
        Starta turnering
      </button>
    </form>
  );
}
