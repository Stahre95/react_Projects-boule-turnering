"use client";

import { useState } from "react";
import PlayerSetup from "./PlayerSetup"; // Justera sökvägen

export default function HeroSection({ onStart }) {
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);

  const handleStart = (players) => {
    onStart(players);
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white px-4 sm:px-6"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      {/* Mörk overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Innehåll */}
      <div className="relative z-10 text-center w-full max-w-3xl">
        {!showPlayerSetup ? (
          <>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
              First Camp Västerås – Mälaren
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl mt-3 sm:mt-4">
              Boule Turnering
            </h2>
            <button
              onClick={() => setShowPlayerSetup(true)}
              className="mt-8 w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-200 transition shadow-lg"
            >
              Skapa ny turnering
            </button>
          </>
        ) : (
          <PlayerSetup onStart={handleStart} />
        )}
      </div>
    </section>
  );
}
