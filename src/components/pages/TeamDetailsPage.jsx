"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Shield, Trash2, UserCheck, UserX } from "lucide-react";
import { teamApi, notificationApi } from "@/services/playerEcosystemApi";
import { useApp } from "@/lib/store";

export default function TeamDetailsPage({ teamId, onBack, onEdit }) {
  const { currentUser, showToast } = useApp();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinRequests, setJoinRequests] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchTeam = async () => {
    try {
      const data = await teamApi.getById(teamId);
      setTeam(data);
    } catch (e) {
      console.error("Fetch team error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async (captainId) => {
    if (!currentUser || currentUser._id !== captainId) return;
    try {
      const notifs = await notificationApi.getAll();
      const reqs = notifs.filter(
        (n) => n.type === "Team Join Request" && n.relatedId === teamId && !n.read
      );
      setJoinRequests(reqs);
    } catch (e) {
      console.error("Fetch join requests error:", e);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  useEffect(() => {
    if (team?.captain?._id) {
      fetchJoinRequests(team.captain._id);
    }
  }, [team]);

  const handleResolve = async (notif, action) => {
    // relatedId holds the team ID; sender is embedded in the notification message
    // We need to find the requesting user by name match from members or by fetching players
    // The backend resolveJoinRequest receives { playerId, action }
    // For now extract playerId from notification message via regex matching
    setResolvingId(notif._id);
    try {
      // We use the requestor's id from relatedId on the notification (it's stored as teamId)
      // So we need another approach: mark notification read, then pass the action
      // The notification message is: "{name} requested to join your team {teamName}"
      // We need player ID - stored in a separate field, but current schema stores teamId in relatedId
      // Let's use a workaround: find the player by name from the team members list after we look it up from players API

      // Better approach: mark notification read to remove it from list, then call resolve with action
      // For accept: we need to somehow get the player id - let's store it in a metadata approach
      // The controller checks message for playerId match - that's buggy. Let's use a different API approach:
      // We pass the notification message to identify the player
      
      // Simplest working approach: extract player name from notification, match to playersList
      const senderName = notif.message.split(" requested")[0].trim();
      
      // Mark the notification as read first
      await notificationApi.markRead(notif._id);
      
      // Try to resolve using team route with name-based lookup (fallback approach)
      // We need to notify the backend. Since our backend needs playerId, let's get players
      // and match by name. This is suboptimal but works without schema changes.
      const { default: api } = await import("@/services/authApi");
      const playersRes = await api.get("/players");
      const matchingPlayer = playersRes.data.find((p) =>
        p.name.trim().toLowerCase() === senderName.toLowerCase()
      );

      if (!matchingPlayer) {
        showToast(`Could not identify player "${senderName}" to ${action} request`, "error");
        setResolvingId(null);
        return;
      }

      await teamApi.resolveRequest(teamId, { playerId: matchingPlayer._id, action });
      showToast(
        action === "accept"
          ? `${senderName} added to the team roster!`
          : `${senderName}'s request declined.`,
        action === "accept" ? "success" : "success"
      );

      // Refresh both
      setJoinRequests((prev) => prev.filter((r) => r._id !== notif._id));
      await fetchTeam();
    } catch (err) {
      showToast(err.response?.data?.error || `Failed to ${action} request`, "error");
    } finally {
      setResolvingId(null);
    }
  };

  const handleRemoveMember = async (playerId, playerName) => {
    if (!window.confirm(`Remove ${playerName} from the team?`)) return;
    try {
      await teamApi.removeMember(teamId, playerId);
      showToast(`${playerName} removed from roster`, "success");
      fetchTeam();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await teamApi.leave(teamId);
      showToast("You left the team", "success");
      onBack();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm("Permanently delete this team? This cannot be undone.")) return;
    try {
      await teamApi.remove(teamId);
      showToast("Team deleted successfully", "success");
      onBack();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete team", "error");
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-secondary rounded-2xl" />
          <div className="h-6 bg-secondary rounded w-1/3" />
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </button>
        <p className="text-foreground text-sm font-semibold">Team not found.</p>
      </main>
    );
  }

  const isCaptain = team.captain?._id === currentUser?._id;
  const isMember = team.members.some((m) => m._id === currentUser?._id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </button>
        <div className="flex items-center gap-2">
          {isCaptain && (
            <>
              <button
                onClick={() => onEdit(team._id)}
                className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Edit Team
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-3.5 py-2 rounded-xl border border-red-500/20 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </>
          )}
          {isMember && !isCaptain && (
            <button
              onClick={handleLeaveTeam}
              className="px-3.5 py-2 rounded-xl border border-red-500/20 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              Leave Team
            </button>
          )}
        </div>
      </div>

      {/* Team Hero Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 mb-8 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-3xl border border-primary/20">
          {team.logo || team.teamName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-foreground leading-tight">
              {team.teamName}
            </h1>
            <span className="self-center text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {team.sport}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1">
            <Shield className="w-3.5 h-3.5" /> Led by {team.captain?.name}
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-xl leading-relaxed">
            {team.description ||
              "A dedicated local sports club competing in regular friendly matches and tournaments."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Roster ({team.members.length}/
              {team.maxMembers})
            </h2>
            <div className="divide-y divide-border">
              {team.members.map((m) => {
                const isTheCaptain = m._id === team.captain?._id;
                return (
                  <div key={m._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {m.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">{m.name}</p>
                          {isTheCaptain && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase">
                              Captain
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.email}</p>
                      </div>
                    </div>
                    {isCaptain && !isTheCaptain && (
                      <button
                        onClick={() => handleRemoveMember(m._id, m.name)}
                        className="p-1.5 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              {team.members.length === 0 && (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No members yet. Send a join request!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Join Requests — captain only */}
        <div className="space-y-6">
          {isCaptain && (
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                Join Requests{" "}
                {joinRequests.length > 0 && (
                  <span className="ml-1.5 text-[9px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                    {joinRequests.length}
                  </span>
                )}
              </h2>
              {joinRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No pending join requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {joinRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-secondary/40 border border-border rounded-2xl p-4"
                    >
                      <p className="text-xs text-foreground font-semibold leading-relaxed mb-3">
                        {req.message}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(req, "accept")}
                          disabled={resolvingId === req._id}
                          className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleResolve(req, "reject")}
                          disabled={resolvingId === req._id}
                          className="flex-1 py-1.5 bg-secondary text-foreground border border-border rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              Team Stats
            </h2>
            <div className="space-y-3">
              {[
                { label: "Sport", value: team.sport },
                { label: "Members", value: `${team.members.length} / ${team.maxMembers}` },
                {
                  label: "Roster Open",
                  value: team.members.length < team.maxMembers ? "Yes" : "Full",
                },
              ].map((s) => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">{s.label}</span>
                  <span className="text-foreground font-bold capitalize">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
