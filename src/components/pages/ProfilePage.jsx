"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Swords,
  MapPin,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pencil,
  Info,
} from "lucide-react";
import PrivateRoute from "@/components/pages/PrivateRoute";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { teamApi, matchApi } from "@/services/playerEcosystemApi";

export default function ProfilePage() {
  const { bookings, cancelBooking, currentUser, updateProfile, logout, showToast } = useApp();

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "teams" | "matches" | "connections"
  const [isEditing, setIsEditing] = useState(false);

  // Editable Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("football");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [favoriteSports, setFavoriteSports] = useState([]);

  // Ecosystem lists
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setSport(currentUser.sport || "football");
      setBio(currentUser.bio || "Excited to play!");
      setProfileImage(currentUser.profileImage || "");
      setFavoriteSports(currentUser.favoriteSports || [currentUser.sport || "football"]);

      // Load teams and matches from backend
      setLoading(true);
      Promise.all([
        teamApi.getAll(),
        matchApi.getAll()
      ]).then(([teams, matches]) => {
        const myTeams = teams.filter(
          (t) =>
            t.captain?._id === currentUser?._id ||
            t.members.some((m) => m._id === currentUser?._id)
        );
        setJoinedTeams(myTeams);

        const myMatches = matches.filter(
          (m) =>
            m.owner?._id === currentUser?._id ||
            m.joinedPlayers.some((p) => p._id === currentUser?._id)
        );
        setUpcomingMatches(myMatches);
      }).catch((e) => console.log("Error loading profile lists:", e))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        phone,
        sport,
        bio,
        profileImage,
        favoriteSports,
      });
      setIsEditing(false);
    } catch (err) {
      // toast shown automatically by store
    }
  };

  const handleToggleFavSport = (sportId) => {
    setFavoriteSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((s) => s !== sportId)
        : [...prev, sportId]
    );
  };

  if (!currentUser) {
    return (
      <PrivateRoute>
        <div />
      </PrivateRoute>
    );
  }

  // Filter player bookings
  const myBookings = bookings.filter((b) => b.username === (currentUser.username || currentUser.email));

  const getInitials = (n) => {
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Info Header */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-2xl border border-primary/20 shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(currentUser.name)
            )}
          </div>
          <div className="text-center md:text-left min-w-0">
            <h1 className="text-2xl font-extrabold text-foreground leading-tight">{currentUser.name}</h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5" /> Ahmedabad · Favorite Sports:{" "}
              {currentUser.favoriteSports?.map((s) => (
                <span key={s} className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{s}</span>
              ))}
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-lg italic">
              "{currentUser.bio || "No biography written yet."}"
            </p>
            <p className="text-[10px] text-muted-foreground mt-2">
              Contact: {currentUser.email} · {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors"
          >
            {isEditing ? "View Profile" : "Edit Profile"}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* EDIT PROFILE VIEW */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground mb-4">Edit Profile details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Phone Number *</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Profile Image URL (optional)</label>
            <input
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Favorite sports checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Favorite Sports</label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => {
                const active = favoriteSports.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleFavSport(s.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border font-bold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/45"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all shadow-sm"
          >
            Save Profile changes
          </button>
        </form>
      ) : (
        /* TABS VIEW */
        <>
          {/* Tabs Selector */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 border-b border-border pb-px">
            {[
              { id: "bookings", label: `Bookings (${myBookings.length})`, icon: Calendar },
              { id: "teams", label: `Teams Joined (${joinedTeams.length})`, icon: Users },
              { id: "matches", label: `Matches Played (${upcomingMatches.length})`, icon: Swords },
              { id: "connections", label: `Connections (${currentUser.connections?.length || 0})`, icon: Users },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors whitespace-nowrap ${
                    activeTab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Bookings */}
          {activeTab === "bookings" && (
            <div className="space-y-3">
              {myBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 bg-card border border-dashed border-border rounded-2xl">
                  No upcoming bookings.
                </p>
              ) : (
                myBookings.map((b) => (
                  <div key={b._id || b.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
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
                ))
              )}
            </div>
          )}

          {/* Teams joined */}
          {activeTab === "teams" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joinedTeams.length === 0 ? (
                <p className="col-span-full text-xs text-muted-foreground text-center py-10 bg-card border border-dashed border-border rounded-2xl">
                  No joined teams found.
                </p>
              ) : (
                joinedTeams.map((t) => (
                  <div key={t._id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.logo || t.teamName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-foreground text-xs truncate">{t.teamName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{t.sport} · {t.members.length} members</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Matches joined */}
          {activeTab === "matches" && (
            <div className="space-y-3">
              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 bg-card border border-dashed border-border rounded-2xl">
                  No matches joined.
                </p>
              ) : (
                upcomingMatches.map((m) => (
                  <div key={m._id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                    <div>
                      <h3 className="font-bold text-foreground text-xs capitalize">{m.sport} Match</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap font-semibold">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.venue?.name || "Local Turf"}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {m.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {m.time}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Connected players */}
          {activeTab === "connections" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!currentUser.connections || currentUser.connections.length === 0 ? (
                <p className="col-span-full text-xs text-muted-foreground text-center py-10 bg-card border border-dashed border-border rounded-2xl">
                  No connected players yet.
                </p>
              ) : (
                currentUser.connections.map((conn) => (
                  <div key={conn._id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {conn.profileImage ? <img src={conn.profileImage} className="w-full h-full object-cover rounded-full" /> : conn.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-xs truncate">{conn.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{conn.sport}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
