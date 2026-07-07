"use client";

import { useState } from "react";
import { Users, Mail, Lock, Phone, User } from "lucide-react";
import { useApp } from "@/lib/store";
import { SPORTS } from "@/lib/data";

export default function SignupPage({ onToggleAuth }) {
  const { signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("football");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Front-end validations
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, phone, sport, role, password, confirmPassword });
      setSuccess("Account created successfully! Please log in.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        onToggleAuth();
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs.");
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
            Join PlayMates Ahmedabad
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Create an account to book courts and connect with players
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dev Patel"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                Phone Number *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                Preferred Sport *
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-all font-semibold cursor-pointer h-[42px]"
              >
                {SPORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
                Account Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:border-primary transition-all font-semibold cursor-pointer h-[42px]"
              >
                <option value="user">User (Player)</option>
                <option value="venue_owner">Venue Owner</option>
                <option value="admin">Administrator</option>
              </select>
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

          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase tracking-wider">
              Confirm Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-border">
          <button
            onClick={onToggleAuth}
            className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
