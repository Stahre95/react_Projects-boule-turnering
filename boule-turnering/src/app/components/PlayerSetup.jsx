"use client";
import { useState, useRef, useEffect } from "react";

export default function PlayerSetup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(16);
  const [playerNames, setPlayerNames] = useState(Array(16).fill(""));
  const [playoffType, setPlayoffType] = useState("kvartsfinal");
  const [error, setError] = useState("");

  const [showPlayerCountDropdown, setShowPlayerCountDropdown] = useState(false);
  const [showPlayoffDropdown, setShowPlayoffDropdown] = useState(false);

  const playerCountRef = useRef(null);
  const playoffRef = useRef(null);
  const playerCountListRef = useRef(null);
  const playoffListRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (playerCountRef.current && !playerCountRef.current.contains(e.target)) {
        setShowPlayerCountDropdown(false);
      }
      if (playoffRef.current && !playoffRef.current.contains(e.target)) {
        setShowPlayoffDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to center current value with smooth animation
  useEffect(() => {
    if (showPlayerCountDropdown && playerCountListRef.current) {
      const index = playerCount - 2; // 2-30
      const optionEl = playerCountListRef.current.children[index];
      optionEl?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [showPlayerCountDropdown, playerCount]);

  useEffect(() => {
    if (showPlayoffDropdown && playoffListRef.current) {
      const index = ["kvartsfinal","semifinal","final"].indexOf(playoffType);
      const optionEl = playoffListRef.current.children[index];
      optionEl?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [showPlayoffDropdown, playoffType]);

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

    onStart(filledNames, playoffType);
  };

  const handlePlayerCountSelect = (count) => {
    setPlayerCount(count);
    setShowPlayerCountDropdown(false);
    setPlayerNames((prev) => {
      if (count > prev.length) return [...prev, ...Array(count - prev.length).fill("")];
      return prev.slice(0, count);
    });
  };

  const handlePlayoffSelect = (type) => {
    setPlayoffType(type);
    setShowPlayoffDropdown(false);
  };

  const playerCounts = Array.from({ length: 29 }, (_, i) => i + 2);
  const playoffOptions = [
    { label: "Kvartsfinal", value: "kvartsfinal" },
    { label: "Semifinal", value: "semifinal" },
    { label: "Final", value: "final" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto p-6 sm:p-8 
                 bg-white/90 backdrop-blur-md 
                 rounded-2xl shadow-2xl text-black"
    >
      {/* Antal spelare */}
      <div className="mb-6 text-center relative" ref={playerCountRef}>
        <label className="block mb-2 font-semibold text-lg">Antal spelare</label>
        <button
          type="button"
          onClick={() => setShowPlayerCountDropdown(prev => !prev)}
          className="w-40 px-4 py-2 rounded-xl shadow-md bg-white text-black border border-gray-300 font-semibold"
        >
          {playerCount}
        </button>
        <ul
          ref={playerCountListRef}
          className={`absolute z-10 w-40 mt-1 max-h-60 overflow-y-auto 
                      bg-white border border-gray-300 rounded shadow-lg
                      left-1/2 -translate-x-1/2 text-center
                      transition-all duration-300 ease-in-out
                      ${showPlayerCountDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
          {playerCounts.map(num => (
            <li
              key={num}
              className={`px-4 py-2 cursor-pointer  ${num === playerCount ? "font-bold" : ""}`}
              onClick={() => handlePlayerCountSelect(num)}
            >
              {num}
            </li>
          ))}
        </ul>
      </div>

      {/* Lista med spelare */}
      <div className="flex flex-col items-center gap-4 max-h-[60vh] overflow-y-auto pr-1
                      scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {playerNames.map((name, idx) => (
          <div key={idx} className="w-full max-w-md">
            <label
              className="block mb-1 font-medium text-sm text-gray-700"
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
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400 text-base"
              required
            />
          </div>
        ))}
      </div>

      {/* Välj playoff-typ */}
      <div className="mt-6 mb-4 text-center relative" ref={playoffRef}>
        <label className="block text-lg font-semibold mb-2">Välj Slutspelstyp</label>
        <button
          type="button"
          onClick={() => setShowPlayoffDropdown(prev => !prev)}
          className="w-52 px-4 py-3 rounded-xl shadow-md bg-white text-black border border-gray-300 font-semibold"
        >
          {playoffOptions.find(o => o.value === playoffType)?.label}
        </button>
        <ul
          ref={playoffListRef}
          className={`absolute z-10 w-52 mt-1 max-h-60 overflow-y-auto 
                      bg-white border border-gray-300 rounded shadow-lg
                      left-1/2 -translate-x-1/2 text-center
                      transition-all duration-300 ease-in-out
                      ${showPlayoffDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
          {playoffOptions.map(opt => (
            <li
              key={opt.value}
              className="px-4 py-2 hover:bg-yellow-100 cursor-pointer text-center"
              onClick={() => handlePlayoffSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Felmeddelande */}
      {error && (
        <p className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-sm sm:text-base shadow text-center">
          {error}
        </p>
      )}

      {/* Startknapp */}
      <button
        type="submit"
        className="mt-6 w-full py-3 rounded-full text-lg font-semibold
                   bg-gradient-to-r from-yellow-400 to-yellow-600 text-black
                   hover:from-yellow-300 hover:to-yellow-500 
                   shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      >
        Starta turnering
      </button>
    </form>
  );
}
