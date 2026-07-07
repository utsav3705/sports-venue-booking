"use client";

import { useState, useEffect } from "react";
import {
  Star, MapPin, Clock, Wifi, ArrowLeft, Pencil, Trash2, AlertCircle,
} from "lucide-react";
import { SPORTS, getSportColor } from "@/lib/data";
import { useApp } from "@/lib/store";
import BookingModal from "@/components/modals/BookingModal";
import venueApi from "@/services/venueApi";

/**
 * VENUE DETAILS PAGE
 *
 * Props:
 * - venueId (string): MongoDB _id of the venue to display.
 * - onBack (function): Navigate back to Venues listing.
 * - onEdit (function): Navigate to Edit Venue page.
 */
export default function VenueDetailsPage({ venueId, onBack, onEdit }) {
  const { currentUser, showToast } = useApp();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookedVenue, setBookedVenue] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isOwnerOrAdmin =
    currentUser?.role === "admin" ||
    (currentUser?.role === "venue_owner" &&
      venue?.owner &&
      (venue.owner._id === currentUser?._id ||
        venue.owner === currentUser?._id));

  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    setError("");
    venueApi
      .getById(venueId)
      .then((data) => setVenue(data))
      .catch(() => setError("Failed to load venue details. Please try again."))
      .finally(() => setLoading(false));
  }, [venueId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await venueApi.remove(venue._id);
      showToast("Venue deleted successfully", "success");
      onBack();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete venue", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-secondary rounded-2xl" />
          <div className="h-6 bg-secondary rounded w-2/3" />
          <div className="h-4 bg-secondary rounded w-1/2" />
          <div className="h-4 bg-secondary rounded w-1/3" />
        </div>
      </main>
    );
  }

  if (error || !venue) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Venues
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-500 font-semibold">{error || "Venue not found."}</p>
        </div>
      </main>
    );
  }

  const sport = SPORTS.find((s) => s.id === venue.sport);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + Actions Row */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Venues
        </button>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(venue._id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6">
        <img
          src={venue.image || "/venues/cricket-turf.png"}
          alt={venue.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${getSportColor(venue.sport)}`}>
          {sport?.icon} {sport?.label}
        </span>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <h1 className="text-2xl font-bold text-white drop-shadow">{venue.name}</h1>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-right">
            <span className="text-lg font-bold text-foreground">₹{venue.pricePerHour.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Rating + Location + Hours */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{venue.rating || "0.0"}</span>
              <span className="text-sm text-muted-foreground">({venue.reviewCount || 0} reviews)</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{venue.address}, {venue.area}, Ahmedabad</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Open: {venue.openTime} – {venue.closeTime}</span>
            </div>
          </div>

          {/* Amenities */}
          {venue.amenities?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Slots */}
          {venue.availableSlots?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Available Slots Today
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.availableSlots.map((slot) => (
                  <span
                    key={slot}
                    className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Book CTA */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Price</p>
            <p className="text-3xl font-bold text-foreground mb-1">
              ₹{venue.pricePerHour.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              {venue.availableSlots?.length || 0} slots available today
            </p>
            <button
              onClick={() => setBookedVenue(venue)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Book Now
            </button>

            {venue.owner?.name && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Listed by <span className="font-semibold text-foreground">{venue.owner.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {bookedVenue && (
        <BookingModal venue={bookedVenue} onClose={() => setBookedVenue(null)} />
      )}
    </main>
  );
}
