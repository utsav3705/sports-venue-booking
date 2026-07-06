import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import HomePage from "@/components/pages/HomePage";
import VenuesPage from "@/components/pages/VenuesPage";
import PlayersPage from "@/components/pages/PlayersPage";
import TeamsPage from "@/components/pages/TeamsPage";
import RegisterPage from "@/components/pages/RegisterPage";
import ProfilePage from "@/components/pages/ProfilePage";
import AdminPage from "@/components/pages/AdminPage";
import { AppProvider, useApp } from "@/lib/store";

/**
 * ROOT APP COMPONENT
 * 
 * This is the entry component of the PlayMates application.
 * It wraps the application inside the global AppProvider (state manager)
 * and mounts the PageContent router component.
 */
export default function App() {
  return (
    <AppProvider>
      <PageContent />
    </AppProvider>
  );
}

/**
 * ROUTER PAGE CONTENT COMPONENT
 * 
 * Manages the client-side single-page routing via simple React state (`activeTab`).
 * Displays different page components depending on the selected tab:
 * - "home": Main dashboard with featured listings.
 * - "venues": Sport turfs and arenas directory.
 * - "players": Matchmaking directory for racket sports.
 * - "teams": Club/Team listings and challenges.
 * - "register": Registration forms for players and teams.
 * - "profile": User's past bookings, connections, and message inbox.
 */
function PageContent() {
  const { currentUser } = useApp();
  // Local states to track routing and quick-search filters across tabs
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");

  // Router handler that updates tab state and scrolls window to top smoothly
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-redirect admin account to admin panel on login
  useEffect(() => {
    if (currentUser?.username === "admin" && activeTab !== "admin") {
      setActiveTab("admin");
    }
  }, [currentUser, activeTab]);

  // --- FORCE LOGIN SCREEN AS FIRST PAGE IF LOGGED-OUT ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Simple Auth Header */}
        <header className="border-b border-border py-4 bg-card">
          <div className="max-w-md mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                P
              </div>
              PlayMates
            </div>
            <span className="text-xs text-muted-foreground font-semibold">Ahmedabad</span>
          </div>
        </header>

        {/* Centered Login / Register Panel */}
        <div className="flex-1 flex items-center justify-center bg-background py-8">
          <ProfilePage />
        </div>

        {/* Simple Auth Footer */}
        <footer className="border-t border-border py-4 bg-card text-center text-[10px] text-muted-foreground">
          &copy; 2025 PlayMates Ahmedabad. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global Navigation Header Bar */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* RENDER PAGES CONDITIONALLY DEPENDING ON activeTab STATE */}

      {/* 1. Home Dashboard Page */}
      {activeTab === "home" && (
        <HomePage
          onNavigate={handleTabChange}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
        />
      )}

      {/* 2. Turf Venues Listing Page */}
      {activeTab === "venues" && (
        <VenuesPage initialSport={selectedSport} initialArea={selectedArea} />
      )}

      {/* 3. Matchmaking Players Directory Page */}
      {activeTab === "players" && <PlayersPage />}

      {/* 4. Teams Directory Page */}
      {activeTab === "teams" && <TeamsPage />}

      {/* 5. User Registration Forms Page */}
      {activeTab === "register" && <RegisterPage />}

      {/* 6. User Profile Dashboard Page */}
      {activeTab === "profile" && <ProfilePage />}

      {/* 7. System Administrator Console Page */}
      {activeTab === "admin" && <AdminPage />}

      {/* Global Application Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-foreground mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                  P
                </div>
                PlayMates
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ahmedabad&apos;s sports community. Book venues, find players,
                build teams, play matches.
              </p>
            </div>

            {/* Quick Links: Venues Category */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Venues
              </p>
              <ul className="space-y-1.5">
                {[
                  "Cricket Turfs",
                  "Football Grounds",
                  "Pickleball Courts",
                  "Padel Courts",
                ].map((v) => (
                  <li key={v}>
                    <button
                      onClick={() => handleTabChange("venues")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {v}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links: Community Pages */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Community
              </p>
              <ul className="space-y-1.5">
                {[
                  { label: "Find Players", tab: "players" },
                  { label: "Teams", tab: "teams" },
                  { label: "Register", tab: "register" },
                ].map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleTabChange(l.tab)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coverage Areas */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Areas
              </p>
              <ul className="space-y-1.5">
                {[
                  "Satellite",
                  "Bopal",
                  "Prahlad Nagar",
                  "SG Highway",
                  "Motera",
                ].map((a) => (
                  <li key={a}>
                    <span className="text-xs text-muted-foreground">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 PlayMates Ahmedabad. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made for sports lovers in Ahmedabad
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
