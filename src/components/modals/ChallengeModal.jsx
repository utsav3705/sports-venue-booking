"use client";

import { useState } from "react";
import { Swords, X, Handshake, IndianRupee } from "lucide-react";

export default function ChallengeModal({ team, onClose, onSubmit }) {
  const [fromTeam, setFromTeam] = useState("");
  const [matchType, setMatchType] = useState("friendly");
  const [stake, setStake] = useState("500");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Challenge {team.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary animate-duration-150 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Your Team Name
        </label>
        <input
          value={fromTeam}
          onChange={(e) => setFromTeam(e.target.value)}
          placeholder="e.g. Bopal Blasters"
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors mb-4"
        />

        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Match Type
        </label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMatchType("friendly")}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${
              matchType === "friendly"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <Handshake className="w-5 h-5" />
            Friendly
          </button>
          <button
            type="button"
            onClick={() => setMatchType("competitive")}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${
              matchType === "competitive"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            <IndianRupee className="w-5 h-5" />
            Loss &amp; Pay
          </button>
        </div>

        {matchType === "competitive" ? (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Stake Amount (loser pays) ₹
            </label>
            <input
              type="number"
              min="100"
              step="100"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />

            <p className="text-xs text-muted-foreground mt-1.5">
              The losing team pays ₹{Number(stake || 0).toLocaleString()} to the
              winner.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-4">
            A casual friendly match — just for fun, no stakes involved.
          </p>
        )}

        <button
          disabled={!fromTeam.trim()}
          onClick={() =>
            onSubmit(
              fromTeam.trim(),
              matchType,
              matchType === "competitive" ? Number(stake || 0) : 0,
            )
          }
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Swords className="w-4 h-4" />
          Send Match Request
        </button>
      </div>
    </div>
  );
}
