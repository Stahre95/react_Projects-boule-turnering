"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocsFromCache, getDocsFromServer, doc, getDoc } from "firebase/firestore";

export default function PlayerSetup({ onStart }) {
  const { user } = useAuth();
  const [playerCount, setPlayerCount] = useState(16);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [fetchBlocked, setFetchBlocked] = useState(false);
  const [playerSlots, setPlayerSlots] = useState(
    Array(16)
      .fill(0)
      .map(() => ({ useGuest: false, userId: null, name: "" }))
  );
  const [playoffType, setPlayoffType] = useState("kvartsfinal");
  const [error, setError] = useState("");
  const [openPlayerDropdown, setOpenPlayerDropdown] = useState(null);

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
      // Close player dropdown if clicked outside
      const playerSelects = document.querySelectorAll('[id^="playerSelect"]');
      let clickedInsidePlayerSelect = false;
      playerSelects.forEach((el) => {
        if (el.contains(e.target) || (el.nextSibling && el.nextSibling.contains(e.target)) || (el.parentElement && el.parentElement.querySelector('ul') && el.parentElement.querySelector('ul').contains(e.target))) {
          clickedInsidePlayerSelect = true;
        }
      });
      if (!clickedInsidePlayerSelect) {
        setOpenPlayerDropdown(null);
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

  // Fetch registered users from Firestore (if available)
  useEffect(() => {
    let mounted = true;
    if (!user) {
      // Clear list when not authenticated; reading 'users' may be blocked by security rules
      setRegisteredUsers([]);
      return () => (mounted = false);
    }
    let blocked = false;
    const fetchUsers = async () => {
      try {
        let snap = null;

        console.log('Starting Firestore registered users fetch.');
        // Try server first so we get the latest registered users.
        // If the server fetch fails, fall back to cache.
        try {
          snap = await getDocsFromServer(collection(db, "users"));
          console.log('Server fetch completed:', { docs: snap.docs.length, metadata: snap.metadata });
          if (snap?.metadata?.fromCache) {
            console.warn('Firestore returned users from cache even though server was requested.', snap.metadata);
          } else {
            console.log(`Fetched ${snap.docs.length} users from Firestore server.`);
          }
        } catch (srvErr) {
          const msg = (srvErr && srvErr.message) || '';
          if (msg.includes('ERR_BLOCKED_BY_CLIENT') || msg.includes('blocked')) {
            blocked = true;
            console.warn('Firestore network requests appear to be blocked by a browser extension or network policy. Falling back to cache.');
          } else {
            console.warn('Failed to fetch registered users from server, falling back to cache:', srvErr);
          }

          try {
            snap = await getDocsFromCache(collection(db, "users"));
            console.log('Cache fetch completed after server failure:', { docs: snap.docs.length, metadata: snap.metadata });
            if (snap) {
              console.warn(`Using cached users (${snap.docs.length}) because server fetch failed.`);
            }
          } catch (cacheErr) {
            console.warn('Failed to load users from cache after server fetch failed:', cacheErr);
            snap = null;
          }
        }

        const users = (snap && snap.docs ? snap.docs : [])
          .map((d) => ({ id: d.id, ...(d.data() || {}) }))
          .map((u) => ({
            id: u.id,
            name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.displayName || u.name || ""),
          }))
          .filter((u) => !!u.name)
          .sort((a, b) => a.name.localeCompare(b.name, "sv", { sensitivity: "base" }));

        let currentUserOption = null;
        if (user) {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              const name = data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}` : (data?.displayName || data?.name || user.displayName || user.email?.split("@")[0] || "Min profil");
              currentUserOption = { id: user.uid, name };
            } else {
              const name = user.displayName || user.email?.split("@")[0] || "Min profil";
              currentUserOption = { id: user.uid, name };
            }
          } catch (err) {
            console.warn("Failed to fetch current user doc:", err);
            const name = user.displayName || user.email?.split("@")[0] || "Min profil";
            currentUserOption = { id: user.uid, name };
          }
        }

        const merged = currentUserOption
          ? [currentUserOption, ...users.filter((u) => u.id !== currentUserOption.id)]
          : users;

        if (mounted) {
          setRegisteredUsers(merged);
          console.log('Loaded registered users:', merged);
          if (snap && snap.docs) {
            console.log('Firestore raw user docs:', snap.docs.map(d => ({ id: d.id, data: d.data() })));
          }
        }
        if (mounted && blocked) setFetchBlocked(true);
      } catch (err) {
        console.warn("Failed to fetch registered users:", err);
      }
    };
    fetchUsers();
    return () => (mounted = false);
  }, [user]);

  const handleNameChange = (index, e) => {
    setPlayerSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: e.target.value };
      return next;
    });
  };

  const handleSelectPlayer = (index, value) => {
    setPlayerSlots((prev) => {
      const next = [...prev];
      if (value === "guest") {
        next[index] = { useGuest: true, userId: null, name: "" };
      } else if (!value) {
        next[index] = { useGuest: false, userId: null, name: "" };
      } else {
        const user = registeredUsers.find((u) => u.id === value);
        next[index] = { useGuest: false, userId: value, name: user ? user.name : "" };
      }
      return next;
    });
  };

  const handleGuestNameChange = (index, e) => {
    setPlayerSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: e.target.value };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const selected = playerSlots.slice(0, playerCount).map((slot) => {
      if (slot.useGuest) return slot.name.trim();
      if (slot.userId) {
        const u = registeredUsers.find((r) => r.id === slot.userId);
        return u ? u.name : slot.name.trim();
      }
      return slot.name.trim();
    });

    // Require every slot to have a name
    if (selected.some((n) => !n)) {
      setError("Alla spelare måste ha ett namn eller väljas från listan.");
      return;
    }

    const nameSet = new Set(selected);
    if (nameSet.size !== selected.length) {
      setError("Två eller flera spelare har samma namn. Namnen måste vara unika.");
      return;
    }

    onStart(selected, playoffType);
  };

  const handlePlayerCountSelect = (count) => {
    setPlayerCount(count);
    setShowPlayerCountDropdown(false);
    setPlayerSlots((prev) => {
      if (count > prev.length)
        return [
          ...prev,
          ...Array(count - prev.length)
            .fill(0)
            .map(() => ({ useGuest: false, userId: null, name: "" })),
        ];
      return prev.slice(0, count);
    });
  };

  const handlePlayoffSelect = (type) => {
    setPlayoffType(type);
    setShowPlayoffDropdown(false);
  };

  const playerCounts = Array.from({ length: 39 }, (_, i) => i + 2);
  const playoffOptions = [
    { label: "Sextondelsfinal", value: "sextondelsfinal" },
    { label: "Åttondelsfinal", value: "åttondelsfinal" },
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
          Ange antalet deltagare, namn och slutspelstyp för att skapa din bouleturnering.
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
          {user ? null : (
            <p className="text-sm text-gray-300 mb-3 text-center">Logga in för att se registrerade användare. Du kan fortfarande lägga till gäster.</p>
          )}
          {fetchBlocked && (
            <p className="text-sm text-yellow-300 mb-3 text-center">Firebasens nätverksanrop blockerades av din webbläsare (adblock/extension). Registrerade användare kan inte laddas.</p>
          )}
          <div className="flex flex-col items-center gap-4 pr-2 overflow-y-auto max-h-[40vh] sm:max-h-[44vh]">
          {playerSlots.slice(0, playerCount).map((slot, idx) => (
            <div key={idx} className="w-full max-w-md relative">
              <label className="block mb-2 font-medium text-sm text-gray-200" htmlFor={`playerSelect${idx}`}>
                Spelare {idx + 1}
              </label>
              <button
                type="button"
                id={`playerSelect${idx}`}
                onClick={() => setOpenPlayerDropdown(openPlayerDropdown === idx ? null : idx)}
                className="w-full px-4 py-3 bg-slate-950/40 border border-white/10 rounded-3xl shadow-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 text-left"
              >
                {slot.userId
                  ? registeredUsers.find((u) => u.id === slot.userId)?.name || "Välj spelare"
                  : slot.useGuest
                  ? "Gäst (skriv eget namn)"
                  : "Välj registrerad spelare eller gäst"}
              </button>
              <ul
                className={`absolute z-50 w-full mt-2 max-h-80 overflow-y-auto 
                           bg-slate-950/95 border border-white/10 rounded-3xl shadow-2xl
                           text-white
                           transition-all duration-300 ease-in-out
                           ${openPlayerDropdown === idx ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
              >
                <li
                  className="px-4 py-3 hover:text-yellow-200 cursor-pointer text-white transition"
                  onClick={() => {
                    handleSelectPlayer(idx, "");
                    setOpenPlayerDropdown(null);
                  }}
                >
                  (töm val)
                </li>
                {registeredUsers.map((u) => (
                  <li
                    key={u.id}
                    className="px-4 py-3 hover:text-yellow-200 cursor-pointer text-white transition"
                    onClick={() => {
                      handleSelectPlayer(idx, u.id);
                      setOpenPlayerDropdown(null);
                    }}
                  >
                    {u.id === user?.uid ? `Jag — ${u.name}` : u.name}
                  </li>
                ))}
                <li
                  className="px-4 py-3 hover:text-yellow-200 cursor-pointer text-white transition border-t border-white/10"
                  onClick={() => {
                    handleSelectPlayer(idx, "guest");
                    setOpenPlayerDropdown(null);
                  }}
                >
                  Gäst (skriv eget namn)
                </li>
              </ul>

              {slot.useGuest && (
                <input
                  type="text"
                  id={`playerName${idx}`}
                  value={slot.name}
                  onChange={(e) => handleGuestNameChange(idx, e)}
                  placeholder={`Namn på gästspelare ${idx + 1}`}
                  className="mt-3 w-full px-4 py-3 bg-white/10 border border-white/10 rounded-3xl shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-300 text-base text-white"
                />
              )}
            </div>
          ))}
        </div>
        {user && registeredUsers.length <= 1 && (
          <p className="mt-3 text-sm text-gray-300 text-center">Inga andra registrerade användare hittades.</p>
        )}
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
