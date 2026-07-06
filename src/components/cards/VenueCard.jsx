import { Star, MapPin, Clock, Wifi } from "lucide-react";
import { getSportColor, SPORTS } from "@/lib/data";

/**
 * SPORTS VENUE CARD COMPONENT
 * 
 * Renders individual details (image, rating, price, amenities) for a bookable sports turf.
 * 
 * Props:
 * - venue (object): The venue details including name, image, rating, reviews, area, address, hours, amenities, price, slots.
 * - onBook (function): Callback handler triggered when the "Book Now" button is clicked.
 */
export default function VenueCard({ venue, onBook }) {
  // Query sport metadata based on the venue's sport type
  const sport = SPORTS.find((s) => s.id === venue.sport);

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group">
      
      {/* 1. Header Media: Turf image, sport badge, and price rate overlay */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={venue.image}
          alt={venue.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-foreground/10" />
        
        {/* Absolute positioned Sport type badge tag */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${getSportColor(venue.sport)}`}
        >
          {sport?.icon} {sport?.label}
        </span>
        
        {/* Absolute positioned Price Tag overlay */}
        <div className="absolute bottom-3 right-3 bg-card/95 backdrop-blur-sm rounded-lg px-2.5 py-1">
          <span className="text-sm font-bold text-foreground">
            ₹{venue.pricePerHour.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">/hr</span>
        </div>
      </div>

      {/* 2. Content Info section: Title, Rating, Address, Hours, and Amenities */}
      <div className="p-4">
        
        {/* Title and Star Rating row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground text-base leading-tight">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-foreground">
              {venue.rating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({venue.reviewCount})
            </span>
          </div>
        </div>

        {/* Location area info */}
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {venue.area} · {venue.address.split(",")[0]}
          </span>
        </div>

        {/* Operating Hours info */}
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {venue.openTime} – {venue.closeTime}
          </span>
        </div>

        {/* Key Amenities Badge Pills (Displays up to 3 badges) */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {venue.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border"
            >
              {amenity}
            </span>
          ))}
          {/* Over-count indicator pill (e.g. +2) */}
          {venue.amenities.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              +{venue.amenities.length - 3}
            </span>
          )}
        </div>

        {/* 3. Availability slot count row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              {venue.availableSlots.length} slots available today
            </span>
          </div>
        </div>

        {/* 4. Book Booking trigger action */}
        <button
          onClick={() => onBook(venue)}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Book Now
        </button>
      </div>
    </article>
  );
}
