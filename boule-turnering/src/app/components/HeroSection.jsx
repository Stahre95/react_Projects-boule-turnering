"use client";

import { useState } from "react";
import PlayerSetup from "./PlayerSetup";

export default function HeroSection({ onStart }) {
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);

  const handleStart = (players, playoffType) => {
    onStart(players, playoffType);
    console.log("Spelare:", players);
    console.log("Slutspelstyp:", playoffType);
  };

  return (
    <section
      className={`relative min-h-screen bg-cover bg-center flex flex-col items-center ${showPlayerSetup ? 'justify-center' : 'justify-start pt-24 sm:pt-28'} text-white px-4 sm:px-6`}
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      {/* Gradient + mörk overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

      {/* Innehåll */}
      <div className={`relative z-10 w-full ${showPlayerSetup ? 'max-w-4xl px-4' : 'text-center max-w-3xl px-4'}`}>
        {!showPlayerSetup ? (
          <>
            {/* Huvudrubrik */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg tracking-wide">
              First Camp Västerås
            </h1>

            {/* Underrubrik */}
            <h2 className="text-xl sm:text-2xl md:text-3xl mt-4 text-gray-200 font-light">
              Bouleturnering {new Date().getFullYear()}
            </h2>

            {/* Knapp */}
            <button
              onClick={() => setShowPlayerSetup(true)}
              className="mt-6 sm:mt-10 px-8 py-4 rounded-full text-lg font-semibold
                         bg-gradient-to-r from-yellow-400 to-yellow-600 text-black
                         hover:from-yellow-300 hover:to-yellow-500 
                         shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
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
