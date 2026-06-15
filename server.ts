import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
const DATABASE_PATH = path.join(process.cwd(), "DatabaseUser.json");

app.use(express.json());

// Helper to read users from the local database
function readUsers(): any[] {
  try {
    if (!fs.existsSync(DATABASE_PATH)) {
      fs.writeFileSync(DATABASE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATABASE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading from DatabaseUser.json:", error);
    return [];
  }
}

// Helper to write users to the local database
function writeUsers(users: any[]): boolean {
  try {
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to DatabaseUser.json:", error);
    return false;
  }
}

// REST Endpoint: Register new user
app.post("/api/register", (req, res) => {
  try {
    const { username, password, givenName, familyName, email } = req.body;

    if (!username || !password || !givenName || !familyName || !email) {
      return res.status(400).json({ error: "Missing required registration inputs" });
    }

    const users = readUsers();
    const exists = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (exists) {
      return res.status(400).json({ error: "Username is already registered" });
    }

    const emailExists = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const firstLetter = givenName ? givenName.trim().charAt(0).toUpperCase() : 'U';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const passportNumber = `${firstLetter}${randomDigits}`;

    const newUser = {
      username,
      password, // In a real production system we would pass this through bcrypt
      givenName,
      familyName,
      email,
      passportNumber,
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    const success = writeUsers(users);

    if (success) {
      return res.json({ success: true, user: { username, givenName, familyName, email, passportNumber } });
    } else {
      return res.status(500).json({ error: "Failed to persist user to local database" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred during registration" });
  }
});

// REST Endpoint: Login
app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const users = readUsers();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password credentials" });
    }

    return res.json({
      success: true,
      user: {
        username: user.username,
        givenName: user.givenName,
        familyName: user.familyName,
        email: user.email || "",
        passportNumber: user.passportNumber || `${user.givenName ? user.givenName.charAt(0).toUpperCase() : 'U'}${Math.floor(1000 + Math.random() * 9000)}`
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred during login" });
  }
});

// Initialize Gemini client using process.env.GEMINI_API_KEY if present
const ai_key = process.env.GEMINI_API_KEY;
const ai = ai_key ? new GoogleGenAI({
  apiKey: ai_key,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
}) : null;

// RapidAPI News Fallbacks (Exclusive Formula 1 racing visuals, no roadcars or lamborghinis)
function getFallbackRapidAPINews() {
  return [
    {
      title: "Verstappen Targets Performance Recovery & Floor Upgrades",
      url: "https://www.autosport.com",
      description: "Max Verstappen and Red Bull Racing are working on floor upgrade adjustments to resolve persistent balance issues experienced in recent sessions.",
      date: "Today",
      imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=400",
      source: "Motorsport.com"
    },
    {
      title: "Mercedes Introduces Major Cooling Package for Summer Heats",
      url: "https://www.autosport.com",
      description: "The team has brought optimized sidepods and engine cover ducts to combat extreme temperatures and maintain performance.",
      date: "Today",
      imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400",
      source: "Autosport"
    },
    {
      title: "Ferrari Shifts Focus to Suspension Upgrades for Tire Management",
      url: "https://www.skysports.com/f1",
      description: "Scuderia Ferrari aims to solve long-run tire degradation by introducing an updated front suspended geometry.",
      date: "Yesterday",
      imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=400",
      source: "Sky Sports F1"
    },
    {
      title: "McLaren Optimistic of Closing Constructors' Championship Gap",
      url: "https://www.bbc.com/sport",
      description: "With consecutive podiums, Andrea Stella believes both Lando Norris and Oscar Piastri can frequently challenge for race victories.",
      date: "2 days ago",
      imageUrl: "https://images.unsplash.com/photo-1627448831828-4f81014e76d9?auto=format&fit=crop&q=80&w=400",
      source: "BBC Sport"
    },
    {
      title: "Audi Outlines Long-Term Strategy for 2026 Power Unit Integration",
      url: "https://www.formula1.com",
      description: "As development ramp-ups continue, Audi confirms testing schedules for their fully synthetic fuel-compatible V6 hybrid setup.",
      date: "3 days ago",
      imageUrl: "https://images.unsplash.com/photo-1617469167446-80e3a58e632c?auto=format&fit=crop&q=80&w=400",
      source: "Formula1.com"
    }
  ];
}

// Search Grounding News Fallbacks
function getFallbackGroundingNews() {
  return [
    {
      title: "Championship Battle Intensifies as McLaren and Ferrari Close Gap",
      summary: "With consecutive podium finishes, McLaren and Ferrari are rapidly chipping away at Red Bull's lead in the Constructors' standings.",
      source: "Reputable Outlets",
      url: "https://www.formula1.com"
    },
    {
      title: "Hamilton Previews Ferrari Transition as Focus Shifts to 2026 Car Setup",
      summary: "Lewis Hamilton addresses ongoing questions regarding his upcoming move to Maranello and Ferrari's long-term technical preparations.",
      source: "Autosport",
      url: "https://www.autosport.com"
    },
    {
      title: "Formula 1 Unveils Modified 2026 Technical Regulations for Active Wings",
      summary: "The FIA has finalized detailed aerodynamic adjustments designed to enhance overtaking opportunities and support active aero configurations.",
      source: "Motorsport.com",
      url: "https://www.motorsport.com"
    },
    {
      title: "Monza Preparing Multi-Million Euro Circuit Modernization Upgrades",
      summary: "The legendary Temple of Speed begins full resurfacing work and Grandstand renovations ahead of its historic centenary.",
      source: "BBC Sport",
      url: "https://www.bbc.com/sport"
    }
  ];
}

// Autosport RSS XML Parser Utility
function parseAutosportRSS(xmlText: string): any[] {
  const items: any[] = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const fallbackF1Images = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1627448831828-4f81014e76d9?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1554223140-896e43e59c6e?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1600706432502-77a0e2e32711?auto=format&fit=crop&q=80&w=400"
  ];

  for (const item of itemMatches) {
    const extractTag = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\/${tag}>`, 'i'));
      if (match) {
        return (match[1] || match[2] || '').trim();
      }
      return '';
    };

    const title = extractTag('title');
    const link = extractTag('link') || extractTag('guid');
    const description = extractTag('description');
    const pubDateStr = extractTag('pubDate');

    let date = "Recent";
    if (pubDateStr) {
      try {
        const d = new Date(pubDateStr);
        if (!isNaN(d.getTime())) {
          date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }

    let imageUrl = '';
    const enclosureMatch = item.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    const mediaContentMatch = item.match(/<(?:media:content|content)[^>]+url=["']([^"']+)["']/i);
    const srcMatch = description.match(/src=["']([^"']+)["']/i);

    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else if (mediaContentMatch) {
      imageUrl = mediaContentMatch[1];
    } else if (srcMatch) {
      imageUrl = srcMatch[1];
    }

    if (!imageUrl) {
      // Deterministic Unsplash selection matching title properties
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      imageUrl = fallbackF1Images[Math.abs(hash) % fallbackF1Images.length];
    }

    const cleanDescription = description.replace(/<[^>]*>/g, '').trim();

    if (title) {
      items.push({
        title,
        url: link || "https://www.autosport.com/f1",
        description: cleanDescription || "Formula 1 updates directly from Autosport world feeds.",
        date,
        imageUrl,
        source: "Autosport RSS"
      });
    }
  }

  return items;
}

// News Cache & Cooldown
interface RapidNewsCache {
  data: any;
  timestamp: number;
}
let rapidNewsCache: RapidNewsCache | null = null;
const RAPID_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
let rapidNewsCooldownUntil = 0;

// Search Grounding News Cache & Cooldown
interface GroundingNewsCache {
  data: any;
  timestamp: number;
}
let groundingNewsCache: GroundingNewsCache | null = null;
const GROUNDING_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache
let groundingCooldownUntil = 0;

// Rapid F1 news endpoint AND Autosport RSS integration
app.get("/api/news", async (req, res) => {
  const now = Date.now();

  // Try in-memory cache first if still valid
  if (rapidNewsCache && (now - rapidNewsCache.timestamp < RAPID_CACHE_TTL_MS)) {
    console.log("Serving F1 news from in-memory cache.");
    return res.json(rapidNewsCache.data);
  }

  let finalArticles: any[] = [];

  // 1. Fetch live Autosport RSS News Feed
  try {
    console.log("Fetching live Autosport RSS Feed...");
    const rssRes = await fetch("https://www.autosport.com/rss/f1/news/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) F1-Cebric-Reports"
      }
    });
    if (rssRes.ok) {
      const xmlText = await rssRes.text();
      const rssArticles = parseAutosportRSS(xmlText);
      if (rssArticles && rssArticles.length > 0) {
        console.log(`Successfully parsed ${rssArticles.length} articles from Autosport RSS.`);
        finalArticles.push(...rssArticles);
      }
    } else {
      console.warn("Autosport RSS response failed with status:", rssRes.status);
    }
  } catch (rssErr: any) {
    console.warn("Autosport RSS fetch or parse exception occurred:", rssErr.message);
  }

  // 2. Combine or supplement with RapidAPI F1 News source (if not on cooldown)
  if (now >= rapidNewsCooldownUntil && finalArticles.length < 10) {
    try {
      console.log("Supplementing with F1-Motorsport-Data via RapidAPI...");
      const response = await fetch("https://f1-motorsport-data.p.rapidapi.com/news", {
        method: "GET",
        headers: {
          "x-rapidapi-key": "64d2b1172cmsh862fc39e54b0220p1c551djsneb7dbe8ad351",
          "x-rapidapi-host": "f1-motorsport-data.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray((data as any).articles) ? (data as any).articles : []);
        
        const standardRapidArticles = rawList.map((item: any) => {
          const title = item.title || item.heading || item.headline || item.name || "Formula 1 News Update";
          // Unsplash F1 News visual placeholders (no lamborghinis, pure high-quality Formula 1 images)
          const fallbackF1Images = [
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1627448831828-4f81014e76d9?auto=format&fit=crop&q=80&w=400"
          ];
          let hash = 0;
          for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
          }
          const imageUrl = item.imageUrl || item.image || item.img || item.thumbnail || item.pic || fallbackF1Images[Math.abs(hash) % fallbackF1Images.length];

          return {
            title,
            url: item.url || item.link || item.source_url || item.href || "https://www.formula1.com",
            description: item.description || item.desc || item.summary || item.text || item.short_desc || "Learn the latest updates directly from major F1 paddocks.",
            date: item.date || item.published || item.time || item.pubDate || new Date().toLocaleDateString(),
            imageUrl,
            source: item.source || item.publisher || item.author || "F1 Feed"
          };
        });

        // Filter out duplicate headlines to keep it pristine and unique
        const existingTitles = new Set(finalArticles.map(a => a.title.toLowerCase().trim()));
        for (const rArt of standardRapidArticles) {
          if (!existingTitles.has(rArt.title.toLowerCase().trim())) {
            finalArticles.push(rArt);
          }
        }
      } else {
        if (response.status === 429) {
          rapidNewsCooldownUntil = Date.now() + 5 * 60 * 1000; // 5 min cooloff
        }
      }
    } catch (apiErr: any) {
      console.warn("RapidAPI supplementation erred:", apiErr.message);
      rapidNewsCooldownUntil = Date.now() + 60 * 1000; // short 1 min cooldown
    }
  }

  // 3. Fallbacks if both feeds returned nothing
  if (finalArticles.length === 0) {
    console.log("No live articles fetched. Returning highest quality paddock fallbacks.");
    if (rapidNewsCache) {
      return res.json(rapidNewsCache.data);
    }
    return res.json(getFallbackRapidAPINews());
  }

  // Save successful fetch results into cache
  rapidNewsCache = {
    data: finalArticles,
    timestamp: Date.now()
  };

  return res.json(finalArticles);
});

// Search Grounding F1 news endpoint
app.get("/api/news/grounding", async (req, res) => {
  const now = Date.now();
  if (now < groundingCooldownUntil) {
    console.log("Gemini grounding is in cooldown. Serving cached/fallback news.");
    if (groundingNewsCache) {
      return res.json(groundingNewsCache.data);
    }
    return res.json({
      headlines: getFallbackGroundingNews(),
      sources: [
        { title: "Formula 1 Official Site", uri: "https://www.formula1.com" },
        { title: "Autosport F1", uri: "https://www.autosport.com" }
      ],
      searchQueries: ["Latest Formula 1 headlines"]
    });
  }

  if (groundingNewsCache && (now - groundingNewsCache.timestamp < GROUNDING_CACHE_TTL_MS)) {
    console.log("Serving Google Grounding headlines from in-memory cache.");
    return res.json(groundingNewsCache.data);
  }

  if (!ai) {
    console.log("Gemini API key not configured yet or client init failed. Returning fallbacks.");
    return res.json({
      headlines: getFallbackGroundingNews(),
      sources: [
        { title: "Formula 1 Official Site", uri: "https://www.formula1.com" },
        { title: "Autosport F1", uri: "https://www.autosport.com" }
      ],
      searchQueries: ["Latest Formula 1 headlines"]
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Find and list the top 5 latest Formula 1 news headlines right now (from major reputable sports sites like Autosport, Motorsport.com, BBC Sport, or Sky Sports F1). Format your entire response as a JSON array of objects, with these exact keys: 'title' (string, concise title), 'summary' (string, 1-2 sentence description), 'source' (string, source name), and 'url' (string, actual source web link). Answer ONLY with the raw JSON array. Do not wrap in markdown code blocks.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "summary", "source", "url"]
          }
        }
      },
    });

    const rawText = response.text || "[]";
    const headlines = JSON.parse(rawText.trim());

    // Extract grounding-rich citations
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    const sources = chunks.map((chunk: any) => ({
      title: chunk.web?.title || "",
      uri: chunk.web?.uri || ""
    })).filter((c: any) => c.uri && c.title);

    // Keep unique sources list by URL to be elegant
    const seenUris = new Set();
    const uniqueSources: any[] = [];
    sources.forEach((s: any) => {
      if (!seenUris.has(s.uri)) {
        seenUris.add(s.uri);
        uniqueSources.push(s);
      }
    });

    const outputData = {
      headlines: headlines && headlines.length > 0 ? headlines : getFallbackGroundingNews(),
      sources: uniqueSources.length > 0 ? uniqueSources : [
        { title: "Formula 1 Official Site", uri: "https://www.formula1.com" },
        { title: "Autosport F1", uri: "https://www.autosport.com" }
      ],
      searchQueries
    };

    // Store in-memory cache
    groundingNewsCache = {
      data: outputData,
      timestamp: Date.now()
    };

    return res.json(outputData);
  } catch (err: any) {
    const errStr = JSON.stringify(err) || err.message || "";
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
      // 10 minutes cooldown to protect the Gemini key and avoid repeated logs
      groundingCooldownUntil = Date.now() + 10 * 60 * 1000;
      console.warn("Gemini Search Grounding quota exhausted (429). Commencing 10-minute cooldown backoff.");
    } else {
      // 2 minutes cooldown for other errors
      groundingCooldownUntil = Date.now() + 2 * 60 * 1000;
      console.warn("Gemini Search Grounding call failed. Commencing 2-minute cooldown backoff:", err.message);
    }

    // Stale Cache Resilience: If we have cached news, return it even if expired rather than static mock fallbacks
    if (groundingNewsCache) {
      console.log("Serving stale cached Grounding news as high-fidelity fallback.");
      return res.json(groundingNewsCache.data);
    }

    return res.json({
      headlines: getFallbackGroundingNews(),
      sources: [
        { title: "Formula 1 Official Site", uri: "https://www.formula1.com" },
        { title: "Autosport F1", uri: "https://www.autosport.com" }
      ],
      searchQueries: ["Latest Formula 1 headlines"],
      error: err.message
    });
  }
});

// Simulated FIA Documents generator for F1 races (high-fidelity legal, technical, and stewarding notices)
function getSimulatedFiaDocs(raceName: string = "") {
  const cleanName = raceName.trim() || "Grand Prix";
  
  // Simple deterministic hash based on race name to seed random choices
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const seed = Math.abs(hash);

  // Lists of F1 drivers to select dynamically for stewarding decisions
  const currentField = [
    { driver: "Verstappen", car: "1", team: "Red Bull Racing" },
    { driver: "Perez", car: "11", team: "Red Bull Racing" },
    { driver: "Hamilton", car: "44", team: "Ferrari" },
    { driver: "Russell", car: "63", team: "Mercedes AMG" },
    { driver: "Leclerc", car: "16", team: "Ferrari" },
    { driver: "Sainz", car: "55", team: "Williams" },
    { driver: "Norris", car: "4", team: "McLaren" },
    { driver: "Piastri", car: "81", team: "McLaren" },
    { driver: "Alonso", car: "14", team: "Aston Martin" },
    { driver: "Stroll", car: "18", team: "Aston Martin" },
    { driver: "Tsunoda", car: "22", team: "RB" },
    { driver: "Lawson", car: "30", team: "RB" },
    { driver: "Albon", car: "23", team: "Williams" },
    { driver: "Gasly", car: "10", team: "Alpine" },
    { driver: "Ocon", car: "31", team: "Haas" },
    { driver: "Hulkenberg", car: "27", team: "Sauber" },
    { driver: "Magnussen", car: "20", team: "Haas" },
    { driver: "Bottas", car: "77", team: "Sauber" },
    { driver: "Colapinto", car: "43", team: "Williams" },
    { driver: "Bearman", car: "87", team: "Haas" }
  ];

  // Pick deterministic indexes based on seed
  const d1 = currentField[seed % currentField.length];
  const d2 = currentField[(seed + 3) % currentField.length];
  const d3 = currentField[(seed + 7) % currentField.length];
  const d4 = currentField[(seed + 11) % currentField.length];

  // Specific track details
  const trackSectors = [
    "Turn 4 Apex", "Turn 12 Exit", "Pit Lane Speed Trap", "Turn 1 Chicane", 
    "Sector 3 High Speed Zone", "Turn 14 Entry Curve", "Turn 9 Apex Limit"
  ];
  const selectedSector = trackSectors[seed % trackSectors.length];
  const compoundOption = (seed % 2 === 0) ? "Range C1, C2, C3" : "Range C3, C4, C5";

  return [
    {
      id: `doc-${seed}-1`,
      title: `Document 4 - Stewards Selection & Race Officials Committee for ${cleanName}`,
      url: "https://www.fia.com",
      date: "Thursday 11:32 AM",
      category: "Committee Announcement",
      meeting: cleanName,
      documentId: "04"
    },
    {
      id: `doc-${seed}-2`,
      title: `Document 9 - Official Tyre Allocation & Pirelli Compound Quantities Set (${compoundOption})`,
      url: "https://www.fia.com",
      date: "Thursday 03:45 PM",
      category: "Technical Regulations",
      meeting: cleanName,
      documentId: "09"
    },
    {
      id: `doc-${seed}-3`,
      title: `Document 14 - Pit Lane Map, Speed Limits, and Driver Briefing Notes`,
      url: "https://www.fia.com",
      date: "Friday 09:15 AM",
      category: "Event Instructions",
      meeting: cleanName,
      documentId: "14"
    },
    {
      id: `doc-${seed}-4`,
      title: `Document 22 - Technical Delegate Report: Initial Scrutineering and Parts Compliance`,
      url: "https://www.fia.com",
      date: "Friday 11:00 AM",
      category: "Technical Report",
      meeting: cleanName,
      documentId: "22"
    },
    {
      id: `doc-${seed}-5`,
      title: `Document 31 - Stewards Decision: Car ${d1.car} (${d1.driver}) Power Unit Upgrades & ICE Component Limits`,
      url: "https://www.fia.com",
      date: "Saturday 12:10 PM",
      category: "Stewards Decisions",
      meeting: cleanName,
      documentId: "31"
    },
    {
      id: `doc-${seed}-6`,
      title: `Document 45 - Summons - Car ${d2.car} (${d2.driver}) & Car ${d3.car} (${d3.driver}) for alleged Pit Lane Outlap Interruption`,
      url: "https://www.fia.com",
      date: "Saturday 04:40 PM",
      category: "Summons & Penalties",
      meeting: cleanName,
      documentId: "45"
    },
    {
      id: `doc-${seed}-7`,
      title: `Document 48 - Post-Qualifying Official Provisional Starting Grid for ${cleanName}`,
      url: "https://www.fia.com",
      date: "Saturday 06:30 PM",
      category: "Grid Allocation",
      meeting: cleanName,
      documentId: "48"
    },
    {
      id: `doc-${seed}-8`,
      title: `Document 52 - Stewards Decision: Car ${d4.car} (${d4.driver}) Track Limits Warning at ${selectedSector}`,
      url: "https://www.fia.com",
      date: "Sunday 02:45 PM",
      category: "Stewards Decisions",
      meeting: cleanName,
      documentId: "52"
    },
    {
      id: `doc-${seed}-9`,
      title: `Document 61 - Final Race Official Classification Report and Event Scrutineering Summary`,
      url: "https://www.fia.com",
      date: "Sunday 06:15 PM",
      category: "Race Results",
      meeting: cleanName,
      documentId: "61"
    }
  ];
}

// RapidAPI f1-live-pulse FIA Documents proxy endpoint
app.get("/api/fia-documents", async (req, res) => {
  const raceNameQuery = String(req.query.race || "").trim();

  try {
    console.log(`Connecting to live f1-live-pulse API for GP Documents... [Query: ${raceNameQuery}]`);
    const response = await fetch("https://f1-live-pulse.p.rapidapi.com/fiaDocuments", {
      method: "GET",
      headers: {
        "x-rapidapi-key": "64d2b1172cmsh862fc39e54b0220p1c551djsneb7dbe8ad351",
        "x-rapidapi-host": "f1-live-pulse.p.rapidapi.com",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.warn(`f1-live-pulse returned non-200 status ${response.status}. Using simulation fallbacks.`);
      return res.json(getSimulatedFiaDocs(raceNameQuery));
    }

    const data = await response.json();
    console.log("Successfully fetched documents from f1-live-pulse.");

    // Direct parser or dynamic nested array normalizer
    const rawList = Array.isArray(data) ? data : (data && typeof data === 'object' ? (data.documents || data.results || data.data || []) : []);

    if (!rawList || rawList.length === 0) {
      return res.json(getSimulatedFiaDocs(raceNameQuery));
    }

    const normalized = rawList.map((item: any, idx: number) => ({
      id: item.id || item.documentId || `doc-${idx}`,
      title: item.title || item.name || item.description || "Official FIA Notice",
      url: item.url || item.link || item.pdf || "https://www.fia.com",
      date: item.date || item.published || new Date().toLocaleDateString(),
      category: item.category || item.type || "Stewards Decisions",
      meeting: item.meeting || raceNameQuery || "Championship Notice",
      documentId: item.documentId || String(10 + idx)
    }));

    // If a specific race name filter is provided, filter or match by it
    if (raceNameQuery) {
      const filtered = normalized.filter((doc: any) => 
        String(doc.meeting || doc.title).toLowerCase().includes(raceNameQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        return res.json(filtered);
      }
    }

    return res.json(normalized);
  } catch (err: any) {
    console.warn("f1-live-pulse API exception occurred. Falling back gracefully:", err.message);
    return res.json(getSimulatedFiaDocs(raceNameQuery));
  }
});

// Configure Vite integration for development / production serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server bound and running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((error) => {
  console.error("An error occurred during Vite boot routing:", error);
});
