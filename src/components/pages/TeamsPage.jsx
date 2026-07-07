"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Shield, Search, Shuffle } from "lucide-react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { teamApi } from "@/services/playerEcosystemApi";

export default function TeamsPage({ onNavigate }) {
  const { currentUser, showToast } = useApp();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const fetchTeams = async () => {
    try {
      const data = await teamApi.getAll();
      setTeams(data);
    } catch (e) {
      console.error("Fetch Teams Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleJoinRequest = async (teamId, teamName) => {
    if (!currentUser) {
      showToast("Please log in to send join requests", "error");
      return;
    }
    setJoiningId(teamId);
    try {
      await teamApi.requestJoin(teamId);
      showToast(`Join request sent to ${teamName}!`, "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send join request", "error");
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = teams
    .filter((t) => (selectedSport === "all" ? true : t.sport === selectedSport))
    .filter((t) =>
      searchQuery
        ? t.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.captain?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} teams — join a club or create your own
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-team")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-card border border-border rounded-2xl p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedSport("all")}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
              selectedSport === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            All Sports
          </button>
          {SPORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSport(s.id)}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedSport === s.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-secondary/30 border border-border rounded-2xl h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-3xl">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-foreground font-medium">No teams found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try a different sport or be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team) => {
            const sport = SPORTS.find((s) => s.id === team.sport);
            const isMember = team.members?.some((m) => m._id === currentUser?._id);
            const isCaptain = team.captain?._id === currentUser?._id;
            const isFull = team.members?.length >= team.maxMembers;

            return (
              <div
                key={team._id}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col hover:shadow-md transition-all"
              >
                {/* Team header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                    {team.logo || team.teamName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm truncate">
                        {team.teamName}
                      </h3>
                      {isCaptain && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase">
                          Captain
                        </span>
                      )}
                      {isMember && !isCaptain && (
                        <span className="text-[9px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full uppercase">
                          Member
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {team.captain?.name || "Unknown"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                    {sport?.icon} {sport?.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {team.description || `A dedicated ${team.sport} team from Ahmedabad.`}
                </p>

                {/* Roster count */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold">
                    {team.members?.length}/{team.maxMembers} Members
                  </span>
                  {isFull && (
                    <span className="ml-auto text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      Full
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => onNavigate(`team-detail:${team._id}`)}
                    className="flex-1 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                  >
                    View Details
                  </button>
                  {!isMember && !isCaptain && (
                    <button
                      onClick={() => handleJoinRequest(team._id, team.teamName)}
                      disabled={joiningId === team._id || isFull}
                      className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joiningId === team._id ? "Sending…" : isFull ? "Team Full" : "Request Join"}
                    </button>
                  )}
                  {isCaptain && (
                    <button
                      onClick={() => onNavigate(`edit-team:${team._id}`)}
                      className="flex-1 py-2 rounded-xl border border-primary/30 text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                    >
                      Edit
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
