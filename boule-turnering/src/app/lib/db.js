// Använder din existerande klient
import { supabase } from "./supabaseClient.js";

/** ===== PLAYERS ===== **/

// Hämta alla spelare
export async function fetchPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching players:", error);
    return [];
  }
  return data || [];
}

// Spara nya spelare: [{ name: "Anna" }, { name: "Johan" }]
export async function savePlayers(players) {
  if (!players?.length) return [];
  const { data, error } = await supabase.from("players").insert(players).select();
  if (error) {
    console.error("❌ Error saving players:", error);
    return [];
  }
  return data || [];
}

/** ===== TOURNAMENTS ===== **/

// Skapa turnering
export async function createTournament(name) {
  const { data, error } = await supabase
    .from("tournaments")
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating tournament:", error);
    return null;
  }
  return data;
}

// Senaste turneringen (fallback: sortera på id om created_at saknas)
export async function fetchLatestTournament() {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("❌ Error fetching latest tournament:", error);
    return null;
  }
  return data || null;
}

/** ===== MATCHES ===== **/

// Skapa matcher för en turnering
// matchList = [{ player1_id, player2_id, round }]
export async function createMatches(tournamentId, matchList) {
  if (!tournamentId || !matchList?.length) return [];

  const payload = matchList.map((m) => ({
    tournament_id: tournamentId,
    player1_id: m.player1_id,
    player2_id: m.player2_id,
    round: m.round,
    score1: m.score1 ?? null,
    score2: m.score2 ?? null,
  }));

  const { data, error } = await supabase.from("matches").insert(payload).select();

  if (error) {
    console.error("❌ Error creating matches:", error);
    return [];
  }
  return data || [];
}

// Hämta alla matcher för en turnering
export async function fetchMatches(tournamentId) {
  if (!tournamentId) return [];
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ Error fetching matches:", error);
    return [];
  }
  return data || [];
}

// Uppdatera flera matchresultat i bulk
// results = [{ id, score1, score2 }]
export async function updateMatchesScores(results) {
  if (!results?.length) return [];

  // Upsert per id (kräver PK på id)
  const { data, error } = await supabase
    .from("matches")
    .upsert(results.map(({ id, score1, score2 }) => ({ id, score1, score2 })), {
      onConflict: "id",
    })
    .select();

  if (error) {
    console.error("❌ Error updating matches:", error);
    return [];
  }
  return data || [];
}
