"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  UserPlus,
  Swords,
  MessageCircle,
  MapPin,
  Clock,
  Handshake,
  IndianRupee,
} from "lucide-react";
import ChatModal from "@/components/modals/ChatModal";
import { SPORTS, getSportColor } from "@/lib/data";
import { useApp } from "@/lib/store";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
    >
      {status === "pending" ? "Pending…" : label}
    </span>
  );
}

export default function ProfilePage() {
  const { bookings, connects, joins, matches, threads, currentUser, login, signup, logout } = useApp();
  const [tab, setTab] = useState("bookings");
  const [chatPeer, setChatPeer] = useState(null);
  
  // Auth Form states
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("football");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await signup({ username, password, name, email, phone, sport });
        setAuthSuccess("Account created successfully! Please log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Please try again.");
    }
  };

  const getInitials = (n) => {
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // --- RENDER LOGIN / SIGNUP VIEW IF GUEST ---
  if (!currentUser) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-extrabold text-foreground">
              {isLogin ? "Welcome back to PlayMates" : "Join PlayMates Ahmedabad"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isLogin
                ? "Enter your credentials to access your profile"
                : "Create an account to book courts and connect with players"}
            </p>
          </div>

          {/* Feedback alerts */}
          {authError && (
            <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-green-50 text-green-600 border border-green-200">
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dev_patel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>

            {/* Extra signup fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dev Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dev@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                    Preferred Sport *
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-all font-semibold cursor-pointer"
                  >
                    {SPORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm shadow-primary/10 mt-2"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle login/signup mode */}
          <div className="text-center mt-6 pt-4 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    {
      id: "bookings",
      label: "Bookings",
      icon: Calendar,
      count: bookings.length,
    },
    {
      id: "connects",
      label: "Connections",
      icon: UserPlus,
      count: connects.length,
    },
    { id: "teams", label: "Team Requests", icon: Users, count: joins.length },
    { id: "matches", label: "Matches", icon: Swords, count: matches.length },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      count: threads.length,
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card border border-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl border border-primary/20 shrink-0">
            {getInitials(currentUser.name)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">{currentUser.name}</h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/80" /> Ahmedabad · {SPORTS.find((s) => s.id === currentUser.sport)?.icon} {SPORTS.find((s) => s.id === currentUser.sport)?.label} enthusiast
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {currentUser.email} · {currentUser.phone}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Bookings", value: bookings.length },
          { label: "Connections", value: connects.length },
          { label: "Team Requests", value: joins.length },
          { label: "Match Requests", value: matches.length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-6 border-b border-border pb-px">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className="text-[10px] font-semibold bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings */}
      {tab === "bookings" && (
        <Section
          empty={bookings.length === 0}
          emptyText="No bookings yet. Book a venue to see it here."
        >
          {bookings.map((b) => {
            const sport = SPORTS.find((s) => s.id === b.sport);
            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {sport?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {b.venueName}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {b.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {b.slots.join(", ")}
                    </span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary text-sm">
                    ₹{b.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {b.slots.length}h
                  </p>
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Connections */}
      {tab === "connects" && (
        <Section
          empty={connects.length === 0}
          emptyText="No connection requests yet. Find players and send requests."
        >
          {connects.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                {c.playerAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {c.playerName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getSportColor(c.sport)}`}
                  >
                    {c.sport}
                  </span>{" "}
                  · {c.area}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </Section>
      )}

      {/* Team Requests */}
      {tab === "teams" && (
        <Section
          empty={joins.length === 0}
          emptyText="No team join requests yet. Request to join a team from the Teams page."
        >
          {joins.map((j) => (
            <div
              key={j.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                {j.teamAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {j.teamName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Join request ·{" "}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getSportColor(j.sport)}`}
                  >
                    {j.sport}
                  </span>
                </p>
              </div>
              <StatusBadge status={j.status} />
            </div>
          ))}
        </Section>
      )}

      {/* Matches */}
      {tab === "matches" && (
        <Section
          empty={matches.length === 0}
          emptyText="No match requests yet. Challenge a team from the Teams page."
        >
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                  {m.toAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {m.fromTeam}{" "}
                    <span className="text-muted-foreground font-normal">
                      vs
                    </span>{" "}
                    {m.toTeam}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    {m.matchType === "competitive" ? (
                      <>
                        <IndianRupee className="w-3 h-3" />
                        Loss &amp; Pay · ₹{m.stake.toLocaleString()} stake
                      </>
                    ) : (
                      <>
                        <Handshake className="w-3 h-3" />
                        Friendly match
                      </>
                    )}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Messages */}
      {tab === "messages" && (
        <Section
          empty={threads.length === 0}
          emptyText="No conversations yet. Message pickleball or padel players to start chatting."
        >
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <button
                key={t.id}
                onClick={() =>
                  setChatPeer({
                    name: t.playerName,
                    avatar: t.playerAvatar,
                    sport: t.sport,
                  })
                }
                className="w-full text-left bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                  {t.playerAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {t.playerName}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {last?.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {last?.from === "me" ? "You: " : ""}
                    {last?.text}
                  </p>
                </div>
              </button>
            );
          })}
        </Section>
      )}

      {chatPeer && (
        <ChatModal peer={chatPeer} onClose={() => setChatPeer(null)} />
      )}
    </main>
  );
}

function Section({ empty, emptyText, children }) {
  if (empty) {
    return (
      <div className="text-center py-16 bg-card border border-dashed border-border rounded-2xl">
        <p className="text-sm text-muted-foreground max-w-sm mx-auto px-4">
          {emptyText}
        </p>
      </div>
    );
  }
  return <div className="space-y-3">{children}</div>;
}
