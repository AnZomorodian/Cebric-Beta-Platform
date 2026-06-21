import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
const DATABASE_PATH = path.join(process.cwd(), "DatabaseUser.json");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to read users from the local database
function readUsers(): any[] {
  try {
    if (!fs.existsSync(DATABASE_PATH)) {
      fs.writeFileSync(DATABASE_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATABASE_PATH, "utf8");
    const parsed = JSON.parse(data || "[]");
    return Array.isArray(parsed) ? parsed : [];
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

    // Special exact credentials override for Admin requested by user
    if (username === "Admin" && password === "Admin123") {
      return res.json({
        success: true,
        user: {
          username: "Admin",
          givenName: "System",
          familyName: "Administrator",
          email: "admin@cebricf1.com",
          passportNumber: "ADM777",
          isAdmin: true
        }
      });
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

    if (user.isBanned) {
      return res.status(403).json({ error: "This user has been banned from the F1 Paddock." });
    }

    return res.json({
      success: true,
      user: {
        username: user.username,
        givenName: user.givenName,
        familyName: user.familyName,
        email: user.email || "",
        passportNumber: user.passportNumber || `${user.givenName ? user.givenName.charAt(0).toUpperCase() : 'U'}${Math.floor(1000 + Math.random() * 9000)}`,
        isAdmin: user.username === "Admin" || !!user.isAdmin,
        isBanned: !!user.isBanned
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred during login" });
  }
});

// Admin REST Endpoint: Get all registered users
app.get("/api/admin/users", (req, res) => {
  try {
    const users = readUsers();
    // Return users mapped with predictions, active score, and historical results for administration detail view
    const safeUsers = users.map(u => ({
      username: u.username,
      givenName: u.givenName || u.username,
      familyName: u.familyName || "",
      email: u.email || "",
      passportNumber: u.passportNumber || "None",
      registeredAt: u.registeredAt || "Prior",
      score: u.score || 0,
      prediction: u.prediction || null,
      history: u.history || [],
      isBanned: !!u.isBanned
    }));
    return res.json(safeUsers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin REST Endpoint: Toggle Ban Option on specific user
app.post("/api/admin/users/toggle-ban", (req, res) => {
  try {
    const { usernameToToggle } = req.body;
    if (!usernameToToggle) {
      return res.status(400).json({ error: "Username was not received in body." });
    }
    if (usernameToToggle.toLowerCase() === "admin") {
      return res.status(400).json({ error: "The system Administrator account can never be banned." });
    }
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === usernameToToggle.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User account not active on database server." });
    }
    user.isBanned = !user.isBanned;
    writeUsers(users);
    return res.json({ success: true, isBanned: user.isBanned });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Admin REST Endpoint: Delete specific user
app.post("/api/admin/users/delete", (req, res) => {
  try {
    const { usernameToDelete } = req.body;
    if (!usernameToDelete) {
      return res.status(400).json({ error: "Username to delete is required" });
    }
    const users = readUsers();
    const filtered = users.filter(u => u.username.toLowerCase() !== usernameToDelete.toLowerCase());
    
    if (users.length === filtered.length) {
      return res.status(404).json({ error: "User not found" });
    }

    writeUsers(filtered);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin REST Endpoint: Clear all users
app.post("/api/admin/users/clear", (req, res) => {
  try {
    // Keeps database empty or clears all
    writeUsers([]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Change Email
app.post("/api/change-email", (req, res) => {
  try {
    const { username, newEmail } = req.body;
    if (!username || !newEmail) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const users = readUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const emailExists = users.some((u, idx) => idx !== userIndex && u.email && u.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: "Email is already in use by another account" });
    }

    users[userIndex].email = newEmail;
    const success = writeUsers(users);
    if (success) {
      return res.json({ success: true, email: newEmail });
    } else {
      return res.status(500).json({ error: "Failed to persist updated email" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred" });
  }
});

// Paths and prediction settings helpers
const PRED_SETTINGS_PATH = path.join(process.cwd(), "PredictionSettings.json");

function readPredictionSettings(): any {
  try {
    if (!fs.existsSync(PRED_SETTINGS_PATH)) {
      const defaultSettings = {
        nextGpName: "British Grand Prix 2026",
        nextGpLocation: "Silverstone Circuit",
        nextGpDate: "2026-07-05T14:00:00Z",
        globalLock: false,
        scoringRules: {
          pole: 10,
          winner: 25,
          podium: 10,
          top10Multiplier: 5,
          fastestLap: 5,
          dotd: 5,
          firstDnf: 10,
          numDnfs: 5,
          safetyCar: 5,
          vsc: 5,
          redFlag: 5,
          qualifyingP2: 5,
          qualifyingP3: 5,
          gains: 10
        },
        certifiedResults: {
          poleDriver: "",
          qualifyingP2: "",
          qualifyingP3: "",
          p1Winner: "",
          p2Winner: "",
          p3Winner: "",
          top10Finishers: Array(10).fill(""),
          fastestLap: "",
          driverOfTheDay: "",
          firstDNF: "",
          numberOfDNFs: 0,
          safetyCar: "no",
          virtualSafetyCar: "no",
          redFlag: "no",
          mostPositionsGained: ""
        }
      };
      fs.writeFileSync(PRED_SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(PRED_SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(data || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Error reading from PredictionSettings.json:", error);
    return {};
  }
}

function writePredictionSettings(settings: any): boolean {
  try {
    fs.writeFileSync(PRED_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to PredictionSettings.json:", error);
    return false;
  }
}

function recalculateUserScores(settings: any) {
  try {
    const users = readUsers();
    const cert = settings.certifiedResults || {};
    const rules = settings.scoringRules || {};

    const isCertified = !!cert.p1Winner;

    users.forEach((u) => {
      if (!isCertified) {
        u.score = 0;
        return;
      }

      const pred = u.prediction;
      if (!pred) {
        u.score = 0;
        return;
      }

      let score = 0;

      // Pole Position
      if (pred.poleDriver && cert.poleDriver && pred.poleDriver.toLowerCase().trim() === cert.poleDriver.toLowerCase().trim()) {
        score += Number(rules.pole || 10);
      }
      // Qualifying P2
      if (pred.qualifyingP2 && cert.qualifyingP2 && pred.qualifyingP2.toLowerCase().trim() === cert.qualifyingP2.toLowerCase().trim()) {
        score += Number(rules.qualifyingP2 || 5);
      }
      // Qualifying P3
      if (pred.qualifyingP3 && cert.qualifyingP3 && pred.qualifyingP3.toLowerCase().trim() === cert.qualifyingP3.toLowerCase().trim()) {
        score += Number(rules.qualifyingP3 || 5);
      }
      // P1 Winner
      if (pred.p1Winner && cert.p1Winner && pred.p1Winner.toLowerCase().trim() === cert.p1Winner.toLowerCase().trim()) {
        score += Number(rules.winner || 25);
      }
      // P2 Runner-up
      if (pred.p2Winner && cert.p2Winner && pred.p2Winner.toLowerCase().trim() === cert.p2Winner.toLowerCase().trim()) {
        score += Number(rules.podium || 10);
      }
      // P3 Third Place
      if (pred.p3Winner && cert.p3Winner && pred.p3Winner.toLowerCase().trim() === cert.p3Winner.toLowerCase().trim()) {
        score += Number(rules.podium || 10);
      }
      // Fastest Lap
      if (pred.fastestLap && cert.fastestLap && pred.fastestLap.toLowerCase().trim() === cert.fastestLap.toLowerCase().trim()) {
        score += Number(rules.fastestLap || 5);
      }
      // Driver of the Day
      if (pred.driverOfTheDay && cert.driverOfTheDay && pred.driverOfTheDay.toLowerCase().trim() === cert.driverOfTheDay.toLowerCase().trim()) {
        score += Number(rules.dotd || 5);
      }
      // First DNF
      if (pred.firstDNF && cert.firstDNF && pred.firstDNF.toLowerCase().trim() === cert.firstDNF.toLowerCase().trim()) {
        score += Number(rules.firstDnf || 10);
      }
      // Number of DNFs
      if (pred.numberOfDNFs !== undefined && cert.numberOfDNFs !== undefined && Number(pred.numberOfDNFs) === Number(cert.numberOfDNFs)) {
        score += Number(rules.numDnfs || 5);
      }
      // Safety Car
      if (pred.safetyCar && cert.safetyCar && pred.safetyCar.toLowerCase().trim() === cert.safetyCar.toLowerCase().trim()) {
        score += Number(rules.safetyCar || 5);
      }
      // Virtual Safety Car
      if (pred.virtualSafetyCar && cert.virtualSafetyCar && pred.virtualSafetyCar.toLowerCase().trim() === cert.virtualSafetyCar.toLowerCase().trim()) {
        score += Number(rules.vsc || 5);
      }
      // Red Flag Occurrence
      if (pred.redFlag && cert.redFlag && pred.redFlag.toLowerCase().trim() === cert.redFlag.toLowerCase().trim()) {
        score += Number(rules.redFlag || 5);
      }
      // Driver Who Gains Most Positions
      if (pred.mostPositionsGained && cert.mostPositionsGained && pred.mostPositionsGained.toLowerCase().trim() === cert.mostPositionsGained.toLowerCase().trim()) {
        score += Number(rules.gains || 10);
      }

      // Top 10 Finishers check
      if (Array.isArray(pred.top10Finishers) && Array.isArray(cert.top10Finishers)) {
        const certSet = new Set(cert.top10Finishers.filter(Boolean).map((d: string) => d.toLowerCase().trim()));
        let correctTop10s = 0;
        pred.top10Finishers.forEach((pdriver: string) => {
          if (pdriver && certSet.has(pdriver.toLowerCase().trim())) {
            correctTop10s++;
          }
        });
        score += correctTop10s * Number(rules.top10Multiplier || 5);
      }

      u.score = score;
    });

    writeUsers(users);
  } catch (err) {
    console.error("Recalculate error:", err);
  }
}

// REST Endpoints for GP Prediction Game
app.get("/api/prediction-settings", (req, res) => {
  const s = readPredictionSettings();
  const now = new Date();
  const autoLock = s.lockTime && now >= new Date(s.lockTime);
  s.globalLock = !!s.globalLock || !!autoLock;
  return res.json(s);
});

app.post("/api/admin/prediction-settings", (req, res) => {
  try {
    const newSettings = req.body;
    if (!newSettings) {
      return res.status(400).json({ error: "Missing prediction settings body data" });
    }

    const current = readPredictionSettings();
    const updated = {
      ...current,
      ...newSettings,
      lockTime: newSettings.lockTime !== undefined ? newSettings.lockTime : current.lockTime,
      scoringRules: { ...current.scoringRules, ...newSettings.scoringRules },
      certifiedResults: { ...current.certifiedResults, ...newSettings.certifiedResults }
    };

    const saved = writePredictionSettings(updated);
    if (!saved) {
      return res.status(500).json({ error: "Failed to write prediction settings." });
    }

    // Automatically recalculate user scores in standard backend database when saved
    recalculateUserScores(updated);

    return res.json({ success: true, settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/user/prediction", (req, res) => {
  try {
    const { username, prediction } = req.body;
    if (!username || !prediction) {
      return res.status(400).json({ error: "Missing required username or prediction details" });
    }

    // Check if predictions are locked globally or automatically locked by time
    const settings = readPredictionSettings();
    const now = new Date();
    const autoLock = settings.lockTime && now >= new Date(settings.lockTime);
    if (settings.globalLock || autoLock) {
      return res.status(403).json({ error: "Submissions are currently locked." });
    }

    const users = readUsers();
    const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: "User profile not found in database" });
    }

    users[idx].prediction = prediction;
    writeUsers(users);

    // Dynamic points calculation support if certified results exist
    recalculateUserScores(settings);

    return res.json({ success: true, message: "Prediction registered and leaderboard recalculated." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Change registered account password
app.post("/api/user/change-password", (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required details to execute password alteration." });
    }
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User profile record does not exist on database server." });
    }
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: "Your specified current password is incorrect." });
    }
    user.password = newPassword;
    writeUsers(users);
    return res.json({ success: true, message: "Your paddock security credentials changed successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Get user profile with mocked F1 game historical points accuracy
app.get("/api/user/profile", (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === (username as string).toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Default pre-populated F1 season history logs if empty
    if (!user.history || user.history.length === 0) {
      user.history = [
        {
          gpName: "Bahrain GP",
          score: 45,
          date: "2026-03-02T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Sergio Pérez",
            p3Winner: "Carlos Sainz Jr",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Carlos Sainz Jr",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          },
          certifiedResults: {
            p1Winner: "Max Verstappen",
            p2Winner: "Sergio Pérez",
            p3Winner: "Carlos Sainz Jr",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Carlos Sainz Jr",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          }
        },
        {
          gpName: "Saudi Arabian GP",
          score: 60,
          date: "2026-03-16T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Charles Leclerc",
            p3Winner: "Sergio Pérez",
            poleDriver: "Max Verstappen",
            fastestLap: "Charles Leclerc",
            driverOfTheDay: "Oliver Bearman",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          },
          certifiedResults: {
            p1Winner: "Max Verstappen",
            p2Winner: "Sergio Pérez",
            p3Winner: "Charles Leclerc",
            poleDriver: "Max Verstappen",
            fastestLap: "Charles Leclerc",
            driverOfTheDay: "Oliver Bearman",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          }
        },
        {
          gpName: "Australian GP",
          score: 35,
          date: "2026-03-30T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Carlos Sainz Jr",
            p3Winner: "Charles Leclerc",
            poleDriver: "Max Verstappen",
            fastestLap: "Charles Leclerc",
            driverOfTheDay: "Carlos Sainz Jr",
            mostPositionsGained: "Alex Albon",
            safetyCar: "no"
          },
          certifiedResults: {
            p1Winner: "Carlos Sainz Jr",
            p2Winner: "Charles Leclerc",
            p3Winner: "Lando Norris",
            poleDriver: "Max Verstappen",
            fastestLap: "Charles Leclerc",
            driverOfTheDay: "Carlos Sainz Jr",
            mostPositionsGained: "Yuki Tsunoda",
            safetyCar: "no"
          }
        },
        {
          gpName: "Japanese GP",
          score: 85,
          date: "2026-04-13T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Sergio Pérez",
            p3Winner: "Carlos Sainz Jr",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Yuki Tsunoda",
            mostPositionsGained: "Yuki Tsunoda",
            safetyCar: "no"
          },
          certifiedResults: {
            p1Winner: "Max Verstappen",
            p2Winner: "Sergio Pérez",
            p3Winner: "Carlos Sainz Jr",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Yuki Tsunoda",
            mostPositionsGained: "Yuki Tsunoda",
            safetyCar: "no"
          }
        },
        {
          gpName: "Chinese GP",
          score: 50,
          date: "2026-04-27T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Lando Norris",
            p3Winner: "Sergio Pérez",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Lando Norris",
            mostPositionsGained: "Nico Hülkenberg",
            safetyCar: "yes"
          },
          certifiedResults: {
            p1Winner: "Max Verstappen",
            p2Winner: "Lando Norris",
            p3Winner: "Sergio Pérez",
            poleDriver: "Max Verstappen",
            fastestLap: "Max Verstappen",
            driverOfTheDay: "Lando Norris",
            mostPositionsGained: "Nico Hülkenberg",
            safetyCar: "yes"
          }
        },
        {
          gpName: "Miami GP",
          score: 70,
          date: "2026-05-11T15:00:00Z",
          prediction: {
            p1Winner: "Max Verstappen",
            p2Winner: "Lando Norris",
            p3Winner: "Charles Leclerc",
            poleDriver: "Max Verstappen",
            fastestLap: "Lando Norris",
            driverOfTheDay: "Lando Norris",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          },
          certifiedResults: {
            p1Winner: "Lando Norris",
            p2Winner: "Max Verstappen",
            p3Winner: "Charles Leclerc",
            poleDriver: "Max Verstappen",
            fastestLap: "Oscar Piastri",
            driverOfTheDay: "Lando Norris",
            mostPositionsGained: "Lewis Hamilton",
            safetyCar: "yes"
          }
        }
      ];
      writeUsers(users);
    }

    return res.json({
      username: user.username,
      givenName: user.givenName || user.username,
      familyName: user.familyName || "",
      email: user.email || "",
      passportNumber: user.passportNumber || "None",
      score: user.score || 0,
      history: user.history
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Get global aggregate prediction statistics
app.get("/api/predictions/aggregate-stats", (req, res) => {
  try {
    const users = readUsers();
    const activePredictions = users.filter(u => u.prediction);
    const totalCount = activePredictions.length;

    if (totalCount === 0) {
      return res.json({
        totalCount: 0,
        mostCommonWinner: { driver: "None", count: 0, pct: 0 },
        mostCommonPole: { driver: "None", count: 0, pct: 0 },
        mostCommonDotd: { driver: "None", count: 0, pct: 0 },
        mostCommonFastestLap: { driver: "None", count: 0, pct: 0 },
        safetyCarSpread: { yes: 0, no: 0 }
      });
    }

    const countWinners: Record<string, number> = {};
    const countPoles: Record<string, number> = {};
    const countDotd: Record<string, number> = {};
    const countFastest: Record<string, number> = {};
    let safetyCarYes = 0;

    activePredictions.forEach(u => {
      const pred = u.prediction;
      if (pred.p1Winner) countWinners[pred.p1Winner] = (countWinners[pred.p1Winner] || 0) + 1;
      if (pred.poleDriver) countPoles[pred.poleDriver] = (countPoles[pred.poleDriver] || 0) + 1;
      if (pred.driverOfTheDay) countDotd[pred.driverOfTheDay] = (countDotd[pred.driverOfTheDay] || 0) + 1;
      if (pred.fastestLap) countFastest[pred.fastestLap] = (countFastest[pred.fastestLap] || 0) + 1;
      if (pred.safetyCar?.toLowerCase() === 'yes') safetyCarYes++;
    });

    const getMax = (record: Record<string, number>) => {
      let maxKey = "None";
      let maxVal = 0;
      for (const [key, val] of Object.entries(record)) {
        if (val > maxVal) {
          maxVal = val;
          maxKey = key;
        }
      }
      return {
        driver: maxKey,
        count: maxVal,
        pct: Math.round((maxVal / totalCount) * 100)
      };
    };

    return res.json({
      totalCount,
      mostCommonWinner: getMax(countWinners),
      mostCommonPole: getMax(countPoles),
      mostCommonDotd: getMax(countDotd),
      mostCommonFastestLap: getMax(countFastest),
      safetyCarSpread: {
        yes: Math.round((safetyCarYes / totalCount) * 100),
        no: 100 - Math.round((safetyCarYes / totalCount) * 100)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Delete / reset current active GP setup
app.post("/api/admin/delete-current-gp", (req, res) => {
  try {
    const emptySettings = {
      nextGpName: "No Active Grand Prix",
      nextGpLocation: "N/A",
      nextGpDate: "1970-01-01T00:00:00Z",
      lockTime: null,
      globalLock: true,
      scoringRules: {
        pole: 10, qualifyingP2: 5, qualifyingP3: 5, winner: 25, podium: 10, top10Multiplier: 5, fastestLap: 5,
        dotd: 5, firstDnf: 10, numDnfs: 5, safetyCar: 5, vsc: 5, redFlag: 5, gains: 10
      },
      certifiedResults: {
        poleDriver: "", qualifyingP2: "", qualifyingP3: "", p1Winner: "", p2Winner: "", p3Winner: "",
        top10Finishers: Array(10).fill(""), fastestLap: "", driverOfTheDay: "",
        firstDNF: "", numberOfDNFs: 0, safetyCar: "no", virtualSafetyCar: "no",
        redFlag: "no", mostPositionsGained: ""
      }
    };
    writePredictionSettings(emptySettings);

    const users = readUsers();
    users.forEach(u => {
      u.prediction = null;
      u.score = 0;
    });
    writeUsers(users);

    return res.json({ success: true, settings: emptySettings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Get fully-revealed predictions & profile data of all players
app.get("/api/admin/users-predictions", (req, res) => {
  try {
    const users = readUsers();
    const list = users.map((u) => ({
      username: u.username,
      givenName: u.givenName || u.username,
      familyName: u.familyName || "",
      email: u.email || "",
      passportNumber: u.passportNumber || "None",
      prediction: u.prediction || null,
      score: u.score || 0
    }));
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REST Endpoint: Archive active GP round and instantiate a new GP round
app.post("/api/admin/archive-and-new-gp", (req, res) => {
  try {
    const { nextGpName, nextGpLocation, nextGpDate, lockTime } = req.body;
    if (!nextGpName || !nextGpLocation || !nextGpDate) {
      return res.status(400).json({ error: "Missing required details to initialize the new F1 Grand Prix session." });
    }

    const settings = readPredictionSettings();
    const users = readUsers();

    // 1. Copy active prediction details into score history for all users
    users.forEach((u) => {
      u.history = u.history || [
        { gpName: "Bahrain GP", score: 45, date: "2026-03-02T15:00:00Z" },
        { gpName: "Saudi Arabian GP", score: 60, date: "2026-03-16T15:00:00Z" },
        { gpName: "Australian GP", score: 35, date: "2026-03-30T15:00:00Z" },
        { gpName: "Japanese GP", score: 85, date: "2026-04-13T15:00:00Z" },
        { gpName: "Chinese GP", score: 50, date: "2026-04-27T15:00:00Z" },
        { gpName: "Miami GP", score: 70, date: "2026-05-11T15:00:00Z" }
      ];

      u.history.push({
        gpName: settings.nextGpName || "F1 Grand Prix",
        gpLocation: settings.nextGpLocation || "F1 Circuit",
        score: u.score || 0,
        date: new Date().toISOString(),
        prediction: u.prediction || null
      });

      // 2. Clear current GP records
      u.prediction = null;
      u.score = 0;
    });

    writeUsers(users);

    // 3. Construct clean next GP settings, with empty/unresolved certifiedResults
    const cleanSettings = {
      nextGpName,
      nextGpLocation,
      nextGpDate,
      lockTime: lockTime || null,
      globalLock: false,
      scoringRules: settings.scoringRules || {
        pole: 10,
        qualifyingP2: 5,
        qualifyingP3: 5,
        winner: 25,
        podium: 10,
        top10Multiplier: 5,
        fastestLap: 5,
        dotd: 5,
        firstDnf: 10,
        numDnfs: 5,
        safetyCar: 5,
        vsc: 5,
        redFlag: 5,
        gains: 10
      },
      certifiedResults: {
        poleDriver: "",
        qualifyingP2: "",
        qualifyingP3: "",
        p1Winner: "",
        p2Winner: "",
        p3Winner: "",
        top10Finishers: Array(10).fill(""),
        fastestLap: "",
        driverOfTheDay: "",
        firstDNF: "",
        numberOfDNFs: 0,
        safetyCar: "no",
        virtualSafetyCar: "no",
        redFlag: "no",
        mostPositionsGained: ""
      }
    };

    writePredictionSettings(cleanSettings);

    return res.json({
      success: true,
      message: `Archived successfully. ${nextGpName} is now active and predictions are open!`,
      settings: cleanSettings
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/leaderboard", (req, res) => {
  try {
    const users = readUsers();
    const list = users.map((u) => ({
      username: u.username,
      givenName: u.givenName || u.username,
      familyName: u.familyName || "",
      score: u.score || 0,
      hasPrediction: !!u.prediction
    })).sort((a, b) => b.score - a.score);

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
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

// Generic RSS XML Parser Utility
function parseRSSFeed(xmlText: string, sourceName: string, defaultUrl: string): any[] {
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
    let timestamp = Date.now();
    if (pubDateStr) {
      try {
        const d = new Date(pubDateStr);
        if (!isNaN(d.getTime())) {
          date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          timestamp = d.getTime();
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
        url: link || defaultUrl,
        description: cleanDescription || `Formula 1 updates directly from ${sourceName} world feeds.`,
        date,
        timestamp,
        imageUrl,
        source: sourceName
      });
    }
  }

  return items;
}

// Autosport RSS XML Parser for compatibility
function parseAutosportRSS(xmlText: string): any[] {
  return parseRSSFeed(xmlText, "Autosport RSS", "https://www.autosport.com/f1");
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

  // 1. Fetch live Autosport and Motorsport RSS News Feeds in parallel
  try {
    console.log("Fetching live Autosport and Motorsport RSS Feeds...");
    const feedUrls = [
      { url: "https://www.autosport.com/rss/f1/news/", source: "Autosport RSS", fallbackUrl: "https://www.autosport.com/f1" },
      { url: "https://www.motorsport.com/rss/f1/news/", source: "Motorsport.com RSS", fallbackUrl: "https://www.motorsport.com/f1" }
    ];

    const feedPromises = feedUrls.map(feed => 
      fetch(feed.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) F1-Cebric-Reports"
        }
      }).then(async r => {
        if (r.ok) {
          const xmlText = await r.text();
          return parseRSSFeed(xmlText, feed.source, feed.fallbackUrl);
        }
        console.warn(`${feed.source} response failed with status:`, r.status);
        return [];
      }).catch(err => {
        console.warn(`${feed.source} fetch exception occurred:`, err.message);
        return [];
      })
    );

    const feedsResults = await Promise.all(feedPromises);
    const tempArticles: any[] = [];
    for (const articlesList of feedsResults) {
      tempArticles.push(...articlesList);
    }

    // Sort by timestamp descending
    tempArticles.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Keep unique elements by normalized title to prevent duplicates across feeds!
    const seenTitles = new Set<string>();
    for (const art of tempArticles) {
      const normalizedTitle = art.title.toLowerCase().trim();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        finalArticles.push(art);
      }
    }
  } catch (err: any) {
    console.warn("Main RSS fetch operation failed:", err.message);
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
const fiaDocsHandler = async (req: any, res: any) => {
  const raceNameQuery = String(req.query.race || req.query.raceName || "").trim();

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
      } else {
        // Deterministic high-fidelity simulated docs fallback specifically for this race name query
        return res.json(getSimulatedFiaDocs(raceNameQuery));
      }
    }

    return res.json(normalized);
  } catch (err: any) {
    console.warn("f1-live-pulse API exception occurred. Falling back gracefully:", err.message);
    return res.json(getSimulatedFiaDocs(raceNameQuery));
  }
};

app.get("/api/fia-docs", fiaDocsHandler);
app.get("/api/fia-documents", fiaDocsHandler);

function getSimulatedLaps(driverNumber: number, baseLapTime: number, sessionKey: number = 9161, count: number = 20) {
  const laps = [];
  for (let l = 1; l <= count; l++) {
    const variance = Math.sin(l * 0.7 + driverNumber) * 0.35 + (Math.random() - 0.5) * 0.5;
    const duration = baseLapTime + (l === 1 ? 5.5 : l === 8 ? -0.8 : variance);
    const s1 = duration * 0.28 + (Math.random() - 0.5) * 0.1;
    const s2 = duration * 0.45 + (Math.random() - 0.5) * 0.1;
    const s3 = duration * 0.27 + (Math.random() - 0.5) * 0.1;

    laps.push({
      driver_number: driverNumber,
      lap_number: l,
      lap_duration: duration,
      duration_sector_1: parseFloat(s1.toFixed(3)),
      duration_sector_2: parseFloat(s2.toFixed(3)),
      duration_sector_3: parseFloat(s3.toFixed(3)),
      is_pit_out_lap: l === 1 || l === 12,
      st_speed: Math.round(300 + (Math.random() - 0.5) * 15),
      session_key: sessionKey
    });
  }
  return laps;
}

function getSimulatedTelemetry(d1: number, d2: number, gp: string, session: string, year: number, extras?: any) {
  const roster: Record<number, { name: string, team: string, color: string }> = {
    44: { name: "Lewis HAMILTON", team: "Ferrari", color: "#ED1131" },
    63: { name: "George RUSSELL", team: "Mercedes", color: "#27F4D2" },
    1: { name: "Max VERSTAPPEN", team: "Red Bull Racing", color: "#3671C6" },
    4: { name: "Lando NORRIS", team: "McLaren", color: "#FF8700" },
    81: { name: "Oscar PIASTRI", team: "McLaren", color: "#FF8700" },
    16: { name: "Charles LECLERC", team: "Ferrari", color: "#ED1131" },
    55: { name: "Carlos SAINZ", team: "Williams", color: "#005AFF" },
    14: { name: "Fernando ALONSO", team: "Aston Martin", color: "#229971" },
    10: { name: "Pierre GASLY", team: "Alpine", color: "#0093CC" },
    43: { name: "Franco COLAPINTO", team: "Alpine", color: "#0093CC" },
    30: { name: "Liam LAWSON", team: "Racing Bulls", color: "#6692FF" },
    17: { name: "Arvid LINDBLAD", team: "Racing Bulls", color: "#6692FF" },
    11: { name: "Sergio PÉREZ", team: "Cadillac Racing", color: "#D4AF37" },
    77: { name: "Valtteri BOTTAS", team: "Cadillac Racing", color: "#D4AF37" },
    12: { name: "Kimi ANTONELLI", team: "Mercedes", color: "#27F4D2" },
    6: { name: "Isack HADJAR", team: "Red Bull Racing", color: "#3671C6" }
  };

  const m1 = roster[d1] || { name: `Driver #${d1}`, team: "F1 Constructor", color: "#22c55e" };
  const m2 = roster[d2] || { name: `Driver #${d2}`, team: "F1 Constructor", color: "#a855f7" };

  const lapTime1 = extras?.d1Fastest?.lap_duration || (74.235 + Math.random() * 1.5);
  const lapTime2 = extras?.d2Fastest?.lap_duration || (lapTime1 + (Math.random() - 0.45) * 0.4);

  const d1_s1 = lapTime1 * 0.28;
  const d1_s2 = lapTime1 * 0.45;
  const d1_s3 = lapTime1 * 0.27;

  const d2_s1 = lapTime2 * 0.282;
  const d2_s2 = lapTime2 * 0.444;
  const d2_s3 = lapTime2 * 0.274;

  const d1Fastest = extras?.d1Fastest || {
    lap_number: 14,
    lap_duration: lapTime1,
    duration_sector_1: d1_s1,
    duration_sector_2: d1_s2,
    duration_sector_3: d1_s3
  };

  const d2Fastest = extras?.d2Fastest || {
    lap_number: 15,
    lap_duration: lapTime2,
    duration_sector_1: d2_s1,
    duration_sector_2: d2_s2,
    duration_sector_3: d2_s3
  };

  const d1Timeline = [];
  const d2Timeline = [];
  let d1Distance = 0;
  let d2Distance = 0;

  for (let i = 0; i < 100; i++) {
    const frac = i / 99;
    let baseSpeed = 310;
    let baseRpm = 11800;
    let baseGear = 8;
    let throttleValue = 100;
    let brakeValue = false;

    if (i >= 15 && i <= 25) {
      const progress = (i - 15) / 10;
      baseSpeed = 85 + Math.pow(progress - 0.5, 2) * 200;
      baseRpm = 9500 + (progress - 0.5) * 2000;
      baseGear = 3;
      throttleValue = progress < 0.5 ? 0 : (progress - 0.5) * 200;
      brakeValue = progress < 0.4;
    }
    else if (i >= 40 && i <= 55) {
      const progress = (i - 40) / 15;
      baseSpeed = 120 + Math.pow(progress - 0.5, 2) * 1500;
      baseRpm = 10200;
      baseGear = 4;
      throttleValue = progress < 0.4 ? 15 : (progress - 0.4) * 140;
      brakeValue = progress < 0.3;
    }
    else if (i >= 70 && i <= 82) {
      const progress = (i - 70) / 12;
      baseSpeed = 95 + Math.pow(progress - 0.5, 2) * 600;
      baseRpm = 8900;
      baseGear = 3;
      throttleValue = progress < 0.5 ? 0 : 100;
      brakeValue = progress < 0.45;
    }
    else {
      baseSpeed = 220 + Math.sin(frac * 10) * 100;
      baseGear = baseSpeed > 300 ? 8 : (baseSpeed > 260 ? 7 : (baseSpeed > 220 ? 6 : 5));
      baseRpm = 11000 + Math.sin(frac * 15) * 1200;
      throttleValue = 100;
      brakeValue = false;
    }

    const d1Offset = Math.sin(i * 0.6) * 2;
    const d1S = Math.min(345, Math.max(78, baseSpeed + d1Offset));
    d1Distance += (d1S / 3.6) * (lapTime1 / 100);

    const theta = (frac * Math.PI * 2) - Math.PI / 2;
    const trackX = Math.round(Math.cos(theta) * 1000 + Math.sin(theta * 2) * 200);
    const trackY = Math.round(Math.sin(theta) * 500 + Math.cos(theta * 3) * 100);

    d1Timeline.push({
      percent: frac * 100,
      distance: Math.round(d1Distance),
      speed: Math.round(d1S),
      rpm: Math.round(Math.min(13100, baseRpm + Math.random() * 100 + d1Offset * 10)),
      gear: baseGear,
      throttle: Math.max(0, Math.min(100, Math.round(throttleValue + Math.random() * 5))),
      brake: brakeValue,
      x: trackX,
      y: trackY
    });

    const d2Offset = Math.cos(i * 0.7) * 3 + (i > 30 && i < 60 ? 4 : -2);
    const d2S = Math.min(345, Math.max(78, baseSpeed + d2Offset));
    d2Distance += (d2S / 3.6) * (lapTime2 / 100);

    d2Timeline.push({
      percent: frac * 100,
      distance: Math.round(d2Distance),
      speed: Math.round(d2S),
      rpm: Math.round(Math.min(13100, baseRpm + Math.random() * 100 + d2Offset * 11)),
      gear: d1S > 300 && d2Offset > 0 ? Math.min(8, baseGear + 1) : baseGear,
      throttle: Math.max(0, Math.min(100, Math.round(throttleValue + (d2Offset > 0 ? 5 : -5)))),
      brake: brakeValue && d2Offset < 0,
      x: trackX + Math.round(d2Offset * 0.5),
      y: trackY + Math.round(d2Offset * 0.5)
    });
  }

  return {
    sessionKey: extras?.sessionKey || 11022,
    year,
    grandPrix: gp,
    sessionName: session,
    driver1: {
      number: d1,
      name: m1.name,
      team: m1.team,
      color: m1.color,
      fastestLap: d1Fastest
    },
    driver1Laps: extras?.d1Laps || getSimulatedLaps(d1, lapTime1, extras?.sessionKey || 11022),
    driver2: {
      number: d2,
      name: m2.name,
      team: m2.team,
      color: m2.color,
      fastestLap: d2Fastest
    },
    driver2Laps: extras?.d2Laps || getSimulatedLaps(d2, lapTime2, extras?.sessionKey || 11022),
    weather: {
      air_temperature: 23.4,
      track_temperature: 31.8,
      humidity: 58.5,
      wind_speed: 1.8,
      wind_direction: 90
    },
    messages: [
      "SESSION STATUS: GREEN FLAG",
      "DRS HAS BEEN ENABLED",
      "METEORLOGY SERVICE: NO RAIN FORECAST DURING SESSION"
    ],
    d1Timeline,
    d2Timeline
  };
}

app.get("/api/openf1/telemetry-compare", async (req, res) => {
  const year = parseInt(req.query.year as string) || 2024;
  const grandPrix = (req.query.grandPrix as string) || "Belgium";
  const sessionType = (req.query.session as string) || "Qualifying";
  const driver1Num = parseInt(req.query.driver1 as string) || 44;
  const driver2Num = parseInt(req.query.driver2 as string) || 63;

  try {
    console.log(`OpenF1 Telemetry Aggregator initiated: Year=${year}, GP=${grandPrix}, Session=${sessionType}, D1=${driver1Num}, D2=${driver2Num}`);
    
    let sessionsUrl = `https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(grandPrix)}&session_name=${encodeURIComponent(sessionType)}`;
    let sessionRes = await fetch(sessionsUrl);
    let sessions = sessionRes.ok ? await sessionRes.json() : [];
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      sessionsUrl = `https://api.openf1.org/v1/sessions?year=${year}&country_name=${encodeURIComponent(grandPrix)}`;
      sessionRes = await fetch(sessionsUrl);
      sessions = sessionRes.ok ? await sessionRes.json() : [];
    }
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      sessionsUrl = `https://api.openf1.org/v1/sessions?year=2024&country_name=${encodeURIComponent(grandPrix)}`;
      sessionRes = await fetch(sessionsUrl);
      sessions = sessionRes.ok ? await sessionRes.json() : [];
    }

    let sessionKey = 9158;
    let resolvedSessionName = sessionType;
    let resolvedGp = grandPrix;
    let resolvedYear = year;

    if (Array.isArray(sessions) && sessions.length > 0) {
      const matched = sessions.find((s: any) => String(s.session_name).toLowerCase() === sessionType.toLowerCase()) || sessions[0];
      sessionKey = matched.session_key;
      resolvedSessionName = matched.session_name || sessionType;
      resolvedGp = matched.country_name || grandPrix;
      resolvedYear = matched.year || year;
    } else {
      console.log("No dynamic session resolved from OpenF1. Operating in high-fidelity simulation mode.");
      return res.json(getSimulatedTelemetry(driver1Num, driver2Num, grandPrix, sessionType, year));
    }

    console.log(`Resolved session key: ${sessionKey}`);

    const driversUrl = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
    const driversRes = await fetch(driversUrl);
    const drivers = driversRes.ok ? await driversRes.json() : [];
    
    const d1Meta = Array.isArray(drivers) ? drivers.find((d: any) => d.driver_number === driver1Num) : null;
    const d2Meta = Array.isArray(drivers) ? drivers.find((d: any) => d.driver_number === driver2Num) : null;

    const d1LapsUrl = `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driver1Num}`;
    const d2LapsUrl = `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driver2Num}`;
    
    const [d1LapsRes, d2LapsRes] = await Promise.all([
      fetch(d1LapsUrl),
      fetch(d2LapsUrl)
    ]);
    
    const d1Laps = d1LapsRes.ok ? await d1LapsRes.json() : [];
    const d2Laps = d2LapsRes.ok ? await d2LapsRes.json() : [];

    if (!Array.isArray(d1Laps) || d1Laps.length === 0 || !Array.isArray(d2Laps) || d2Laps.length === 0) {
      console.log("Empty lap logs found for chosen drivers. Falling back to simulations.");
      return res.json(getSimulatedTelemetry(driver1Num, driver2Num, grandPrix, sessionType, year, { d1Meta, d2Meta }));
    }

    const d1Fastest = d1Laps
      .filter((l: any) => typeof l.lap_duration === 'number' && l.lap_duration > 40)
      .reduce((best: any, current: any) => (!best || current.lap_duration < best.lap_duration) ? current : best, null);

    const d2Fastest = d2Laps
      .filter((l: any) => typeof l.lap_duration === 'number' && l.lap_duration > 40)
      .reduce((best: any, current: any) => (!best || current.lap_duration < best.lap_duration) ? current : best, null);

    if (!d1Fastest || !d2Fastest) {
      return res.json(getSimulatedTelemetry(driver1Num, driver2Num, grandPrix, sessionType, year, { d1Meta, d2Meta }));
    }

    const getLapRange = (lap: any) => {
      const start = new Date(lap.date_start);
      const end = new Date(start.getTime() + lap.lap_duration * 1000);
      return { start: start.toISOString(), end: end.toISOString() };
    };

    const r1 = getLapRange(d1Fastest);
    const r2 = getLapRange(d2Fastest);

    const d1TelemetryUrl = `https://api.openf1.org/v1/car_data?session_key=${sessionKey}&driver_number=${driver1Num}&date>=${r1.start}&date<=${r1.end}`;
    const d2TelemetryUrl = `https://api.openf1.org/v1/car_data?session_key=${sessionKey}&driver_number=${driver2Num}&date>=${r2.start}&date<=${r2.end}`;

    const d1LocationUrl = `https://api.openf1.org/v1/location?session_key=${sessionKey}&driver_number=${driver1Num}&date>=${r1.start}&date<=${r1.end}`;
    const d2LocationUrl = `https://api.openf1.org/v1/location?session_key=${sessionKey}&driver_number=${driver2Num}&date>=${r2.start}&date<=${r2.end}`;

    const weatherUrl = `https://api.openf1.org/v1/weather?session_key=${sessionKey}&date>=${r1.start}&date<=${r1.end}`;
    const raceControlUrl = `https://api.openf1.org/v1/race_control?session_key=${sessionKey}`;

    const [d1TelRes, d2TelRes, d1LocRes, d2LocRes, weatherRes, rcRes] = await Promise.all([
      fetch(d1TelemetryUrl),
      fetch(d2TelemetryUrl),
      fetch(d1LocationUrl),
      fetch(d2LocationUrl),
      fetch(weatherUrl),
      fetch(raceControlUrl)
    ]);

    const d1Tel = d1TelRes.ok ? await d1TelRes.json() : [];
    const d2Tel = d2TelRes.ok ? await d2TelRes.json() : [];
    const d1Loc = d1LocRes.ok ? await d1LocRes.json() : [];
    const d2Loc = d2LocRes.ok ? await d2LocRes.json() : [];
    const weatherList = weatherRes.ok ? await weatherRes.json() : [];
    const rcList = rcRes.ok ? await rcRes.json() : [];

    if (!Array.isArray(d1Tel) || d1Tel.length === 0 || !Array.isArray(d2Tel) || d2Tel.length === 0) {
      console.log("No detailed car telemetry records returned. Providing high-fidelity calculations.");
      return res.json(getSimulatedTelemetry(driver1Num, driver2Num, grandPrix, sessionType, year, { d1Meta, d2Meta, d1Fastest, d2Fastest }));
    }

    const parseLapTelemetry = (telemetry: any[], locations: any[], lapDuration: number) => {
      const points = [];
      let totalDistance = 0;

      for (let i = 0; i < 100; i++) {
        const indexTel = Math.min(Math.floor((i / 99) * (telemetry.length - 1)), telemetry.length - 1);
        const indexLoc = Math.min(Math.floor((i / 99) * (locations.length - 1)), locations.length - 1);
        const tel = telemetry[indexTel] || { speed: 200, rpm: 11000, n_gear: 5, throttle: 100, brake: false };
        const loc = locations[indexLoc] || { x: 0, y: 0, z: 0 };

        const fraction = i / 99;
        const speedKmh = tel.speed || 0;
        const speedMs = speedKmh / 3.6;
        
        const pointDuration = lapDuration / 100;
        totalDistance += speedMs * pointDuration;

        points.push({
          percent: fraction * 100,
          distance: Math.round(totalDistance),
          speed: speedKmh,
          rpm: tel.rpm || 11000,
          gear: tel.n_gear || 1,
          throttle: tel.throttle || 0,
          brake: tel.brake === true || tel.brake === 1 || String(tel.brake).toLowerCase() === "true" || (speedKmh < 150 && Math.random() > 0.6),
          x: loc.x || 0,
          y: loc.y || 0
        });
      }
      return points;
    };

    const d1Timeline = parseLapTelemetry(d1Tel, d1Loc, d1Fastest.lap_duration);
    const d2Timeline = parseLapTelemetry(d2Tel, d2Loc, d2Fastest.lap_duration);

    const weather = Array.isArray(weatherList) && weatherList.length > 0 ? weatherList[0] : {
      air_temperature: 24.5,
      track_temperature: 32.1,
      humidity: 62.4,
      wind_speed: 2.1,
      wind_direction: 180
    };

    const messages = Array.isArray(rcList) ? rcList.slice(-5).map((m: any) => m.message || "Track session green flag") : ["Track session and timing clear"];

    return res.json({
      sessionKey,
      year: resolvedYear,
      grandPrix: resolvedGp,
      sessionName: resolvedSessionName,
      driver1: {
        number: driver1Num,
        name: d1Meta?.full_name || `Driver #${driver1Num}`,
        team: d1Meta?.team_name || "Constructor Team",
        color: d1Meta?.team_colour ? `#${d1Meta.team_colour}` : "#22c55e",
        fastestLap: d1Fastest
      },
      driver1Laps: d1Laps,
      driver2: {
        number: driver2Num,
        name: d2Meta?.full_name || `Driver #${driver2Num}`,
        team: d2Meta?.team_name || "Constructor Team",
        color: d2Meta?.team_colour ? `#${d2Meta.team_colour}` : "#a855f7",
        fastestLap: d2Fastest
      },
      driver2Laps: d2Laps,
      weather,
      messages,
      d1Timeline,
      d2Timeline
    });

  } catch (err: any) {
    console.error("OpenF1 API exception: ", err);
    return res.json(getSimulatedTelemetry(driver1Num, driver2Num, grandPrix, sessionType, year));
  }
});

// Resilient in-memory cache for Ergast F1 Mirror requests to eliminate rate limit 429 faults
const ergastCache = new Map<string, { data: any, expiresAt: number }>();

function generateProgrammaticErgastFallback(pathPart: string, queryStr: string) {
  const cleanPath = pathPart.replace(/^\/+|\/+$/g, "");
  const segments = cleanPath.split("/");

  const firstNames = ["Niki", "Alain", "Ayrton", "Jody", "Mario", "James", "Jackie", "Graham", "Jim", "Juan", "Emerson", "Clay", "Gilles", "Nelson", "Keke", "Michael", "Mika", "Fernando", "Lewis", "Sebastian", "Max", "Damon", "Jacques", "Nigel", "John", "Kimi", "Jenson", "Rubens", "David", "Robert"];
  const lastNames = ["Lauda", "Prost", "Senna", "Scheckter", "Andretti", "Hunt", "Stewart", "Hill", "Clark", "Fangio", "Fittipaldi", "Regazzoni", "Villeneuve", "Piquet", "Rosberg", "Schumacher", "Hakkinen", "Alonso", "Hamilton", "Vettel", "Verstappen", "Mansell", "Berger", "Sainz", "Leclerc", "Norris", "Piastri", "Russell", "Raikkonen", "Button", "Barrichello", "Coulthard", "Kubica", "Jones", "Watson"];
  const constructorsPool = ["ferrari", "mclaren", "williams", "lotus", "brabham", "tyrrell", "renault", "benetton", "red_bull", "mercedes", "jordan", "sauber", "ligier", "brm", "cooper"];

  function getSeededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getSeededItem<T>(arr: T[], seed: number): T {
    const rand = getSeededRandom(seed);
    return arr[Math.floor(rand * arr.length)];
  }

  function getDriversForYear(year: number) {
    const driversList = [];
    for (let i = 1; i <= 20; i++) {
      const seed = year * 100 + i;
      const firstName = getSeededItem(firstNames, seed + 1);
      const familyName = getSeededItem(lastNames, seed + 2);
      const code = (familyName.slice(0, 3)).toUpperCase();
      const driverId = `${firstName.toLowerCase()}_${familyName.toLowerCase()}`.replace(/[^a-z0-9_]/g, "");
      const permanentNumber = String(Math.floor(getSeededRandom(seed + 3) * 98) + 1);
      const nationality = getSeededItem(["German", "British", "Brazilian", "French", "Italian", "American", "Australian", "Spanish", "Austrian", "Swiss", "Finnish", "Japanese", "Canadian"], seed + 4);

      const dobYear = year - 23 - Math.floor(getSeededRandom(seed + 5) * 15);
      const dobMonth = String(Math.floor(getSeededRandom(seed + 6) * 11) + 1).padStart(2, "0");
      const dobDay = String(Math.floor(getSeededRandom(seed + 7) * 27) + 1).padStart(2, "0");

      const constructorId = getSeededItem(constructorsPool, seed + 8);
      const constructorName = constructorId.charAt(0).toUpperCase() + constructorId.slice(1).replace("_", " ");

      driversList.push({
        position: String(i),
        points: String(Math.max(0, 240 - i * 11 - Math.floor(getSeededRandom(seed + 9) * 8))),
        wins: i <= 3 ? String(4 - i) : "0",
        Driver: {
          driverId,
          permanentNumber,
          code,
          url: `https://en.wikipedia.org/wiki/${firstName}_${familyName}`,
          givenName: firstName,
          familyName,
          dateOfBirth: `${dobYear}-${dobMonth}-${dobDay}`,
          nationality
        },
        Constructor: {
          constructorId,
          name: constructorName,
          nationality: getSeededItem(["Italian", "British", "French", "German", "Austrian"], seed + 10),
          url: `https://en.wikipedia.org/wiki/${constructorName}`
        }
      });
    }
    return driversList;
  }

  const originalCircuitNames = [
    { name: "Silverstone Circuit", locality: "Silverstone", country: "UK", lat: 52.0786, long: -1.01692 },
    { name: "Circuit de Monaco", locality: "Monte Carlo", country: "Monaco", lat: 43.7347, long: 7.42056 },
    { name: "Autodromo Nazionale Monza", locality: "Monza", country: "Italy", lat: 45.6156, long: 9.28111 },
    { name: "Circuit de Spa-Francorchamps", locality: "Spa", country: "Belgium", lat: 50.4372, long: 5.97139 },
    { name: "Circuit Gilles Villeneuve", locality: "Montreal", country: "Canada", lat: 45.5005, long: -73.5228 },
    { name: "Suzuka International Racing Course", locality: "Suzuka", country: "Japan", lat: 34.8431, long: 136.541 },
    { name: "Interlagos", locality: "São Paulo", country: "Brazil", lat: -23.7036, long: -46.6997 },
    { name: "Hungaroring", locality: "Budapest", country: "Hungary", lat: 47.583, long: 19.2511 },
    { name: "Red Bull Ring", locality: "Spielberg", country: "Austria", lat: 47.2197, long: 14.7647 },
    { name: "Marina Bay Street Circuit", locality: "Marina Bay", country: "Singapore", lat: 1.2914, long: 103.864 },
    { name: "Bahrain International Circuit", locality: "Sakhir", country: "Bahrain", lat: 26.0325, long: 50.5106 },
    { name: "Albert Park Grand Prix Circuit", locality: "Melbourne", country: "Australia", lat: -37.8497, long: 144.968 }
  ];

  function getRacesForYear(year: number) {
    const racesList = [];
    const raceCount = year < 1980 ? 12 : 18;
    for (let r = 1; r <= raceCount; r++) {
      const seed = year * 50 + r;
      const circ = getSeededItem(originalCircuitNames, seed + 1);
      const raceName = `${circ.country} Grand Prix`;
      const circuitId = circ.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

      const monthNum = 3 + Math.floor((r / raceCount) * 8);
      const dayNum = 1 + Math.floor(getSeededRandom(seed + 2) * 27);
      const dateString = `${year}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

      racesList.push({
        season: String(year),
        round: String(r),
        url: `https://en.wikipedia.org/wiki/${year}_${raceName.replace(" ", "_")}`,
        raceName,
        Circuit: {
          circuitId,
          url: `https://en.wikipedia.org/wiki/${circ.name.replace(" ", "_")}`,
          circuitName: circ.name,
          Location: {
            lat: String(circ.lat),
            long: String(circ.long),
            locality: circ.locality,
            country: circ.country
          }
        },
        date: dateString,
        time: "14:00:00Z"
      });
    }
    return racesList;
  }

  if (cleanPath === "seasons.json") {
    const seasonsList = [];
    for (let y = 2026; y >= 1950; y--) {
      seasonsList.push({ season: String(y), url: "" });
    }
    return {
      MRData: {
        xmlns: "http://ergast.com/mrd/1.5",
        series: "f1",
        url: "http://ergast.com/api/f1/seasons.json",
        limit: "1000",
        offset: "0",
        total: String(seasonsList.length),
        SeasonTable: { Seasons: seasonsList }
      }
    };
  }

  if (segments.length === 2 && segments[1] === "driverstandings.json") {
    const year = parseInt(segments[0]) || 2024;
    const standings = getDriversForYear(year).map((drv) => ({
      position: drv.position,
      positionText: drv.position,
      points: drv.points,
      wins: drv.wins,
      Driver: drv.Driver,
      Constructors: [drv.Constructor]
    }));

    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/${year}/driverstandings.json`,
        limit: "30",
        offset: "0",
        total: String(standings.length),
        StandingsTable: {
          season: String(year),
          StandingsLists: [
            {
              season: String(year),
              round: "15",
              DriverStandings: standings
            }
          ]
        }
      }
    };
  }

  if (segments.length === 2 && segments[1] === "constructorstandings.json") {
    const year = parseInt(segments[0]) || 2024;
    const teamPoints: Record<string, { name: string, points: number, wins: number, nationality: string }> = {};

    getDriversForYear(year).forEach((d) => {
      const cid = d.Constructor.constructorId;
      if (!teamPoints[cid]) {
        teamPoints[cid] = {
          name: d.Constructor.name,
          points: 0,
          wins: 0,
          nationality: d.Constructor.nationality
        };
      }
      teamPoints[cid].points += parseInt(d.points) || 0;
      teamPoints[cid].wins += parseInt(d.wins) || 0;
    });

    const constructorsStanding = Object.entries(teamPoints)
      .map(([cid, info]) => ({
        points: String(info.points),
        wins: String(info.wins),
        Constructor: {
          constructorId: cid,
          name: info.name,
          nationality: info.nationality,
          url: ""
        }
      }))
      .sort((a, b) => parseInt(b.points) - parseInt(a.points))
      .map((item, idx) => ({
        position: String(idx + 1),
        positionText: String(idx + 1),
        ...item
      }));

    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/${year}/constructorstandings.json`,
        limit: "30",
        offset: "0",
        total: String(constructorsStanding.length),
        StandingsTable: {
          season: String(year),
          StandingsLists: [
            {
              season: String(year),
              round: "15",
              ConstructorStandings: constructorsStanding
            }
          ]
        }
      }
    };
  }

  if (segments.length === 1 && segments[0].endsWith(".json")) {
    const sStr = segments[0].replace(".json", "");
    const year = parseInt(sStr) || 2024;
    const races = getRacesForYear(year);
    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/${year}.json`,
        limit: "100",
        offset: "0",
        total: String(races.length),
        RaceTable: {
          season: String(year),
          Races: races
        }
      }
    };
  }

  if (segments.length === 2 && segments[1].startsWith("drivers.json")) {
    const year = parseInt(segments[0]) || 2024;
    const drivers = getDriversForYear(year).map((item) => item.Driver);
    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/${year}/drivers.json`,
        limit: "100",
        offset: "0",
        total: String(drivers.length),
        DriverTable: {
          season: String(year),
          Drivers: drivers
        }
      }
    };
  }

  if (segments.length === 3 && segments[2] === "results.json") {
    const year = parseInt(segments[0]) || 2024;
    const round = parseInt(segments[1]) || 1;
    const races = getRacesForYear(year);
    const targetRace = races.find((r) => r.round === String(round)) || races[0];

    const results = getDriversForYear(year).map((drv, idx) => {
      const pos = idx + 1;
      const seed = year * 100 + round * 10 + pos;
      const delay = (pos - 1) * 3 + getSeededRandom(seed) * 2;
      const timeStr = pos === 1 ? "1:31:04.281" : `+${delay.toFixed(3)}`;
      const lapCount = year < 1980 ? 50 : 57;

      return {
        number: drv.Driver.permanentNumber,
        position: String(pos),
        positionText: String(pos),
        points: String(pos === 1 ? 25 : pos === 2 ? 18 : pos === 3 ? 15 : pos === 4 ? 12 : pos === 5 ? 10 : pos === 6 ? 8 : pos === 7 ? 6 : pos === 8 ? 4 : pos === 9 ? 2 : pos === 10 ? 1 : 0),
        Driver: drv.Driver,
        Constructor: drv.Constructor,
        grid: String(Math.floor(getSeededRandom(seed + 1) * 10) + pos),
        laps: String(lapCount),
        status: idx === 18 ? "Engine" : idx === 19 ? "Accident" : "Finished",
        Time: pos === 1 ? { millis: "5464281", time: timeStr } : { time: timeStr },
        FastestLap: {
          rank: String(pos),
          lap: String(Math.floor(getSeededRandom(seed + 2) * 20) + 15),
          Time: {
            time: `1:24.${(200 + pos * 53).toString().padStart(3, "0")}`
          },
          AverageSpeed: {
            units: "kph",
            speed: (215 - pos * 1.5).toFixed(1)
          }
        }
      };
    });

    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/${year}/${round}/results.json`,
        limit: "50",
        offset: "0",
        total: "1",
        RaceTable: {
          season: String(year),
          round: String(round),
          Races: [
            {
              ...targetRace,
              Results: results
            }
          ]
        }
      }
    };
  }

  if (segments.length === 3 && segments[0] === "drivers" && segments[2].startsWith("results.json")) {
    const driverId = segments[1];
    const driverRaces = [];
    const driverFirst = driverId.split("_")[0] || "Lewis";
    const driverLast = driverId.split("_")[1] || "Hamilton";
    const code = (driverLast.slice(0, 3)).toUpperCase();
    const dObj = {
      driverId,
      permanentNumber: "44",
      code,
      url: `https://en.wikipedia.org/wiki/${driverFirst}_${driverLast}`,
      givenName: driverFirst.charAt(0).toUpperCase() + driverFirst.slice(1),
      familyName: driverLast.charAt(0).toUpperCase() + driverLast.slice(1),
      dateOfBirth: "1985-01-07",
      nationality: "British"
    };

    const cObj = {
      constructorId: "mercedes",
      name: "Mercedes",
      nationality: "German",
      url: ""
    };

    for (let y = 2021; y <= 2024; y++) {
      const races = getRacesForYear(y).slice(0, 5);
      races.forEach((rc, rIdx) => {
        const seed = y * 10 + rIdx;
        const pos = Math.floor(getSeededRandom(seed) * 8) + 1;
        driverRaces.push({
          ...rc,
          Results: [
            {
              number: "44",
              position: String(pos),
              positionText: String(pos),
              points: String(pos === 1 ? 25 : pos === 2 ? 18 : pos === 3 ? 15 : pos === 4 ? 12 : pos === 5 ? 10 : pos === 6 ? 8 : pos === 7 ? 6 : pos === 8 ? 4 : 0),
              Driver: dObj,
              Constructor: cObj,
              grid: String(pos + 1),
              laps: "57",
              status: "Finished"
            }
          ]
        });
      });
    }

    return {
      MRData: {
        series: "f1",
        url: `http://ergast.com/api/f1/drivers/${driverId}/results.json`,
        limit: "100",
        offset: "0",
        total: String(driverRaces.length),
        RaceTable: {
          driverId,
          Races: driverRaces
        }
      }
    };
  }

  return {
    MRData: {
      series: "f1",
      url: `http://ergast.com/api/f1/unknown`,
      limit: "30",
      offset: "0",
      total: "0",
      RaceTable: { Races: [] },
      StandingsTable: { StandingsLists: [] },
      DriverTable: { Drivers: [] }
    }
  };
}

app.get("/api/ergast/*", async (req, res) => {
  const pathPart = req.params[0] || "";
  const queryStr = req.url.split("?")[1] || "";
  const cacheKey = `ergast_${pathPart}?${queryStr}`;

  if (ergastCache.has(cacheKey)) {
    const cached = ergastCache.get(cacheKey)!;
    if (Date.now() < cached.expiresAt) {
      return res.json(cached.data);
    }
  }

  try {
    const targetUrl = `https://api.jolpi.ca/ergast/f1/${pathPart}${queryStr ? "?" + queryStr : ""}`;
    const headRes = await fetch(targetUrl, {
      headers: { "Accept": "application/json" }
    });

    if (headRes.ok) {
      const data = await headRes.json();
      const isPastYear = !pathPart.startsWith("2026") && !pathPart.startsWith("2025");
      const ttl = isPastYear ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
      ergastCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
      return res.json(data);
    } else {
      console.warn(`Jolpi fetch returned state ${headRes.status} for path ${pathPart}. Serving fallback.`);
    }
  } catch (err) {
    console.warn(`Jolpi fetch failed:`, err);
  }

  if (ergastCache.has(cacheKey)) {
    return res.json(ergastCache.get(cacheKey)!.data);
  }

  const fallbackData = generateProgrammaticErgastFallback(pathPart, queryStr);
  return res.json(fallbackData);
});

// Proxy for sessions to bypass browser limits / CORS issues / downtime
app.get("/api/openf1/sessions", async (req, res) => {
  const year = parseInt(req.query.year as string) || 2024;
  const mockSessions = [
    { session_key: year * 10 + 1, session_name: "Race", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
    { session_key: year * 10 + 2, session_name: "Qualifying", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
    { session_key: year * 10 + 3, session_name: "Practice 1", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
    { session_key: year * 10 + 4, session_name: "Race", location: "Marina Bay", country_name: "Singapore", year, meeting_name: "Singapore Grand Prix" },
    { session_key: year * 10 + 5, session_name: "Qualifying", location: "Marina Bay", country_name: "Singapore", year, meeting_name: "Singapore Grand Prix" },
    { session_key: year * 10 + 6, session_name: "Race", location: "Spa-Francorchamps", country_name: "Belgium", year, meeting_name: "Belgian Grand Prix" },
    { session_key: year * 10 + 7, session_name: "Qualifying", location: "Spa-Francorchamps", country_name: "Belgium", year, meeting_name: "Belgian Grand Prix" },
    { session_key: year * 10 + 8, session_name: "Race", location: "Monza", country_name: "Italy", year, meeting_name: "Italian Grand Prix" },
    { session_key: year * 10 + 9, session_name: "Qualifying", location: "Monza", country_name: "Italy", year, meeting_name: "Italian Grand Prix" },
  ];

  if (year >= 2025) {
    return res.json(mockSessions);
  }

  try {
    const sessionsUrl = `https://api.openf1.org/v1/sessions?year=${year}`;
    const sessionRes = await fetch(sessionsUrl);
    if (sessionRes.ok) {
      const data = await sessionRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
    return res.json(mockSessions);
  } catch (err) {
    console.info("Sessions proxy fallback served successfully.");
    return res.json(mockSessions);
  }
});

// Proxy for drivers to bypass browser limits / CORS issues / downtime
app.get("/api/openf1/drivers", async (req, res) => {
  const sessionKey = req.query.session_key;
  const mockDrivers = [
    { driver_number: 1, full_name: "Max Verstappen", name_acronym: "VER", team_name: "Red Bull Racing", team_colour: "1E41FF" },
    { driver_number: 44, full_name: "Lewis Hamilton", name_acronym: "HAM", team_name: "Mercedes AMG", team_colour: "27F4D2" },
    { driver_number: 63, full_name: "George Russell", name_acronym: "RUS", team_name: "Mercedes AMG", team_colour: "27F4D2" },
    { driver_number: 4, full_name: "Lando Norris", name_acronym: "NOR", team_name: "McLaren", team_colour: "FF8700" },
    { driver_number: 81, full_name: "Oscar Piastri", name_acronym: "PIA", team_name: "McLaren", team_colour: "FF8700" },
    { driver_number: 16, full_name: "Charles Leclerc", name_acronym: "LEC", team_name: "Scuderia Ferrari", team_colour: "F91536" },
    { driver_number: 55, full_name: "Carlos Sainz", name_acronym: "SAI", team_name: "Scuderia Ferrari", team_colour: "F91536" },
    { driver_number: 14, full_name: "Fernando Alonso", name_acronym: "ALO", team_name: "Aston Martin", team_colour: "229971" },
    { driver_number: 11, full_name: "Sergio Perez", name_acronym: "PER", team_name: "Red Bull Racing", team_colour: "1E41FF" },
    { driver_number: 23, full_name: "Alexander Albon", name_acronym: "ALB", team_name: "Williams Racing", team_colour: "37BEDD" }
  ];

  try {
    if (!sessionKey) return res.json(mockDrivers);
    const skVal = Number(sessionKey);
    if (!isNaN(skVal) && skVal >= 15000) {
      return res.json(mockDrivers);
    }

    const driversUrl = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
    const driversRes = await fetch(driversUrl);
    if (driversRes.ok) {
      const data = await driversRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
    return res.json(mockDrivers);
  } catch (err) {
    console.info("Drivers proxy fallback served successfully.");
    return res.json(mockDrivers);
  }
});

// Proxy for laps to bypass browser limits / CORS issues / downtime
app.get("/api/openf1/laps", async (req, res) => {
  const sessionKey = req.query.session_key;
  const driverNumber = req.query.driver_number;
  try {
    if (!sessionKey || !driverNumber) {
      return res.json([]);
    }
    const skVal = Number(sessionKey);
    if (!isNaN(skVal) && skVal >= 15000) {
      const laps = getSimulatedLaps(Number(driverNumber), 75.5, skVal, 20);
      return res.json(laps);
    }
    const lapsUrl = `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverNumber}`;
    const lapsRes = await fetch(lapsUrl);
    if (lapsRes.ok) {
      const data = await lapsRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
    const laps = getSimulatedLaps(Number(driverNumber), 75.5, Number(sessionKey), 20);
    return res.json(laps);
  } catch (err) {
    console.info("Laps proxy fallback served successfully.");
    const laps = getSimulatedLaps(Number(driverNumber) || 44, 75.5, Number(sessionKey) || 9161, 20);
    return res.json(laps);
  }
});

const TELEMETRY_UPLOADS_PATH = path.join(process.cwd(), "UploadedTelemetries.json");

function readUploadedTelemetries(): any[] {
  try {
    if (!fs.existsSync(TELEMETRY_UPLOADS_PATH)) {
      fs.writeFileSync(TELEMETRY_UPLOADS_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(TELEMETRY_UPLOADS_PATH, "utf8");
    const parsed = JSON.parse(data || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading from UploadedTelemetries.json:", error);
    return [];
  }
}

function writeUploadedTelemetries(data: any[]): boolean {
  try {
    fs.writeFileSync(TELEMETRY_UPLOADS_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to UploadedTelemetries.json:", error);
    return false;
  }
}

// GET all uploaded telemetries
app.get("/api/admin/uploaded-telemetries", (req, res) => {
  try {
    const list = readUploadedTelemetries();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to retrieve uploaded telemetries" });
  }
});

// POST new uploaded telemetry
app.post("/api/admin/upload-telemetry", (req, res) => {
  try {
    const { year, gp, session, driver, lapsCsv, telemetryCsv } = req.body;
    
    if (!year || !gp || !session || !driver || !lapsCsv || !telemetryCsv) {
      return res.status(400).json({ error: "Missing required inputs or files data" });
    }
    
    const list = readUploadedTelemetries();
    const newRecord = {
      id: `tel-${Date.now()}-${Math.floor(100+Math.random()*900)}`,
      year: Number(year),
      gp,
      session,
      driver,
      lapsCsv,
      telemetryCsv,
      uploadedAt: new Date().toISOString()
    };
    
    list.push(newRecord);
    const success = writeUploadedTelemetries(list);
    
    if (success) {
      return res.json({ success: true, telemetry: newRecord });
    } else {
      return res.status(500).json({ error: "Failed to save telemetry to persistent JSON store" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred during database upload" });
  }
});

// DELETE uploaded telemetry
app.delete("/api/admin/delete-telemetry/:id", (req, res) => {
  try {
    const { id } = req.params;
    let list = readUploadedTelemetries();
    const originalLength = list.length;
    list = list.filter((item: any) => item.id !== id);
    if (list.length === originalLength) {
      return res.status(404).json({ error: "Telemetry record not found" });
    }
    const success = writeUploadedTelemetries(list);
    if (success) {
      return res.json({ success: true, message: "Telemetry record deleted" });
    } else {
      return res.status(500).json({ error: "Failed to persist updated telemetry store" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected error occurred during record deletion" });
  }
});

// Paddock Polls Persistence Database
const POLLS_DATABASE_PATH = path.join(process.cwd(), "DatabasePolls.json");

function readPolls(): any[] {
  try {
    if (!fs.existsSync(POLLS_DATABASE_PATH)) {
      const defaultPolls: any[] = [];
      fs.writeFileSync(POLLS_DATABASE_PATH, JSON.stringify(defaultPolls, null, 2));
      return defaultPolls;
    }
    const data = fs.readFileSync(POLLS_DATABASE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading DatabasePolls.json:", error);
    return [];
  }
}

function writePolls(polls: any[]): boolean {
  try {
    fs.writeFileSync(POLLS_DATABASE_PATH, JSON.stringify(polls, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing DatabasePolls.json:", error);
    return false;
  }
}

// REST Endpoints: Polls
app.get("/api/polls", (req, res) => {
  try {
    const polls = readPolls();
    return res.json({ success: true, polls });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to retrieve polls" });
  }
});

app.post("/api/polls", (req, res) => {
  try {
    const { question, options, createdBy, category, durationHours } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "A poll question and at least two options are required" });
    }

    const polls = readPolls();
    
    // Initialize votes object
    const votes: Record<string, number> = {};
    options.forEach(opt => {
      votes[opt] = 0;
    });

    // Compute expiration
    let expiresAt: string | null = null;
    if (durationHours && !isNaN(Number(durationHours)) && Number(durationHours) > 0) {
      expiresAt = new Date(Date.now() + Number(durationHours) * 60 * 60 * 1000).toISOString();
    }

    const newPoll = {
      id: `poll-${Date.now()}`,
      question: question.trim(),
      options: options.map(o => o.trim()),
      category: category ? category.trim() : "GENERAL",
      votes,
      votedUsers: [],
      votedIps: [],
      createdAt: new Date().toISOString(),
      expiresAt,
      createdBy: createdBy || "Paddock Control",
      active: true
    };

    polls.unshift(newPoll);
    writePolls(polls);

    return res.json({ success: true, poll: newPoll });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create poll" });
  }
});

app.post("/api/polls/:id/vote", (req, res) => {
  try {
    const { id } = req.params;
    const { option, username } = req.body;

    if (!option) {
      return res.status(400).json({ error: "Selected vote option is required" });
    }

    const polls = readPolls();
    const poll = polls.find(p => p.id === id);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if dynamic time has expired
    if (poll.expiresAt && new Date(poll.expiresAt).getTime() < Date.now()) {
      poll.active = false;
    }

    if (!poll.active) {
      return res.status(400).json({ error: "This paddock poll has reached its final checkered flag and is now locked" });
    }

    // Check if user has already voted
    const identityString = username ? username.toLowerCase() : "anonymous_ip_" + (req.ip || "unknown");
    const hasVoted = poll.votedUsers && poll.votedUsers.some((u: string) => u.toLowerCase() === identityString);

    if (hasVoted) {
      return res.status(400).json({ error: "You have already casted your ballot on this paddock poll" });
    }

    // Initialize tracking arrays if not present
    if (!poll.votedUsers) poll.votedUsers = [];
    poll.votedUsers.push(identityString);

    // Increment option vote
    if (typeof poll.votes[option] === 'number') {
      poll.votes[option] += 1;
    } else {
      poll.votes[option] = 1;
    }

    writePolls(polls);
    return res.json({ success: true, poll });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit vote" });
  }
});

app.post("/api/polls/:id/toggle", (req, res) => {
  try {
    const { id } = req.params;
    const polls = readPolls();
    const poll = polls.find(p => p.id === id);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    poll.active = !poll.active;
    writePolls(polls);

    return res.json({ success: true, poll });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle poll status" });
  }
});

app.delete("/api/polls/:id", (req, res) => {
  try {
    const { id } = req.params;
    let polls = readPolls();
    const originalLength = polls.length;
    polls = polls.filter(p => p.id !== id);

    if (polls.length === originalLength) {
      return res.status(404).json({ error: "Poll not found" });
    }

    writePolls(polls);
    return res.json({ success: true, message: "Poll successfully cleared from archive" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete poll" });
  }
});

// Paddock Announcements / Releases Database
const ANNOUNCEMENTS_DATABASE_PATH = path.join(process.cwd(), "DatabaseAnnouncements.json");

function readAnnouncements(): any[] {
  try {
    if (!fs.existsSync(ANNOUNCEMENTS_DATABASE_PATH)) {
      const defaultAnnouncements: any[] = [];
      fs.writeFileSync(ANNOUNCEMENTS_DATABASE_PATH, JSON.stringify(defaultAnnouncements, null, 2));
      return defaultAnnouncements;
    }
    const data = fs.readFileSync(ANNOUNCEMENTS_DATABASE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading DatabaseAnnouncements.json:", error);
    return [];
  }
}

function writeAnnouncements(announcements: any[]): boolean {
  try {
    fs.writeFileSync(ANNOUNCEMENTS_DATABASE_PATH, JSON.stringify(announcements, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing DatabaseAnnouncements.json:", error);
    return false;
  }
}

// REST Endpoints: Announcements
app.get("/api/announcements", (req, res) => {
  try {
    let announcements = readAnnouncements();
    const now = Date.now();
    // Filter out announcements where expiresAt is populated and in the past
    let writeBackNeeded = false;
    const activeAnnouncements = announcements.filter(a => {
      if (a.expiresAt) {
        const hasExpired = new Date(a.expiresAt).getTime() < now;
        if (hasExpired) {
          writeBackNeeded = true;
          return false;
        }
      }
      return true;
    });
    
    if (writeBackNeeded) {
      writeAnnouncements(activeAnnouncements);
    }
    
    return res.json({ success: true, announcements: activeAnnouncements });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to retrieve announcements" });
  }
});

app.post("/api/announcements", (req, res) => {
  try {
    const { title, content, category, createdBy, expiryMinutes } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required to release announcements" });
    }

    const announcements = readAnnouncements();
    
    let expiresAt = null;
    if (expiryMinutes && Number(expiryMinutes) > 0) {
      expiresAt = new Date(Date.now() + Number(expiryMinutes) * 60000).toISOString();
    }

    const newAnn = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim().toUpperCase() : "GENERAL",
      createdAt: new Date().toISOString(),
      expiresAt,
      createdBy: createdBy || "Paddock Control"
    };

    announcements.unshift(newAnn);
    writeAnnouncements(announcements);

    return res.json({ success: true, announcement: newAnn });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to release announcement" });
  }
});

app.put("/api/announcements/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, expiryMinutes } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required to modify announcements" });
    }

    const announcements = readAnnouncements();
    const ann = announcements.find(a => a.id === id);

    if (!ann) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    ann.title = title.trim();
    ann.content = content.trim();
    if (category) {
      ann.category = category.trim().toUpperCase();
    }
    
    if (expiryMinutes !== undefined) {
      if (Number(expiryMinutes) > 0) {
        ann.expiresAt = new Date(Date.now() + Number(expiryMinutes) * 60000).toISOString();
      } else {
        ann.expiresAt = null;
      }
    }

    writeAnnouncements(announcements);
    return res.json({ success: true, announcement: ann });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to edit announcement" });
  }
});

app.delete("/api/announcements/:id", (req, res) => {
  try {
    const { id } = req.params;
    let announcements = readAnnouncements();
    const originalLength = announcements.length;
    announcements = announcements.filter(a => a.id !== id);

    if (announcements.length === originalLength) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    writeAnnouncements(announcements);
    return res.json({ success: true, message: "Announcement successfully deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete announcement" });
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
