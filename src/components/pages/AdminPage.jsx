import { useState } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  User,
  Trash2,
  Trophy,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { SPORTS, getSportColor } from "@/lib/data";

/**
 * SYSTEM ADMINISTRATOR DASHBOARD PAGE
 * 
 * Accessible only by logging in as the 'admin' account. Displays platform KPIs,
 * lists all bookings placed by all users with a "Cancel Booking" action, and provides
 * directories of all registered players and teams.
 */
export default function AdminPage() {
  const { bookings, createdPlayers, createdTeams, cancelBooking } = useApp();
  const [activeView, setActiveView] = useState("bookings"); // "bookings" | "players" | "teams"

  // KPI Calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const totalBookingsCount = bookings.length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Admin Console</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor reservations, revenue metrics, and user registers.
        </p>
      </div>

      {/* 2. KPI Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Bookings KPI */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Bookings
            </span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalBookingsCount}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Active reservations</p>
        </div>

        {/* Total Revenue KPI */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Earnings accrued</p>
        </div>

        {/* Total Players KPI */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Players Registered
            </span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{createdPlayers.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Matchmaking profiles</p>
        </div>

        {/* Total Teams KPI */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Teams Registered
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{createdTeams.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Clubs registered</p>
        </div>
      </div>

      {/* 3. Section View Selector Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-px">
        {[
          { id: "bookings", label: `Bookings (${bookings.length})` },
          { id: "players", label: `Players Directory (${createdPlayers.length})` },
          { id: "teams", label: `Teams Directory (${createdTeams.length})` },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              activeView === v.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 4. Section Render Switch */}

      {/* --- BOOKINGS MANAGEMENT TABLE --- */}
      {activeView === "bookings" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs text-muted-foreground">No active bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Venue</th>
                    <th className="px-5 py-3">Sport</th>
                    <th className="px-5 py-3">Customer Details</th>
                    <th className="px-5 py-3">Date / Slots</th>
                    <th className="px-5 py-3">Paid</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {bookings.map((b) => {
                    const sport = SPORTS.find((s) => s.id === b.sport);
                    return (
                      <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                        {/* Venue details */}
                        <td className="px-5 py-4 font-semibold text-foreground">
                          {b.venueName}
                        </td>
                        
                        {/* Sport badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getSportColor(b.sport)}`}
                          >
                            {sport?.icon} {sport?.label}
                          </span>
                        </td>

                        {/* Customer details */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">{b.userName || "Guest"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {b.userPhone || "No contact"}
                          </p>
                          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
                            username: {b.username || "offline"}
                          </p>
                        </td>

                        {/* Date and slots */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{b.date}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {b.slots.join(", ")}
                          </p>
                        </td>

                        {/* Paid Amount */}
                        <td className="px-5 py-4 font-bold text-primary">
                          ₹{b.amount.toLocaleString()}
                        </td>

                        {/* Actions: Cancel Booking */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel the booking for ${b.userName || 'Guest'}?`)) {
                                cancelBooking(b.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- PLAYERS DIRECTORY --- */}
      {activeView === "players" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {createdPlayers.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-card border border-border border-dashed rounded-3xl">
              <p className="text-xs text-muted-foreground">No registered players yet.</p>
            </div>
          ) : (
            createdPlayers.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm border border-primary/20 shrink-0">
                  {p.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {p.area} · {p.position} · {p.level}
                  </p>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1.5 ${getSportColor(p.sport)}`}
                  >
                    {p.sport}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TEAMS DIRECTORY --- */}
      {activeView === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {createdTeams.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-card border border-border border-dashed rounded-3xl">
              <p className="text-xs text-muted-foreground">No registered teams yet.</p>
            </div>
          ) : (
            createdTeams.map((t) => (
              <div
                key={t.id}
                className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm border border-primary/20 shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {t.area} · Captain: {t.captain}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Trophy className="w-3 h-3 text-amber-500" /> {t.wins}W - {t.losses}L</span>
                    <span>·</span>
                    <span>{t.members}/{t.maxMembers} members</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
