import { Users, MapPin, Trophy, UserPlus, Swords } from "lucide-react";
import { getSportColor, getLevelColor, SPORTS } from "@/lib/data";

/**
 * TEAM CARD COMPONENT
 * 
 * Displays club/team details, members progress, and W-L statistics records.
 * 
 * Props:
 * - team (object): The team object containing name, avatar, sport, area, level, wins, losses, description, members, maxMembers, and lookingFor.
 * - onJoin (function): Callback handler triggered when the "Join" button is clicked.
 * - onChallenge (function): Callback handler triggered when the "Challenge" button is clicked.
 */
export default function TeamCard({ team, onJoin, onChallenge }) {
  // Query sport metadata based on the team's sport type
  const sport = SPORTS.find((s) => s.id === team.sport);
  
  // Calculate members fill percentage for the UI progress bar
  const fillPercent = Math.round((team.members / team.maxMembers) * 100);
  
  // Calculate vacant slots left in the team roster
  const spotsLeft = team.maxMembers - team.members;

  return (
    <article className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        
        {/* 1. Header: Avatar Initials, Name, and Area location */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Square/Rounded avatar for the team logo */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm border border-primary/20">
              {team.avatar}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm leading-snug tracking-tight">
                {team.name}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground/70" />
                {team.area}
              </p>
            </div>
          </div>
          {/* Level Badge (e.g. Advanced) */}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${getLevelColor(team.level)}`}
          >
            {team.level}
          </span>
        </div>

        {/* 2. Stats Block: Sport Tag and Wins/Losses record */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getSportColor(team.sport)}`}
          >
            {sport?.icon} {sport?.label}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="text-green-600 font-semibold">{team.wins}W</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-red-500 font-semibold">{team.losses}L</span>
          </span>
        </div>

        {/* 3. Description text */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {team.description}
        </p>

        {/* 4. Roster Progress Bar: Members status count */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {team.members}/{team.maxMembers} Members
            </span>
            {spotsLeft > 0 ? (
              <span className="text-primary font-semibold text-[11px]">
                {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} left
              </span>
            ) : (
              <span className="text-muted-foreground text-[11px] font-medium">
                Full
              </span>
            )}
          </div>
          {/* Thin progress bar background container */}
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            {/* Animated primary color filler */}
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* 5. Target Roster Openings Info block */}
        <div className="flex items-start gap-1.5 bg-accent/50 border border-primary/5 rounded-xl px-3 py-2 mb-5">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
            Looking for:
          </span>
          <span className="text-xs text-accent-foreground font-medium flex-1">
            {team.lookingFor}
          </span>
        </div>
      </div>

      {/* 6. Action Buttons: Request to Join or Challenge to a match */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onJoin?.(team)}
          disabled={spotsLeft === 0} // Disable button if the team has reached max size
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-primary/10"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {spotsLeft > 0 ? "Join" : "Full"}
        </button>
        <button
          onClick={() => onChallenge?.(team)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary hover:border-primary/30 transition-all"
        >
          <Swords className="w-3.5 h-3.5 text-muted-foreground" />
          Challenge
        </button>
      </div>
    </article>
  );
}
