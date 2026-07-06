"use client";

import { useState, useMemo } from "react";
import { Shuffle, CheckCircle, Plus, Swords, X, Users } from "lucide-react";
import TeamCard from "@/components/cards/TeamCard";
import ChallengeModal from "@/components/modals/ChallengeModal";
import JoinModal from "@/components/modals/JoinModal";
import { TEAMS, SPORTS, AREAS } from "@/lib/data";
import { useApp } from "@/lib/store";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];

export default function TeamsPage() {
  const { createdTeams, addTeam, addJoin, addMatch } = useApp();
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [joinedTeam, setJoinedTeam] = useState(null);
  const [challengeTeam, setChallengeTeam] = useState(null);
  const [randomTeam, setRandomTeam] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const allTeams = useMemo(() => {
    return [...createdTeams, ...TEAMS].filter(
      (t) => t.sport === "cricket" || t.sport === "football",
    );
  }, [createdTeams]);

  const filtered = allTeams
    .filter((t) => (selectedSport === "all" ? true : t.sport === selectedSport))
    .filter((t) => (selectedArea === "all" ? true : t.area === selectedArea));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const findRandomTeam = () => {
    const pool = filtered.length > 0 ? filtered : allTeams;
    setRandomTeam(pool[Math.floor(Math.random() * pool.length)]);
  };

  const confirmJoin = () => {
    if (!joinedTeam) return;
    addJoin({
      teamName: joinedTeam.name,
      teamAvatar: joinedTeam.avatar,
      sport: joinedTeam.sport,
    });
    showToast(`Join request sent to ${joinedTeam.name}`);
    setJoinedTeam(null);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} teams — join one or challenge them to a match
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
          <button
            onClick={findRandomTeam}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>
        </div>
      </div>

      {/* Random Team Banner */}
      {randomTeam && (
        <div className="mb-6 bg-accent border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base border border-primary/20 shrink-0">
            {randomTeam.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
              Random Team Match
            </p>
            <p className="font-bold text-foreground">{randomTeam.name}</p>
            <p className="text-xs text-muted-foreground">
              {randomTeam.sport.charAt(0).toUpperCase() +
                randomTeam.sport.slice(1)}{" "}
              · {randomTeam.area} · {randomTeam.level}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChallengeTeam(randomTeam)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <Swords className="w-3.5 h-3.5" />
              Challenge
            </button>
            <button
              onClick={() => setJoinedTeam(randomTeam)}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              Join
            </button>
            <button
              onClick={() => setRandomTeam(null)}
              className="px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Sleek Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-card border border-border rounded-2xl p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSport("all")}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
              selectedSport === "all"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-102"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            All Sports
          </button>
          {SPORTS.filter((s) => s.id === "cricket" || s.id === "football").map(
            (s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSport(s.id)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === s.id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-102"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ),
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold cursor-pointer"
          >
            <option value="all">All Areas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground font-medium">No teams found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try a different filter or create your own team
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onJoin={setJoinedTeam}
              onChallenge={setChallengeTeam}
            />
          ))}
        </div>
      )}

      {/* Join Modal */}
      {joinedTeam && (
        <JoinModal
          team={joinedTeam}
          onClose={() => setJoinedTeam(null)}
          onConfirm={confirmJoin}
        />
      )}

      {/* Challenge / Match Request Modal */}
      {challengeTeam && (
        <ChallengeModal
          team={challengeTeam}
          onClose={() => setChallengeTeam(null)}
          onSubmit={(fromTeam, matchType, stake) => {
            addMatch({
              fromTeam,
              toTeam: challengeTeam.name,
              toAvatar: challengeTeam.avatar,
              sport: challengeTeam.sport,
              matchType,
              stake,
            });
            showToast(`Match request sent to ${challengeTeam.name}`);
            setChallengeTeam(null);
          }}
        />
      )}

      {/* Create Team Modal */}
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreate={(team) => {
            addTeam(team);
            showToast(`${team.name} created and now visible to everyone`);
            setShowCreate(false);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </main>
  );
}

/* ---------- Create Team Modal ---------- */

function CreateTeamModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [captain, setCaptain] = useState("");
  const [sport, setSport] = useState("cricket");
  const [area, setArea] = useState("");
  const [level, setLevel] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [maxMembers, setMaxMembers] = useState("8");

  const handleSportChange = (s) => {
    setSport(s);
    setMaxMembers(s === "cricket" ? "8" : "11");
  };

  const initials = (n) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NT";

  const maxAllowed = sport === "cricket" ? 8 : 11;
  const sizeVal = Number(maxMembers);
  const sizeValid = sizeVal >= 2 && sizeVal <= maxAllowed;

  const valid =
    name.trim() &&
    captain.trim() &&
    area &&
    level &&
    lookingFor.trim() &&
    sizeValid;

  const handleCreate = () => {
    if (!valid) return;
    const team = {
      id: "ct-" + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      sport,
      area,
      level: level,
      members: 1,
      maxMembers: Math.min(maxAllowed, Math.max(2, sizeVal)),
      avatar: initials(name.trim()),
      captain: captain.trim(),
      description: `Newly created team led by ${captain.trim()}. Looking for ${lookingFor.trim()}.`,
      wins: 0,
      losses: 0,
      lookingFor: lookingFor.trim(),
      createdDate: new Date().toISOString().slice(0, 7),
    };
    onCreate(team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-5 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Create a Team</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Team Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Satellite FC"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Captain *
              </label>
              <input
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Sport *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.filter(
                (s) => s.id === "cricket" || s.id === "football",
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSportChange(s.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    sport === s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Area *
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">Select area</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Level *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Max Size
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Max: {sport === "cricket" ? "8" : "11"}
                </span>
              </div>
              <input
                type="number"
                min="2"
                max={sport === "cricket" ? 8 : 11}
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Looking For *
              </label>
              <input
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="e.g. 2 Batsmen"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            disabled={!valid}
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}
