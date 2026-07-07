import { useState } from "react";
import { X, MapPin, Star, ChevronRight, CheckCircle } from "lucide-react";
import { TIME_SLOTS } from "@/lib/data";
import { useApp } from "@/lib/store";

// Static Array mapping dates: Generates next 7 days dynamically
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

/**
 * TURF BOOKING MODAL COMPONENT
 * 
 * Manages the multi-step booking process flow for a selected venue:
 * - "select": User selects booking date & hourly slots.
 * - "confirm": User fills name & phone, reviews receipt.
 * - "success": Displays booking confirmation details.
 * 
 * Props:
 * - venue (object): Details of the target turf/venue to book.
 * - onClose (function): Close modal handler callback.
 */
export default function BookingModal({ venue, onClose }) {
  const { addBooking } = useApp();

  const [selectedDate, setSelectedDate] = useState(0); 
  const [selectedSlots, setSelectedSlots] = useState([]); 
  const [step, setStep] = useState("select"); 
  const [name, setName] = useState(""); 
  const [phone, setPhone] = useState(""); 
  
  // Track slots that are already booked for this venue on the chosen date
  const [bookedSlots, setBookedSlots] = useState([]);

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  // Query existing bookings for this venue on selectedDate change
  useEffect(() => {
    if (!venue?._id) return;
    const formattedDate = formatDate(DATES[selectedDate]);
    
    // Import axios instance directly or via service
    import("@/services/authApi").then(({ default: api }) => {
      api.get(`/bookings?venueId=${venue._id}`)
        .then((res) => {
          const matchedBookings = res.data.filter((b) => b.date === formattedDate);
          const occupied = matchedBookings.flatMap((b) => b.slots);
          setBookedSlots(occupied);
          // Clear any selected slots that are now occupied
          setSelectedSlots([]);
        })
        .catch((err) => console.error("Error loading booked slots:", err));
    });
  }, [selectedDate, venue?._id]);

  const toggleSlot = (slot) => {
    if (!venue.availableSlots.includes(slot) || bookedSlots.includes(slot)) return;
    
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const totalHours = selectedSlots.length;
  const totalAmount = totalHours * venue.pricePerHour;


  // --- STEP 3: SUCCESS VIEW RENDER ---
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center border border-border shadow-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Your slot at <strong>{venue.name}</strong> has been booked for{" "}
            {formatDate(DATES[selectedDate])}.
          </p>
          <div className="bg-secondary rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Slots</span>
              <span className="font-medium text-foreground text-right">
                {selectedSlots.join(", ")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">
                {totalHours} hour{totalHours > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-bold text-primary">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // --- STEPS 1 & 2: SELECTION & CONFIRMATION VIEWS ---
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Sticky Header block containing Venue Name and Ratings */}
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-5 py-4 rounded-t-2xl">
          <div>
            <h2 className="font-semibold text-foreground">{venue.name}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              {venue.area}
              <span className="mx-1">·</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {venue.rating}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* STEP 1: DATE & SLOT SELECTION SCREEN */}
          {step === "select" && (
            <>
              {/* Date Pills Slider */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Select Date
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {DATES.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      className={`flex flex-col items-center shrink-0 w-14 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        selectedDate === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="uppercase text-[10px] opacity-70">
                        {d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </span>
                      <span className="text-base font-bold mt-0.5">
                        {d.getDate()}
                      </span>
                      <span className="uppercase text-[10px] opacity-70">
                        {d.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid (Green = Active/Selected, Gray = Free, Strikethrough = Taken) */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Select Time Slots
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const available = venue.availableSlots.includes(slot) && !bookedSlots.includes(slot);
                    const selected = selectedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        disabled={!available}
                        className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : available
                              ? "bg-secondary text-foreground border-border hover:border-primary/50"
                              : "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed line-through"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {/* Visual Legend indicator */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary inline-block" />{" "}
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-secondary border border-border inline-block" />{" "}
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-muted border border-border inline-block opacity-50" />{" "}
                    Booked
                  </span>
                </div>
              </div>

              {/* Dynamic Bill summary */}
              {selectedSlots.length > 0 && (
                <div className="bg-accent rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-accent-foreground">
                      {totalHours} hour{totalHours > 1 ? "s" : ""} × ₹
                      {venue.pricePerHour.toLocaleString()}
                    </span>
                    <span className="font-bold text-foreground">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(DATES[selectedDate])}
                  </p>
                </div>
              )}

              <button
                disabled={selectedSlots.length === 0}
                onClick={() => setStep("confirm")} // Shift to Step 2
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* STEP 2: USER DETAILS & CONFIRMATION SCREEN */}
          {step === "confirm" && (
            <>
              <div className="mb-5">
                {/* Visual Receipt detail */}
                <div className="bg-secondary rounded-xl p-4 mb-5 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-medium text-foreground">
                      {venue.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {formatDate(DATES[selectedDate])}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slots</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">
                      {selectedSlots.join(", ")}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-primary text-base">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Form fields for Name & Phone validation */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!name || !phone} // Validates both fields are non-empty
                  onClick={() => {
                    addBooking({
                      venueName: venue.name,
                      sport: venue.sport,
                      area: venue.area,
                      date: formatDate(DATES[selectedDate]),
                      slots: selectedSlots,
                      amount: totalAmount,
                      venueId: venue._id,
                    });
                    setStep("success"); // Shift to Step 3
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
