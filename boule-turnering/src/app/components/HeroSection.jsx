"use client";

export default function HeroSection() {
  return (
    <section
      className="relative h-screen bg-cover bg-center flex flex-col items-center justify-center text-white px-4"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 text-center w-full">
        <h1 className="text-4xl md:text-6xl font-bold">
          First Camp Västerås – Mälaren
        </h1>
        <h2 className="text-xl md:text-2xl mt-4">Boule Turnering</h2>
        <button
          className="mt-8 bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition"
        >
          Starta ny turnering
        </button>
      </div>
    </section>
  );
}
