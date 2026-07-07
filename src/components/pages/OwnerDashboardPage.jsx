"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Building,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  Trash2,
  Pencil,
  Plus,
  Eye,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { SPORTS, getSportColor } from "@/lib/data";
import venueApi from "@/services/venueApi";
import api from "@/services/authApi";

/**
 * OWNER DASHBOARD PAGE
 *
 * Provides a management interface for users with role "venue_owner" or "admin".
 * Shows:
 * - KPI Metrics: Owned Venues count, Total Bookings, Accrued Revenue
 * - Tab: My Venues (CRUD, details, edit, delete)
 * - Tab: Venue Bookings (view customer bookings placed on owned venues)
 */
export default function OwnerDashboardPage({ onNavigate }) {
  const { currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("venues"); // "venues" | "bookings"
  
  const [myVenues, setMyVenues] = useState([]);
  const [venueBookings, setVenueBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all venues owned by current user, then fetch bookings for each
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all venues
      const allVenues = await venueApi.getAll();
      // Filter venues owned by this user (or show all if admin)
      const owned = allVenues.filter(
        (v) =>
          currentUser?.role === "admin" ||
          (v.owner && (v.owner._id === currentUser?._id || v.owner === currentUser?._id))
      );
      setMyVenues(owned);

      // 2. Fetch bookings for each owned venue in parallel
      const bookingsPromises = owned.map((v) =>
        api.get(`/bookings?venueId=${v._id}`).then((res) => res.data)
      );
      const bookingsResults = await Promise.all(bookingsPromises);
      // Flatten the array of bookings arrays
      const flattenedBookings = bookingsResults.flat();
      // Sort bookings by creation date desc
      flattenedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setVenueBookings(flattenedBookings);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      showToast("Error loading dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const handleDeleteVenue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await venueApi.remove(id);
      showToast("Venue deleted successfully", "success");
      // Reload dashboard data
      loadDashboardData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete venue", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // KPIs
  const totalBookings = venueBookings.length;
  const accruedRevenue = venueBookings.reduce((sum, b) => sum + b.amount, 0);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-28 bg-secondary rounded-2xl" />
            <div className="h-28 bg-secondary rounded-2xl" />
            <div className="h-28 bg-secondary rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Venue Partner Console</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your venues, view schedules, and track booking revenues.
          </p>
        </div>
        <button
          onClick={() => onNavigate("add-venue")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all shadow-sm shadow-primary/10"
        >
          <Plus className="w-4 h-4" /> Add New Venue
        </button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Venues Listed */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Venues Listed
            </span>
            <Building className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{myVenues.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Listed properties</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Bookings
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{totalBookings}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Accrued reservations</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Accrued Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">
            ₹{accruedRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Earnings received</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-px">
        {[
          { id: "venues", label: `My Venues (${myVenues.length})` },
          { id: "bookings", label: `Venue Bookings (${totalBookings})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content switch */}

      {/* MY VENUES TAB */}
      {activeTab === "venues" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myVenues.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card border border-border border-dashed rounded-3xl">
              <p className="text-xs text-muted-foreground mb-4">No venues listed yet.</p>
              <button
                onClick={() => onNavigate("add-venue")}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors"
              >
                Add Your First Venue
              </button>
            </div>
          ) : (
            myVenues.map((v) => {
              const sport = SPORTS.find((s) => s.id === v.sport);
              return (
                <div
                  key={v._id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={v.image || "/venues/cricket-turf.png"}
                      alt={v.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${getSportColor(v.sport)}`}>
                      {sport?.icon} {sport?.label}
                    </span>
                    <div className="absolute bottom-3 right-3 bg-card/95 backdrop-blur-sm rounded-lg px-2.5 py-1">
                      <span className="text-sm font-bold text-foreground">₹{v.pricePerHour}</span>
                      <span className="text-xs text-muted-foreground">/hr</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-1">{v.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" /> {v.area} · {v.address.split(",")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                        <Clock className="w-3 h-3" /> {v.openTime} – {v.closeTime}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <button
                        onClick={() => onNavigate(`venue-detail:${v._id}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => onNavigate(`edit-venue:${v._id}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVenue(v._id)}
                        disabled={deletingId === v._id}
                        className="p-2 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VENUE BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {venueBookings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs text-muted-foreground">No bookings found for your venues.</p>
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
                    <th className="px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {venueBookings.map((b) => {
                    const sport = SPORTS.find((s) => s.id === b.sport);
                    return (
                      <tr key={b._id || b.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-4 font-semibold text-foreground">{b.venueName}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getSportColor(b.sport)}`}>
                            {sport?.icon} {sport?.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">{b.userName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {b.userPhone}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{b.date}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {b.slots.join(", ")}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-bold text-primary">₹{b.amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
