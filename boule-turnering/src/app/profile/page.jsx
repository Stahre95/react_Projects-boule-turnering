import Link from 'next/link';

export default function ProfilePage() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-start pt-24 sm:pt-28 text-white px-4 sm:px-6"
      style={{
        backgroundImage: "url('/images/hero_background.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80"></div>

      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg tracking-wide">
            First Camp Västerås
          </h1>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl text-gray-200 font-semibold">
            Placeholder&apos;s Profil
          </h2>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4 sm:mb-6">Personlig information</h3>
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4 lg:p-5">
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-[0.2em] mb-2">Namn</p>
                <p className="text-base sm:text-lg lg:text-xl text-white">Placeholder</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4 lg:p-5">
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-[0.2em] mb-2">E-post</p>
                <p className="text-base sm:text-lg lg:text-xl text-white">placeholder@example.com</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4 lg:p-5">
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-[0.2em] mb-2">Telefon</p>
                <p className="text-base sm:text-lg lg:text-xl text-white">+46 70 123 45 67</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white/10 border border-white/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xl sm:text-2xl text-white font-semibold mb-4 sm:mb-6">Kontodetaljer</h3>
            <div className="space-y-3 sm:space-y-4 text-gray-300">
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Antal turneringar {new Date().getFullYear()}</p>
                <p className="text-white font-medium">{Math.floor(Math.random() * 10) + 1}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Senaste turnering</p>
                <p className="text-white font-medium">{new Date().toLocaleDateString('sv-SE')}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/40 border border-white/10 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400">Konto skapat</p>
                <p className="text-white font-medium">N/A</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-black font-semibold shadow-xl transition hover:bg-yellow-300"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </section>
  );
}

