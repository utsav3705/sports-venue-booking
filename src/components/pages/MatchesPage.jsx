"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Plus, Users, Calendar, MapPin, Swords, Clock, AlertCircle } from "lucide-react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { matchApi } from "@/services/playerEcosystemApi";

/**
 * PUBLIC MATCHES DIRECTORY PAGE
 *
 * Lists all open/active matches hosted by other player users.
 * Offers quick sport tab filtering and join match triggers.
 */
export default function MatchesPage({ onNavigate }) {
  const { currentUser, showToast } = useApp();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("all");
  const [joiningId, setJoiningId] = useState(null);

  const fetchMatches = async () => {
    try {
      const data = await matchApi.getAll();
      setMatches(data);
    } catch (e) {
      console.error("Fetch Matches Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleJoinMatch = async (matchId) => {
    setJoiningId(matchId);
    try {
      await matchApi.join(matchId);
      showToast("Joined match successfully!", "success");
      fetchMatches();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to join match", "error");
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveMatch = async (matchId) => {
    try {
      await matchApi.leave(matchId);
      showToast("Left match successfully", "success");
      fetchMatches();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to leave match", "error");
    }
  };

  const filtered = matches.filter(
    (m) => selectedSport === "all" ? true : m.sport === selectedSport
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Public Matches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} matches found — join a game or host one
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-match")}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Host a Match
        </button>
      </div>

      {/* Sport quick tab filtering */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        <button
          onClick={() => setSelectedSport("all")}
          className={`shrink-0 text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
            selectedSport === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          All Sports
        </button>
        {SPORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSport(s.id)}
            className={`shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
              selectedSport === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Matches listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-secondary/30 border border-border rounded-2xl h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-foreground font-medium">No open matches found</p>
          <p className="text-muted-foreground text-xs mt-1">Check back later or host your own public lobby</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-semibold">
          {filtered.map((m) => {
            const sport = SPORTS.find((s) => s.id === m.sport);
            const spotsLeft = m.requiredPlayers - m.joinedPlayers.length;
            const isParticipant = m.joinedPlayers.some((p) => p._id === currentUser?._id);
            const isHost = m.owner?._id === currentUser?._id;

            return (
              <div
                key={m._id}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Row 1 */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20`}>
                      {sport?.icon} {sport?.label}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                      {m.skillLevel}
                    </span>
                  </div>

                  {/* Title/Host */}
                  <h3 className="font-bold text-foreground text-sm truncate mb-1">
                    {sport?.label} Match @ {m.venue?.name || "Local Turf"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Hosted by <span className="font-semibold text-foreground">{m.owner?.name || "Player"}</span>
                  </p>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {m.description || "Friendly matches looking for players to fill slots. Casual gameplay focus."}
                  </p>

                  {/* Date & Time details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.joinedPlayers.length}/{m.requiredPlayers} Players joined</span>
                    </div>
                  </div>
                </div>

                {/* CTA controls */}
                <div className="pt-4 border-t border-border mt-auto">
                  {isHost ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-bold cursor-not-allowed text-center"
                    >
                      You are Hosting
                    </button>
                  ) : isParticipant ? (
                    <button
                      onClick={() => handleLeaveMatch(m._id)}
                      className="w-full py-2.5 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-secondary transition-colors"
                    >
                      Leave Match
                    </button>
                  ) : spotsLeft > 0 ? (
                    <button
                      onClick={() => handleJoinMatch(m._id)}
                      disabled={joiningId === m._id}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-sm shadow-primary/10"
                    >
                      {joiningId === m._id ? "Joining..." : "Join Match"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold cursor-not-allowed text-center"
                    >
                      Match Full
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
