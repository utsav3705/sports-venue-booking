import { useState, useEffect, useRef } from "react";
import { Menu, X, MapPin, User, Bell, BellDot } from "lucide-react";
import { useApp } from "@/lib/store";
import { notificationApi } from "@/services/playerEcosystemApi";

// Navigation link structure for desktop and mobile menus
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "venues", label: "Venues" },
  { id: "players", label: "Find Players" },
  { id: "teams", label: "Teams" },
  { id: "matches", label: "Matches" },
];

/**
 * GLOBAL NAVBAR HEADER COMPONENT
 *
 * Props:
 * - activeTab (string): The current active page route.
 * - onTabChange (function): Callback to switch active pages.
 */
export default function Navbar({ activeTab, onTabChange }) {
  const { currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // --- Polling: fetch notifications every 15 seconds ---
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifs = () => {
      notificationApi
        .getAll()
        .then((data) => setNotifications(data || []))
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close notification panel on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {}
  };

  const handleDeleteNotif = async (id) => {
    try {
      await notificationApi.remove(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(unread.map((n) => notificationApi.markRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [...NAV_LINKS];
  if (currentUser?.username === "admin" || currentUser?.role === "admin") {
    links.push({ id: "admin", label: "Admin Panel" });
  }
  if (currentUser?.role === "venue_owner" || currentUser?.role === "admin") {
    links.push({ id: "owner-dashboard", label: "Owner Console" });
  }
  if (currentUser && currentUser.role === "user") {
    links.push({ id: "player-dashboard", label: "Dashboard" });
  }

  // Notification type color badge
  const notifColor = (type) => {
    if (type?.includes("Accepted") || type?.includes("Joined")) return "text-green-500";
    if (type?.includes("Rejected") || type?.includes("Cancelled")) return "text-red-500";
    if (type?.includes("Request")) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <button
            onClick={() => onTabChange("home")}
            className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">P</span>
            </div>
            <span>PlayMates</span>
            <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5 ml-1">
              <MapPin className="w-3 h-3" />
              Ahmedabad
            </span>
          </button>

          {/* DESKTOP NAV */}
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

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-2">

            {/* Notification Bell */}
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
                  aria-label="Notifications"
                >
                  {unreadCount > 0 ? (
                    <BellDot className="w-5 h-5 text-primary" />
                  ) : (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-semibold">
                            All caught up!
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 20).map((notif) => (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 flex items-start gap-3 hover:bg-secondary/40 transition-colors ${
                              !notif.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !notif.read ? "bg-primary" : "bg-muted"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${notifColor(
                                  notif.type
                                )}`}
                              >
                                {notif.type}
                              </p>
                              <p className="text-xs text-foreground leading-relaxed font-medium">
                                {notif.message}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkRead(notif._id)}
                                  className="text-[9px] text-primary hover:underline font-bold"
                                >
                                  Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotif(notif._id)}
                                className="text-[9px] text-muted-foreground hover:text-red-500 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Button */}
            <button
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <User className="w-4 h-4" />
              {currentUser ? currentUser.name.split(" ")[0] : "Profile"}
            </button>

            {/* Register / Logout */}
            {!currentUser && (
              <button
                onClick={() => onTabChange("register")}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Register
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onTabChange(link.id);
                setMobileOpen(false);
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

          {/* Mobile Profile */}
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
            {currentUser ? `${currentUser.name.split(" ")[0]}'s Profile` : "Profile"}
          </button>

          {/* Mobile Notifications Badge */}
          {currentUser && (
            <button
              onClick={() => {
                setMobileOpen(false);
                setNotifOpen(true);
              }}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {unreadCount > 0 ? (
                <BellDot className="w-4 h-4 text-primary" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => {
                onTabChange("register");
                setMobileOpen(false);
              }}
              className="mt-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
            >
              Register
            </button>
          )}
        </div>
      )}
    </header>
  );
}
