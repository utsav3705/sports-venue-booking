"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Plus, Info } from "lucide-react";
import VenueCard from "@/components/cards/VenueCard";
import BookingModal from "@/components/modals/BookingModal";
import { SPORTS, AREAS } from "@/lib/data";
import { useApp } from "@/lib/store";
import venueApi from "@/services/venueApi";

/**
 * TURF VENUES DIRECTORY PAGE
 *
 * Modified to load dynamic venues from the Node/Express backend API.
 * Displays an "Add Venue" shortcut button to users with the "venue_owner" or "admin" role.
 * Clicking a card redirects to the details page.
 */
export default function VenuesPage({
  initialSport = "all",
  initialArea = "all",
  onNavigate,
}) {
  const { currentUser } = useApp();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [sortBy, setSortBy] = useState("rating");
  const [bookedVenue, setBookedVenue] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load venues on mount and when filters query backend
  useEffect(() => {
    setLoading(true);
    venueApi
      .getAll({ sport: selectedSport, area: selectedArea })
      .then((data) => {
        setVenues(data);
      })
      .catch((err) => {
        console.error("Fetch Venues Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedSport, selectedArea]);

  // Client-side sorting
  const filtered = [...venues].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
    return b.pricePerHour - a.pricePerHour;
  });

  const isPartner = currentUser?.role === "venue_owner" || currentUser?.role === "admin";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sports Venues</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} venues found in Ahmedabad
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPartner && onNavigate && (
            <button
              onClick={() => onNavigate("add-venue")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Venue
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters section */}
      <div
        className={`${showFilters ? "block" : "hidden"} bg-card border border-border rounded-2xl p-5 mb-6`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sport Filter */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Sport
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSport("all")}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedSport === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                All
              </button>
              {SPORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSport(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    selectedSport === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active filters summary */}
        {(selectedSport !== "all" || selectedArea !== "all") && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Active filters:
            </span>
            {selectedSport !== "all" && (
              <button
                onClick={() => setSelectedSport("all")}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {SPORTS.find((s) => s.id === selectedSport)?.label}
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedArea !== "all" && (
              <button
                onClick={() => setSelectedArea("all")}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {selectedArea}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sport Tabs (quick filter) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        <button
          onClick={() => setSelectedSport("all")}
          className={`shrink-0 text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
            selectedSport === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          All Sports
        </button>
        {SPORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSport(s.id)}
            className={`shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
              selectedSport === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Loading view */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-secondary/30 border border-border rounded-2xl h-80" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="text-foreground font-medium">No venues found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Try changing your filters
          </p>
          <button
            onClick={() => {
              setSelectedSport("all");
              setSelectedArea("all");
            }}
            className="mt-4 text-sm text-primary underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-semibold">
          {filtered.map((venue) => (
            <div key={venue._id || venue.id} className="relative group">
              <VenueCard venue={venue} onBook={setBookedVenue} />
              
              {/* Floating Info/Details shortcut overlay */}
              {onNavigate && (
                <button
                  onClick={() => onNavigate(`venue-detail:${venue._id || venue.id}`)}
                  className="absolute bottom-16 right-4 p-2.5 rounded-full bg-white/95 text-foreground hover:bg-primary hover:text-primary-foreground shadow-md transition-all z-10"
                  title="View details"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {bookedVenue && (
        <BookingModal
          venue={bookedVenue}
          onClose={() => setBookedVenue(null)}
        />
      )}
    </main>
  );
}
