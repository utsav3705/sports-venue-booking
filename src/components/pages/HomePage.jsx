"use client";

import { ArrowRight, Shuffle, CheckCircle } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import VenueCard from "@/components/cards/VenueCard";
import PlayerCard from "@/components/cards/PlayerCard";
import TeamCard from "@/components/cards/TeamCard";
import BookingModal from "@/components/modals/BookingModal";
import ChatModal from "@/components/modals/ChatModal";
import ConnectModal from "@/components/modals/ConnectModal";
import ChallengeModal from "@/components/modals/ChallengeModal";
import JoinModal from "@/components/modals/JoinModal";
import { VENUES, PLAYERS, TEAMS } from "@/lib/data";
import { useState } from "react";
import { useApp } from "@/lib/store";

export default function HomePage({
  onNavigate,
  selectedSport,
  onSportChange,
  selectedArea,
  onAreaChange,
}) {
  const { addConnect, addJoin, addMatch } = useApp();
  const [bookedVenue, setBookedVenue] = useState(null);
  const [connectPlayer, setConnectPlayer] = useState(null);
  const [chatPlayer, setChatPlayer] = useState(null);
  const [joinedTeam, setJoinedTeam] = useState(null);
  const [challengeTeam, setChallengeTeam] = useState(null);
  const [toast, setToast] = useState(null);

  const featuredVenues = VENUES.slice(0, 4);
  const featuredPlayers = PLAYERS.slice(0, 4);
  const featuredTeams = TEAMS.slice(0, 3);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const confirmConnect = () => {
    if (!connectPlayer) return;
    addConnect({
      playerName: connectPlayer.name,
      playerAvatar: connectPlayer.avatar,
      sport: connectPlayer.sport,
      area: connectPlayer.area,
    });
    showToast(`Request sent to ${connectPlayer.name.split(" ")[0]}`);
    setConnectPlayer(null);
  };

  const confirmJoin = () => {
    if (!joinedTeam) return;
    addJoin({
      teamName: joinedTeam.name,
      teamAvatar: joinedTeam.avatar,
      sport: joinedTeam.sport,
    });
    showToast(`Join request sent to ${joinedTeam.name}`);
    setJoinedTeam(null);
  };

  const confirmChallenge = (fromTeam, matchType, stake) => {
    if (!challengeTeam) return;
    addMatch({
      fromTeam,
      toTeam: challengeTeam.name,
      toAvatar: challengeTeam.avatar,
      sport: challengeTeam.sport,
      matchType,
      stake,
    });
    showToast(`Match request sent to ${challengeTeam.name}`);
    setChallengeTeam(null);
  };

  return (
    <main>
      <HeroSection
        onExplore={onNavigate}
        selectedSport={selectedSport}
        onSportChange={onSportChange}
        selectedArea={selectedArea}
        onAreaChange={onAreaChange}
      />

      {/* Featured Venues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Top Venues in Ahmedabad
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Most popular sports venues this week
            </p>
          </div>
          <button
            onClick={() => onNavigate("venues")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onBook={setBookedVenue} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            How TurfBook Works
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Book a venue in 3 simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Choose a Venue",
                desc: "Browse from 10+ venues across 12 areas in Ahmedabad. Filter by sport, area, and price.",
                icon: "🏟️",
              },
              {
                step: "02",
                title: "Pick a Slot",
                desc: "Select your preferred date and time from available hourly slots. See real-time availability.",
                icon: "📅",
              },
              {
                step: "03",
                title: "Confirm & Play",
                desc: "Confirm your booking instantly and show up to play. Payment collected at venue.",
                icon: "✅",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary tracking-widest mb-1">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Players */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Find Nearby Players
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect with players looking for a game
            </p>
          </div>
          <button
            onClick={() => onNavigate("players")}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Random player CTA */}
        <div className="bg-accent border border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-6">
          <div>
            <p className="font-semibold text-foreground text-sm">
              Looking for a random opponent or partner?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Let us match you with a player near you instantly
            </p>
          </div>
          <button
            onClick={() => onNavigate("players")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Random Match
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onConnect={setConnectPlayer}
              onMessage={setChatPlayer}
            />
          ))}
        </div>
      </section>

      {/* Teams */}
      <section className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Teams Looking for Players
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Join an existing team or find teammates
              </p>
            </div>
            <button
              onClick={() => onNavigate("teams")}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onJoin={setJoinedTeam}
                onChallenge={setChallengeTeam}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Ready to play in Ahmedabad?
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base mb-6 max-w-md mx-auto">
            Register as a player or create your team. Discover venues, find
            opponents, and book your next game in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate("register")}
              className="px-6 py-3 rounded-xl bg-primary-foreground text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-colors"
            >
              Register Now
            </button>
            <button
              onClick={() => onNavigate("venues")}
              className="px-6 py-3 rounded-xl border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
            >
              Browse Venues
            </button>
          </div>
        </div>
      </section>

      {bookedVenue && (
        <BookingModal
          venue={bookedVenue}
          onClose={() => setBookedVenue(null)}
        />
      )}

      {connectPlayer && (
        <ConnectModal
          player={connectPlayer}
          onClose={() => setConnectPlayer(null)}
          onConfirm={confirmConnect}
        />
      )}

      {chatPlayer && (
        <ChatModal
          peer={{
            name: chatPlayer.name,
            avatar: chatPlayer.avatar,
            sport: chatPlayer.sport,
          }}
          onClose={() => setChatPlayer(null)}
        />
      )}

      {joinedTeam && (
        <JoinModal
          team={joinedTeam}
          onClose={() => setJoinedTeam(null)}
          onConfirm={confirmJoin}
        />
      )}

      {challengeTeam && (
        <ChallengeModal
          team={challengeTeam}
          onClose={() => setChallengeTeam(null)}
          onSubmit={confirmChallenge}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </main>
  );
}
