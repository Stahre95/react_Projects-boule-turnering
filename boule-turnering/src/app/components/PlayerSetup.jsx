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
      className="w-full max-w-3xl mx-auto p-5 sm:p-7 lg:p-8 pb-16 sm:pb-20 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl text-white max-h-[calc(100vh-4rem)] overflow-hidden"
    >
      <div className="mb-6 sm:mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300 mb-2">Turneringsinställningar</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
          Spelare & matchup
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Ange antalet deltagare, namn och slutspelstyp för att skapa en modern bouleturnering.
        </p>
      </div>

      {/* Antal spelare */}
      <div className="mb-8 text-center relative" ref={playerCountRef}>
        <label className="block mb-3 font-semibold text-lg sm:text-xl text-white">Antal spelare</label>
        <button
          type="button"
          onClick={() => setShowPlayerCountDropdown(prev => !prev)}
          className="w-32 sm:w-40 lg:w-48 px-4 py-3 rounded-3xl bg-slate-950/40 text-white border border-white/10 font-semibold shadow-sm transition hover:bg-slate-950/70"
        >
          {playerCount}
        </button>
        <ul
          ref={playerCountListRef}
          className={`absolute z-10 w-32 sm:w-40 lg:w-48 mt-2 max-h-60 overflow-y-auto 
                      bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl
                      left-1/2 -translate-x-1/2 text-center text-white
                      transition-all duration-300 ease-in-out
                      ${showPlayerCountDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
          {playerCounts.map(num => (
            <li
              key={num}
              className={`px-4 py-3 cursor-pointer ${num === playerCount ? "font-semibold text-yellow-300" : "text-white hover:text-yellow-200"}`}
              onClick={() => handlePlayerCountSelect(num)}
            >
              {num}
            </li>
          ))}
        </ul>
      </div>

      {/* Lista med spelare */}
      <div className="mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center text-white">Spelarnamn</h3>
        <div className="flex flex-col items-center gap-4 pr-2 overflow-y-auto max-h-[35vh] sm:max-h-[40vh]">
          {playerNames.map((name, idx) => (
            <div key={idx} className="w-full max-w-md">
              <label
                className="block mb-2 font-medium text-sm text-gray-200"
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
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-3xl shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-300 text-base text-white"
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Välj playoff-typ */}
      <div className="mb-6 text-center relative" ref={playoffRef}>
        <label className="block text-lg sm:text-xl font-semibold mb-3 text-white">Välj slutspelstyp</label>
        <button
          type="button"
          onClick={() => setShowPlayoffDropdown(prev => !prev)}
          className="w-32 sm:w-40 lg:w-48 px-4 py-3 rounded-3xl bg-slate-950/40 text-white border border-white/10 font-semibold shadow-sm transition hover:bg-slate-950/70"
        >
          {playoffOptions.find(o => o.value === playoffType)?.label}
        </button>
        <ul
          ref={playoffListRef}
          className={`absolute z-10 w-32 sm:w-40 lg:w-48 mt-2 max-h-60 overflow-y-auto 
                      bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl
                      left-1/2 -translate-x-1/2 text-center text-white
                      transition-all duration-300 ease-in-out
                      ${showPlayoffDropdown ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
          {playoffOptions.map(opt => (
            <li
              key={opt.value}
              className="px-4 py-3 hover:text-yellow-200 cursor-pointer text-center text-white transition"
              onClick={() => handlePlayoffSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Felmeddelande */}
      {error && (
        <div className="mt-4 p-3 bg-red-100/90 text-red-700 rounded-3xl border border-red-300 text-sm sm:text-base shadow-lg text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Startknapp */}
      <div className="mt-6 mb-8 flex justify-center">
        <button
          type="submit"
          className="px-8 py-3 rounded-full text-lg font-semibold
                     bg-gradient-to-r from-yellow-400 to-yellow-600 text-black
                     hover:from-yellow-300 hover:to-yellow-500 
                     shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          Starta turnering
        </button>
      </div>
    </form>
  );
}
