"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { teamApi } from "@/services/playerEcosystemApi";

export default function EditTeamPage({ teamId, onBack, onSuccess }) {
  const { showToast } = useApp();
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("cricket");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [maxMembers, setMaxMembers] = useState("11");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teamId) return;
    teamApi.getById(teamId)
      .then((data) => {
        setTeamName(data.teamName || "");
        setSport(data.sport || "cricket");
        setDescription(data.description || "");
        setLogo(data.logo || "");
        setMaxMembers(data.maxMembers || "11");
      })
      .catch((e) => setError("Failed to load team details"))
      .finally(() => setLoading(false));
  }, [teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setSaving(true);
    try {
      await teamApi.update(teamId, {
        teamName,
        sport,
        description,
        logo,
        maxMembers: Number(maxMembers),
      });
      showToast("Team details updated successfully!", "success");
      onSuccess(teamId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-secondary rounded w-1/3" />
          <div className="h-12 bg-secondary rounded" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update team roster limit and profile details</p>
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
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
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
            <label className="block text-xs font-semibold text-foreground mb-1.5">Logo Initials</label>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
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
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
