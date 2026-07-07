import { createContext, useContext, useState, useEffect } from "react";
import api, { authApi } from "@/services/authApi";

// Create the Context container. Other components will consume this.
const AppContext = createContext(null);

// Helper utility to generate unique random IDs (fallback)
const uid = () => Math.random().toString(36).slice(2, 9);

// Helper utility to format the current local time
const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Educational helper function.
 * Simulates a delay, then randomly marks a pending request
 * as 'accepted' or 'rejected' when backend is offline.
 */
function scheduleResolution(id, setter) {
  setTimeout(() => {
    const outcome = Math.random() > 0.35 ? "accepted" : "rejected";
    setter((prev) =>
      prev.map((item) =>
        item.id === id || item._id === id ? { ...item, status: outcome } : item
      )
    );
  }, 3200);
}

/**
 * APP PROVIDER COMPONENT
 * 
 * Central state provider for the React app. Automatically fetches data
 * from the Express REST API on mount. If the server is offline, falls back
 * to standard in-memory mock states seamlessly.
 */
export function AppProvider({ children }) {
  // --- STATE DECLARATIONS ---
  const [bookings, setBookings] = useState([]);
  const [connects, setConnects] = useState([]);
  const [joins, setJoins] = useState([]);
  const [matches, setMatches] = useState([]);
  const [threads, setThreads] = useState([]);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [createdPlayers, setCreatedPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Global Toast State
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success"); // "success" | "error"

  const showToast = (message, type = "success") => {
    setToast(message);
    setToastType(type);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // --- CONNECTIVITY: FETCH DATA ON COMPONENT MOUNT ---
  useEffect(() => {
    // 1. Fetch public Directories (Players and Teams)
    api.get("/players")
      .then((res) => setCreatedPlayers(res.data))
      .catch(() => console.log("Players API offline. Using local players."));

    api.get("/teams")
      .then((res) => setCreatedTeams(res.data))
      .catch(() => console.log("Teams API offline. Using local teams."));

    // 2. Restore User Auth Session
    const savedUser = localStorage.getItem("playmates_user");
    const savedToken = localStorage.getItem("playmates_token");
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("playmates_user");
        localStorage.removeItem("playmates_token");
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

    const username = currentUser.username || currentUser.email;

    // Fetch user-specific bookings
    api.get(`/bookings?username=${username}`)
      .then((res) => setBookings(res.data))
      .catch(() => console.log("Bookings API offline. Using fallback."));

    // Fetch user-specific player connects
    api.get(`/connects?username=${username}`)
      .then((res) => setConnects(res.data))
      .catch(() => console.log("Connects API offline."));

    // Fetch user-specific team joins
    api.get(`/joins?username=${username}`)
      .then((res) => setJoins(res.data))
      .catch(() => console.log("Joins API offline."));

    // Fetch user-specific match challenges
    api.get(`/matches?username=${username}`)
      .then((res) => setMatches(res.data))
      .catch(() => console.log("Matches API offline."));

    // Fetch user-specific chat threads
    api.get(`/threads?username=${username}`)
      .then((res) => setThreads(res.data))
      .catch(() => console.log("Threads API offline."));
  }, [currentUser]);

  // --- CRUD REST API DISPATCH ACTION TRIGGERS ---

  // CREATE Booking
  const addBooking = async (b) => {
    const payload = { ...b, username: currentUser?.username || currentUser?.email };
    try {
      const res = await api.post("/bookings", payload);
      setBookings((prev) => [res.data, ...prev]);
    } catch (e) {
      // Local fallback
      setBookings((prev) => [{ ...payload, id: uid() }, ...prev]);
    }
  };

  // DELETE/Cancel Booking
  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId && b._id !== bookingId));
      showToast("Booking cancelled successfully", "success");
    } catch (e) {
      // Local fallback in case server offline
      setBookings((prev) => prev.filter((b) => b.id !== bookingId && b._id !== bookingId));
      showToast("Booking cancelled (Offline mode)", "success");
    }
  };

  // CREATE Connection request
  const addConnect = async (c) => {
    const payload = { ...c, username: currentUser?.username || currentUser?.email };
    try {
      const res = await api.post("/connects", payload);
      setConnects((prev) => [res.data, ...prev]);
    } catch (e) {
      // Local fallback
      const id = uid();
      setConnects((prev) => [{ ...payload, id, status: "pending" }, ...prev]);
      scheduleResolution(id, setConnects);
    }
  };

  // CREATE Join request
  const addJoin = async (j) => {
    const payload = { ...j, username: currentUser?.username || currentUser?.email };
    try {
      const res = await api.post("/joins", payload);
      setJoins((prev) => [res.data, ...prev]);
    } catch (e) {
      // Local fallback
      const id = uid();
      setJoins((prev) => [{ ...payload, id, status: "pending" }, ...prev]);
      scheduleResolution(id, setJoins);
    }
  };

  // CREATE Match Challenge request
  const addMatch = async (m) => {
    const payload = { ...m, username: currentUser?.username || currentUser?.email };
    try {
      const res = await api.post("/matches", payload);
      setMatches((prev) => [res.data, ...prev]);
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
      const res = await api.post("/teams", t);
      setCreatedTeams((prev) => [res.data, ...prev]);
    } catch (e) {
      // Local fallback
      setCreatedTeams((prev) => [t, ...prev]);
    }
  };

  // CREATE/Register a new Player profile
  const addPlayer = async (p) => {
    try {
      const res = await api.post("/players", p);
      setCreatedPlayers((prev) => [res.data, ...prev]);
    } catch (e) {
      // Local fallback
      setCreatedPlayers((prev) => [p, ...prev]);
    }
  };

  // CREATE Message in thread
  const sendMessage = async (player, text) => {
    const payload = {
      playerName: player.name,
      playerAvatar: player.avatar,
      sport: player.sport,
      messageText: text,
      username: currentUser?.username || currentUser?.email,
    };
    try {
      const res = await api.post("/threads", payload);
      setThreads((prev) => {
        const otherThreads = prev.filter((t) => t.playerName !== player.name);
        return [res.data, ...otherThreads];
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
              : t
          );
        }
        return [
          {
            id: uid(),
            playerName: player.name,
            playerAvatar: player.avatar,
            sport: player.sport,
            messages: [myMsg],
            username: currentUser?.username || currentUser?.email,
          },
          ...prev,
        ];
      });
    }
  };

  // --- USER AUTHENTICATION HANDLERS ---

  // POST Request to Login view
  const login = async (email, password) => {
    try {
      const userData = await authApi.login(email, password);
      // The API returns username = email.split('@')[0] in our design
      const fullUserData = {
        ...userData,
        username: userData.username || userData.email.split("@")[0],
      };
      setCurrentUser(fullUserData);
      localStorage.setItem("playmates_token", userData.token);
      localStorage.setItem("playmates_user", JSON.stringify(fullUserData));
      showToast("Login Successful", "success");
      return fullUserData;
    } catch (err) {
      const errMessage = err.response?.data?.error || "Login failed";
      showToast(errMessage, "error");
      throw new Error(errMessage);
    }
  };

  // POST Request to Signup view
  const signup = async (signupData) => {
    try {
      const data = await authApi.register(signupData);
      showToast("Registration Successful", "success");
      return data;
    } catch (err) {
      const errMessage = err.response?.data?.error || "Registration failed";
      showToast(errMessage, "error");
      throw new Error(errMessage);
    }
  };

  // PUT Request to Update Profile
  const updateProfile = async (profileData) => {
    try {
      const data = await authApi.updateProfile(profileData);
      const token = localStorage.getItem("playmates_token");
      const fullUserData = {
        ...data,
        token,
        username: data.username || data.email.split("@")[0],
      };
      setCurrentUser(fullUserData);
      localStorage.setItem("playmates_user", JSON.stringify(fullUserData));
      showToast("Profile Updated Successfully", "success");
      return fullUserData;
    } catch (err) {
      const errMessage = err.response?.data?.error || "Profile update failed";
      showToast(errMessage, "error");
      throw new Error(errMessage);
    }
  };

  // Clear session state and storage
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("playmates_user");
    localStorage.removeItem("playmates_token");
    showToast("Logged out successfully", "success");
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
        cancelBooking,
        addConnect,
        addJoin,
        addMatch,
        addTeam,
        addPlayer,
        sendMessage,
        currentUser,
        login,
        signup,
        updateProfile,
        logout,
        toast,
        toastType,
        showToast,
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
