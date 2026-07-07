"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { SPORTS, AREAS, TIME_SLOTS } from "@/lib/data";
import { useApp } from "@/lib/store";
import venueApi from "@/services/venueApi";

/**
 * EDIT VENUE PAGE
 *
 * Props:
 * - venueId (string): MongoDB _id of the venue to edit.
 * - onBack (function): Navigate back to Venues/Dashboard.
 * - onSuccess (function): Called after successful update.
 */
export default function EditVenuePage({ venueId, onBack, onSuccess }) {
  const { showToast } = useApp();

  // Form fields
  const [name, setName] = useState("");
  const [sport, setSport] = useState("cricket");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing details
  useEffect(() => {
    if (!venueId) return;
    setLoading(true);
    venueApi
      .getById(venueId)
      .then((data) => {
        setName(data.name || "");
        setSport(data.sport || "cricket");
        setArea(data.area || "");
        setAddress(data.address || "");
        setPricePerHour(data.pricePerHour || "");
        setOpenTime(data.openTime || "06:00");
        setCloseTime(data.closeTime || "22:00");
        setAmenities(data.amenities || []);
        setAvailableSlots(data.availableSlots || []);
        setImage(data.image || "");
      })
      .catch(() => setError("Failed to load venue details."))
      .finally(() => setLoading(false));
  }, [venueId]);

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
    }
    setAmenityInput("");
  };

  const removeAmenity = (a) => setAmenities((prev) => prev.filter((x) => x !== a));

  const toggleSlot = (slot) =>
    setAvailableSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!area) { setError("Please select an area."); return; }

    setSaving(true);
    try {
      const payload = {
        name,
        sport,
        area,
        address,
        pricePerHour: Number(pricePerHour),
        openTime,
        closeTime,
        amenities,
        availableSlots,
        image: image || `/venues/${sport}-turf.png`,
      };
      await venueApi.update(venueId, payload);
      showToast("Venue updated successfully!", "success");
      onSuccess(venueId);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update venue. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-secondary rounded w-1/3" />
          <div className="h-12 bg-secondary rounded" />
          <div className="h-12 bg-secondary rounded" />
          <div className="h-12 bg-secondary rounded" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Venue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Modify your listed venue details</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 text-xs font-semibold p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Venue Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Venue Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arena Cricket Hub"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Sport *</label>
          <div className="grid grid-cols-2 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSport(s.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  sport === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Area + Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Area *</label>
            <select
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              <option value="">Select area</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Price per Hour (₹) *</label>
            <input
              required
              type="number"
              min="1"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              placeholder="e.g. 800"
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Full Address *</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Near Shivranjani Cross Road, Satellite"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Open / Close time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Opens At *</label>
            <select
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Closes At *</label>
            <select
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            >
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="23:00">23:00</option>
              <option value="24:00">24:00</option>
            </select>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Amenities</label>
          <div className="flex gap-2 mb-2">
            <input
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
              placeholder="e.g. Floodlights, Parking..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span key={a} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {a}
                  <button type="button" onClick={() => removeAmenity(a)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Available Slots */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Available Time Slots <span className="text-muted-foreground font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  availableSlots.includes(slot)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Image URL (optional) */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Image URL <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder={`/venues/${sport}-turf.png`}
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
