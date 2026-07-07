"use client";

import { useState } from "react";
import { Users, Mail, Lock } from "lucide-react";
import { useApp } from "@/lib/store";

export default function LoginPage({ onToggleAuth }) {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">
            Welcome back to PlayMates
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Enter your credentials to access your turf bookings & community
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-sm shadow-primary/10 mt-2 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-border">
          <button
            onClick={onToggleAuth}
            className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
