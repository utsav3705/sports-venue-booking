import { createContext, useContext, useState, useEffect } from "react";

// Base REST API URL: targets local Django port 8000 when running standalone Vite (port 3000), otherwise uses relative path
const API_URL = typeof window !== "undefined" && window.location.origin.includes("3000")
  ? "http://localhost:8000/api"
  : "/api";


// Create the Context container. Other components will consume this.
const AppContext = createContext(null);

// Helper utility to generate unique random IDs (e.g. "a3f89cd")
const uid = () => Math.random().toString(36).slice(2, 9);

// Helper utility to format the current local time (e.g. "07:30 PM")
const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Educational helper function.
 * Simulates a delay (e.g. network latency), then randomly marks a pending request
 * as 'accepted' or 'rejected' when Django backend is offline.
 */
function scheduleResolution(id, setter) {
  setTimeout(() => {
    const outcome = Math.random() > 0.35 ? "accepted" : "rejected";
    setter((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: outcome } : item,
      ),
    );
  }, 3200);
}

/**
 * APP PROVIDER COMPONENT
 * 
 * Central state provider for the React app. Automatically fetches data
 * from the Django REST API on mount. If the server is offline, falls back
 * to standard in-memory mock states seamlessly.
 */
export function AppProvider({ children }) {
  // --- STATE DECLARATIONS ---
  const [bookings, setBookings] = useState([
    {
      id: "seed-b1",
      venueName: "ProKick Football Arena",
      sport: "football",
      area: "Prahlad Nagar",
      date: "Sat, 5 Jul",
      slots: ["19:00", "20:00"],
      amount: 2400,
    },
  ]);
  const [connects, setConnects] = useState([
    {
      id: "seed-c1",
      playerName: "Dev Patel",
      playerAvatar: "DP",
      sport: "football",
      area: "Prahlad Nagar",
      status: "accepted",
    },
    {
      id: "seed-c2",
      playerName: "Karan Joshi",
      playerAvatar: "KJ",
      sport: "cricket",
      area: "Bopal",
      status: "pending",
    },
  ]);
  const [joins, setJoins] = useState([
    {
      id: "seed-j1",
      teamName: "Satellite Strikers",
      teamAvatar: "SS",
      sport: "cricket",
      status: "rejected",
    },
  ]);
  const [matches, setMatches] = useState([]);
  const [threads, setThreads] = useState([]);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [createdPlayers, setCreatedPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- CONNECTIVITY: FETCH DATA ON COMPONENT MOUNT ---
  useEffect(() => {
    // 1. Fetch public Directories (Players and Teams)
    fetch(`${API_URL}/players`)
      .then((res) => res.json())
      .then((data) => setCreatedPlayers(data))
      .catch(() => console.log("Players API offline. Using local players."));

    fetch(`${API_URL}/teams`)
      .then((res) => res.json())
      .then((data) => setCreatedTeams(data))
      .catch(() => console.log("Teams API offline. Using local teams."));

    // 2. Restore User Auth Session
    const savedUser = localStorage.getItem("playmates_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("playmates_user");
      }
    }
  }, []);

  // --- CONNECTIVITY: FETCH USER-SPECIFIC DATA AFTER LOGIN ---
  useEffect(() => {
    if (!currentUser) {
      // Clear all user-specific states when user is guest/logged out
      setBookings([]);
      setConnects([]);
      setJoins([]);
      setMatches([]);
      setThreads([]);
      return;
    }

    const username = currentUser.username;

    // Fetch user-specific bookings
    fetch(`${API_URL}/bookings?username=${username}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch(() => console.log("Bookings API offline. Using fallback."));

    // Fetch user-specific player connects
    fetch(`${API_URL}/connects?username=${username}`)
      .then((res) => res.json())
      .then((data) => setConnects(data))
      .catch(() => console.log("Connects API offline."));

    // Fetch user-specific team joins
    fetch(`${API_URL}/joins?username=${username}`)
      .then((res) => res.json())
      .then((data) => setJoins(data))
      .catch(() => console.log("Joins API offline."));

    // Fetch user-specific match challenges
    fetch(`${API_URL}/matches?username=${username}`)
      .then((res) => res.json())
      .then((data) => setMatches(data))
      .catch(() => console.log("Matches API offline."));

    // Fetch user-specific chat threads
    fetch(`${API_URL}/threads?username=${username}`)
      .then((res) => res.json())
      .then((data) => setThreads(data))
      .catch(() => console.log("Threads API offline."));
  }, [currentUser]);

  // --- CRUD REST API DISPATCH ACTION TRIGGERS ---

  // CREATE Booking
  const addBooking = async (b) => {
    const payload = { ...b, username: currentUser?.username };
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setBookings((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      setBookings((prev) => [{ ...payload, id: uid() }, ...prev]);
    }
  };

  // CREATE Connection request
  const addConnect = async (c) => {
    const payload = { ...c, username: currentUser?.username };
    try {
      const res = await fetch(`${API_URL}/connects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setConnects((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      const id = uid();
      setConnects((prev) => [{ ...payload, id, status: "pending" }, ...prev]);
      scheduleResolution(id, setConnects);
    }
  };

  // CREATE Join request
  const addJoin = async (j) => {
    const payload = { ...j, username: currentUser?.username };
    try {
      const res = await fetch(`${API_URL}/joins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setJoins((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      const id = uid();
      setJoins((prev) => [{ ...payload, id, status: "pending" }, ...prev]);
      scheduleResolution(id, setJoins);
    }
  };

  // CREATE Match Challenge request
  const addMatch = async (m) => {
    const payload = { ...m, username: currentUser?.username };
    try {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMatches((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      const id = uid();
      setMatches((prev) => [{ ...payload, id, status: "pending" }, ...prev]);
      scheduleResolution(id, setMatches);
    }
  };

  // CREATE/Register a new Team
  const addTeam = async (t) => {
    try {
      const res = await fetch(`${API_URL}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      const data = await res.json();
      setCreatedTeams((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      setCreatedTeams((prev) => [t, ...prev]);
    }
  };

  // CREATE/Register a new Player profile
  const addPlayer = async (p) => {
    try {
      const res = await fetch(`${API_URL}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      setCreatedPlayers((prev) => [data, ...prev]);
    } catch (e) {
      // Local fallback
      setCreatedPlayers((prev) => [p, ...prev]);
    }
  };

  // CREATE Message in thread (with simulated delayed auto-reply)
  const sendMessage = async (player, text) => {
    const payload = {
      playerName: player.name,
      playerAvatar: player.avatar,
      sport: player.sport,
      messageText: text,
      username: currentUser?.username,
    };
    try {
      const res = await fetch(`${API_URL}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setThreads((prev) => {
        const otherThreads = prev.filter((t) => t.playerName !== player.name);
        return [data, ...otherThreads];
      });
    } catch (e) {
      // Local fallback
      setThreads((prev) => {
        const existing = prev.find((t) => t.playerName === player.name);
        const myMsg = { from: "me", text, time: now() };
        if (existing) {
          return prev.map((t) =>
            t.playerName === player.name
              ? { ...t, messages: [...t.messages, myMsg] }
              : t,
          );
        }
        return [
          {
            id: uid(),
            playerName: player.name,
            playerAvatar: player.avatar,
            sport: player.sport,
            messages: [myMsg],
            username: currentUser?.username,
          },
          ...prev,
        ];
      });
    }
  };

  // --- USER AUTHENTICATION HANDLERS ---

  // POST Request to Login view
  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Login failed");
    }
    const userData = await res.json();
    setCurrentUser(userData);
    localStorage.setItem("playmates_user", JSON.stringify(userData));
    return userData;
  };

  // POST Request to Signup view
  const signup = async (signupData) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Registration failed");
    }
    const data = await res.json();
    return data;
  };

  // Clear session state and storage
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("playmates_user");
  };

  return (
    <AppContext.Provider
      value={{
        bookings,
        connects,
        joins,
        matches,
        threads,
        createdTeams,
        createdPlayers,
        addBooking,
        addConnect,
        addJoin,
        addMatch,
        addTeam,
        addPlayer,
        sendMessage,
        currentUser,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * CUSTOM HOOK
 * Provides an easy way for components to import the context.
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
