"use client";

import { Search, MapPin, ChevronRight } from "lucide-react";
import { SPORTS, AREAS } from "@/lib/data";

export default function HeroSection({
  onExplore,
  selectedSport,
  onSportChange,
  selectedArea,
  onAreaChange,
}) {
  return (
    <section className="relative overflow-hidden bg-card border-b border-border">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6">
            <MapPin className="w-3 h-3" />
            Ahmedabad, Gujarat
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance mb-4">
            Book Your
            <span className="text-primary"> Sports Venue</span>
            <br />
            in Minutes
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-xl">
            Find and book cricket turfs, football grounds, pickleball courts,
            and padel arenas across Ahmedabad. Hourly booking, instant
            confirmation.
          </p>

          {/* Search Bar */}
          <div className="bg-background border border-border rounded-2xl p-3 flex flex-col sm:flex-row gap-3 mb-8 shadow-sm">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={selectedSport}
                onChange={(e) => onSportChange(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none cursor-pointer"
                aria-label="Select sport"
              >
                <option value="all">All Sports</option>
                {SPORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="flex-1 flex items-center gap-3 px-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={selectedArea}
                onChange={(e) => onAreaChange(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none cursor-pointer"
                aria-label="Select area"
              >
                <option value="all">All Areas</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => onExplore("venues")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              Search Venues
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sport Pills */}
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((sport) => (
              <button
                key={sport.id}
                onClick={() => {
                  onSportChange(sport.id);
                  onExplore("venues");
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${sport.color} hover:opacity-80`}
              >
                <span>{sport.icon}</span>
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap gap-8">
          {[
            { value: "10+", label: "Venues" },
            { value: "12", label: "Areas Covered" },
            { value: "500+", label: "Happy Players" },
            { value: "4", label: "Sports" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
