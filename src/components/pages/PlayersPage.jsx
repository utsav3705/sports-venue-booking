"use client";

import { useState, useEffect } from "react";
import { Shuffle, CheckCircle, MessageCircle, UserPlus } from "lucide-react";
import PlayerCard from "@/components/cards/PlayerCard";
import ChatModal from "@/components/modals/ChatModal";
import ConnectModal from "@/components/modals/ConnectModal";
import { SPORTS, AREAS, canMessage } from "@/lib/data";
import { useApp } from "@/lib/store";
import { playerApi } from "@/services/playerEcosystemApi";

export default function PlayersPage() {
  const { showToast, currentUser } = useApp();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [connectPlayer, setConnectPlayer] = useState(null);
  const [chatPlayer, setChatPlayer] = useState(null);
  const [randomPlayer, setRandomPlayer] = useState(null);
  const [sendingConnect, setSendingConnect] = useState(false);

  const fetchPlayers = async () => {
    try {
      const data = await playerApi.getAll();
      // Filter out current user from listing
      const others = data.filter((p) => p._id !== currentUser?._id);
      setPlayers(others);
    } catch (e) {
      console.error("Fetch Players Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [currentUser]);

  const filtered = players
    .filter((p) => (selectedSport === "all" ? true : p.sport === selectedSport))
    .filter((p) => (selectedArea === "all" ? true : p.area === selectedArea));

  const findRandomPlayer = () => {
    const pool = filtered.length > 0 ? filtered : players;
    if (pool.length === 0) return;
    setRandomPlayer(pool[Math.floor(Math.random() * pool.length)]);
  };

  const confirmConnect = async () => {
    if (!connectPlayer) return;
    setSendingConnect(true);
    try {
      await playerApi.connect(connectPlayer._id);
      showToast(`Connection request sent to ${connectPlayer.name.split(" ")[0]}`, "success");
      setConnectPlayer(null);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send request", "error");
    } finally {
      setSendingConnect(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-semibold">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Players</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect with {filtered.length} players near you in Ahmedabad
          </p>
        </div>
        <button
          onClick={findRandomPlayer}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Match Me Randomly
        </button>
      </div>

      {/* Simple filter bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSport("all")}
            className={`text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
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
              className={`text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
                selectedSport === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full sm:w-56 px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="all">All Areas in Ahmedabad</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              Near {a}
            </option>
          ))}
        </select>
      </div>

      {/* Info note about messaging */}
      <div className="mb-6 flex items-start gap-2 bg-accent border border-primary/10 rounded-xl px-3 py-2.5">
        <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-accent-foreground leading-relaxed font-semibold">
          Direct messaging is enabled! Tap the <strong>Message</strong> button
          to chat and coordinate a game.
        </p>
      </div>

      {/* Random Player Banner */}
      {randomPlayer && (
        <div className="mb-6 bg-accent border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base border border-primary/20 shrink-0">
            {randomPlayer.profileImage ? <img src={randomPlayer.profileImage} className="w-full h-full object-cover rounded-full" /> : randomPlayer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 font-semibold">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
              Your Random Match
            </p>
            <p className="font-bold text-foreground">{randomPlayer.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {randomPlayer.sport.charAt(0).toUpperCase() +
                randomPlayer.sport.slice(1)}{" "}
              · {randomPlayer.area}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canMessage(randomPlayer.sport) && (
              <button
                onClick={() => setChatPlayer(randomPlayer)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message
              </button>
            )}
            <button
              onClick={() => setConnectPlayer(randomPlayer)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Connect
            </button>
            <button
              onClick={() => setRandomPlayer(null)}
              className="px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-secondary/30 border border-border rounded-2xl h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <p className="text-foreground font-medium">No players found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try a different sport or area
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => {
            const isConnected = currentUser?.connections?.some((c) => c._id === player._id);
            return (
              <div key={player._id} className="relative group">
                <PlayerCard
                  player={{
                    name: player.name,
                    avatar: player.name.slice(0, 2).toUpperCase(),
                    sport: player.sport,
                    position: player.bio || "Excited to play!",
                    level: "Intermediate",
                    area: player.area || "Satellite",
                  }}
                  onConnect={() => {
                    if (isConnected) {
                      showToast("Already connected!", "info");
                    } else {
                      setConnectPlayer(player);
                    }
                  }}
                  onMessage={setChatPlayer}
                />
                {isConnected && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full uppercase">
                    Connected
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Confirmation Modal */}
      {connectPlayer && (
        <ConnectModal
          player={{
            name: connectPlayer.name,
            avatar: connectPlayer.name.slice(0, 2).toUpperCase(),
            sport: connectPlayer.sport,
            area: connectPlayer.area || "Satellite"
          }}
          onClose={() => setConnectPlayer(null)}
          onConfirm={confirmConnect}
        />
      )}

      {/* Chat Modal */}
      {chatPlayer && (
        <ChatModal
          peer={{
            name: chatPlayer.name,
            avatar: chatPlayer.name.slice(0, 2).toUpperCase(),
            sport: chatPlayer.sport,
          }}
          onClose={() => setChatPlayer(null)}
        />
      )}
    </main>
  );
}
