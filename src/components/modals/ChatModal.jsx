"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { SPORTS } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function ChatModal({ peer, onClose }) {
  const { threads, sendMessage } = useApp();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const thread = threads.find((t) => t.playerName === peer.name);
  const messages = thread?.messages ?? [];
  const sport = SPORTS.find((s) => s.id === peer.sport);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(peer, trimmed);
    setText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-border shadow-xl flex flex-col h-[70vh] sm:h-[32rem]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
            {peer.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {peer.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {sport?.icon} {sport?.label} player
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Send className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Start the conversation
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[15rem]">
                Say hi to {peer.name.split(" ")[0]} and plan a {sport?.label}{" "}
                game together.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                    m.from === "me"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      m.from === "me"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
