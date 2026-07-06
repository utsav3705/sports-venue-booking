"use client";

import { useState } from "react";
import { CheckCircle, User, Users } from "lucide-react";
import { SPORTS, AREAS } from "@/lib/data";
import { useApp } from "@/lib/store";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];
const AVAILABILITY_OPTIONS = [
  "Morning (6am–12pm)",
  "Afternoon (12pm–5pm)",
  "Evening (5pm–10pm)",
  "Weekend Only",
];
const POSITIONS = {
  cricket: [
    "Batsman",
    "Bowler",
    "All-rounder",
    "Wicketkeeper",
    "Fast Bowler",
    "Spinner",
  ],
  football: ["Goalkeeper", "Defender", "Midfielder", "Striker", "Winger"],
  pickleball: ["Singles", "Doubles", "All-rounder"],
  padel: ["Singles", "Doubles", "Mixed Doubles"],
};

export default function RegisterPage() {
  const [type, setType] = useState("player");
  const [success, setSuccess] = useState(false);

  // Player form
  const [pName, setPName] = useState("");
  const [pAge, setPAge] = useState("");
  const [pSport, setPSport] = useState("cricket");
  const [pPosition, setPPosition] = useState("");
  const [pArea, setPArea] = useState("");
  const [pLevel, setPLevel] = useState("");
  const [pBio, setPBio] = useState("");
  const [pAvailability, setPAvailability] = useState([]);

  // Team form
  const [tName, setTName] = useState("");
  const [tSport, setTSport] = useState("cricket");
  const [tArea, setTArea] = useState("");
  const [tLevel, setTLevel] = useState("");
  const [tCaptain, setTCaptain] = useState("");
  const [tDescription, setTDescription] = useState("");
  const [tLooking, setTLooking] = useState("");
  const [tMax, setTMax] = useState("8");

  const { addPlayer, addTeam } = useApp();

  const toggleAvailability = (opt) => {
    setPAvailability((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "player") {
      const initials =
        pName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "P";
      const newPlayer = {
        id: "p-" + Math.random().toString(36).slice(2, 8),
        name: pName,
        age: Number(pAge) || 25,
        sport: pSport,
        position: pPosition || "All-rounder",
        area: pArea || "Satellite",
        level: pLevel || "Intermediate",
        availability: pAvailability.map((opt) => opt.split(" ")[0]),
        avatar: initials,
        bio: pBio || "Excited to play!",
        gamesPlayed: 0,
        joinedDate: new Date().toISOString().slice(0, 7),
      };
      addPlayer(newPlayer);
    } else {
      const initials =
        tName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "T";
      const maxAllowed = tSport === "cricket" ? 8 : 11;
      const sizeVal = Math.min(
        maxAllowed,
        Math.max(2, Number(tMax) || maxAllowed),
      );

      const newTeam = {
        id: "t-" + Math.random().toString(36).slice(2, 8),
        name: tName,
        sport: tSport,
        area: tArea,
        level: tLevel || "Intermediate",
        members: 1,
        maxMembers: sizeVal,
        avatar: initials,
        captain: tCaptain,
        description: tDescription || `Team ${tName} led by ${tCaptain}`,
        wins: 0,
        losses: 0,
        lookingFor: tLooking || "Any players",
        createdDate: new Date().toISOString().slice(0, 7),
      };
      addTeam(newTeam);
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {type === "player" ? "Player Profile Created!" : "Team Registered!"}
        </h2>
        <p className="text-muted-foreground mb-6">
          Your {type === "player" ? "profile" : "team"} is now visible to all
          users on TurfBook. Other players can find and connect with you!
        </p>
        <div className="bg-card border border-border rounded-2xl p-4 text-left mb-6 space-y-2">
          {type === "player" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{pName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium capitalize">{pSport}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Area</span>
                <span className="font-medium">{pArea}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">{pLevel}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Team</span>
                <span className="font-medium">{tName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium capitalize">{tSport}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Captain</span>
                <span className="font-medium">{tCaptain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Looking for</span>
                <span className="font-medium">{tLooking}</span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            if (type === "player") {
              setPName("");
              setPAge("");
              setPBio("");
            } else {
              setTName("");
              setTCaptain("");
            }
          }}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Register Another
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Register</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create your profile to connect with players and teams
        </p>
      </div>

      {/* Type toggle */}
      <div className="flex bg-secondary rounded-xl p-1 mb-6 gap-1">
        <button
          onClick={() => setType("player")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            type === "player"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          Player
        </button>
        <button
          onClick={() => setType("team")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            type === "team"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Team
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "player" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Name *
                </label>
                <input
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Age *
                </label>
                <input
                  required
                  type="number"
                  min="10"
                  max="80"
                  value={pAge}
                  onChange={(e) => setPAge(e.target.value)}
                  placeholder="25"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Sport *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setPSport(s.id);
                      setPPosition("");
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      pSport === s.id
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
                  Position / Role *
                </label>
                <select
                  required
                  value={pPosition}
                  onChange={(e) => setPPosition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select position</option>
                  {(POSITIONS[pSport] ?? []).map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Skill Level *
                </label>
                <select
                  required
                  value={pLevel}
                  onChange={(e) => setPLevel(e.target.value)}
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

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Your Area in Ahmedabad *
              </label>
              <select
                required
                value={pArea}
                onChange={(e) => setPArea(e.target.value)}
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
                Availability
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAvailability(opt)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-colors ${
                      pAvailability.includes(opt)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Short Bio
              </label>
              <textarea
                value={pBio}
                onChange={(e) => setPBio(e.target.value)}
                rows={3}
                placeholder="Tell other players a bit about yourself, your experience, what you're looking for..."
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Team Name *
                </label>
                <input
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Satellite FC"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Captain Name *
                </label>
                <input
                  required
                  value={tCaptain}
                  onChange={(e) => setTCaptain(e.target.value)}
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
                    onClick={() => {
                      setTSport(s.id);
                      setTMax(s.id === "cricket" ? "8" : "11");
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      tSport === s.id
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
                  Team Area *
                </label>
                <select
                  required
                  value={tArea}
                  onChange={(e) => setTArea(e.target.value)}
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
                  Skill Level *
                </label>
                <select
                  required
                  value={tLevel}
                  onChange={(e) => setTLevel(e.target.value)}
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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Max Team Size
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Max Limit: {tSport === "cricket" ? "8" : "11"}
                </span>
              </div>
              <input
                type="number"
                min="2"
                max={tSport === "cricket" ? 8 : 11}
                value={tMax}
                onChange={(e) => setTMax(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Looking For *
              </label>
              <input
                required
                value={tLooking}
                onChange={(e) => setTLooking(e.target.value)}
                placeholder="e.g. Spinner and 2 Batsmen"
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Team Description
              </label>
              <textarea
                value={tDescription}
                onChange={(e) => setTDescription(e.target.value)}
                rows={3}
                placeholder="Describe your team, training schedule, goals..."
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mt-2"
        >
          {type === "player" ? "Create Player Profile" : "Register Team"}
        </button>
      </form>
    </main>
  );
}
