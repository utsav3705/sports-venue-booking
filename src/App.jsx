import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import HomePage from "@/components/pages/HomePage";
import VenuesPage from "@/components/pages/VenuesPage";
import PlayersPage from "@/components/pages/PlayersPage";
import TeamsPage from "@/components/pages/TeamsPage";
import RegisterPage from "@/components/pages/RegisterPage";
import ProfilePage from "@/components/pages/ProfilePage";
import AdminPage from "@/components/pages/AdminPage";
import OwnerDashboardPage from "@/components/pages/OwnerDashboardPage";
import AddVenuePage from "@/components/pages/AddVenuePage";
import EditVenuePage from "@/components/pages/EditVenuePage";
import VenueDetailsPage from "@/components/pages/VenueDetailsPage";
import PlayerDashboardPage from "@/components/pages/PlayerDashboardPage";
import MatchesPage from "@/components/pages/MatchesPage";
import CreateMatchPage from "@/components/pages/CreateMatchPage";
import TeamDetailsPage from "@/components/pages/TeamDetailsPage";
import CreateTeamPage from "@/components/pages/CreateTeamPage";
import EditTeamPage from "@/components/pages/EditTeamPage";
import { AppProvider, useApp } from "@/lib/store";
import { CheckCircle, AlertCircle } from "lucide-react";

/**
 * ROOT APP COMPONENT
 *
 * Wraps the application inside AppProvider (global state manager)
 * and mounts the PageContent SPA router component.
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
 * Simple React-state-based client-side SPA router.
 * Supports nested routes like "team-detail:ID", "edit-team:ID" etc.
 */
