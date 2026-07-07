"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Users,
  Swords,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserPlus,
  ArrowRight,
  Info,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { notificationApi, playerApi, teamApi, matchApi } from "@/services/playerEcosystemApi";
import venueApi from "@/services/venueApi";
import api from "@/services/authApi";

/**
 * PLAYER DASHBOARD COMPONENT
 *
 * Renders the player console overview containing:
 * - Upcoming Bookings list with cancellation triggers
 * - Registered Matches (either hosted or joined) with leave triggers
 * - Roster of joined/led teams
 * - Live Connection requests list (Accept / Decline action triggers)
 * - Recent notifications logs list
 */
export default function PlayerDashboardPage({ onNavigate }) {
  const { currentUser, bookings, cancelBooking, showToast } = useApp();
  
  const [incomingConnections, setIncomingConnections] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch notifications
      const notifs = await notificationApi.getAll();
      setNotifications(notifs);

      // 2. Connection Requests (notifications with type "Connection Request")
      const incomingConn = notifs.filter((n) => n.type === "Connection Request" && !n.read);
      setIncomingConnections(incomingConn);

      // 3. Teams joined/owned
      const allTeams = await teamApi.getAll();
      const myTeams = allTeams.filter(
        (t) =>
          t.captain?._id === currentUser?._id ||
          t.members.some((m) => m._id === currentUser?._id)
      );
      setJoinedTeams(myTeams);

      // 4. Matches joined/owned
      const allMatches = await matchApi.getAll();
      const myMatches = allMatches.filter(
        (m) =>
          m.owner?._id === currentUser?._id ||
          m.joinedPlayers.some((p) => p._id === currentUser?._id)
      );
      setUpcomingMatches(myMatches);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
      // Setup Polling every 10 seconds for notifications
      const timer = setInterval(() => {
        notificationApi.getAll()
          .then((notifs) => {
            setNotifications(notifs);
            setIncomingConnections(notifs.filter((n) => n.type === "Connection Request" && !n.read));
          })
          .catch((e) => console.log("Polling error:", e));
      }, 10000);

      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const handleResolveConnection = async (notificationId, senderId, action) => {
    try {
      await playerApi.resolveConnect(senderId, action);
      showToast(`Connection request ${action}ed successfully`, "success");
      // Update local profile session state if connections lists changed
      api.get("/auth/profile").then((res) => {
        localStorage.setItem("playmates_user", JSON.stringify(res.data));
      });
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const handleLeaveMatch = async (matchId) => {
    try {
      await matchApi.leave(matchId);
      showToast("Left the match successfully", "success");
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const handleCancelMatch = async (matchId) => {
    if (!window.confirm("Are you sure you want to cancel this match?")) return;
    try {
      await matchApi.cancel(matchId);
      showToast("Match cancelled successfully", "success");
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-secondary rounded-2xl" />
            <div className="h-48 bg-secondary rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // Filter local bookings for player
  const myBookings = bookings.filter((b) => b.username === (currentUser.username || currentUser.email));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Hero banner */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
          Coordinate upcoming bookings, challenge public match lobbies, manage your teams, and respond to incoming connection requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming Bookings & Matches */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming bookings */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Bookings
              </h2>
              <button
                onClick={() => onNavigate("venues")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Book Turf
              </button>
            </div>
            
            {myBookings.length === 0 ? (
              <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground">No upcoming bookings scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div key={b._id || b.id} className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{b.venueName}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.area}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.slots.join(", ")}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => cancelBooking(b._id || b.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Matches */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary" /> Registered Matches
              </h2>
              <button
                onClick={() => onNavigate("matches")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Browse Matches
              </button>
            </div>

            {upcomingMatches.length === 0 ? (
              <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground">No active public matches joined.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((m) => {
                  const isHost = m.owner?._id === currentUser?._id;
                  return (
                    <div key={m._id} className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground text-sm capitalize">
                          {m.sport} Match {isHost && <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full ml-1.5 uppercase">Host</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.venue?.name || "Local Turf"}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                        </p>
                      </div>
                      <div>
                        {isHost ? (
                          <button
                            onClick={() => handleCancelMatch(m._id)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors shrink-0"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLeaveMatch(m._id)}
                            className="px-3 py-1.5 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-secondary transition-colors shrink-0"
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Connection requests, Joined Teams */}
        <div className="space-y-6">
          
          {/* Connection requests */}
          {incomingConnections.length > 0 && (
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Connection Requests
              </h2>
              <div className="space-y-3">
                {incomingConnections.map((conn) => (
                  <div key={conn._id} className="bg-secondary/40 border border-border rounded-2xl p-4">
                    <p className="text-xs text-foreground font-semibold leading-relaxed mb-3">
                      {conn.message}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveConnection(conn._id, conn.relatedId, "accept")}
                        className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResolveConnection(conn._id, conn.relatedId, "reject")}
                        className="flex-1 py-1.5 bg-secondary text-foreground border border-border rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams roster list */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> My Teams
              </h2>
              <button
                onClick={() => onNavigate("teams")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Find Teams
              </button>
            </div>

            {joinedTeams.length === 0 ? (
              <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground">You haven't joined any teams.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {joinedTeams.map((t) => {
                  const isCaptain = t.captain?._id === currentUser?._id;
                  return (
                    <button
                      key={t._id}
                      onClick={() => onNavigate(`team-detail:${t._id}`)}
                      className="w-full text-left bg-secondary/40 border border-border hover:border-primary/20 rounded-2xl p-3 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm border border-primary/20">
                        {t.logo || t.teamName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-xs truncate group-hover:text-primary transition-colors">{t.teamName}</h4>
                          {isCaptain && <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase">Capt</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{t.sport} · {t.members.length} members</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
