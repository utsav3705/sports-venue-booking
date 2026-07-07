"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Swords, Shield, MapPin, Calendar, Clock, Plus, X, Users, AlertCircle } from "lucide-react";
import { SPORTS, AREAS, TIME_SLOTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { matchApi } from "@/services/playerEcosystemApi";
import venueApi from "@/services/venueApi";

export default function CreateMatchPage({ onBack, onSuccess }) {
  const { showToast } = useApp();
  const [sport, setSport] = useState("cricket");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:00");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [requiredPlayers, setRequiredPlayers] = useState("10");
  const [description, setDescription] = useState("");

  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    venueApi.getAll()
      .then((data) => setVenues(data))
      .catch((e) => console.error("Error loading venues:", e))
      .finally(() => setLoadingVenues(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!venue) {
      setError("Please select a sports venue");
      return;
    }

    setSaving(true);
    try {
      const match = await matchApi.create({
        sport,
        venue,
        date,
        time,
        skillLevel,
        requiredPlayers: Number(requiredPlayers),
        description,
      });
      showToast("Public match created successfully!", "success");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create match");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Match</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Host a public match for players to join</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 text-xs font-semibold p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sport selection */}
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

        {/* Venue selection */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Sports Venue *</label>
          {loadingVenues ? (
            <div className="h-10 bg-secondary animate-pulse rounded-xl" />
          ) : (
            <select
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">Select a Venue</option>
              {venues
                .filter((v) => v.sport === sport)
                .map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.area})
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Date *</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Start Time *</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Level & Required players count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Skill Level *</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Required Players *</label>
            <input
              required
              type="number"
              min="2"
              max="50"
              value={requiredPlayers}
              onChange={(e) => setRequiredPlayers(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Short description */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Match Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Introduce the match, target level, equipment arrangements, etc."
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50"
        >
          {saving ? "Creating Match..." : "Create Match"}
        </button>
      </form>
    </main>
  );
}
