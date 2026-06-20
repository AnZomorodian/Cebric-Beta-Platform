import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, ShieldCheck, Lock, Unlock, Sparkles, Send, RefreshCw, 
  AlertTriangle, Compass, HelpCircle, Check, Calendar, MapPin, 
  Watch, Settings, Shield, Sliders, ChevronDown, ChevronUp, Star, TrendingUp,
  X, ShieldAlert, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Converts ISO UTC string to local YYYY-MM-DDTHH:mm for datetime-local
const toLocalDateTimeLocal = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000; // in ms
  const localTime = new Date(d.getTime() - tzOffset);
  return localTime.toISOString().slice(0, 16);
};

// Converts local datetime-local string to ISO UTC string
const fromLocalDateTimeLocal = (localString: string) => {
  if (!localString) return "";
  const d = new Date(localString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
};

const REAL_DRIVERS_LIST = [
  "Arvid Lindblad",
  "Alexander Albon",
  "Carlos Sainz",
  "Charles Leclerc",
  "Esteban Ocon",
  "Fernando Alonso",
  "Franco Colapinto",
  "Gabriel Bortoleto",
  "George Russell",
  "Isack Hadjar",
  "Kimi Antonelli",
  "Lance Stroll",
  "Lando Norris",
  "Lewis Hamilton",
  "Liam Lawson",
  "Max Verstappen",
  "Nico Hülkenberg",
  "Oliver Bearman",
  "Oscar Piastri",
  "Pierre Gasly",
  "Sergio Pérez",
  "Valtteri Bottas"
];

interface PredictionData {
  poleDriver: string;
  qualifyingP2: string;
  qualifyingP3: string;
  p1Winner: string;
  p2Winner: string;
  p3Winner: string;
  top10Finishers: string[]; // exactly 10 drivers
  fastestLap: string;
  driverOfTheDay: string;
  firstDNF: string; // driver or "None"
  numberOfDNFs: number;
  safetyCar: string; // "yes" / "no"
  virtualSafetyCar: string; // "yes" / "no"
  redFlag: string; // "yes" / "no"
  mostPositionsGained: string;
}

interface PredictionSettings {
  nextGpName: string;
  nextGpLocation: string;
  nextGpDate: string;
  globalLock: boolean;
  scoringRules: {
    pole: number;
    qualifyingP2: number;
    qualifyingP3: number;
    winner: number;
    podium: number;
    top10Multiplier: number;
    fastestLap: number;
    dotd: number;
    firstDnf: number;
    numDnfs: number;
    safetyCar: number;
    vsc: number;
    redFlag: number;
    gains: number;
  };
  certifiedResults: {
    poleDriver: string;
    qualifyingP2: string;
    qualifyingP3: string;
    p1Winner: string;
    p2Winner: string;
    p3Winner: string;
    top10Finishers: string[];
    fastestLap: string;
    driverOfTheDay: string;
    firstDNF: string;
    numberOfDNFs: number;
    safetyCar: string;
    virtualSafetyCar: string;
    redFlag: string;
    mostPositionsGained: string;
  };
}

interface PredictionsTabProps {
  seasonData?: any;
}

export default function PredictionsTab({ seasonData }: PredictionsTabProps) {
  const [sessionUser, setSessionUser] = useState<any>(null);

  // New states for aggregates, lifecycle, and logs
  const [aggregateStats, setAggregateStats] = useState<any>(null);
  const [showClosingToast, setShowClosingToast] = useState<boolean>(true);
  const [usersPredictionsList, setUsersPredictionsList] = useState<any[]>([]);
  const [loadingUsersPredictions, setLoadingUsersPredictions] = useState<boolean>(false);
  const [spawnNewGPData, setSpawnNewGPData] = useState({
    name: "",
    location: "",
    date: "",
    lockTime: ""
  });
  
  // Hardcoded defaults mapping to back-end initial state
  const [prediction, setPrediction] = useState<PredictionData>({
    poleDriver: '',
    qualifyingP2: '',
    qualifyingP3: '',
    p1Winner: '',
    p2Winner: '',
    p3Winner: '',
    top10Finishers: Array(10).fill(''),
    fastestLap: '',
    driverOfTheDay: '',
    firstDNF: '',
    numberOfDNFs: 0,
    safetyCar: 'no',
    virtualSafetyCar: 'no',
    redFlag: 'no',
    mostPositionsGained: ''
  });

  const [settings, setSettings] = useState<PredictionSettings>({
    nextGpName: "British Grand Prix 2026",
    nextGpLocation: "Silverstone Circuit",
    nextGpDate: "2026-07-05T14:00:00Z",
    globalLock: false,
    scoringRules: {
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
  });

  // State handles
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>("Calculating clock...");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [adminSavingSettings, setAdminSavingSettings] = useState<boolean>(false);
  const [adminNotify, setAdminNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Fetch fully-revealed predictions & profile data of all players for the Admin
  const fetchUsersPredictions = async () => {
    setLoadingUsersPredictions(true);
    try {
      const res = await fetch("/api/admin/users-predictions");
      if (res.ok) {
        const data = await res.json();
        setUsersPredictionsList(data);
      }
    } catch (e) {
      console.error("Failed to load user predictions:", e);
    } finally {
      setLoadingUsersPredictions(false);
    }
  };

  // Load and refresh dataset
  const loadPaddockData = async (userObj?: any) => {
    try {
      // Fetch dynamic settings from server
      const sRes = await fetch('/api/prediction-settings');
      if (sRes.ok) {
        const sData = await sRes.json();
        setSettings(sData);
      }

      // Fetch dynamic leaderboard from server
      const lRes = await fetch('/api/leaderboard');
      if (lRes.ok) {
        const lData = await lRes.json();
        setLeaderboard(lData);

        // Find current user profile prediction status
        const currentUserHandle = userObj || sessionUser;
        if (currentUserHandle) {
          const match = lData.find((u: any) => u.username.toLowerCase() === currentUserHandle.username.toLowerCase());
          // If user previously stored prediction on server, reload it
          const localSaved = localStorage.getItem(`f1_predictions_${currentUserHandle.username}`);
          if (localSaved) {
            setPrediction(JSON.parse(localSaved));
            setSubmitted(true);
          }

          // Fetch the user's historical accuracy / profile data
          try {
            const pRes = await fetch(`/api/user/profile?username=${encodeURIComponent(currentUserHandle.username)}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData && pData.history) {
                setUserHistory(pData.history);
              }
            }
          } catch (profileErr) {
            console.error("Failed to load user profile history:", profileErr);
          }

          // Fetch admin-exclusive user lists if user is Admin
          if (currentUserHandle.username === "Admin") {
            fetchUsersPredictions();
          }
        }
      }

      // Fetch aggregate stats
      try {
        const aggRes = await fetch('/api/predictions/aggregate-stats');
        if (aggRes.ok) {
          const aggData = await aggRes.json();
          setAggregateStats(aggData);
        }
      } catch (aggErr) {
        console.error("Error loading aggregates:", aggErr);
      }
    } catch (e) {
      console.error("Error loading predictions/settings:", e);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('f1_user_session');
    if (cached) {
      const parsed = JSON.parse(cached);
      setSessionUser(parsed);
      loadPaddockData(parsed);
    } else {
      loadPaddockData();
    }
  }, []);

  // Live countdown timer execution
  useEffect(() => {
    const interval = setInterval(() => {
      let targetTime = new Date(settings.nextGpDate).getTime();
      
      if (seasonData && seasonData.nextRace) {
        const nextRace = seasonData.nextRace;
        let fullTime = nextRace.time || '13:00:00Z';
        if (!fullTime.endsWith('Z') && !fullTime.includes('+') && !fullTime.includes('-')) {
          fullTime += 'Z';
        }
        const targetDateStr = `${nextRace.date}T${fullTime}`;
        targetTime = new Date(targetDateStr).getTime();
      }

      const now = Date.now();
      // If the event completed in the past, provide an active countdown 
      // of 3 days, 14 hours, 42 minutes for rich interactive preview testing, exactly like the dashboard.
      if (targetTime < now) {
        targetTime = now + (3 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (42 * 60 * 1000);
      }

      const gap = targetTime - now;

      if (gap <= 0) {
        setCountdownText("SESSION LOCKED (QUALIFYING HAS STARTED)");
      } else {
        const days = Math.floor(gap / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((gap % (1000 * 60)) / 1000);

        setCountdownText(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.nextGpDate, seasonData]);

  // Handle standard user prediction submission
  const handleSavePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) return;

    // Strict validation
    if (
      !prediction.poleDriver || 
      !prediction.qualifyingP2 || 
      !prediction.qualifyingP3 || 
      !prediction.p1Winner || 
      !prediction.p2Winner || 
      !prediction.p3Winner || 
      !prediction.fastestLap ||
      !prediction.driverOfTheDay ||
      !prediction.mostPositionsGained
    ) {
      alert("Please ensure all critical driver prediction drop-downs (including qualifying and podium positions) are selected!");
      return;
    }

    // Sync p1, p2, p3 into first three slots of top10Finishers
    const syncedTop10 = [...prediction.top10Finishers];
    syncedTop10[0] = prediction.p1Winner;
    syncedTop10[1] = prediction.p2Winner;
    syncedTop10[2] = prediction.p3Winner;

    // Check if slots P4 to P10 are filled
    const emptyTop10s = syncedTop10.filter(d => !d);
    if (emptyTop10s.length > 0) {
      alert("Please complete selecting all driver choices in the P4 to P10 prediction finishers grid!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/user/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: sessionUser.username,
          prediction: {
            ...prediction,
            top10Finishers: syncedTop10
          }
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Failed to submit predictions to the server.");
      }

      // Persist locally as backup
      localStorage.setItem(`f1_predictions_${sessionUser.username}`, JSON.stringify(prediction));
      setSubmitted(true);
      await loadPaddockData();
    } catch (err: any) {
      alert(err.message || "Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (settings.globalLock) return;
    setSubmitted(false);
  };

  // Admin scoring rules/gp configurations save
  const handleSaveSettingsByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSavingSettings(true);
    setAdminNotify(null);

    try {
      // Sync certifiedResults P1, P2, P3 into first 3 slots of top10Finishers array
      const certTop10 = [...settings.certifiedResults.top10Finishers];
      certTop10[0] = settings.certifiedResults.p1Winner;
      certTop10[1] = settings.certifiedResults.p2Winner;
      certTop10[2] = settings.certifiedResults.p3Winner;

      const syncedSettings = {
        ...settings,
        certifiedResults: {
          ...settings.certifiedResults,
          top10Finishers: certTop10
        }
      };

      const response = await fetch('/api/admin/prediction-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(syncedSettings)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update configuration Settings.");
      }

      setAdminNotify({ type: 'success', msg: "Global Prediction Engine fully config-updated and live-league recalculated!" });
      setTimeout(() => setAdminNotify(null), 4000);
      await loadPaddockData();
    } catch (err: any) {
      setAdminNotify({ type: 'error', msg: err.message || "Communication failure with servers." });
    } finally {
      setAdminSavingSettings(false);
    }
  };

  const handleArchiveAndSpawn = async () => {
    if (!spawnNewGPData.name || !spawnNewGPData.location || !spawnNewGPData.date) {
      alert("Please ensure all matchup spawning details (Name, Location, Date) are filled!");
      return;
    }

    if (!confirm(`Are you absolutely sure you want to CLOSE the active GP "${settings.nextGpName}" and ARCHIVE player results into history, before spawning "${spawnNewGPData.name}"? This action is irreversible!`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/archive-and-new-gp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextGpName: spawnNewGPData.name,
          nextGpLocation: spawnNewGPData.location,
          nextGpDate: spawnNewGPData.date,
          lockTime: spawnNewGPData.lockTime || null
        })
      });

      if (res.ok) {
        alert("Completed and archived! The fresh Grand Prix matchup is now open and ready for customer predictions!");
        setSpawnNewGPData({ name: "", location: "", date: "", lockTime: "" });
        await loadPaddockData();
      } else {
        const err = await res.json();
        alert(`Error spawning matchup: ${err.error || "Unknown server response."}`);
      }
    } catch (e: any) {
      alert(`Network error during spawning: ${e.message}`);
    }
  };

  const handleDeleteGPSetup = async () => {
    if (!confirm("Are you absolutely certain you want to DELETE and wipe the active GP configuration and clear active user predictions? Any unsaved predictions for this race will be lost!")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/delete-current-gp", {
        method: "POST"
      });

      if (res.ok) {
        alert("Active Grand Prix configuration deleted and active player cards successfully reset!");
        await loadPaddockData();
      } else {
        alert("Failed to delete GP setup from database server.");
      }
    } catch (e: any) {
      alert(`Network error deleting GP: ${e.message}`);
    }
  };

  // Render Lockout Gate for guests
  if (!sessionUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-gray-150 rounded-2xl p-8 text-center space-y-5 shadow-sm select-none">
        <div className="w-14 h-14 bg-red-50 text-[#EF1A2D] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock size={26} className="animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-black text-black uppercase tracking-tight font-sans">Locked Prediction Section</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Standard and live Formula 1 paddock race predictions are locked. Please login or register to your Cebric Fan Account to submit your race cards!
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-block text-[10px] font-mono bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">
            User Hub Verification Required
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8 select-none"
      id="prediction-container"
    >
      {/* Dynamic Window Dismissable Toast Reminder */}
      <AnimatePresence>
        {showClosingToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-neutral-900 border border-neutral-800 text-white p-4 rounded-xl flex items-center justify-between gap-4 shadow-xl relative z-50 overflow-hidden"
          >
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#EF1A2D]" />
            <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-[#EF1A2D]/10 rounded-full text-[#EF1A2D]">
                <Watch size={16} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#EF1A2D] block uppercase tracking-wider">Prediction Gate Warning</span>
                <p className="text-xs font-bold text-neutral-100">
                  The submissions lock for {seasonData?.nextRace ? `${seasonData.nextRace.raceName}` : settings.nextGpName} begins in <span className="text-red-400 font-mono font-black">{countdownText}</span>!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowClosingToast(false)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer outline-none border-none bg-none"
              title="Dismiss toast"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header GP Detail Board with Live Countdown */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-neutral-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(239,26,45,0.08),_transparent_60%)] pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600')] bg-cover opacity-[0.03] mix-blend-overlay pointer-events-none hidden md:block" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#EF1A2D]/20 text-[#EF1A2D] px-2.5 py-1 rounded-full font-black tracking-widest leading-none">
                Next Grand Prix Matchup
              </span>
              {settings.globalLock && (
                <span className="text-[10px] font-mono uppercase bg-amber-600/20 text-amber-400 px-2.5 py-1 rounded-full font-black tracking-widest leading-none flex items-center gap-1">
                  <Lock size={10} /> LOCK ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white uppercase leading-none">
              {seasonData?.nextRace ? `${seasonData.nextRace.raceName} 2026` : settings.nextGpName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-semibold font-mono">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#EF1A2D]" />
                {seasonData?.nextRace ? `${seasonData.nextRace.Circuit.circuitName}, ${seasonData.nextRace.Circuit.Location.locality}` : settings.nextGpLocation}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#EF1A2D]" />
                {new Date(seasonData?.nextRace ? `${seasonData.nextRace.date}T${seasonData.nextRace.time || '13:00:00'}` : settings.nextGpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-5 text-center min-w-[200px] shrink-0">
            <span className="text-[9px] text-neutral-400 font-black font-mono tracking-widest uppercase block mb-1">
              Qualified Gate Deadline
            </span>
            <div className="flex items-center justify-center gap-1.5 text-white">
              <Watch size={14} className="text-[#EF1A2D] animate-pulse" />
              <strong className="text-sm font-black font-mono tracking-tight">{countdownText}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Admin Settings and Control Desk (Only visible to Username "Admin") */}
      {sessionUser.username === "Admin" && (
        <div className="bg-neutral-950 border border-neutral-800 text-white rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(239,26,45,0.03),_transparent_50%)] pointer-events-none" />
          
          <button 
            type="button"
            onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
            className="w-full flex items-center justify-between pb-2 border-b border-neutral-800 outline-none select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-[#EF1A2D] animate-[spin_5s_linear_infinite]" />
              <div className="text-left">
                <span className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase block leading-none mb-1">Power cockpit</span>
                <h3 className="text-base font-black text-white leading-none">Scoring System & GP Administrator controls</h3>
              </div>
            </div>
            {isAdminPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {isAdminPanelOpen && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveSettingsByAdmin} 
                className="space-y-6 overflow-hidden pt-2"
              >
                {adminNotify && (
                  <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border font-mono ${
                    adminNotify.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-rose-400 border-red-500/20'
                  }`}>
                    <ShieldCheck size={16} />
                    <span>{adminNotify.msg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Next GP setup */}
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl space-y-3">
                    <span className="text-[10px] text-red-400 font-mono font-black block uppercase tracking-wider">1. Next GP Info Board</span>
                    <div className="space-y-2">
                      <label className="text-[9px] text-neutral-400 block font-mono">GP Name</label>
                      <input 
                        type="text" 
                        value={settings.nextGpName} 
                        onChange={(e) => setSettings({ ...settings, nextGpName: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                      <label className="text-[9px] text-neutral-400 block font-mono">Location / Track</label>
                      <input 
                        type="text" 
                        value={settings.nextGpLocation} 
                        onChange={(e) => setSettings({ ...settings, nextGpLocation: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                      <label className="text-[9px] text-neutral-400 block font-mono">Start Time Date</label>
                      <input 
                        type="datetime-local" 
                        value={toLocalDateTimeLocal(settings.nextGpDate)} 
                        onChange={(e) => setSettings({ ...settings, nextGpDate: fromLocalDateTimeLocal(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Lock setup */}
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl space-y-3">
                    <span className="text-[10px] text-red-400 font-mono font-black block uppercase tracking-wider">2. System Access Gate</span>
                    <div className="space-y-2">
                      <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                        Setting this state to LOCKED freezes all user inputs, enables full point calculation checking against certified results, and delivers a live points readout.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, globalLock: !settings.globalLock })}
                        className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer uppercase border transition-all ${
                          settings.globalLock 
                            ? 'bg-amber-600/20 text-amber-500 border-amber-500/30' 
                            : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {settings.globalLock ? <Lock size={12} /> : <Unlock size={12} />}
                        <span>{settings.globalLock ? 'LOCKED / FREEZE' : 'ACTIVE / RECEIVING'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Points Setup */}
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-2xl space-y-3 overflow-y-auto max-h-[220px]">
                    <span className="text-[10px] text-red-400 font-mono font-black block uppercase tracking-wider">3. Point Weight Rules</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <label className="text-neutral-400">Winner:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.winner} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, winner: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Pole Pos:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.pole} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, pole: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Podium:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.podium} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, podium: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Fast Lap:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.fastestLap} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, fastestLap: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Top 10 (ea):</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.top10Multiplier} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, top10Multiplier: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Qual P2:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.qualifyingP2} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, qualifyingP2: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400">Qual P3:</label>
                        <input 
                          type="number" 
                          value={settings.scoringRules.qualifyingP3} 
                          onChange={(e) => setSettings({ ...settings, scoringRules: { ...settings.scoringRules, qualifyingP3: Number(e.target.value) } })}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-white text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CERTIFY LIVE RESULTS FOR SCORING */}
                <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Shield size={14} className="text-[#EF1A2D]" />
                    <span className="text-[10px] text-red-400 font-mono font-black uppercase tracking-wider">4. Official Race Result Certification</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Pole Driver</label>
                      <select 
                        value={settings.certifiedResults.poleDriver}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, poleDriver: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Qualifying P2</label>
                      <select 
                        value={settings.certifiedResults.qualifyingP2}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, qualifyingP2: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Qualifying P3</label>
                      <select 
                        value={settings.certifiedResults.qualifyingP3}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, qualifyingP3: e.target.value } })}
                        className="w-full bg-[#11121d] border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Race Winner (P1)</label>
                      <select 
                        value={settings.certifiedResults.p1Winner}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, p1Winner: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold text-red-400"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">P2 Runner up</label>
                      <select 
                        value={settings.certifiedResults.p2Winner}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, p2Winner: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">P3 Third place</label>
                      <select 
                        value={settings.certifiedResults.p3Winner}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, p3Winner: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Fastest Lap</label>
                      <select 
                        value={settings.certifiedResults.fastestLap}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, fastestLap: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Driver of Day</label>
                      <select 
                        value={settings.certifiedResults.driverOfTheDay}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, driverOfTheDay: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">First DNF</label>
                      <select 
                        value={settings.certifiedResults.firstDNF}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, firstDNF: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        <option value="None">None</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Driver Gains Positions</label>
                      <select 
                        value={settings.certifiedResults.mostPositionsGained}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, mostPositionsGained: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="">-- No Result --</option>
                        {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Safety Car?</label>
                      <select 
                        value={settings.certifiedResults.safetyCar}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, safetyCar: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">VSC?</label>
                      <select 
                        value={settings.certifiedResults.virtualSafetyCar}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, virtualSafetyCar: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">Red Flag?</label>
                      <select 
                        value={settings.certifiedResults.redFlag}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, redFlag: e.target.value } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        <option value="yes">YES</option>
                        <option value="no">NO</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 block">DNFs Count</label>
                      <input 
                        type="number"
                        value={settings.certifiedResults.numberOfDNFs}
                        onChange={(e) => setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, numberOfDNFs: Number(e.target.value) } })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-center"
                      />
                    </div>

                    {/* Top 10 Finishers selection list */}
                    <div className="space-y-1 md:col-span-3">
                      <label className="text-neutral-400 block mb-1">Certified Top 10 Finishers (Order immaterial to Top 10 choice points)</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {Array(10).fill(null).map((_, topIdx) => (
                          <select
                            key={`top-cert-${topIdx}`}
                            value={settings.certifiedResults.top10Finishers[topIdx] || ''}
                            onChange={(e) => {
                              const copy = [...settings.certifiedResults.top10Finishers];
                              copy[topIdx] = e.target.value;
                              setSettings({ ...settings, certifiedResults: { ...settings.certifiedResults, top10Finishers: copy } });
                            }}
                            className="bg-neutral-950 text-white text-[10px] rounded p-1.5 border border-neutral-800"
                          >
                            <option value="">P{topIdx + 1}</option>
                            {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminSavingSettings}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-red-650 hover:bg-red-750 font-mono text-xs font-black tracking-wider transition-all cursor-pointer"
                >
                  {adminSavingSettings ? "UPDATING ENGINE AND DISTRIBUTING SCORES..." : "SAVE GP CONFIGURATION & SCORE LEAGUE"}
                </button>

                {/* NEXT MATCHUP LIFECYCLE CONTROLS */}
                <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                    <Calendar size={14} className="text-[#EF1A2D]" />
                    <span className="text-[10px] text-red-400 font-mono font-black uppercase tracking-wider">5. Grand Prix Lifecycle: Close / Delete / Spawn Matchup</span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Use these controls to close/archive the current Grand Prix round (which archives all player predictions into their profile history) and setup a fresh Grand Prix matchup for other predictors, or delete/reset the active setup altogether.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fresh Matchup Form */}
                    <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                      <span className="text-[10px] text-white font-black block uppercase tracking-wider">Spawn New Matchup</span>
                      <div className="space-y-2 text-xs font-mono text-neutral-300">
                        <div>
                          <label className="block mb-1 text-[10px] text-neutral-400">Matchup GP Name</label>
                          <input 
                            type="text"
                            placeholder="e.g. Austrian Grand Prix 2026"
                            value={spawnNewGPData.name}
                            onChange={(e) => setSpawnNewGPData({ ...spawnNewGPData, name: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-neutral-400">Matchup Track / Location</label>
                          <input 
                            type="text"
                            placeholder="e.g. Red Bull Ring, Spielberg"
                            value={spawnNewGPData.location}
                            onChange={(e) => setSpawnNewGPData({ ...spawnNewGPData, location: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-neutral-400">Matchup Start Time Date</label>
                          <input 
                            type="datetime-local"
                            value={toLocalDateTimeLocal(spawnNewGPData.date)}
                            onChange={(e) => setSpawnNewGPData({ ...spawnNewGPData, date: fromLocalDateTimeLocal(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] text-neutral-400">Auto Close / Lock Date (Optional)</label>
                          <input 
                            type="datetime-local"
                            value={toLocalDateTimeLocal(spawnNewGPData.lockTime)}
                            onChange={(e) => setSpawnNewGPData({ ...spawnNewGPData, lockTime: fromLocalDateTimeLocal(e.target.value) })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-white cursor-pointer"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleArchiveAndSpawn}
                          className="w-full py-2 bg-[#EF1A2D] hover:bg-opacity-95 text-white text-[10px] font-black uppercase rounded tracking-wider cursor-pointer border-none font-bold"
                        >
                          Archive Current & Create Matchup
                        </button>
                      </div>
                    </div>

                    {/* Danger zone delete/clear GP */}
                    <div className="space-y-3 bg-neutral-950/50 p-4 rounded-xl border border-red-950/40 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-rose-500 font-black block uppercase tracking-wider mb-2">⚠ Danger Cockpit controls</span>
                        <p className="text-[11px] text-neutral-400 leading-normal">
                          Completely delete the active Grand Prix configuration and reset current submissions. Warning: This clears user prediction forms for this GP!
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteGPSetup}
                        className="w-full py-2 border border-red-650/40 hover:bg-rose-600/20 text-rose-450 text-[10px] font-black uppercase rounded tracking-widest cursor-pointer bg-transparent transition-all font-bold"
                      >
                        DELETE GP SETUP & predictions
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Users List with full predictions data */}
                <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-[#EF1A2D]" />
                      <div>
                        <span className="text-[10px] text-red-400 font-mono font-black block uppercase tracking-wider">6. Registered Users & Predictions Ledger</span>
                        <p className="text-xs text-neutral-400 leading-none mt-0.5">Admin cockpit to view player profiles, email info, and exact prediction picks.</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={fetchUsersPredictions}
                      className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors border-none bg-none outline-none cursor-pointer"
                      title="Reload ledger cards"
                    >
                      <RefreshCw size={13} className={loadingUsersPredictions ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {usersPredictionsList.length === 0 ? (
                      <p className="text-center text-xs text-neutral-500 py-4 font-mono">No users loaded.</p>
                    ) : (
                      usersPredictionsList.map((usr) => (
                        <div key={usr.username} className="bg-neutral-950 border border-neutral-850 rounded-xl p-3.5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-850/40 pb-2">
                            <div>
                              <strong className="text-white text-xs block font-bold">{usr.givenName} {usr.familyName} (@{usr.username})</strong>
                              <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{usr.email || "No Email"} | Passport ID: {usr.passportNumber || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-full">
                                Score: {usr.score} pts
                              </span>
                              <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full ${
                                usr.prediction ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-rose-400'
                              }`}>
                                {usr.prediction ? '✓ Submissions Received' : '⚠ No Predict Card'}
                              </span>
                            </div>
                          </div>

                          {usr.prediction && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🏆 P1 Winner:</span>
                                <strong className="text-white">{usr.prediction.p1Winner || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🥈 P2:</span>
                                <strong className="text-white">{usr.prediction.p2Winner || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🥉 P3:</span>
                                <strong className="text-white">{usr.prediction.p3Winner || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">⏱️ Pole Position:</span>
                                <strong className="text-white">{usr.prediction.poleDriver || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🥈 Qual P2:</span>
                                <strong className="text-white">{usr.prediction.qualifyingP2 || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🥉 Qual P3:</span>
                                <strong className="text-white">{usr.prediction.qualifyingP3 || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">⚡ Fastest Lap:</span>
                                <strong className="text-white">{usr.prediction.fastestLap || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🌟 DOTD:</span>
                                <strong className="text-white">{usr.prediction.driverOfTheDay || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🚀 Most Gains:</span>
                                <strong className="text-white">{usr.prediction.mostPositionsGained || "-"}</strong>
                              </div>
                              <div className="bg-neutral-900 p-1.5 rounded border border-neutral-850/40">
                                <span className="text-neutral-500 block">🛡️ Safety Car:</span>
                                <strong className="text-white uppercase">{usr.prediction.safetyCar || "-"}</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 3. Main Split Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Prediction Form Elements */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-black font-sans uppercase tracking-tight flex items-center gap-1.5">
                <Trophy size={16} className="text-[#EF1A2D]" />
                <span>Active Instinct Card ({sessionUser.username})</span>
              </h3>
              <p className="text-[10.5px] text-gray-400 font-medium">
                Predict absolute race outcomes across all key metrics below.
              </p>
            </div>
            {submitted && !settings.globalLock && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10.5px] font-mono font-bold text-[#EF1A2D] hover:underline flex items-center gap-1 cursor-pointer outline-none bg-none border-none"
              >
                <RefreshCw size={11} /> Edit Prediction
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="submitted-deck"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase">Submission Fully Synced</h4>
                    <p className="text-[10.5px] text-emerald-800 mt-1 leading-normal font-medium">
                      Your instinct variables have been safely locked for the {settings.nextGpName}. Once the admin certifies results, your score will match instantly.
                    </p>
                  </div>
                </div>

                {/* Rich Saved Card Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Pole Position</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.poleDriver || "empty"}</strong>
                  </div>

                  <div className="bg-red-50/30 border border-red-100/40 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-[#EF1A2D] font-black uppercase font-mono block">Race Winner (P1)</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.p1Winner || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Podium Second (P2)</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.p2Winner || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Podium Third (P3)</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.p3Winner || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Fastest Lap Driver</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.fastestLap || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Driver of Day</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.driverOfTheDay || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">First DNF</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.firstDNF || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Number of DNFs</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.numberOfDNFs || 0} Drivers</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Safety Car deployed?</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block block uppercase">{prediction.safetyCar}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Virtual Safety Car (VSC)?</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block block uppercase">{prediction.virtualSafetyCar}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Red Flag Occurrence?</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block block uppercase">{prediction.redFlag}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Qualifying P2</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.qualifyingP2 || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Qualifying P3</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.qualifyingP3 || "empty"}</strong>
                  </div>

                  <div className="bg-neutral-50/50 border border-gray-100 rounded-xl p-3.5 space-y-1 md:col-span-2">
                    <span className="text-[9px] text-gray-400 font-black uppercase font-mono block">Gains Most Positions</span>
                    <strong className="text-xs text-neutral-900 font-extrabold block">{prediction.mostPositionsGained || "empty"}</strong>
                  </div>

                  {/* Top 10 Finishers summary list item */}
                  <div className="bg-neutral-50 border border-gray-150 rounded-xl p-4 md:col-span-2 space-y-2">
                    <span className="text-[9px] text-neutral-500 font-black uppercase font-mono block border-b pb-1">
                      Your Predicted Top 10 Finisher Grid
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prediction.top10Finishers.map((driver, idx) => (
                        <span 
                          key={`sub-top10-${idx}`}
                          className="text-[10px] bg-white border border-gray-150 font-mono px-2.5 py-1 rounded-md text-neutral-800"
                        >
                          P{idx + 1}: {driver || "empty"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form key="unsubmitted-deck" onSubmit={handleSavePrediction} className="space-y-6">
                
                {settings.globalLock && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-center gap-3 text-[11.5px] font-medium leading-normal">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>Dynamic submissions have been closed for qualifying setup. You can review active entries in the sidebar.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Pole position */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Pole Position Driver</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.poleDriver}
                      onChange={(e) => setPrediction({ ...prediction, poleDriver: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Select Driver --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Qualifying P2 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Qualifying P2 Driver</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.qualifyingP2}
                      onChange={(e) => setPrediction({ ...prediction, qualifyingP2: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Select Qualifying P2 --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Qualifying P3 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Qualifying P3 Driver</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.qualifyingP3}
                      onChange={(e) => setPrediction({ ...prediction, qualifyingP3: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Select Qualifying P3 --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Race Winner P1 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#EF1A2D] font-black font-mono uppercase tracking-wider block">Predicted Race Winner</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.p1Winner}
                      onChange={(e) => setPrediction({ ...prediction, p1Winner: e.target.value })}
                      className="w-full bg-red-50/10 border border-[#EF1A2D]/20 text-black text-xs font-mono font-bold rounded-xl p-2.5 outline-none focus:border-[#EF1A2D] cursor-pointer"
                    >
                      <option value="">-- Choose P1 Winner --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Podium P2 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Second Place Finisher (P2)</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.p2Winner}
                      onChange={(e) => setPrediction({ ...prediction, p2Winner: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Choose P2 Finisher --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Podium P3 */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Third Place Finisher (P3)</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.p3Winner}
                      onChange={(e) => setPrediction({ ...prediction, p3Winner: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Choose P3 Finisher --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Fastest Lap */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict Fastest Lap</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.fastestLap}
                      onChange={(e) => setPrediction({ ...prediction, fastestLap: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Select Fastest Lap --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Driver of the Day */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Driver of the Day</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.driverOfTheDay}
                      onChange={(e) => setPrediction({ ...prediction, driverOfTheDay: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Choose Driver --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* First DNF */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict First DNF</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.firstDNF}
                      onChange={(e) => setPrediction({ ...prediction, firstDNF: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Choose DNF Option --</option>
                      <option value="None">None (No DNFs this Race)</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Most Positions Gained */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Driver Who Gains Most Positions</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.mostPositionsGained}
                      onChange={(e) => setPrediction({ ...prediction, mostPositionsGained: e.target.value })}
                      className="w-full bg-neutral-50 hover:bg-neutral-100 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none focus:border-[#EF1A2D]"
                    >
                      <option value="">-- Choose Driver --</option>
                      {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Slider parameters deployment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict Safety Car Deployment</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.safetyCar}
                      onChange={(e) => setPrediction({ ...prediction, safetyCar: e.target.value })}
                      className="w-full bg-neutral-50 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none cursor-pointer"
                    >
                      <option value="yes">YES</option>
                      <option value="no">NO</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict Virtual Safety Car (VSC)</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.virtualSafetyCar}
                      onChange={(e) => setPrediction({ ...prediction, virtualSafetyCar: e.target.value })}
                      className="w-full bg-neutral-50 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none cursor-pointer"
                    >
                      <option value="yes">YES</option>
                      <option value="no">NO</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict Red Flag Occurrence</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.redFlag}
                      onChange={(e) => setPrediction({ ...prediction, redFlag: e.target.value })}
                      className="w-full bg-neutral-50 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none cursor-pointer"
                    >
                      <option value="yes">YES</option>
                      <option value="no">NO</option>
                    </select>
                  </div>

                  {/* Integer choices */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-black font-mono uppercase tracking-wider block">Predict Number of DNFs</label>
                    <select
                      disabled={settings.globalLock}
                      value={prediction.numberOfDNFs}
                      onChange={(e) => setPrediction({ ...prediction, numberOfDNFs: Number(e.target.value) })}
                      className="w-full bg-neutral-50 border border-gray-150 text-black text-xs font-mono rounded-xl p-2.5 outline-none cursor-pointer"
                    >
                      {Array(21).fill(0).map((_, i) => (
                        <option key={`dnf-opt-${i}`} value={i}>{i} DNF{i !== 1 && 's'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Predict Top 10 Finishers Form Deck */}
                <div className="bg-neutral-50/50 p-5 border border-gray-150 rounded-2xl space-y-3 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] text-neutral-850 font-black font-mono uppercase tracking-widest block">
                      Predict the remaining Top 10 Finishers (P4 to P10)
                    </span>
                  </div>
                  <p className="text-[10.5px] text-gray-500 font-medium">
                    Select the other 7 drivers for P4 to P10. P1, P2, and P3 are automatically populated based on your selections above!
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-3.5 pt-2">
                    {Array(7).fill(null).map((_, idxIndex) => {
                      const idx = idxIndex + 3; // Starts from idx 3 (Finisher #4)
                      return (
                        <div key={`form-top10-${idx}`} className="space-y-1">
                          <label className="text-[8px] text-gray-400 font-black block font-mono">FINISHER #{idx + 1}</label>
                          <select
                            disabled={settings.globalLock}
                            value={prediction.top10Finishers[idx] || ''}
                            onChange={(e) => {
                              const newTop10 = [...prediction.top10Finishers];
                              newTop10[idx] = e.target.value;
                              setPrediction({ ...prediction, top10Finishers: newTop10 });
                            }}
                            className="w-full bg-white border border-gray-150 rounded-lg p-1.5 text-[10px] font-mono outline-none focus:border-[#EF1A2D]"
                          >
                            <option value="">P{idx + 1}</option>
                            {REAL_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!settings.globalLock && (
                  <button
                    type="submit"
                    id="submit-prediction-btn"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl text-white bg-[#EF1A2D] hover:bg-neutral-900 font-serif text-sm font-bold flex items-center justify-center gap-2 outline-none cursor-pointer transition-colors shadow-xs"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Verifying with cebric engine cockpit...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Upload My F1 Instinct Card</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Leaderboard Side Rail */}
        <div className="lg:col-span-4 space-y-6">
          {/* Historical Accuracy Visualization Section */}
          {sessionUser && userHistory && userHistory.length > 0 && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="border-b border-gray-100 pb-2.5">
                <span className="text-[8px] font-black font-mono text-gray-400 uppercase tracking-widest leading-none mb-0.5 block">
                  Season Track Analysis
                </span>
                <h3 className="text-xs font-black text-black uppercase font-sans flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#EF1A2D]" />
                  <span>My Prediction Accuracy</span>
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal">
                Visualizing cumulative instinct accuracy and points scored per Grand Prix round across the 2026 season roster.
              </p>
              <div className="h-[180px] w-full pt-1 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF1A2D" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#EF1A2D" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis 
                      dataKey="gpName" 
                      tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }} 
                      stroke="#e5e7eb"
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: '#6b7280' }} 
                      stroke="#e5e7eb" 
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#171717', 
                        borderColor: '#171717', 
                        color: '#fff', 
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                      itemStyle={{ color: '#EF1A2D' }}
                      labelStyle={{ fontWeight: 'bold', color: '#fff', marginBottom: '2px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#EF1A2D" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#scoreColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono select-none pt-1">
                <div className="bg-neutral-50/70 border border-gray-100 rounded-lg p-2">
                  <span className="text-gray-400 block pb-0.5">PEAK PERFORMANCE</span>
                  <strong className="text-black text-sm font-black text-center block">
                    {Math.max(...userHistory.map(h => h.score || 0))} pts
                  </strong>
                </div>
                <div className="bg-neutral-50/70 border border-gray-100 rounded-lg p-2">
                  <span className="text-gray-400 block pb-0.5">AVERAGE ACCURACY</span>
                  <strong className="text-sm font-black text-center block text-red-500">
                    {Math.round(userHistory.reduce((acc, curve) => acc + (curve.score || 0), 0) / userHistory.length)} pts
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (userHistory && userHistory.length > 0) {
                    setSelectedHistoryItem(userHistory[userHistory.length - 1]);
                  }
                  setShowHistoryModal(true);
                }}
                className="w-full mt-2 py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md"
              >
                <Clock size={13} className="text-red-500" />
                <span>My Prediction History</span>
              </button>
            </div>
          )}

          <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass size={15} className="text-[#EF1A2D]" />
                <div>
                  <span className="block text-[8px] font-black font-mono text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                    Live Database
                  </span>
                  <h3 className="text-xs font-black text-black uppercase font-sans">Fantasy Leaderboard</h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => loadPaddockData()}
                className="text-neutral-450 hover:text-black hover:rotate-180 transition-all duration-300"
                title="Refresh scores"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Render actual real registered database users */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-[10.5px] text-gray-400 font-mono">
                  Loading fantasy league users...
                </div>
              ) : (
                leaderboard.map((comp, idx) => {
                  const isCurUsr = comp.username.toLowerCase() === sessionUser.username.toLowerCase();
                  return (
                    <div 
                      key={comp.username} 
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-mono border transition-all ${
                        isCurUsr 
                          ? 'bg-[#EF1A2D]/5 border-[#EF1A2D]/20 text-black font-bold' 
                          : 'bg-neutral-50/50 hover:bg-neutral-50 text-neutral-800 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 font-bold ${isCurUsr ? 'text-red-500' : 'text-gray-400'}`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-black font-extrabold block leading-normal">
                              @{comp.username}
                            </span>
                            {isCurUsr && <span className="bg-[#EF1A2D] text-white text-[8px] font-mono px-1 rounded-sm uppercase tracking-wide">You</span>}
                          </div>
                          <span className="text-[8.5px] text-gray-400 block leading-none">
                            {comp.hasPrediction ? "Instinct Registered" : "No Prediction submitted"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-black font-black block">{comp.score || 0} pts</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Global Aggregate Stats Card */}
          {aggregateStats && (
            <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Trophy size={15} className="text-[#EF1A2D]" />
                  <div>
                    <span className="block text-[8px] font-black font-mono text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                      Paddock Sentiments
                    </span>
                    <h3 className="text-xs font-black text-black uppercase font-sans">Global Aggregate Statistics</h3>
                  </div>
                </div>
                <span className="text-[10px] bg-red-50 text-red-600 font-mono font-black py-0.5 px-2 rounded-full">
                  {aggregateStats.totalCount || 0} active cards
                </span>
              </div>
              
              <p className="text-[11px] text-gray-500 leading-normal">
                Aggregating consensus choices submitted by all active predictors across our fantasy championship roster.
              </p>

              {aggregateStats.totalCount === 0 ? (
                <div className="text-center py-4 text-[10px] text-gray-400 font-mono">
                  No predictions submitted yet for this Grand Prix.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* 1. Winner */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold leading-none mb-0.5">🏆 Top P1 Winner Pick</span>
                      <strong className="text-neutral-900 font-black">{aggregateStats.mostCommonWinner?.driver || "N/A"}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black text-red-600 block bg-red-50/50 py-0.5 px-1.5 rounded-md">
                        {aggregateStats.mostCommonWinner?.pct}%
                      </span>
                      <span className="text-[8px] text-gray-450 block mt-0.5 font-mono">({aggregateStats.mostCommonWinner?.count} votes)</span>
                    </div>
                  </div>

                  {/* 2. Pole */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold leading-none mb-0.5">⏱️ Top Pole Position Pick</span>
                      <strong className="text-neutral-900 font-black">{aggregateStats.mostCommonPole?.driver || "N/A"}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black text-red-600 block bg-red-50/50 py-0.5 px-1.5 rounded-md">
                        {aggregateStats.mostCommonPole?.pct}%
                      </span>
                      <span className="text-[8px] text-gray-450 block mt-0.5 font-mono">({aggregateStats.mostCommonPole?.count} votes)</span>
                    </div>
                  </div>

                  {/* 3. Driver of the Day */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold leading-none mb-0.5">🌟 Top Driver of Day Pick</span>
                      <strong className="text-neutral-900 font-black">{aggregateStats.mostCommonDotd?.driver || "N/A"}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black text-red-600 block bg-red-50/50 py-0.5 px-1.5 rounded-md">
                        {aggregateStats.mostCommonDotd?.pct}%
                      </span>
                      <span className="text-[8px] text-gray-450 block mt-0.5 font-mono">({aggregateStats.mostCommonDotd?.count} votes)</span>
                    </div>
                  </div>

                  {/* 4. Fastest Lap */}
                  <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold leading-none mb-0.5">⚡ Top Fastest Lap Pick</span>
                      <strong className="text-neutral-900 font-black">{aggregateStats.mostCommonFastestLap?.driver || "N/A"}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-black text-red-600 block bg-red-50/50 py-0.5 px-1.5 rounded-md">
                        {aggregateStats.mostCommonFastestLap?.pct}%
                      </span>
                      <span className="text-[8px] text-gray-450 block mt-0.5 font-mono">({aggregateStats.mostCommonFastestLap?.count} votes)</span>
                    </div>
                  </div>

                  {/* 5. Safety Car split */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[9px] font-mono text-gray-400 uppercase font-black">
                      <span>Safety Car Expectation: Yes ({aggregateStats.safetyCarSpread?.yes}%)</span>
                      <span>No ({aggregateStats.safetyCarSpread?.no}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-[#EF1A2D] h-full" style={{ width: `${aggregateStats.safetyCarSpread?.yes}%` }} />
                      <div className="bg-gray-300 h-full" style={{ width: `${aggregateStats.safetyCarSpread?.no}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick FAQ info block */}
          <div className="bg-neutral-50 border border-gray-150 p-5 rounded-2xl space-y-2 text-[11px] leading-relaxed select-none">
            <div className="flex items-center gap-1.5 text-black font-extrabold uppercase font-sans mb-1 text-xs">
              <HelpCircle size={14} className="text-[#EF1A2D]" />
              <span>Official Scoring Policy</span>
            </div>
            <p className="text-gray-500">
              Your instinct scores are dynamically matched to final race certificates:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-mono text-[9px] text-gray-550 pt-1">
              <li><strong>Winner (P1):</strong> +{settings.scoringRules.winner} points</li>
              <li><strong>Pole position (Qualifying P1):</strong> +{settings.scoringRules.pole} points</li>
              <li><strong>Qualifying P2:</strong> +{settings.scoringRules.qualifyingP2} points</li>
              <li><strong>Qualifying P3:</strong> +{settings.scoringRules.qualifyingP3} points</li>
              <li><strong>P2 / P3 podium:</strong> +{settings.scoringRules.podium} points each</li>
              <li><strong>Fastest Lap:</strong> +{settings.scoringRules.fastestLap} points</li>
              <li><strong>Top 10 correct:</strong> +{settings.scoringRules.top10Multiplier} pts per driver</li>
              <li><strong>Track deployment metrics:</strong> +5 points each</li>
            </ul>
          </div>
        </div>

      </div>

      {/* MY PREDICTION HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-150 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <header className="bg-neutral-950 text-white p-5 md:px-6 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-650 rounded-xl text-white">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight font-sans">My Prediction History & Certificates</h3>
                    <p className="text-[10px] text-neutral-400 font-mono tracking-wide">COMPARING YOUR FANTASY INSTINCTS VS FINAL RACE OUTCOMES</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer outline-none border-none bg-transparent"
                >
                  <X size={20} />
                </button>
              </header>

              {/* Main Content Body */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                {/* Left side GP list */}
                <div className="md:col-span-4 border-r border-gray-100 bg-neutral-50 p-4 overflow-y-auto space-y-2 select-none">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-black block mb-3">CONCLUDED GP ROSTER</span>
                  
                  {userHistory.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-450 font-mono">No historical GPs in database yet.</div>
                  ) : (
                    userHistory.map((item, index) => {
                      const isSelected = selectedHistoryItem && selectedHistoryItem.gpName === item.gpName;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedHistoryItem(item)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 outline-none ${
                            isSelected 
                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-md' 
                              : 'bg-white text-neutral-700 border-gray-150 hover:bg-gray-50'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <strong className="font-extrabold text-xs block leading-tight truncate">{item.gpName}</strong>
                            <span className={`text-[9px] font-mono block ${isSelected ? 'text-neutral-400' : 'text-gray-400'}`}>
                              {item.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Season Round'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-red-650 text-white' : 'bg-neutral-100 text-neutral-900'
                          }`}>
                            +{item.score || 0} pts
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Right side Detail Verification view */}
                <div className="md:col-span-8 p-5 md:p-6 overflow-y-auto space-y-5">
                  {selectedHistoryItem ? (
                    <div className="space-y-4">
                      {/* GP Header */}
                      <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <span className="text-[8px] font-mono font-black text-red-650 uppercase tracking-widest block mb-0.5">VERIFIED RECORD</span>
                          <h4 className="text-lg font-black text-black leading-none uppercase">{selectedHistoryItem.gpName}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">{selectedHistoryItem.gpLocation || 'Official Circuit'}</span>
                        </div>
                        <div className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-center shrink-0 min-w-36 font-sans">
                          <span className="text-[8px] font-mono text-neutral-450 uppercase tracking-widest block mb-0.5">EARNED POINTS</span>
                          <strong className="text-base text-red-500 font-extrabold">+{selectedHistoryItem.score || 0} Total Pts</strong>
                        </div>
                      </div>

                      {/* Prediction verification blocks comparison */}
                      {selectedHistoryItem.prediction ? (
                        <div className="space-y-3.5">
                          <div className="grid grid-cols-2 text-[9px] font-mono text-gray-400 uppercase font-black px-1 pb-1">
                            <span>YOUR CHOSEN PICK</span>
                            <span>OFFICIAL RACE RESULT</span>
                          </div>

                          <div className="space-y-2.5">
                            {/* Comparison Row helper list */}
                            {[
                              { label: "Winner (P1)", key: "p1Winner", icon: "🏆", desc: "Predict the driver who crosses the finish line in P1" },
                              { label: "Runner-Up (P2)", key: "p2Winner", icon: "🥈", desc: "Predict the driver to finish in P2" },
                              { label: "Third-Place (P3)", key: "p3Winner", icon: "🥉", desc: "Predict the driver to finish in P3" },
                              { label: "Pole Position Setter", key: "poleDriver", icon: "⏱", desc: "Predict the driver who sets the fastest Q3 lap time (Qualifying P1)" },
                              { label: "Qualifying P2", key: "qualifyingP2", icon: "🥈", desc: "Predict the driver who finishes Q3 in second place (Qualifying P2)" },
                              { label: "Qualifying P3", key: "qualifyingP3", icon: "🥉", desc: "Predict the driver who finishes Q3 in third place (Qualifying P3)" },
                              { label: "Fastest Lap Record", key: "fastestLap", icon: "⚡", desc: "Driver who clocks the single fastest lap on race day" },
                              { label: "Driver of the Day", key: "driverOfTheDay", icon: "🌟", desc: "The popular fan-voted driver of the GP" },
                              { label: "Most Positions Gained", key: "mostPositionsGained", icon: "📈", desc: "Driver who moves up the most places from starting grid" },
                              { label: "Safety Car Deployed", key: "safetyCar", icon: "🚨", desc: "Indicate whether the physical Safety Car is deployed" }
                            ].map((row) => {
                              const userPick = selectedHistoryItem.prediction[row.key];
                              const certifiedResult = selectedHistoryItem.certifiedResults ? selectedHistoryItem.certifiedResults[row.key] : null;
                              // Highlight correct picks
                              const isCorrect = certifiedResult && userPick && String(userPick).toLowerCase() === String(certifiedResult).toLowerCase();

                              return (
                                <div key={row.key} className="p-3.5 bg-neutral-50/50 hover:bg-neutral-50 border border-gray-150 rounded-2xl space-y-1.5 transition-all">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black font-sans uppercase text-gray-800 flex items-center gap-1.5">
                                      <span>{row.icon}</span>
                                      <span>{row.label}</span>
                                    </span>
                                    {isCorrect && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                                        <Check size={10} /> MATCH (+POINTS)
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                                    <div className={`p-2 rounded-xl text-xs font-mono font-bold border ${
                                      isCorrect ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-white text-gray-700 border-gray-150'
                                    }`}>
                                      {userPick || "Not Predicted"}
                                    </div>
                                    <div className={`p-2 rounded-xl text-xs font-mono font-bold border ${
                                      isCorrect ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-neutral-900 text-white border-neutral-905'
                                    }`}>
                                      {certifiedResult || "Uncertified / Suspended"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed border-gray-200 text-center rounded-3xl space-y-2.5">
                          <AlertTriangle className="mx-auto text-amber-500 animate-bounce" size={32} />
                          <h5 className="font-sans font-black text-black text-sm uppercase">No Prediction Registered</h5>
                          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                            No fantasy prediction coupon was submitted on your account before this GP round lock period closed.
                          </p>
                          <div className="bg-amber-50 rounded-xl max-w-md mx-auto p-3 text-amber-800 font-mono text-[10px] border border-amber-100 uppercase">
                            Fantasy penalty points allocated automatically.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center py-24 text-center space-y-2">
                      <Compass size={40} className="text-gray-300 animate-spin" />
                      <h4 className="font-sans font-bold text-gray-400 text-xs uppercase pt-2">No Selected Round</h4>
                      <p className="text-[10px] text-gray-450 font-mono">Select a GP card from the sidebar roster list to review details.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
