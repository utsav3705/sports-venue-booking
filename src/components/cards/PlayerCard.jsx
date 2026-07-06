import { MessageCircle, MapPin, UserPlus } from "lucide-react";
import { getSportColor, getLevelColor, canMessage, SPORTS } from "@/lib/data";

/**
 * PLAYER CARD COMPONENT
 * 
 * Displays individual details for a sports player looking for matchmaking partners.
 * Used inside the "Find Players" page grid and the homepage player section.
 * 
 * Props:
 * - player (object): The player object containing name, avatar, sport, position, level, and area.
 * - onConnect (function): Event handler callback triggered when the "Connect" button is clicked.
 * - onMessage (function): Event handler callback triggered when the "Message" button is clicked.
 */
export default function PlayerCard({ player, onConnect, onMessage }) {
  // Query sport metadata (like emoji icons and tags) based on the player's sport type
  const sport = SPORTS.find((s) => s.id === player.sport);
  
  // Checks if chat/messaging is supported for this player's sport (typically racket sports)
  const messagingEnabled = canMessage(player.sport);

  return (
    <article className="bg-card border border-border rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all">
      
      {/* 1. Header Section: Avatar, Name, and Skill Level */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar circle containing initials */}
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm border border-primary/20">
          {player.avatar}
        </div>
        {/* Name and geographic area */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {player.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            {player.area}
          </div>
        </div>
        {/* Colored skill level pill (e.g. Beginner, Intermediate) */}
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getLevelColor(player.level)}`}
        >
          {player.level}
        </span>
      </div>

      {/* 2. Content Section: Sport Badge and Preferred Play Position */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-[11px] font-medium px-2 py-1 rounded-lg ${getSportColor(player.sport)}`}
        >
          {sport?.icon} {sport?.label}
        </span>
        <span className="text-xs text-muted-foreground">{player.position}</span>
      </div>

      {/* 3. Action Buttons Section */}
      <div className="flex gap-2">
        {/* Send a player connection/friend request */}
        <button
          onClick={() => onConnect?.(player)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Connect
        </button>
        {/* Open chat messaging window if enabled for this sport */}
        {messagingEnabled && (
          <button
            onClick={() => onMessage?.(player)}
            aria-label={`Message ${player.name}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary hover:border-primary/40 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Message</span>
          </button>
        )}
      </div>
    </article>
  );
}
