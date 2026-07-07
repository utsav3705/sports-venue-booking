"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { teamApi } from "@/services/playerEcosystemApi";

export default function CreateTeamPage({ onBack, onSuccess }) {
  const { showToast } = useApp();
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("cricket");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [maxMembers, setMaxMembers] = useState("11");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setSaving(true);
    try {
      await teamApi.create({
        teamName,
        sport,
        description,
        logo,
        maxMembers: Number(maxMembers),
      });
      showToast("Team created successfully!", "success");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create a Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Form a new sports club and recruit players</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 text-xs font-semibold p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Team Name *</label>
          <input
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Satellite Strikers"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Sport *</label>
          <div className="grid grid-cols-2 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSport(s.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  sport === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Max Members *</label>
            <input
              required
              type="number"
              min="2"
              max="50"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Logo Initials (optional)</label>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="e.g. SS"
              maxLength={3}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Introduce your team, preferred areas in Ahmedabad, schedules, etc."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50"
        >
          {saving ? "Creating Team..." : "Create Team"}
        </button>
      </form>
    </main>
  );
}
