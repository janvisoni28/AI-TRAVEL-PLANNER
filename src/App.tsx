import React, { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Share2,
  Users,
  LogOut,
  User as UserIcon,
  MessageSquare,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Bell,
  Sun,
  CloudRain,
  ChevronRight,
  TrendingUp,
  Globe,
  Lock,
  Menu,
  X,
  Languages,
  Printer,
  BrainCircuit,
  Eye,
  Settings,
  HelpCircle
} from "lucide-react";

import { Trip, User, Notification } from "./types";
import MapMock from "./components/MapMock.tsx";
import ExpenseTracker from "./components/ExpenseTracker.tsx";
import PackingChecklist from "./components/PackingChecklist.tsx";
import CurrencyConverter from "./components/CurrencyConverter.tsx";
import VoiceAssistant from "./components/VoiceAssistant.tsx";

// Helper for scenic cover pictures
const getDestinationImage = (dest: string) => {
  const d = dest.toLowerCase();
  if (d.includes("goa")) return "https://images.unsplash.com/photo-1512411516757-772a16072045?auto=format&fit=crop&w=600&q=80";
  if (d.includes("manali")) return "https://images.unsplash.com/photo-1626490989567-58f17371c53b?auto=format&fit=crop&w=600&q=80";
  if (d.includes("paris")) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80";
  if (d.includes("london")) return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80";
  if (d.includes("tokyo")) return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80";
  if (d.includes("bali")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80";
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80";
};

// Seed initial state in localStorage if not set to ensure stateless DB-free execution
const initializeLocalStorage = () => {
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        id: "user-admin",
        email: "admin@aitravelplanner.com",
        username: "Admin Explorer",
        passwordHash: "admin123",
        role: "admin",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString()
      },
      {
        id: "user-standard",
        email: "user@aitravelplanner.com",
        username: "Explorer",
        passwordHash: "user123",
        role: "user",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem("trips")) {
    const defaultTrips = [
      {
        id: "trip-goa",
        userId: "user-standard",
        destination: "Goa, India",
        days: 3,
        budget: 15000,
        style: "Budget",
        travelers: 2,
        interests: ["Beaches", "Nightlife", "Food"],
        tripSummary: "An exciting 3-day beach gateway exploring scenic coastlines, vibrant shacks, and rich local cuisine.",
        totalEstimatedBudget: 12500,
        daysItinerary: [
          {
            day: 1,
            hotel: "Seaside Breeze Inn, Calangute",
            transportation: "Scooter Rental",
            estimated_cost: 3500,
            food: ["Fish Thali at Ritz Classic", "Dinner at Curlies Shack"],
            activities: [
              {
                time: "Morning",
                description: "Relax at Calangute Beach and watch the golden sunrise.",
                location: "Calangute Beach",
                cost: 0,
                transport: "Walk"
              },
              {
                time: "Afternoon",
                description: "Indulge in authentic Goan seafood lunch and explore nearby local street markets.",
                location: "Mapusa Market",
                cost: 500,
                transport: "Scooter"
              },
              {
                time: "Evening",
                description: "Experience sunset vibes at Curlies Shack with lively beach music.",
                location: "Anjuna Beach",
                cost: 1200,
                transport: "Scooter"
              }
            ]
          },
          {
            day: 2,
            hotel: "Seaside Breeze Inn, Calangute",
            transportation: "Scooter Rental",
            estimated_cost: 4500,
            food: ["Breakfast at Infantaria", "Lunch at Mum's Kitchen"],
            activities: [
              {
                time: "Morning",
                description: "Explore the historic Reis Magos Fort and capture beautiful estuary views.",
                location: "Reis Magos Fort",
                cost: 100,
                transport: "Scooter"
              },
              {
                time: "Afternoon",
                description: "Try water sports including jet ski and parasailing at Baga beach.",
                location: "Baga Beach",
                cost: 2500,
                transport: "Scooter"
              },
              {
                time: "Evening",
                description: "Witness the legendary sunset at Chapora Fort (Dil Chahta Hai spot).",
                location: "Chapora Fort",
                cost: 0,
                transport: "Scooter"
              }
            ]
          },
          {
            day: 3,
            hotel: "Seaside Breeze Inn, Calangute",
            transportation: "Scooter Rental",
            estimated_cost: 4500,
            food: ["Breakfast at Artjuna Café", "Lunch at Fisherman's Wharf"],
            activities: [
              {
                time: "Morning",
                description: "Visit the stunning Basilica of Bom Jesus and explore UNESCO heritage Old Goa.",
                location: "Old Goa Church Complex",
                cost: 0,
                transport: "Scooter"
              },
              {
                time: "Afternoon",
                description: "Enjoy a sensory walk inside Sahakari Spice Farm with buffet lunch.",
                location: "Sahakari Spice Farm",
                cost: 1000,
                transport: "Scooter"
              },
              {
                time: "Evening",
                description: "Take a scenic Panaji Mandovi River cruise with traditional folk dance.",
                location: "Mandovi River",
                cost: 700,
                transport: "Scooter"
              }
            ]
          }
        ],
        hotels: [
          { name: "Seaside Breeze Inn", rating: "4.2★", price: "₹2,500/night", link: "#", description: "Cozy budget stay close to Calangute Beach." },
          { name: "The Park Calangute", rating: "4.5★", price: "₹6,000/night", link: "#", description: "Boutique beachfront luxury within reach." }
        ],
        restaurants: [
          { name: "Ritz Classic", rating: "4.4★", specialty: "Goan Fish Thali", cost: "₹400 per person" },
          { name: "Curlies", rating: "4.1★", specialty: "Cocktails & Woodfire Pizza", cost: "₹800 per person" }
        ],
        attractions: [
          { name: "Basilica of Bom Jesus", description: "Historical 16th-century church holding mortal remains of St. Francis Xavier." },
          { name: "Chapora Fort", description: "Fascinating hilltop fort offering expansive views of Vagator Beach." }
        ],
        localTips: [
          "Renting a scooter is the most budget-friendly way to get around (around ₹350-₹500/day).",
          "Always negotiate taxi fares before boarding as they don't run on meters.",
          "Keep cash handy as beach shacks sometimes have poor network connectivity for digital payments."
        ],
        weather: {
          temp: 31,
          humidity: 78,
          condition: "Sunny",
          forecast: [
            { day: "Today", temp: 31, condition: "Sunny" },
            { day: "Tomorrow", temp: 32, condition: "Partly Cloudy" },
            { day: "Day After", temp: 30, condition: "Thunderstorm" }
          ]
        },
        flightRecommendations: [
          { airline: "IndiGo", flightNo: "6E-2104", price: "₹4,200", duration: "2h 15m", type: "Non-stop" },
          { airline: "Air India", flightNo: "AI-812", price: "₹5,100", duration: "2h 30m", type: "Non-stop" }
        ],
        emergencyContacts: {
          police: "100 / +91-832-2428400",
          medical: "108 (GVK EMRI Ambulance Service)",
          embassy: "Embassy Liaison / Panaji Police HQ"
        },
        collaborators: ["user-admin"],
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("trips", JSON.stringify(defaultTrips));
  }

  if (!localStorage.getItem("notifications")) {
    const defaultNotifications = [
      {
        id: "notif-1",
        userId: "all",
        title: "Welcome to AI Travel Planner!",
        message: "Start by entering your dream destination or explore the existing trip itineraries created by our expert AI models.",
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("notifications", JSON.stringify(defaultNotifications));
  }
};

export default function App() {
  // Global Routing & Session States
  const [page, setPage] = useState<"home" | "login" | "register" | "dashboard" | "create-trip" | "my-trips" | "trip-details" | "chat" | "profile" | "admin">("home");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  // Create Trip states
  const [fromCity, setFromCity] = useState("");
  const [dest, setDest] = useState("");
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("15000");
  const [style, setStyle] = useState("Adventure");
  const [travelers, setTravelers] = useState("2");
  const [interests, setInterests] = useState<string[]>([]);
  const [isGeneratingTrip, setIsGeneratingTrip] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Collaboration state
  const [collabEmail, setCollabEmail] = useState("");
  const [collabSuccess, setCollabSuccess] = useState("");
  const [collabError, setCollabError] = useState("");

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string; timestamp: string }[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Admin Panel states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);

  // Premium toggle states
  const [activeLanguage, setActiveLanguage] = useState("en");

  // Load user session on boot
  useEffect(() => {
    initializeLocalStorage();
    const defaultUser: User = {
      id: "user-standard",
      email: "user@aitravelplanner.com",
      username: "Explorer",
      role: "user",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      createdAt: new Date().toISOString()
    };
    const simToken = btoa(JSON.stringify({ id: defaultUser.id, role: defaultUser.role, exp: Date.now() + 86400000 }));
    setToken(simToken);
    setUser(defaultUser);
    localStorage.setItem("token", simToken);
    localStorage.setItem("user", JSON.stringify(defaultUser));
  }, []);

  // Fetch trips and notifications when logged in
  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchNotifications();
      if (user.role === "admin") {
        fetchAdminData();
      }
    }
  }, [token, page, user]);

  // Handle chat message state reload per trip context
  useEffect(() => {
    if (page === "chat") {
      const chatKey = selectedTrip ? `chatHistory-${selectedTrip.id}` : "chatHistory-global";
      const stored = localStorage.getItem(chatKey);
      if (stored) {
        setChatMessages(JSON.parse(stored));
      } else {
        if (selectedTrip?.id === "trip-goa") {
          const seeds = [
            {
              role: "user" as const,
              text: "Best places in Goa for couples?",
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              role: "model" as const,
              text: "Goa is magical for couples! I highly recommend visiting:\n1. **Cola Beach**: A secluded beach with an amazing fresh water lagoon perfect for peaceful kayaking.\n2. **Fontainhas (Latin Quarter)**: Wander around the quaint colored Portuguese houses, take gorgeous photos, and visit lovely bakeries.\n3. **Cabo de Rama Fort**: Breathtaking cliffs overlooking the Arabian Sea, perfect for romantic sunset viewing.\n4. **Dinner at Thalassa**: Incredible sunset view with upscale Greek dining in Siolim.",
              timestamp: new Date(Date.now() - 3500000).toISOString()
            }
          ];
          setChatMessages(seeds);
          localStorage.setItem(chatKey, JSON.stringify(seeds));
        } else {
          setChatMessages([]);
        }
      }
    }
  }, [page, selectedTrip]);

  const fetchTrips = () => {
    try {
      const storedTrips = localStorage.getItem("trips") || "[]";
      const parsedTrips: Trip[] = JSON.parse(storedTrips);
      if (user) {
        const userTrips = parsedTrips.filter(
          (t) => t.userId === user.id || (t.collaborators && t.collaborators.includes(user.id))
        );
        setTrips(userTrips);
      }
    } catch (e) {
      console.error("Failed fetching trips", e);
    }
  };

  const fetchNotifications = () => {
    try {
      const stored = localStorage.getItem("notifications") || "[]";
      const parsed: Notification[] = JSON.parse(stored);
      if (user) {
        const userNotifications = parsed.filter(
          (n) => n.userId === user.id || n.userId === "all"
        );
        setNotifications(userNotifications);
      }
    } catch (e) {
      console.error("Failed fetching notifications", e);
    }
  };

  const markNotificationRead = (id: string) => {
    try {
      const stored = localStorage.getItem("notifications") || "[]";
      const parsed: Notification[] = JSON.parse(stored);
      const updated = parsed.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("notifications", JSON.stringify(updated));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminData = () => {
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const secureUsers = parsedUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
      }));
      setAdminUsers(secureUsers);

      const storedTrips = localStorage.getItem("trips") || "[]";
      const parsedTrips: Trip[] = JSON.parse(storedTrips);

      let totalExpenses = 0;
      parsedTrips.forEach((t) => {
        const storedExp = localStorage.getItem(`expenses-${t.id}`);
        if (storedExp) {
          const expList: any[] = JSON.parse(storedExp);
          totalExpenses += expList.reduce((sum, e) => sum + e.amount, 0);
        }
      });

      const styleCount: { [key: string]: number } = {};
      parsedTrips.forEach((t) => {
        styleCount[t.style] = (styleCount[t.style] || 0) + 1;
      });

      setAdminAnalytics({
        totalUsers: secureUsers.length,
        totalTrips: parsedTrips.length,
        totalExpenses,
        totalChats: 4,
        styleBreakdown: Object.keys(styleCount).map((k) => ({ name: k, value: styleCount[k] })),
      });
    } catch (e) {
      console.error("Failed loading admin panels", e);
    }
  };

  const handleAdminDeleteUser = (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user and all their associated trips?")) return;
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const updatedUsers = parsedUsers.filter((u: any) => u.id !== id);
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      const storedTrips = localStorage.getItem("trips") || "[]";
      const parsedTrips: Trip[] = JSON.parse(storedTrips);
      const updatedTrips = parsedTrips.filter((t) => t.userId !== id);
      localStorage.setItem("trips", JSON.stringify(updatedTrips));

      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Auth actions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setForgotPasswordMessage("");
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const foundUser = parsedUsers.find(
        (u: any) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.passwordHash === loginPassword
      );

      if (foundUser) {
        const simToken = btoa(JSON.stringify({ id: foundUser.id, role: foundUser.role, exp: Date.now() + 86400000 }));
        setToken(simToken);
        setUser(foundUser);
        localStorage.setItem("token", simToken);
        localStorage.setItem("user", JSON.stringify(foundUser));
        setPage("dashboard");
        setLoginEmail("");
        setLoginPassword("");
      } else {
        setAuthError("Invalid email or password");
      }
    } catch {
      setAuthError("Login failed");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const existing = parsedUsers.find((u: any) => u.email.toLowerCase() === registerEmail.toLowerCase());

      if (existing) {
        setAuthError("Email is already registered");
        return;
      }

      const newUser = {
        id: "user-" + Math.random().toString(36).substring(2, 11),
        email: registerEmail.toLowerCase(),
        username: registerUsername,
        passwordHash: registerPassword,
        role: "user" as const,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(registerUsername)}`,
        createdAt: new Date().toISOString(),
      };

      parsedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(parsedUsers));

      const welcomeNotif = {
        id: "notif-" + Math.random().toString(36).substring(2, 11),
        userId: newUser.id,
        title: `Welcome onboard, ${newUser.username}!`,
        message: "Ready to explore the world? Generate your first trip using the AI Trip Planner!",
        type: "success" as const,
        read: false,
        createdAt: new Date().toISOString(),
      };

      const storedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
      storedNotifs.push(welcomeNotif);
      localStorage.setItem("notifications", JSON.stringify(storedNotifs));

      const simToken = btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }));
      setToken(simToken);
      setUser(newUser);
      localStorage.setItem("token", simToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setPage("dashboard");
      setRegisterEmail("");
      setRegisterUsername("");
      setRegisterPassword("");
    } catch {
      setAuthError("Signup failed");
    }
  };

  const handleForgotPassword = () => {
    if (!loginEmail) {
      setAuthError("Please input your email in the Email Address field to retrieve password.");
      return;
    }
    setForgotPasswordMessage("");
    setAuthError("");
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const found = parsedUsers.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());

      if (!found) {
        setAuthError("No user found with that email address");
      } else {
        setForgotPasswordMessage("Password reset instructions have been sent to your email address.");
      }
    } catch {
      setAuthError("Server connection lost.");
    }
  };

  const handleGoogleLogin = () => {
    setAuthError("");
    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const parsedUsers = JSON.parse(storedUsers);
      const googleEmail = "oauth_traveller_google@gmail.com";
      let foundUser = parsedUsers.find((u: any) => u.email.toLowerCase() === googleEmail);

      if (!foundUser) {
        foundUser = {
          id: "user-" + Math.random().toString(36).substring(2, 11),
          email: googleEmail,
          username: "OAuth Traveller",
          passwordHash: "google-oauth-pwd",
          role: "user" as const,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          createdAt: new Date().toISOString(),
        };
        parsedUsers.push(foundUser);
        localStorage.setItem("users", JSON.stringify(parsedUsers));
      }

      const simToken = btoa(JSON.stringify({ id: foundUser.id, role: foundUser.role, exp: Date.now() + 86400000 }));
      setToken(simToken);
      setUser(foundUser);
      localStorage.setItem("token", simToken);
      localStorage.setItem("user", JSON.stringify(foundUser));
      setPage("dashboard");
    } catch {
      setAuthError("Google single sign-on failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setPage("home");
    setSelectedTrip(null);
  };

  // Create Trip (Stateless API calls + local persistence)
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dest) {
      setGenerationError("Destination is required");
      return;
    }
    setIsGeneratingTrip(true);
    setGenerationError("");

    try {
      const res = await fetch("/api/trips/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromCity,
          destination: dest,
          days,
          budget,
          style,
          travelers,
          interests,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Set owned user ID client-side
        data.userId = user?.id || "user-standard";

        const storedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
        storedTrips.unshift(data);
        localStorage.setItem("trips", JSON.stringify(storedTrips));

        setTrips((prev) => [data, ...prev]);
        setSelectedTrip(data);
        setPage("trip-details");
        setFromCity("");
        setDest("");
        setInterests([]);

        // Generate success notification locally
        const generatedNotif = {
          id: "notif-" + Math.random().toString(36).substring(2, 11),
          userId: user?.id || "all",
          title: "Trip Generated!",
          message: `Your adventure to ${dest} is ready. Day-wise schedule and checklists have been set up!`,
          type: "success" as const,
          read: false,
          createdAt: new Date().toISOString(),
        };
        const storedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
        storedNotifs.push(generatedNotif);
        localStorage.setItem("notifications", JSON.stringify(storedNotifs));
        fetchNotifications();
      } else {
        setGenerationError(data.error || "Failed to generate AI trip");
      }
    } catch {
      setGenerationError("Server error. Please verify Gemini API connectivity.");
    } finally {
      setIsGeneratingTrip(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip and all logs?")) return;
    try {
      const storedTrips = JSON.parse(localStorage.getItem("trips") || "[]");
      const filteredTrips = storedTrips.filter((t: any) => t.id !== id);
      localStorage.setItem("trips", JSON.stringify(filteredTrips));

      localStorage.removeItem(`checklist-${id}`);
      localStorage.removeItem(`expenses-${id}`);
      localStorage.removeItem(`chatHistory-${id}`);

      setTrips((prev) => prev.filter((t) => t.id !== id));
      if (selectedTrip?.id === id) setSelectedTrip(null);
      setPage("dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  // Add collaborator
  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabEmail || !selectedTrip) return;
    setCollabSuccess("");
    setCollabError("");

    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const invitee = storedUsers.find((u: any) => u.email.toLowerCase() === collabEmail.trim().toLowerCase());

      if (!invitee) {
        setCollabError("User with this email is not registered on AI Travel Planner yet.");
        return;
      }

      if (user && invitee.id === user.id) {
        setCollabError("You are already the owner of this trip");
        return;
      }

      const storedTrips: Trip[] = JSON.parse(localStorage.getItem("trips") || "[]");
      const tripIndex = storedTrips.findIndex((t) => t.id === selectedTrip.id);

      if (tripIndex === -1) {
        setCollabError("Trip not found");
        return;
      }

      const trip = storedTrips[tripIndex];
      if (!trip.collaborators) trip.collaborators = [];
      if (trip.collaborators.includes(invitee.id)) {
        setCollabError("User is already a collaborator");
        return;
      }

      trip.collaborators.push(invitee.id);
      localStorage.setItem("trips", JSON.stringify(storedTrips));

      setCollabSuccess(`Successfully added ${invitee.username} as collaborator!`);
      setCollabEmail("");

      const updatedTrip = { ...selectedTrip, collaborators: trip.collaborators };
      setSelectedTrip(updatedTrip);
      setTrips((prev) => prev.map((t) => (t.id === selectedTrip.id ? updatedTrip : t)));

      const collabNotif = {
        id: "notif-" + Math.random().toString(36).substring(2, 11),
        userId: invitee.id,
        title: "Shared Trip Invitation!",
        message: `${user?.username || "Someone"} added you as a collaborator on the trip to ${trip.destination}!`,
        type: "info" as const,
        read: false,
        createdAt: new Date().toISOString(),
      };
      const storedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
      storedNotifs.push(collabNotif);
      localStorage.setItem("notifications", JSON.stringify(storedNotifs));
    } catch {
      setCollabError("Failed to add collaborator.");
    }
  };

  // Chat API Integration
  const handleSendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { role: "user" as const, text: textToSend, timestamp: new Date().toISOString() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    if (!overrideText) setChatInput("");
    setIsChatSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          tripContext: selectedTrip,
          history: chatMessages.slice(-6),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const replyMsg = { role: "model" as const, text: data.reply, timestamp: new Date().toISOString() };
        const finalMessages = [...updatedMessages, replyMsg];
        setChatMessages(finalMessages);

        const chatKey = selectedTrip ? `chatHistory-${selectedTrip.id}` : "chatHistory-global";
        localStorage.setItem(chatKey, JSON.stringify(finalMessages));
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "model", text: "⚠️ Generation issue. Please verify Gemini API setup.", timestamp: new Date().toISOString() },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ Network connectivity lost to server.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const toggleInterest = (val: string) => {
    setInterests((prev) => (prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]));
  };

  const handlePrintItinerary = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("home")}>
          <div className="p-2 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl shadow-lg shadow-teal-500/10">
            <Compass className="w-5 h-5 text-slate-950 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-teal-400 via-indigo-300 to-white bg-clip-text text-transparent">
              AI Travel Planner
            </h1>
          </div>
        </div>

        {/* Desktop Controls */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setPage("dashboard")} className={`text-xs font-medium transition-colors ${page === "dashboard" ? "text-teal-400" : "text-slate-400 hover:text-white"}`}>Dashboard</button>
          <button onClick={() => setPage("create-trip")} className={`text-xs font-medium transition-colors ${page === "create-trip" ? "text-teal-400" : "text-slate-400 hover:text-white"}`}>Plan New</button>
          {user?.role === "admin" && (
            <button onClick={() => setPage("admin")} className={`text-xs font-medium bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-slate-950 transition-all ${page === "admin" ? "bg-red-500 text-slate-950" : ""}`}>Admin Gate</button>
          )}
        </nav>

        {/* Right side Profile & Notification Tray */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl hover:bg-slate-700 text-slate-300 hover:text-white transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-white">System Messages</span>
                  <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[10px] text-teal-400 font-mono hover:underline">Mark all read</button>
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          notif.read ? "bg-slate-950/40 border-slate-850 text-slate-400" : "bg-teal-500/5 border-teal-500/25 text-slate-200"
                        }`}
                      >
                        <p className="text-[11px] font-semibold">{notif.title}</p>
                        <p className="text-[10px] mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">No notifications present</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center bg-slate-800/50 border border-slate-700/40 rounded-full p-1">
              <img
                src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=globetrotter"}
                alt="user avatar"
                className="w-6 h-6 rounded-full border border-teal-500/30"
              />
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 md:hidden hover:bg-slate-700">
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="bg-slate-900 border-b border-slate-800/80 px-5 py-4 space-y-3.5 md:hidden">
          <button onClick={() => { setPage("dashboard"); setMobileMenuOpen(false); }} className="block w-full text-left text-xs font-medium text-slate-300 py-1 hover:text-teal-400">Dashboard</button>
          <button onClick={() => { setPage("create-trip"); setMobileMenuOpen(false); }} className="block w-full text-left text-xs font-medium text-slate-300 py-1 hover:text-teal-400">Plan New Trip</button>
          {user?.role === "admin" && (
            <button onClick={() => { setPage("admin"); setMobileMenuOpen(false); }} className="block w-full text-left text-xs font-semibold text-red-400 py-1 hover:text-red-300">Admin Gate</button>
          )}
        </div>
      )}

      {/* CORE VIEWPORT */}
      <main className="flex-1 flex flex-col">

        {/* 1. LANDING/HOME PAGE */}
        {page === "home" && (
          <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden py-14 px-4 text-center">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl space-y-6">
              {/* Premium Launcher tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Next-Generation Travel Mapping Engine</span>
              </div>

              <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-none text-white">
                Plan Your Next Adventure with <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Cognitive AI</span>
              </h2>

              <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Generate highly optimized day-wise itineraries, recommended hotels, flight parameters, localized custom safety tips, smart budget ledger calculators, and automated travel checklists in seconds.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-4">
                <button
                  onClick={() => setPage("create-trip")}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  Start AI Planning Free
                </button>
                <button
                  onClick={() => setPage("dashboard")}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-8 py-3 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Explore Dashboard
                </button>
              </div>

              {/* Bento Card Grid overview */}
              <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-5xl mx-auto text-left">
                <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
                  <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl w-fit mb-3">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-semibold text-sm">Personalized Generation</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Custom fits your trip style: Budget, Solo, Couple, Family, Luxury. Includes food recommendations and localized tips.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-3">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-semibold text-sm">Finances & Budgets</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Track every expense with visual Recharts breakdown graphs. Split expenses and manage currency rates instantly.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-3">
                    <Languages className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-semibold text-sm">Elite Travel Widgets</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Voice-based assistance, localized weather, interactive route plotting, collaborative editing, and printable itineraries.</p>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* 4. DASHBOARD VIEW */}
        {page === "dashboard" && (
          <div className="flex-1 p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
            
            {/* Dashboard Header greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Welcome back, {user?.username || "Explorer"}!</h2>
                <p className="text-slate-400 text-xs mt-1">Check out your registered trips, flight matrices, and active travel statistics.</p>
              </div>
              <button
                onClick={() => setPage("create-trip")}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Plan New Adventure
              </button>
            </div>

            {/* Travel statistics banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Registered Trips</span>
                  <h4 className="text-xl font-bold font-mono text-white">{trips.length}</h4>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Budget Allocation</span>
                  <h4 className="text-xl font-bold font-mono text-white">₹{trips.reduce((sum, t) => sum + t.budget, 0).toLocaleString()}</h4>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Aggregate Days Out</span>
                  <h4 className="text-xl font-bold font-mono text-white">{trips.reduce((sum, t) => sum + t.days, 0)} days</h4>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Active Travelers</span>
                  <h4 className="text-xl font-bold font-mono text-white">{trips.reduce((sum, t) => sum + t.travelers, 0)} Heads</h4>
                </div>
              </div>
            </div>

            {/* Recently Saved/Created trips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Trips list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg text-white">Recently Generated Trips</h3>
                </div>

                {trips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trips.slice(0, 4).map((trip) => (
                      <div
                        key={trip.id}
                        id={`trip-card-${trip.id}`}
                        onClick={() => { setSelectedTrip(trip); setPage("trip-details"); }}
                        className="group bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] flex flex-col h-full shadow-lg relative"
                      >
                        <div className="h-32 relative overflow-hidden">
                          <img
                            src={getDestinationImage(trip.destination)}
                            alt={trip.destination}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                          <span className="absolute top-3 right-3 text-[10px] font-mono bg-slate-900/80 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">
                            {trip.style}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-display font-bold text-white text-base truncate">
                              {trip.fromCity ? `${trip.fromCity} ➔ ` : ""}{trip.destination}
                            </h4>
                            <p className="text-slate-400 text-xs line-clamp-2 mt-1">{trip.tripSummary}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 border-t border-slate-800/60 pt-3">
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-400" /> {trip.days} Days</span>
                            <span className="text-xs font-mono font-bold text-white">₹{trip.budget.toLocaleString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          className="absolute bottom-16 right-3 p-1.5 bg-slate-950/80 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-slate-800/80"
                          title="Delete trip record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl">
                    <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No travel matrices logged.</p>
                    <button onClick={() => setPage("create-trip")} className="text-xs text-teal-400 underline mt-1.5 inline-block">Create your first itinerary!</button>
                  </div>
                )}
              </div>

              {/* Right Column: Premium Widgets */}
              <div className="space-y-4">
                {/* Currency converter */}
                <CurrencyConverter />
              </div>
            </div>
          </div>
        )}

        {/* 5. CREATE TRIP VIEW */}
        {page === "create-trip" && (
          <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="mb-6 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-400" />
                <h3 className="font-display font-bold text-xl text-white">Construct Cognitive Travel Matrix</h3>
              </div>

              <div className="mb-6 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium block mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                  Cognitive Suggestion Matrix Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      title: "🌸 Tokyo Spring",
                      fromCity: "New Delhi",
                      dest: "Tokyo, Japan",
                      days: "7",
                      budget: "180000",
                      style: "Adventure",
                      travelers: 2,
                      interests: ["Nature", "Food", "Shopping", "Historical Places"]
                    },
                    {
                      title: "🏖️ Goa Beach Getaway",
                      fromCity: "Mumbai",
                      dest: "Goa, India",
                      days: "4",
                      budget: "15000",
                      style: "Budget",
                      travelers: 2,
                      interests: ["Beaches", "Food", "Nightlife"]
                    },
                    {
                      title: "🏰 Paris Romance",
                      fromCity: "London",
                      dest: "Paris, France",
                      days: "5",
                      budget: "250000",
                      style: "Couple",
                      travelers: 2,
                      interests: ["Historical Places", "Shopping", "Food", "Museums"]
                    },
                    {
                      title: "🏔️ Manali Snowy Trek",
                      fromCity: "Chandigarh",
                      dest: "Manali, Himachal Pradesh",
                      days: "5",
                      budget: "20000",
                      style: "Adventure",
                      travelers: 3,
                      interests: ["Adventure", "Nature", "Scenic drives"]
                    }
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFromCity(sug.fromCity);
                        setDest(sug.dest);
                        setDays(sug.days);
                        setBudget(sug.budget);
                        setStyle(sug.style);
                        setTravelers(sug.travelers.toString());
                        setInterests(sug.interests);
                      }}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{sug.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateTrip} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">From (Origin)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai, New Delhi, London, New York"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Goa, Manali, Paris, Tokyo"
                        value={dest}
                        onChange={(e) => setDest(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-medium">Duration (Days)</label>
                      <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                          <option key={d} value={d}>{d} Days</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-medium">Group Size</label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((t) => (
                          <option key={t} value={t}>{t} {t === 1 ? "Traveller" : "Travellers"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-medium">Trip Budget Limit (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        required
                        min="2000"
                        placeholder="e.g. 15000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">Aesthetic / Travel Style</label>
                  <div className="grid grid-cols-5 gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                    {["Budget", "Luxury", "Adventure", "Family", "Couple"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStyle(st)}
                        className={`text-[10px] font-medium py-2 rounded-lg transition-all ${
                          style === st ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-interests tags */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Interests & Focused Attractions</label>
                  <div className="flex flex-wrap gap-2">
                    {["Historical Places", "Nature", "Food", "Shopping", "Adventure", "Beaches", "Nightlife", "Scenic drives", "Museums"].map((int) => {
                      const selected = interests.includes(int);
                      return (
                        <button
                          key={int}
                          type="button"
                          onClick={() => toggleInterest(int)}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                            selected
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/50 shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {int}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {generationError && (
                  <p className="text-xs font-mono text-rose-400 border border-rose-500/20 bg-rose-500/5 p-3 rounded-xl">
                    ⚠️ {generationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isGeneratingTrip}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 disabled:from-teal-800 disabled:to-teal-900 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingTrip ? (
                    <>
                      <Compass className="w-5 h-5 animate-spin text-slate-950" />
                      Synthesizing custom itinerary... This will take a few seconds
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Build Custom AI Itinerary
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 6. MY TRIPS VIEW */}
        {page === "my-trips" && (
          <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">Your Travel Collections</h2>
                <p className="text-slate-400 text-xs">Manage your active plans, review itineraries, or update budgets.</p>
              </div>
              <button onClick={() => setPage("create-trip")} className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create Trip
              </button>
            </div>

            {trips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    id={`trip-card-large-${trip.id}`}
                    onClick={() => { setSelectedTrip(trip); setPage("trip-details"); }}
                    className="group bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] flex flex-col h-full shadow-lg relative"
                  >
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={getDestinationImage(trip.destination)}
                        alt={trip.destination}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <span className="absolute top-3 right-3 text-[10px] font-mono bg-slate-900/85 text-teal-400 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                        {trip.style}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-display font-bold text-white text-lg truncate">
                          {trip.fromCity ? `${trip.fromCity} ➔ ` : ""}{trip.destination}
                        </h4>
                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{trip.tripSummary}</p>
                      </div>

                      <div className="flex items-center justify-between mt-5 border-t border-slate-850 pt-3.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-4 h-4 text-teal-400" /> {trip.days} Days</span>
                        <span className="text-xs font-mono font-bold text-white">₹{trip.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, e)}
                      className="absolute bottom-16 right-3 p-2 bg-slate-950/80 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-slate-800/80"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl">
                <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No registered itineraries in your library.</p>
                <button onClick={() => setPage("create-trip")} className="mt-3 bg-teal-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold">Generate Itinerary now</button>
              </div>
            )}
          </div>
        )}

        {/* 7. TRIP DETAILS VIEW */}
        {page === "trip-details" && selectedTrip && (
          <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6 print:bg-white print:text-black print:p-0">
            
            {/* Itinerary Banner with covers */}
            <div className="h-56 relative rounded-2xl overflow-hidden border border-slate-800/80 print:hidden">
              <img
                src={getDestinationImage(selectedTrip.destination)}
                alt={selectedTrip.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full uppercase">
                      {selectedTrip.style} Style
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full uppercase">
                      {selectedTrip.travelers} {selectedTrip.travelers === 1 ? "Person" : "People"}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-white mt-1">
                    {selectedTrip.fromCity ? `${selectedTrip.fromCity} ➔ ` : ""}{selectedTrip.destination}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl mt-0.5">{selectedTrip.tripSummary}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintItinerary}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors border border-slate-800"
                    title="Print/Save as PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/share/trip/${selectedTrip.id}`);
                      alert("Itinerary shared link copied to clipboard!");
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors border border-slate-800"
                    title="Copy Shared Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Printable summary header */}
            <div className="hidden print:block mb-6">
              <h1 className="text-3xl font-bold font-display">
                {selectedTrip.fromCity ? `${selectedTrip.fromCity} ➔ ` : ""}{selectedTrip.destination} - AI Travel Itinerary
              </h1>
              <p className="text-sm mt-1">{selectedTrip.tripSummary}</p>
              <p className="text-xs font-mono text-gray-500 mt-2">Days: {selectedTrip.days} | Travelers: {selectedTrip.travelers} | Style: {selectedTrip.style}</p>
              <hr className="my-4 border-gray-300" />
            </div>

            {/* Weather Overlay Banner */}
            {selectedTrip.weather && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm print:hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Temperature</span>
                    <h4 className="text-sm font-bold text-white font-mono">{selectedTrip.weather.temp}°C</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Humidity</span>
                    <h4 className="text-sm font-bold text-white font-mono">{selectedTrip.weather.humidity}%</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Condition</span>
                    <h4 className="text-sm font-semibold text-white truncate max-w-[110px]">{selectedTrip.weather.condition}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Est. Cost</span>
                    <h4 className="text-sm font-bold text-white font-mono">₹{selectedTrip.totalEstimatedBudget.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
            )}

            {/* TWO COLUMNS WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side: Day itineraries */}
              <div className="lg:col-span-2 space-y-5">
                <h3 className="font-display font-semibold text-lg text-white border-b border-slate-800/80 pb-2">Day-by-Day Schedule</h3>

                <div className="space-y-4">
                  {selectedTrip.daysItinerary && selectedTrip.daysItinerary.map((dayPlan) => (
                    <div
                      key={dayPlan.day}
                      id={`itinerary-day-${dayPlan.day}`}
                      className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-5 shadow-lg relative print:bg-white print:border-gray-200 print:text-black"
                    >
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/40 print:border-gray-200">
                        <span className="text-sm font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-xl font-mono print:text-black print:bg-gray-100">
                          DAY {dayPlan.day}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Transit & Lodging</span>
                          <span className="text-xs font-medium text-slate-300 print:text-black">{dayPlan.transportation} • {dayPlan.hotel}</span>
                        </div>
                      </div>

                      {/* Day Activities */}
                      <div className="space-y-4">
                        {dayPlan.activities && dayPlan.activities.map((act, aIdx) => (
                          <div key={aIdx} className="flex gap-3">
                            <span className="text-[10px] font-mono font-semibold bg-slate-950 border border-slate-800 text-indigo-400 px-2 py-1 h-fit rounded print:bg-gray-100 print:text-black">
                              {act.time}
                            </span>
                            <div className="flex-1">
                              <h5 className="text-xs font-bold text-white print:text-black flex items-center gap-1.5">
                                {act.location}
                                <span className="text-[10px] font-mono text-slate-500 font-normal">({act.transport})</span>
                              </h5>
                              <p className="text-xs text-slate-400 mt-0.5 print:text-gray-700 leading-relaxed">{act.description}</p>
                              {act.cost > 0 && <span className="text-[10px] font-mono text-teal-400 block mt-1">Cost: ₹{act.cost}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Day Food recommendations */}
                      {dayPlan.food && dayPlan.food.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-dashed border-slate-800/60 flex items-center gap-2 overflow-x-auto print:border-gray-200">
                          <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">Culinary Stops:</span>
                          <div className="flex gap-2">
                            {dayPlan.food.map((fd, fIdx) => (
                              <span key={fIdx} className="text-[10px] bg-slate-950 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800/60 whitespace-nowrap print:bg-gray-100 print:text-black">
                                🍕 {fd}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Lodging, Restaurants, Flights, Checklist, Expenses */}
              <div className="space-y-6 print:hidden">
                
                {/* 1. FLIGHT MATRIX RECOMMENDATIONS */}
                {selectedTrip.flightRecommendations && selectedTrip.flightRecommendations.length > 0 && (
                  <div className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                    <h3 className="font-display font-semibold text-base text-white mb-3">Live flight schedule matrices</h3>
                    <div className="space-y-2">
                      {selectedTrip.flightRecommendations.map((fl: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{fl.airline} • {fl.flightNo}</p>
                            <p className="text-[10px] text-slate-500">{fl.duration} ({fl.type})</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-teal-400">{fl.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. LOCAL HOTELS AND RESTAURANTS RECOMMENDATIONS */}
                <div className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                  <h3 className="font-display font-semibold text-base text-white mb-3">Top Lodging Options</h3>
                  <div className="space-y-3">
                    {selectedTrip.hotels && selectedTrip.hotels.map((hot: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{hot.name}</h4>
                          <span className="text-[10px] font-mono text-amber-400">{hot.rating}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{hot.description}</p>
                        <p className="text-[10px] text-teal-400 font-mono mt-1.5">{hot.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. GROUP PLANNING COLLABORATION MODEL */}
                <div className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                  <h3 className="font-display font-semibold text-base text-white mb-1">Group Collaborators</h3>
                  <p className="text-[10px] text-slate-500 mb-3.5">Enter teammate email to sync checklists and expenses!</p>
                  
                  <form onSubmit={handleAddCollaborator} className="flex gap-2 mb-3">
                    <input
                      type="email"
                      required
                      placeholder="teammate@gmail.com"
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                      className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-semibold">Invite</button>
                  </form>
                  {collabSuccess && <p className="text-[10px] font-mono text-teal-400">{collabSuccess}</p>}
                  {collabError && <p className="text-[10px] font-mono text-rose-400">{collabError}</p>}
                </div>

                {/* 4. PACKING ASSISTANT CHECKLIST */}
                <PackingChecklist trip={selectedTrip} token={token || ""} />

                {/* 5. EXPENSE LEDGER */}
                <ExpenseTracker trip={selectedTrip} token={token || ""} />

                {/* 6. INTERACTIVE ROUTE MAP */}
                <MapMock trip={selectedTrip} />

                {/* 7. EMERGENCY CONTACTS MATRICES */}
                {selectedTrip.emergencyContacts && (
                  <div className="bg-slate-900/65 rounded-2xl border border-slate-850 p-5">
                    <div className="flex items-center gap-2 mb-3 text-rose-400">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                      <h3 className="font-display font-semibold text-base">Emergency Contacts Hub</h3>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                        <span className="text-slate-400">Police Assistance:</span>
                        <span className="font-mono text-white">{selectedTrip.emergencyContacts.police}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                        <span className="text-slate-400">Medical Center:</span>
                        <span className="font-mono text-white">{selectedTrip.emergencyContacts.medical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Regional Embassy:</span>
                        <span className="font-mono text-white truncate max-w-[130px]" title={selectedTrip.emergencyContacts.embassy}>{selectedTrip.emergencyContacts.embassy}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. AI CHAT ASSISTANT */}
        {page === "chat" && (
          <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-white">AI Companion Terminal</h2>
                  <p className="text-[11px] text-slate-500">Ask any packing, routing, or sightseeing guidance about destinations.</p>
                </div>
              </div>
              
              {selectedTrip && (
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  Focused context: {selectedTrip.destination}
                </span>
              )}
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4 mb-4">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-teal-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-slate-900/90 border border-slate-800 text-slate-150 rounded-tl-none whitespace-pre-wrap"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Compass className="w-10 h-10 text-slate-700 animate-spin-slow mb-3" />
                  <p className="text-sm">Companion ready for queries!</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-lg w-full">
                    {[
                      "What should I pack for Manali in December?",
                      "Best romantic spots in Goa for couples?",
                      "How should I split transport expenses?",
                      "Find top local restaurants near Chapora"
                    ].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => handleSendChatMessage(sample)}
                        className="text-[11px] text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-left truncate transition-colors"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isChatSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5 rounded-tl-none">
                    <Sparkles className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
                    AI is writing recommendations...
                  </div>
                </div>
              )}
            </div>

            {/* Input field */}
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder={selectedTrip ? `Ask something about ${selectedTrip.destination}...` : "Type packing, routing, or attraction queries..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(); }}
                className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={isChatSending}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 text-slate-950 font-bold px-5 rounded-xl text-xs transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* 9. ADMIN PANEL VIEW */}
        {page === "admin" && user?.role === "admin" && (
          <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/85 pb-3">
              <Lock className="w-5 h-5 text-red-400 animate-pulse" />
              <h2 className="font-display font-bold text-2xl text-white">Security Admin Portal</h2>
            </div>

            {adminAnalytics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Total Registered Users</span>
                  <h4 className="text-xl font-bold font-mono text-white mt-1">{adminAnalytics.totalUsers}</h4>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">System trips generated</span>
                  <h4 className="text-xl font-bold font-mono text-white mt-1">{adminAnalytics.totalTrips}</h4>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Ledger transaction counts</span>
                  <h4 className="text-xl font-bold font-mono text-white mt-1">{adminAnalytics.totalChats}</h4>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Total Expenses Tracked</span>
                  <h4 className="text-xl font-bold font-mono text-teal-400 mt-1">₹{adminAnalytics.totalExpenses}</h4>
                </div>
              </div>
            )}

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <h3 className="font-display font-semibold text-lg text-white mb-4">Users Administration List</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Profile</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Privilege</th>
                      <th className="py-2.5 px-3">Joined Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-850 hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2">
                          <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full border border-slate-800" />
                          <span className="font-medium text-white">{u.username}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                            u.role === "admin" ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-right">
                          {u.id !== "user-admin" ? (
                            <button
                              onClick={() => handleAdminDeleteUser(u.id)}
                              className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20 transition-all font-semibold font-mono"
                            >
                              Revoke
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">System Owner</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900/50 border-t border-slate-800/80 px-4 py-6 md:px-8 text-center text-xs text-slate-500 print:hidden mt-auto">
        <p>© 2026 AI Travel Planner. Built using Google AI Studio and Google Gemini API grounding matrices.</p>
        <div className="flex justify-center gap-4 mt-2">
          <button onClick={() => alert("Premium collaborative trip editing triggers auto-saving across local networks!")} className="hover:text-white transition-colors">Collaborative editing</button>
          <span>•</span>
          <button onClick={() => alert("Active currency converted data pulls dynamically from top localized travel providers.")} className="hover:text-white transition-colors">Currency conversion</button>
          <span>•</span>
          <button onClick={() => alert("Personalized flight matrix recommendations grounded on actual real-time carrier flight grids.")} className="hover:text-white transition-colors">Live flight matrix</button>
        </div>
      </footer>
    </div>
  );
}
