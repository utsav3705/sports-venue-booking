"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import VenueCard from "@/components/cards/VenueCard";
import BookingModal from "@/components/modals/BookingModal";
import { VENUES, SPORTS, AREAS } from "@/lib/data";

export default function VenuesPage({
  initialSport = "all",
  initialArea = "all",
}) {
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [sortBy, setSortBy] = useState("rating");
  const [bookedVenue, setBookedVenue] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = VENUES.filter((v) =>
    selectedSport === "all" ? true : v.sport === selectedSport,
  )
    .filter((v) => (selectedArea === "all" ? true : v.area === selectedArea))
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.pricePerHour - b.pricePerHour;
      return b.pricePerHour - a.pricePerHour;
    });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sports Venues</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} venues found in Ahmedabad
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
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

        {/* Active filters */}
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

      {/* Grid */}
      {filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onBook={setBookedVenue} />
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
