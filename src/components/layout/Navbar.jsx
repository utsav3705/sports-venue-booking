import { useState } from "react";
import { Menu, X, MapPin, User } from "lucide-react";
import { useApp } from "@/lib/store";


// Navigation link structure shared between desktop and mobile menus
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "venues", label: "Venues" },
  { id: "players", label: "Find Players" },
  { id: "teams", label: "Teams" },
];

/**
 * GLOBAL NAVBAR HEADER COMPONENT
 * 
 * Renders the top navigation header bar. Supports both desktop layouts
 * and collapsible mobile hamburger layouts.
 * 
 * Props:
 * - activeTab (string): The current active page route (e.g. "home", "venues").
 * - onTabChange (function): Callback handler to switch active pages.
 */
export default function Navbar({ activeTab, onTabChange }) {
  const { currentUser } = useApp();
  // Local state to toggle mobile slide-down navigation drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [...NAV_LINKS];
  if (currentUser?.username === "admin") {
    links.push({ id: "admin", label: "Admin Panel" });
  }

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO BRAND BUTTON */}
          <button
            onClick={() => onTabChange("home")}
            className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                P
              </span>
            </div>
            <span>PlayMates</span>
            <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5 ml-1">
              <MapPin className="w-3 h-3" />
              Ahmedabad
            </span>
          </button>

          {/* DESKTOP NAVIGATION ITEMS */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* DESKTOP USER ACTIONS (Profile & Register) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => onTabChange("register")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Register
            </button>
          </div>

          {/* MOBILE NAVIGATION TOGGLE BUTTON (Collapsible Hamburger) */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE MOBILE MENU CONTAINER */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onTabChange(link.id);
                setMobileOpen(false); // Close mobile menu drawer on tap
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === link.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </button>
          ))}
          
          {/* Mobile Profile Trigger */}
          <button
            onClick={() => {
              onTabChange("profile");
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          
          {/* Mobile Register Trigger */}
          <button
            onClick={() => {
              onTabChange("register");
              setMobileOpen(false);
            }}
            className="mt-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
          >
            Register
          </button>
        </div>
      )}
    </header>
  );
}
