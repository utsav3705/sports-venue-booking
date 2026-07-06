"use client";

import { CheckCircle } from "lucide-react";

export default function ConnectModal({ player, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-xl">
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary font-bold text-lg border border-primary/20">
            {player.avatar}
          </div>
          <h3 className="font-bold text-foreground">{player.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {player.level} {player.sport} player · {player.area}
          </p>
        </div>
        <p className="text-sm text-center text-muted-foreground mb-5">
          Send a connect request to {player.name.split(" ")[0]}? You can track
          the response in your Profile.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