function PageContent() {
  const { currentUser, toast, toastType } = useApp();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-redirect based on role after login
  useEffect(() => {
    if (
      (currentUser?.username === "admin" || currentUser?.role === "admin") &&
      activeTab !== "admin"
    ) {
      setActiveTab("admin");
    } else if (currentUser?.role === "venue_owner" && activeTab === "home") {
      setActiveTab("owner-dashboard");
    }
  }, [currentUser]);

  // --- FORCE LOGIN SCREEN IF GUEST ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between relative">
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

        <div className="flex-1 flex items-center justify-center bg-background py-8">
          <ProfilePage />
        </div>

        <footer className="border-t border-border py-4 bg-card text-center text-[10px] text-muted-foreground">
          &copy; 2025 PlayMates Ahmedabad. All rights reserved.
        </footer>

        {toast && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 ${
              toastType === "error"
                ? "bg-red-500 text-white border border-red-600 shadow-red-500/10"
                : "bg-foreground text-background"
            }`}
          >
            {toastType === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global Navigation */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ====================== PAGE ROUTING ====================== */}

      {/* 1. Home */}
      {activeTab === "home" && (
        <HomePage
          onNavigate={handleTabChange}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
        />
      )}

      {/* 2. Venues Listing */}
      {activeTab === "venues" && (
        <VenuesPage
          initialSport={selectedSport}
          initialArea={selectedArea}
          onNavigate={handleTabChange}
        />
      )}

      {/* 3. Find Players */}
      {activeTab === "players" && <PlayersPage />}

      {/* 4. Teams Listing */}
      {activeTab === "teams" && <TeamsPage onNavigate={handleTabChange} />}

      {/* 5. Team Details */}
      {activeTab.startsWith("team-detail:") && (
        <TeamDetailsPage
          teamId={activeTab.split(":")[1]}
          onBack={() => handleTabChange("teams")}
          onEdit={(id) => handleTabChange(`edit-team:${id}`)}
        />
      )}

      {/* 6. Create Team */}
      {activeTab === "create-team" && (
        <CreateTeamPage
          onBack={() => handleTabChange("teams")}
          onSuccess={() => handleTabChange("teams")}
        />
      )}

      {/* 7. Edit Team */}
      {activeTab.startsWith("edit-team:") && (
        <EditTeamPage
          teamId={activeTab.split(":")[1]}
          onBack={() => handleTabChange("teams")}
          onSuccess={(id) => handleTabChange(`team-detail:${id}`)}
        />
      )}

      {/* 8. Public Matches Listing */}
      {activeTab === "matches" && <MatchesPage onNavigate={handleTabChange} />}

      {/* 9. Create Match (Host a Match) */}
      {activeTab === "create-match" && (
        <CreateMatchPage
          onBack={() => handleTabChange("matches")}
          onSuccess={() => handleTabChange("matches")}
        />
      )}

      {/* 10. User Registration Forms */}
      {activeTab === "register" && <RegisterPage />}

      {/* 11. User Profile */}
      {activeTab === "profile" && <ProfilePage />}

      {/* 12. Player Dashboard (role=user only) */}
      {activeTab === "player-dashboard" && (
        currentUser?.role === "user" ? (
          <PlayerDashboardPage onNavigate={handleTabChange} />
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-4">
            <h1 className="text-xl font-extrabold text-red-500">Access Denied</h1>
            <p className="text-xs text-muted-foreground mt-1">
              This dashboard is only available for player accounts.
            </p>
          </div>
        )
      )}

      {/* 13. Admin Console */}
      {activeTab === "admin" && (
        currentUser?.role === "admin" || currentUser?.username === "admin" ? (
          <AdminPage />
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-4">
            <h1 className="text-xl font-extrabold text-red-500">Access Denied</h1>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have administrative privileges to access this console.
            </p>
          </div>
        )
      )}

      {/* 14. Owner Dashboard */}
      {activeTab === "owner-dashboard" && (
        currentUser?.role === "venue_owner" || currentUser?.role === "admin" ? (
          <OwnerDashboardPage onNavigate={handleTabChange} />
        ) : (
          <div className="max-w-md mx-auto text-center py-20 px-4">
            <h1 className="text-xl font-extrabold text-red-500">Access Denied</h1>
            <p className="text-xs text-muted-foreground mt-1">
              You do not have owner privileges to access this dashboard.
            </p>
          </div>
        )
      )}

      {/* 15. Add Venue */}
      {activeTab === "add-venue" && (
        <AddVenuePage
          onBack={() => handleTabChange("owner-dashboard")}
          onSuccess={(id) => handleTabChange(`venue-detail:${id}`)}
        />
      )}

      {/* 16. Edit Venue */}
      {activeTab.startsWith("edit-venue:") && (
        <EditVenuePage
          venueId={activeTab.split(":")[1]}
          onBack={() => handleTabChange("owner-dashboard")}
          onSuccess={(id) => handleTabChange(`venue-detail:${id}`)}
        />
      )}

      {/* 17. Venue Details */}
      {activeTab.startsWith("venue-detail:") && (
        <VenueDetailsPage
          venueId={activeTab.split(":")[1]}
          onBack={() => {
            if (currentUser?.role === "venue_owner") {
              handleTabChange("owner-dashboard");
            } else {
              handleTabChange("venues");
            }
          }}
          onEdit={(id) => handleTabChange(`edit-venue:${id}`)}
        />
      )}

      {/* ====================== FOOTER ====================== */}
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
                Ahmedabad&apos;s sports community. Book venues, find players, build teams, play matches.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Venues
              </p>
              <ul className="space-y-1.5">
                {["Cricket Turfs", "Football Grounds", "Pickleball Courts", "Padel Courts"].map(
                  (v) => (
                    <li key={v}>
                      <button
                        onClick={() => handleTabChange("venues")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {v}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Community
              </p>
              <ul className="space-y-1.5">
                {[
                  { label: "Find Players", tab: "players" },
                  { label: "Teams", tab: "teams" },
                  { label: "Matches", tab: "matches" },
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

            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Areas
              </p>
              <ul className="space-y-1.5">
                {["Satellite", "Bopal", "Prahlad Nagar", "SG Highway", "Motera"].map((a) => (
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
            <p className="text-xs text-muted-foreground">Made for sports lovers in Ahmedabad</p>
          </div>
        </div>
      </footer>

      {/* Global Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 ${
            toastType === "error"
              ? "bg-red-500 text-white border border-red-600 shadow-red-500/10"
              : "bg-foreground text-background"
          }`}
        >
          {toastType === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
