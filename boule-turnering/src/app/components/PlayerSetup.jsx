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
      className="w-full max-w-3xl mx-auto p-6 sm:p-8 bg-white bg-opacity-90 rounded-xl shadow-lg text-black"
    >
      {/* Antal spelare */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
       <label
  className="block mb-4 font-semibold text-center" // text-center centrerar texten
  htmlFor="playerCount"
>
  Antal spelare:
  <div className="mt-2 flex justify-center">
    <input
      id="playerCount"
      type="number"
      min="2"
      max="30"
      value={playerCount}
      onChange={handlePlayerCountChange}
      className="
        w-24
        px-3 py-2
        text-center
        text-lg font-semibold
        border border-gray-300
        rounded-lg
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-emerald-500
        focus:border-emerald-500
        transition-all duration-200 ease-in-out
        accent-emerald-600
        placeholder:text-gray-400 placeholder:text-center
      "
      placeholder="16"
    />
  </div>
</label>
      </div>

      {/* Lista med spelare */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto pr-1">
        {playerNames.map((name, idx) => (
          <div key={idx}>
            <label
              className="block mb-1 font-medium text-sm sm:text-base"
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
              className="
                w-full
                px-4 py-3
                border border-gray-300
                rounded-xl
                shadow-md
                focus:outline-none focus:ring-2 focus:ring-emerald-500
                placeholder-gray-400
                text-base sm:text-lg
              "
              required
            />
          </div>
        ))}
      </div>

      {/* Felmeddelande */}
      {error && (
        <p className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm sm:text-base">
          {error}
        </p>
      )}

      {/* Startknapp */}
      <button
        type="submit"
        className="
          sticky bottom-0
          mt-6
          w-full
          bg-emerald-600
          text-white
          py-3
          rounded-xl
          hover:bg-emerald-700
          transition
          text-lg font-semibold
          shadow-lg
        "
      >
        Starta turnering
      </button>
    </form>
  );
}
