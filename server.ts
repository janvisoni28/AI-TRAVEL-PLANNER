import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GeminiService } from "./server/geminiService.js";
import { errorHandler } from "./server/errorMiddleware.js";

// Helper for unique ID generation
const generateId = () => Math.random().toString(36).substring(2, 11);

// Token verification for stateless authentication
function verifyToken(token: string): { id: string; email: string; username: string; role: "user" | "admin" } | null {
  try {
    const payloadStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express body parsers
  app.use(express.json());

  // ==========================================
  // TRIP PLANNER APIS (STATELESS GEMINI CALLS)
  // ==========================================

  app.post("/api/trips/create", authenticateToken, async (req: any, res, next) => {
    const { fromCity, destination, days, budget, style, travelers, interests } = req.body;

    if (!destination || !days || !budget) {
      return res.status(400).json({ error: "Destination, days, and budget are required" });
    }

    try {
      // Craft the ultimate structured prompt
      const prompt = `
Generate a highly detailed, personalized travel itinerary for:
Starting Location / Origin: ${fromCity || "Unspecified"}
Destination: ${destination}
Days: ${days} (generate exactly ${days} days inside the 'days' array)
Budget limit: ${budget}
Travel Style: ${style || "Adventure"}
Travelers: ${travelers || 1}
Interests: ${(interests || []).join(", ") || "Nature, History, Local Food"}

Return a JSON object conforming strictly to the following schema:
{
  "tripSummary": "Brief overview of the trip's tone and theme",
  "totalEstimatedBudget": 15000,
  "daysItinerary": [
    {
      "day": 1,
      "hotel": "Name of highly rated recommended hotel",
      "transportation": "Primary suggested transport for the day (e.g., local cab, rental bike)",
      "estimated_cost": 3000,
      "food": [
        "Specialty local breakfast at Cafe Name",
        "Classic lunch spot offering traditional regional food",
        "Atmospheric dinner recommendation"
      ],
      "activities": [
        {
          "time": "Morning",
          "description": "Engaging description of morning sight or activity",
          "location": "Name of exact spot/monument",
          "cost": 500,
          "transport": "Cab / Metro / Foot"
        },
        {
          "time": "Afternoon",
          "description": "Engaging description of afternoon activity",
          "location": "Name of spot",
          "cost": 1000,
          "transport": "Cab"
        },
        {
          "time": "Evening",
          "description": "Unwind activity, market walks, or sunset point",
          "location": "Name of spot",
          "cost": 400,
          "transport": "Walk"
        }
      ]
    }
  ],
  "hotels": [
    { "name": "Hotel Name", "rating": "4.5★", "price": "₹3,500/night", "link": "#", "description": "Short explanation why it fits this user style and budget" }
  ],
  "restaurants": [
    { "name": "Restaurant Name", "rating": "4.3★", "specialty": "Dish Specialty", "cost": "₹500 per person" }
  ],
  "attractions": [
    { "name": "Attraction Name", "description": "Interesting historical or cultural detail about this attraction" }
  ],
  "localTips": [
    "Tip 1 about cultural etiquette or bargaining.",
    "Tip 2 about clothing, travel times, or safety guides."
  ],
  "weather": {
    "temp": 28,
    "humidity": 65,
    "condition": "Pleasant and Sunny",
    "forecast": [
      { "day": "Day 1", "temp": 28, "condition": "Sunny" },
      { "day": "Day 2", "temp": 29, "condition": "Clear" }
    ]
  },
  "flightRecommendations": [
    { "airline": "IndiGo", "flightNo": "6E-304", "price": "₹4,500", "duration": "2h 30m", "type": "Non-stop" },
    { "airline": "SpiceJet", "flightNo": "SG-188", "price": "₹4,800", "duration": "2h 45m", "type": "Non-stop" }
  ],
  "emergencyContacts": {
    "police": "100 or local emergency equivalent",
    "medical": "102 or reputable hospital number",
    "embassy": "Local regional assistance bureau or consulate info"
  }
}

Use the actual country's local currency symbol or '₹' for Indian Rupees, or '$' if international, matching the destination and budget constraint.
Keep the budget mathematically within the user's limit of ${budget}. Ensure to write creative, helpful descriptions without generic markers.
`;

      const response = await GeminiService.generateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
        promptDescription: "Itinerary generation for " + destination,
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini API");
      }

      // Parse JSON
      const parsedTrip = JSON.parse(responseText.trim());

      // Create new trip structure
      const newTrip = {
        id: "trip-" + generateId(),
        userId: req.user.id,
        fromCity: fromCity || "",
        destination,
        days: parseInt(days),
        budget: parseInt(budget),
        style: style || "Adventure",
        travelers: parseInt(travelers || 1),
        interests: interests || [],
        tripSummary: parsedTrip.tripSummary || "Your perfect vacation in " + destination,
        totalEstimatedBudget: parsedTrip.totalEstimatedBudget || parseInt(budget) * 0.8,
        daysItinerary: parsedTrip.daysItinerary || [],
        hotels: parsedTrip.hotels || [],
        restaurants: parsedTrip.restaurants || [],
        attractions: parsedTrip.attractions || [],
        localTips: parsedTrip.localTips || [],
        weather: parsedTrip.weather || {
          temp: 26,
          humidity: 60,
          condition: "Sunny",
          forecast: [{ day: "Day 1", temp: 26, condition: "Sunny" }],
        },
        flightRecommendations: parsedTrip.flightRecommendations || [],
        emergencyContacts: parsedTrip.emergencyContacts || {
          police: "112 / 100",
          medical: "102 / 108",
          embassy: "Nearest Consular Office",
        },
        collaborators: [],
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(newTrip);
    } catch (error: any) {
      next(error);
    }
  });

  // ==========================================
  // AI CHAT ASSISTANT (STATELESS PROXY)
  // ==========================================

  app.post("/api/chat", authenticateToken, async (req: any, res, next) => {
    const { message, tripContext, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      // System instruction explaining they are the AI Travel Assistant
      const systemInstruction = `
You are the AI Travel Assistant for "AI Travel Planner" - an elite full-stack web application.
Your tone is incredibly helpful, adventurous, warm, and highly professional.
Whenever the user asks questions about destinations, packing, attractions, budgets, weather, local customs, or hidden gems, answer comprehensively using formatted markdown.
If a trip context is provided, align your answer specifically to their planned itinerary details.
Try to provide actual practical tips (e.g. currency, travel adapters, safety warnings, emergency numbers, specific local phrases).
`;

      const contentsPayload: any[] = [];

      // Add context about their current trip if they are looking at one
      if (tripContext) {
        contentsPayload.push({
          role: "user",
          parts: [{ text: `CONTEXT TRIP: This is the trip I am currently viewing:\nDestination: ${tripContext.destination}, Style: ${tripContext.style}, Budget: ${tripContext.budget}, Travelers: ${tripContext.travelers}, Itinerary Summary: ${tripContext.tripSummary}` }]
        });
        contentsPayload.push({
          role: "model",
          parts: [{ text: `Understood! I will use the trip context for ${tripContext.destination} to personalize all answers and offer the finest recommendations.` }]
        });
      }

      // Add actual history if provided from the client side
      if (history && Array.isArray(history)) {
        for (const hist of history) {
          contentsPayload.push({
            role: hist.role === "user" ? "user" : "model",
            parts: [{ text: hist.text }],
          });
        }
      }

      // Add current message
      contentsPayload.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await GeminiService.generateContent({
        contents: contentsPayload,
        config: {
          systemInstruction,
        },
        promptDescription: "Chat assistance",
      });

      const replyText = response.text || "I am here to help you plan your incredible journey!";

      res.json({ reply: replyText });
    } catch (error: any) {
      next(error);
    }
  });

  // Global Error Handler Middleware (placed after API routes)
  app.use(errorHandler);

  // ==========================================
  // VITE DEV SERVER OR STATIC SERVING MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
