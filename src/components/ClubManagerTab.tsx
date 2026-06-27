import React, { useState, useEffect } from 'react';
import { ScoutingTab } from './ScoutingTab';
import { 
  Trophy, 
  Shield, 
  Users, 
  Zap, 
  Flame, 
  Flag, 
  Play, 
  Calendar, 
  CloudSun, 
  Award, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  PlusCircle,
  UserCheck,
  DollarSign,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Wrench,
  Sparkles,
  ChevronRight,
  AlertCircle,
  MapPin,
  Clock,
  Coins,
  Search,
  Circle,
  Star,
  Crown,
  Gem,
  Hexagon,
  Octagon,
  Triangle,
  Diamond,
  Target,
  Activity,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Sliders,
  Info,
  Scale
} from 'lucide-react';

interface ClubManagerTabProps {
  currentUser?: { username: string; role?: string; verifyStyle?: string } | null;
  seasonData?: any;
}

const BADGE_ICONS: Record<string, React.FC<{ size: number; className?: string }>> = {
  Shield: ({ size, className }) => <Shield size={size} className={className} />,
  Zap: ({ size, className }) => <Zap size={size} className={className} />,
  Flame: ({ size, className }) => <Flame size={size} className={className} />,
  Trophy: ({ size, className }) => <Trophy size={size} className={className} />,
  Flag: ({ size, className }) => <Flag size={size} className={className} />,
  Circle: ({ size, className }) => <Circle size={size} className={className} />,
  Star: ({ size, className }) => <Star size={size} className={className} />,
  Crown: ({ size, className }) => <Crown size={size} className={className} />,
  Gem: ({ size, className }) => <Gem size={size} className={className} />,
  Hexagon: ({ size, className }) => <Hexagon size={size} className={className} />,
  Octagon: ({ size, className }) => <Octagon size={size} className={className} />,
  Triangle: ({ size, className }) => <Triangle size={size} className={className} />,
  Diamond: ({ size, className }) => <Diamond size={size} className={className} />,
  Target: ({ size, className }) => <Target size={size} className={className} />,
  Activity: ({ size, className }) => <Activity size={size} className={className} />
};

const COLOR_PRESETS = [
  { name: "Apex Red", hex: "#EF1A2D" },
  { name: "Electric Blue", hex: "#3B82F6" },
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Cyber Amber", hex: "#F59E0B" },
  { name: "Royal Purple", hex: "#8B5CF6" },
  { name: "Stealth Black", hex: "#1F2937" },
  { name: "Papaya Orange", hex: "#FF8C00" },
  { name: "Racing Green", hex: "#004225" },
  { name: "Neon Pink", hex: "#FF1493" },
  { name: "Arctic White", hex: "#F3F4F6" },
  { name: "Silver Arrow", hex: "#9CA3AF" },
  { name: "Midnight Blue", hex: "#1E3A8A" }
];

export const ClubManagerTab: React.FC<ClubManagerTabProps> = ({ currentUser, seasonData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'standings' | 'hq' | 'market' | 'rd' | 'sponsors' | 'admin' | 'results' | 'club-settings' | 'scouting' | 'info'>('hq');
  const [settings, setSettings] = useState<any>({
    seasonStart: "2026-03-01",
    currentGpRound: "1",
    currentGpName: "",
    raceLaps: 0,
    weatherConditions: "Unknown",
    pointMultiplier: 1.0,
    status: "Awaiting Schedule",
    customCircuits: []
  });

  const [marketDrivers, setMarketDrivers] = useState<any[]>([]);
  const [marketStaff, setMarketStaff] = useState<any[]>([]);
  const [sponsorsPool, setSponsorsPool] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [raceResults, setRaceResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Club registration form
  const [newClubForm, setNewClubForm] = useState({
    clubName: "",
    teamColor: "#EF1A2D",
    badgeIcon: "Shield"
  });

  const [updateClubForm, setUpdateClubForm] = useState({
    clubName: "",
    teamColor: "",
    badgeIcon: ""
  });

  // Admin circuit creator form
  const [circuitForm, setCircuitForm] = useState({
    name: "",
    laps: 60,
    locality: "",
    practiceTime: "Friday 14:00 UTC",
    qualifyingTime: "Saturday 15:00 UTC",
    raceTime: "Sunday 14:00 UTC"
  });

  const isAdmin = currentUser?.username?.toLowerCase() === 'admin' || currentUser?.isAdmin === true || currentUser?.role === 'admin';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settRes, clubRes, resRes] = await Promise.all([
        fetch('/api/club-manager/settings'),
        fetch('/api/club-manager/clubs'),
        fetch('/api/club-manager/results')
      ]);
      if (settRes.ok) {
        const data = await settRes.json();
        setSettings(data.settings || {});
        setMarketDrivers(data.marketDrivers || []);
        setMarketStaff(data.marketStaff || []);
        setSponsorsPool(data.sponsors || []);
      }
      if (clubRes.ok) {
        const cList = await clubRes.json();
        setClubs(cList || []);
      }
      if (resRes.ok) {
        const resultsData = await resRes.json();
        setRaceResults(resultsData.results || []);
      }
    } catch (e) {
      console.error("Failed to load club data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const myClubRecord = clubs.find(c => c.username?.toLowerCase() === currentUser?.username?.toLowerCase());

  useEffect(() => {
    if (myClubRecord) {
      setUpdateClubForm({
        clubName: myClubRecord.clubName || "",
        teamColor: myClubRecord.teamColor || "#EF1A2D",
        badgeIcon: myClubRecord.badgeIcon || "Shield"
      });
    }
  }, [myClubRecord]);

  const handleRegisterClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setStatusMsg("Registering constructor club...");
    try {
      const res = await fetch('/api/club-manager/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          clubName: newClubForm.clubName,
          teamColor: newClubForm.teamColor,
          badgeIcon: newClubForm.badgeIcon
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg("Club founded successfully with $3,000,000 budget!");
        await fetchData();
        setActiveSubTab('hq');
      } else {
        setStatusMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMsg(`Registration failed: ${err.message}`);
    }
  };

  const handleBuyDriver = async (driverId: string, slot: 1 | 2 | 3) => {
    if (!currentUser) return;
    setStatusMsg(`Negotiating contract for Seat ${slot}...`);
    try {
      const res = await fetch('/api/club-manager/buy-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, driverId, slot })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || "Driver signed!");
        await fetchData();
      } else {
        alert(data.error || "Transfer failed");
        setStatusMsg(`Failed: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMsg(`Transfer error: ${e.message}`);
    }
  };

  const handleSwapDrivers = async () => {
    if (!currentUser) return;
    setStatusMsg("Swapping Seat 1 and Seat 2 drivers...");
    try {
      const res = await fetch('/api/club-manager/swap-drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || "Drivers swapped!");
        await fetchData();
      } else {
        alert(data.error || "Swap failed");
        setStatusMsg(`Failed: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMsg(`Swap error: ${e.message}`);
    }
  };

  const handleUpdateDriverStyle = async (slot: 1 | 2 | 3, drivingStyle: string) => {
    if (!currentUser) return;
    setStatusMsg(`Updating driving style...`);
    try {
      const res = await fetch('/api/club-manager/update-driver-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, slot, drivingStyle })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        await fetchData();
      } else {
        setStatusMsg(`Failed: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMsg(`Update error: ${e.message}`);
    }
  };

  const handleSellDriver = async (slot: 1 | 2 | 3) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/club-manager/sell-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, slot })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message || "Driver released.");
        await fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpgradeRD = async (category: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/club-manager/upgrade-rd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, category })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        await fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleSponsor = async (sponsorId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/club-manager/toggle-sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, sponsorId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        await fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddCircuit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circuitForm.name) return;
    try {
      const res = await fetch('/api/admin/club-manager/add-circuit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuitForm)
      });
      if (res.ok) {
        setStatusMsg(`Circuit "${circuitForm.name}" added to Championship!`);
        setCircuitForm({ name: "", laps: 60, locality: "" });
        await fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setStatusMsg("Updating club...");
    try {
      const res = await fetch("/api/club-manager/update-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          ...updateClubForm
        })
      });
      const data = await res.json();
      setStatusMsg(data.error || data.message);
      if (res.ok) {
        fetchData();
      }
    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  const handleDeleteClub = async () => {
    if (!currentUser) return;
    
    try {
      const res = await fetch("/api/club-manager/delete-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username })
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg(data.error);
        return;
      }
      setStatusMsg(data.message);
      setShowDeleteConfirm(false);
      setActiveSubTab('hq');
      fetchData();
    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  const handleTrainDriver = async (slot: 1 | 2) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/club-manager/train-driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username, slot })
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg(data.error);
        return;
      }
      setStatusMsg(data.message);
      fetchData();
    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  const handleDriverInteract = async (slot: 1 | 2 | 3, type: 'praise' | 'criticize' | 'bonus') => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/club-manager/driver-interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username, slot, type })
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg(data.error);
        return;
      }
      setStatusMsg(data.message);
      fetchData();
    } catch (err: any) {
      setStatusMsg(err.message);
    }
  };

  const handleSimulateRace = async () => {
    setStatusMsg("Simulating Grand Prix Race Round...");
    try {
      const res = await fetch('/api/admin/club-manager/simulate-race', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(data.message);
        await fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 px-4 text-center">
        <RefreshCw className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading F1 Constructor League & Transfer Market...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Status Alert */}
      {statusMsg && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between text-amber-900 text-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-600 shrink-0" size={18} />
            <span className="font-medium">{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs font-bold uppercase text-amber-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveSubTab('info')}
          title="Guide & Info"
          className={`p-3 rounded-xl transition-all shadow-sm ${
            activeSubTab === 'info' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Info size={20} />
        </button>

        <button
          onClick={() => setActiveSubTab('hq')}
          title="My Club HQ"
          className={`p-3 rounded-xl transition-all shadow-sm ${
            activeSubTab === 'hq' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Briefcase size={20} />
        </button>

        {myClubRecord && (
          <>
            <button
              onClick={() => setActiveSubTab('standings')}
              title="Constructor Standings"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'standings' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Trophy size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('results')}
              title="Race Results"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'results' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Flag size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('market')}
              title="Personnel Transfer Market"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'market' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ShoppingCart size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('scouting')}
              title="Young Driver Scouting"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'scouting' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('rd')}
              title="R&D Upgrade Trees"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'rd' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Wrench size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('sponsors')}
              title="Dynamic Paddock Sponsorships"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'sponsors' ? 'bg-red-600 text-white shadow-red-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <DollarSign size={20} />
            </button>

            <button
              onClick={() => setActiveSubTab('club-settings')}
              title="Club Settings"
              className={`p-3 rounded-xl transition-all shadow-sm ${
                activeSubTab === 'club-settings' ? 'bg-gray-800 text-white shadow-gray-500/25' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Sliders size={20} />
            </button>
          </>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('admin')}
            title="Race Director (Admin)"
            className={`p-3 rounded-xl transition-all shadow-sm ml-auto ${
              activeSubTab === 'admin' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
            }`}
          >
            <Settings size={20} />
          </button>
        )}
      </div>

      {/* GUIDE & INFO */}
      {activeSubTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Info className="text-red-600" size={28} />
                How to Play: Constructor Club Manager
              </h2>
              <p className="text-gray-500 mt-2">Welcome to the paddock! Here is everything you need to know to take your team to the top.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-blue-500" size={20} />
                  1. Found Your Club
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Start by heading over to the <span className="font-bold">My Club HQ</span> tab. Choose your team name, livery colors, and badge. Once founded, you'll receive a starting budget of $3,000,000 to build your empire.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="text-emerald-500" size={20} />
                  2. Hire Drivers & Staff
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Visit the <span className="font-bold">Transfer Market</span> to sign up to 2 main drivers and 1 test driver. Drivers with higher overall skill will perform better on track. You can also hire Key Personnel (Chief Engineers, Strategists) to unlock powerful passive bonuses for your team.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wrench className="text-amber-500" size={20} />
                  3. Upgrade Your Car
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  In the <span className="font-bold">R&D Upgrade Trees</span> tab, spend your budget to improve your car's aerodynamics, engine, and more. Each upgrade tier boosts your drivers' performance in simulated races. Don't fall behind the development curve!
                </p>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="text-purple-500" size={20} />
                  4. Financial Management, Budget & Sponsoring
                </h3>
                <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                  <p className="font-bold text-gray-800">1- Budget Cap Rules (Season)</p>
                  <p>1. All teams participating in the races can spend a maximum of 2.5 million dollars per race. These costs include (driver contracts, managers, engineers, and R&D costs).</p>
                  <p className="font-bold text-gray-800 mt-2">« Notes »</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>If a team exceeds the budget cap by 5%, it will lead to a direct ban from R&D in the next two races.</li>
                    <li>If a team exceeds the budget cap by 10%, it will lead to a direct ban from R&D and transfer market for the next two races.</li>
                  </ul>
                  <p className="mt-2">Keep your team afloat by signing deals in the <span className="font-bold">Dynamic Sponsorships</span> tab. Good race finishes also award prize money!</p>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Flag className="text-red-600" size={20} />
                  5. Race Weekend Simulation
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When the Admin simulates a race round, your drivers' base skill, plus your R&D bonuses and staff perks, are combined to calculate their race pace. Points are awarded to the top 10 finishers, contributing to the World Constructor Standings!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: LEAGUE STANDINGS */}
      {activeSubTab === 'standings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">World Constructor Standings</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sample teams have been removed. Create your team to compete for the championship!</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                 <div>
                    {settings.currentGpName ? (
                      <>
                        <div className="text-xs text-gray-500 font-mono uppercase font-bold">Upcoming: {settings.currentGpName} ({settings.raceLaps || 0} Laps)</div>
                        <div className="flex gap-4 mt-1 text-xs font-mono text-gray-700">
                          <span><span className="font-bold text-indigo-600">FP1:</span> {settings.practiceTime}</span>
                          <span><span className="font-bold text-amber-600">Quali:</span> {settings.qualifyingTime}</span>
                          <span><span className="font-bold text-red-600">Race:</span> {settings.raceTime}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 font-mono italic">No upcoming races scheduled.</div>
                    )}
                 </div>
                <button onClick={fetchData} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors" title="Refresh">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {clubs.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-700">No Constructor Clubs Founded Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  The grid is pristine and empty! Head over to <button onClick={() => setActiveSubTab('hq')} className="text-red-600 font-bold hover:underline">My Club HQ</button> to register the inaugural F1 constructor team.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs font-mono tracking-wider border-b border-gray-200">
                      <th className="py-4 px-6 w-16">Pos</th>
                      <th className="py-4 px-6">Constructor Club</th>
                      <th className="py-4 px-6">Founder</th>
                      <th className="py-4 px-6">Driver Roster</th>
                      <th className="py-4 px-6 text-center">Wins</th>
                      <th className="py-4 px-6 text-center">Podiums</th>
                      <th className="py-4 px-6 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {clubs.map((club, index) => {
                      const BadgeComp = BADGE_ICONS[club.badgeIcon] || BADGE_ICONS.Shield;
                      const isMyTeam = club.username?.toLowerCase() === currentUser?.username?.toLowerCase();
                      return (
                        <tr key={club.id || index} className={`hover:bg-gray-50/80 transition-colors ${isMyTeam ? 'bg-red-50/50 font-medium' : ''}`}>
                          <td className="py-4 px-6 font-mono font-bold">
                            {index + 1 === 1 && <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-400 text-black text-xs font-black mr-1">1</span>}
                            {index + 1 === 2 && <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-black text-xs font-black mr-1">2</span>}
                            {index + 1 === 3 && <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700 text-white text-xs font-black mr-1">3</span>}
                            {index + 1 > 3 && <span className="text-gray-500">#{index + 1}</span>}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ backgroundColor: club.teamColor || '#EF1A2D' }}>
                                <BadgeComp size={20} />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{club.clubName}</div>
                                {isMyTeam && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono">Your Team</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-mono">@{club.username}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200 font-medium">{club.driver1?.name || "Seat 1"} <span className="text-red-600 font-bold">({club.driver1?.skill || 70})</span></span>
                              <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200 font-medium">{club.driver2?.name || "Seat 2"} <span className="text-red-600 font-bold">({club.driver2?.skill || 68})</span></span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-bold font-mono text-gray-800">{club.wins || 0}</td>
                          <td className="py-4 px-6 text-center font-bold font-mono text-gray-800">{club.podiums || 0}</td>
                          <td className="py-4 px-6 text-right font-black font-mono text-lg text-red-600">{club.totalPoints || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MY CLUB HQ */}
      {activeSubTab === 'hq' && (
        <div className="space-y-6">
          {!currentUser ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xl space-y-4">
              <Users className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Please Login to Access Your Club HQ</h3>
              <p className="text-sm text-gray-500">Sign in to claim your $3M starting budget and manage your driver roster.</p>
            </div>
          ) : !myClubRecord ? (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                  <PlusCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Found Your Constructor Club</h2>
                <p className="text-sm text-gray-500">
                  You will receive a <span className="font-bold text-emerald-600">$3,000,000 starting budget</span> to sign transfer market drivers and build upgrade trees. Driver names cannot be customized manually.
                </p>
              </div>

              <form onSubmit={handleRegisterClub} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Constructor Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scuderia Cebric Apex"
                    value={newClubForm.clubName}
                    onChange={(e) => setNewClubForm({ ...newClubForm, clubName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Livery Team Color</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setNewClubForm({ ...newClubForm, teamColor: col.hex })}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-white transition-transform ${
                          newClubForm.teamColor === col.hex ? 'ring-4 ring-red-500/30 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {newClubForm.teamColor === col.hex && <CheckCircle size={20} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Team Crest Icon</label>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(BADGE_ICONS).map((bKey) => {
                      const BIcon = BADGE_ICONS[bKey];
                      return (
                        <button
                          key={bKey}
                          type="button"
                          onClick={() => setNewClubForm({ ...newClubForm, badgeIcon: bKey })}
                          className={`w-24 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            newClubForm.badgeIcon === bKey ? 'border-red-600 bg-red-50/60 text-red-700 font-bold shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <BIcon size={24} />
                          <span className="text-xs">{bKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-red-600 text-white font-bold shadow-xl hover:bg-red-700 transition-all text-center uppercase tracking-wider"
                >
                  Found Team & Claim $3M Budget
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Club Dashboard Overview */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,0,0,0.15)] text-3xl border-4 border-white relative z-10" style={{ backgroundColor: myClubRecord.teamColor || '#EF1A2D' }}>
                      {React.createElement(BADGE_ICONS[myClubRecord.badgeIcon] || BADGE_ICONS.Shield, { size: 48, className: "drop-shadow-md" })}
                    </div>
                    <div className="absolute inset-0 rounded-full border border-gray-100 scale-110 z-0"></div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-xs uppercase font-mono text-gray-400 font-semibold flex items-center gap-2">
                      <Shield size={14} /> Registered Constructor Club
                    </span>
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-black text-gray-900">{myClubRecord.clubName}</h2>
                    </div>
                    <p className="text-sm text-gray-500">Managed by @{myClubRecord.username}</p>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 min-w-[160px]">
                    <div className="text-xs uppercase font-mono text-emerald-800 font-bold flex items-center gap-1">
                      <Coins size={14} /> Available Budget
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                      ${(myClubRecord.budget || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 min-w-[160px]">
                    <div className="text-xs uppercase font-mono text-blue-800 font-bold flex items-center gap-1">
                      <DollarSign size={14} /> Salary Cap Status
                    </div>
                    <div className="text-lg font-black font-mono text-blue-900 mt-1">
                      ${((myClubRecord.driver1?.salary || 0) + (myClubRecord.driver2?.salary || 0) + (myClubRecord.testDriver?.salary || 0) + (myClubRecord.staff || []).reduce((acc: number, s: any) => acc + s.salary, 0)).toLocaleString()} <span className="text-xs text-blue-600 font-normal">/ ${(myClubRecord.salaryCap || 2500000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Roster Cards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900">Active Racing Roster</h3>
                  <div className="flex items-center gap-4">
                    <button onClick={handleSwapDrivers} className="text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">
                      Swap Seat 1 & 2
                    </button>
                    <button onClick={() => setActiveSubTab('market')} className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1">
                      Buy Drivers on Market <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seat 1 */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black font-mono text-xs px-3 py-1 rounded-bl-xl uppercase">
                      Seat #1 (Lead Driver)
                    </div>
                    <div className="space-y-2 pt-2">
                      <h4 className="text-2xl font-black text-gray-900">{myClubRecord.driver1?.name || "Empty Seat"}</h4>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 font-mono">
                        <div className="flex items-center gap-4">
                          <span>Skill Rating: <strong className="text-red-600 text-base">{myClubRecord.driver1?.skill || 70} / 100</strong></span>
                          <span>Salary: <strong>${(myClubRecord.driver1?.salary || 0).toLocaleString()} / race</strong></span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span>Morale: <strong>{myClubRecord.driver1?.morale || 80}</strong></span>
                          <span>Focus: <strong>{myClubRecord.driver1?.focus || 80}</strong></span>
                          <span>Loyalty: <strong>{myClubRecord.driver1?.loyalty || 80}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => handleDriverInteract(1, 'praise')} title="Praise" className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition"><ThumbsUp size={16} /></button>
                          <button onClick={() => handleDriverInteract(1, 'criticize')} title="Criticize" className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition"><ThumbsDown size={16} /></button>
                          <button onClick={() => handleDriverInteract(1, 'bonus')} title="Bonus (-$50k)" className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition"><Coins size={16} /></button>
                          <div className="w-px h-4 bg-gray-300 mx-1"></div>
                          <button onClick={() => handleUpdateDriverStyle(1, 'Aggressive')} title="Aggressive: +2 Pace / -1 Tire / -1 Rel" className={`p-1.5 rounded transition ${myClubRecord.driver1?.drivingStyle === 'Aggressive' ? 'bg-red-500 text-white shadow-inner' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}><Zap size={16} /></button>
                          <button onClick={() => handleUpdateDriverStyle(1, 'Balanced')} title="Balanced: Neutral" className={`p-1.5 rounded transition ${myClubRecord.driver1?.drivingStyle === 'Balanced' || !myClubRecord.driver1?.drivingStyle ? 'bg-gray-800 text-white shadow-inner' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><Scale size={16} /></button>
                          <button onClick={() => handleUpdateDriverStyle(1, 'Conservative')} title="Conservative: -1 Pace / +1 Tire / +1 Rel" className={`p-1.5 rounded transition ${myClubRecord.driver1?.drivingStyle === 'Conservative' ? 'bg-blue-500 text-white shadow-inner' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}><Shield size={16} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Release Clause: ${(myClubRecord.driver1?.price || 100000).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrainDriver(1)}
                          className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
                        >
                          Train (+1 OVR) -$50k
                        </button>
                        <button
                          onClick={() => handleSellDriver(1)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-bold transition-colors border border-gray-200"
                        >
                          Sell (80%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Seat 2 */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="absolute top-0 right-0 bg-gray-800 text-white font-black font-mono text-xs px-3 py-1 rounded-bl-xl uppercase">
                      Seat #2 (Wingman)
                    </div>
                    <div className="space-y-2 pt-2">
                      <h4 className="text-2xl font-black text-gray-900">{myClubRecord.driver2?.name || "Empty Seat"}</h4>
                      <div className="flex flex-col gap-2 text-sm text-gray-600 font-mono">
                        <div className="flex items-center gap-4">
                          <span>Skill Rating: <strong className="text-red-600 text-base">{myClubRecord.driver2?.skill || 68} / 100</strong></span>
                          <span>Salary: <strong>${(myClubRecord.driver2?.salary || 0).toLocaleString()} / race</strong></span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span>Morale: <strong>{myClubRecord.driver2?.morale || 80}</strong></span>
                          <span>Focus: <strong>{myClubRecord.driver2?.focus || 80}</strong></span>
                          <span>Loyalty: <strong>{myClubRecord.driver2?.loyalty || 80}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => handleDriverInteract(2, 'praise')} title="Praise" className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition"><ThumbsUp size={16} /></button>
                          <button onClick={() => handleDriverInteract(2, 'criticize')} title="Criticize" className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition"><ThumbsDown size={16} /></button>
                          <button onClick={() => handleDriverInteract(2, 'bonus')} title="Bonus (-$50k)" className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition"><Coins size={16} /></button>
                          <div className="w-px h-4 bg-gray-300 mx-1"></div>
                          <button onClick={() => handleUpdateDriverStyle(2, 'Aggressive')} title="Aggressive: +2 Pace / -1 Tire / -1 Rel" className={`p-1.5 rounded transition ${myClubRecord.driver2?.drivingStyle === 'Aggressive' ? 'bg-red-500 text-white shadow-inner' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}><Zap size={16} /></button>
                          <button onClick={() => handleUpdateDriverStyle(2, 'Balanced')} title="Balanced: Neutral" className={`p-1.5 rounded transition ${myClubRecord.driver2?.drivingStyle === 'Balanced' || !myClubRecord.driver2?.drivingStyle ? 'bg-gray-800 text-white shadow-inner' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><Scale size={16} /></button>
                          <button onClick={() => handleUpdateDriverStyle(2, 'Conservative')} title="Conservative: -1 Pace / +1 Tire / +1 Rel" className={`p-1.5 rounded transition ${myClubRecord.driver2?.drivingStyle === 'Conservative' ? 'bg-blue-500 text-white shadow-inner' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}><Shield size={16} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Release Clause: ${(myClubRecord.driver2?.price || 100000).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrainDriver(2)}
                          className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
                        >
                          Train (+1 OVR) -$50k
                        </button>
                        <button
                          onClick={() => handleSellDriver(2)}
                          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-bold transition-colors border border-gray-200"
                        >
                          Sell (80%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Seat 3 (Test Driver) */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white font-black font-mono text-xs px-3 py-1 rounded-bl-xl uppercase">
                      Seat #3 (Test Driver)
                    </div>
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xl font-black text-gray-900">{myClubRecord.testDriver?.name || "Empty Seat"}</h4>
                      {myClubRecord.testDriver && (
                        <div className="flex flex-col gap-2 text-sm text-gray-600 font-mono">
                          <div className="flex items-center gap-4">
                            <span>Skill Rating: <strong className="text-red-600 text-base">{myClubRecord.testDriver.skill} / 100</strong></span>
                            <span>Salary: <strong>${myClubRecord.testDriver.salary.toLocaleString()} / race</strong></span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Morale: <strong>{myClubRecord.testDriver.morale || 80}</strong></span>
                            <span>Focus: <strong>{myClubRecord.testDriver.focus || 80}</strong></span>
                            <span>Loyalty: <strong>{myClubRecord.testDriver.loyalty || 80}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => handleDriverInteract(3, 'praise')} title="Praise" className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition"><ThumbsUp size={16} /></button>
                            <button onClick={() => handleDriverInteract(3, 'criticize')} title="Criticize" className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition"><ThumbsDown size={16} /></button>
                            <button onClick={() => handleDriverInteract(3, 'bonus')} title="Bonus (-$50k)" className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition"><Coins size={16} /></button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button onClick={() => handleUpdateDriverStyle(3, 'Aggressive')} title="Aggressive: +2 Pace / -1 Tire / -1 Rel" className={`p-1.5 rounded transition ${myClubRecord.testDriver?.drivingStyle === 'Aggressive' ? 'bg-red-500 text-white shadow-inner' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}><Zap size={16} /></button>
                            <button onClick={() => handleUpdateDriverStyle(3, 'Balanced')} title="Balanced: Neutral" className={`p-1.5 rounded transition ${myClubRecord.testDriver?.drivingStyle === 'Balanced' || !myClubRecord.testDriver?.drivingStyle ? 'bg-gray-800 text-white shadow-inner' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><Scale size={16} /></button>
                            <button onClick={() => handleUpdateDriverStyle(3, 'Conservative')} title="Conservative: -1 Pace / +1 Tire / +1 Rel" className={`p-1.5 rounded transition ${myClubRecord.testDriver?.drivingStyle === 'Conservative' ? 'bg-blue-500 text-white shadow-inner' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}><Shield size={16} /></button>
                          </div>
                        </div>
                      )}
                      {!myClubRecord.testDriver && (
                        <p className="text-xs text-gray-500">Sign a test driver from the market (Max salary $1,000).</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Release Clause: ${(myClubRecord.testDriver?.price || 0).toLocaleString()}</span>
                      <div className="flex gap-2">
                        {myClubRecord.testDriver && (
                          <button
                            onClick={() => handleSellDriver(3)}
                            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-bold transition-colors border border-gray-200"
                          >
                            Sell (80%)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLUB SETTINGS */}
      {activeSubTab === 'club-settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Club Settings</h2>
            
            {myClubRecord ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleUpdateClub} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Club Name</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={updateClubForm.clubName}
                      onChange={(e) => setUpdateClubForm({ ...updateClubForm, clubName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Livery Team Color</label>
                    <div className="flex gap-3">
                      {COLOR_PRESETS.map(color => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setUpdateClubForm({ ...updateClubForm, teamColor: color.hex })}
                          className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                            updateClubForm.teamColor === color.hex ? 'ring-4 ring-offset-2 ring-red-500 shadow-lg scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {updateClubForm.teamColor === color.hex && <span className="text-white drop-shadow-md"><Trophy size={16} /></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Team Crest Icon</label>
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(BADGE_ICONS).map((bKey) => {
                        const BIcon = BADGE_ICONS[bKey];
                        return (
                          <button
                            key={bKey}
                            type="button"
                            onClick={() => setUpdateClubForm({ ...updateClubForm, badgeIcon: bKey })}
                            className={`w-24 py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                              updateClubForm.badgeIcon === bKey ? 'border-gray-900 bg-gray-900 text-white font-bold shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <BIcon size={24} />
                            <span className="text-xs">{bKey}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black uppercase text-sm rounded-xl transition-all shadow-xl shadow-gray-900/20"
                  >
                    Save Changes
                  </button>
                </form>

                <div className="space-y-4">
                  <div className="pt-6 border-t border-gray-100 lg:border-t-0 lg:pt-0">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-xs text-gray-400 mb-4">Deleting your club is permanent and will erase all funds, roster, and upgrades.</p>
                    
                    {!showDeleteConfirm ? (
                      <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                        Delete Club Permanently
                      </button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3">
                        <p className="text-sm font-bold text-red-800">Are you absolutely sure?</p>
                        <div className="flex gap-2">
                          <button onClick={handleDeleteClub} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                            Yes, Delete My Club
                          </button>
                          <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-bold transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Please found a club first to access settings.</p>
            )}
          </div>
        </div>
      )}

      {/* RACE RESULTS */}
      {activeSubTab === 'results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Past Race Results</h2>
            <p className="text-sm text-gray-500">View classifications from completed simulated races.</p>
            {raceResults.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-sm">No races have been simulated yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {raceResults.map((race, i) => (
                  <div key={race.id} className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{race.gpName} - Round {race.round}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs font-bold">
                            <th className="py-2 px-3">Pos</th>
                            <th className="py-2 px-3">Driver</th>
                            <th className="py-2 px-3">Team</th>
                            <th className="py-2 px-3 text-right">Points</th>
                            <th className="py-2 px-3 text-right">Time Gap</th>
                          </tr>
                        </thead>
                        <tbody>
                          {race.standings.map((driver: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0">
                              <td className="py-2 px-3 font-bold text-gray-900">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium">{driver.name}</td>
                              <td className="py-2 px-3 text-gray-500" style={{ color: driver.teamColor || '#666' }}>{driver.teamName}</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-600">{driver.pointsEarned}</td>
                              <td className="py-2 px-3 text-right text-gray-400 font-mono text-xs">{idx === 0 ? 'Winner' : `+${driver.timeGap?.toFixed(3) || '0.000'}s`}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DRIVER TRANSFER MARKET */}
      {activeSubTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Personnel Transfer Market</h2>
                <p className="text-sm text-gray-500">Sign elite fictitious talent. Combined driver salaries cannot exceed your $400k/race Salary Cap.</p>
                <div className="mt-2 text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 inline-flex px-2 py-1 rounded">
                  <Clock size={12} /> Market Refreshes Every Monday at 00:00 UTC
                </div>
              </div>

              {myClubRecord && (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-200 font-mono text-sm">
                  <span>Budget: <strong className="text-emerald-600">${myClubRecord.budget.toLocaleString()}</strong></span>
                  <span>Salaries: <strong className="text-blue-600">${((myClubRecord.driver1?.salary || 0) + (myClubRecord.driver2?.salary || 0)).toLocaleString()}</strong>/400k</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketDrivers.map((driver) => {
                const isSignedSeat1 = myClubRecord?.driver1?.id === driver.id;
                const isSignedSeat2 = myClubRecord?.driver2?.id === driver.id;
                const isSignedSeat3 = myClubRecord?.testDriver?.id === driver.id;
                const isAlreadySigned = isSignedSeat1 || isSignedSeat2 || isSignedSeat3;

                return (
                  <div key={driver.id} className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                    isAlreadySigned ? 'bg-gray-50 border-gray-300 opacity-80' : 'bg-white border-gray-200 shadow-md hover:shadow-xl hover:border-red-300'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{driver.nationality}</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-black font-mono text-sm">
                          {driver.skill} OVR
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{driver.name}</h4>
                        <p className="text-xs text-gray-400">Age: {driver.age} yrs old</p>
                      </div>
                      <div className="py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs font-mono">
                        <div className="flex justify-between text-gray-600">
                          <span>Transfer Fee:</span>
                          <strong className="text-gray-900">${driver.price.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Salary Demand:</span>
                          <strong className="text-blue-600">${driver.salary.toLocaleString()}/race</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
                      {isAlreadySigned ? (
                        <div className="w-full py-2 text-center text-xs font-bold uppercase text-gray-400 bg-gray-100 rounded-xl">
                          Active on Roster ({isSignedSeat1 ? 'Seat 1' : isSignedSeat2 ? 'Seat 2' : 'Test Driver'})
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleBuyDriver(driver.id, 1)}
                            disabled={!myClubRecord}
                            className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase transition-colors shadow-sm disabled:opacity-50"
                          >
                            Sign Seat #1
                          </button>
                          <button
                            onClick={() => handleBuyDriver(driver.id, 2)}
                            disabled={!myClubRecord}
                            className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase transition-colors shadow-sm disabled:opacity-50"
                          >
                            Sign Seat #2
                          </button>
                          {driver.salary <= 1000 && (
                            <button
                              onClick={() => handleBuyDriver(driver.id, 3)}
                              disabled={!myClubRecord}
                              className="col-span-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition-colors shadow-sm disabled:opacity-50"
                            >
                              Sign as Test Driver
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

              {/* Staff Grid */}
              <div className="mt-12 space-y-8">
                <h3 className="text-xl font-black text-gray-900">Available Key Personnel (Staff)</h3>
                
                {["Chief Engineer", "Strategy Director", "Race Engineer", "Head of Mechanics"].map((role) => (
                  <div key={role} className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wider text-sm border-b border-gray-100 pb-2">{role}s</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {marketStaff.filter(s => s.role === role).map((staff) => {
                        const isHired = myClubRecord?.staff?.some((s: any) => s.id === staff.id);
                        return (
                          <div key={staff.id} className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{staff.name}</div>
                              <div className="text-xs text-gray-500 font-mono mt-1">OVR <span className="font-bold text-red-600">{staff.skill}</span></div>
                              <div className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">{staff.bonus}</div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="text-sm font-black text-gray-900">${staff.price.toLocaleString()}</div>
                              {isHired ? (
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold">Hired</span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch("/api/club-manager/buy-staff", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ username: currentUser?.username, staffId: staff.id })
                                      });
                                      const data = await res.json();
                                      setStatusMsg(data.error || data.message);
                                      fetchData();
                                    } catch (err: any) {
                                      setStatusMsg(err.message);
                                    }
                                  }}
                                  className="text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-xl font-bold transition-colors"
                                >
                                  Hire Staff
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: R&D UPGRADE TREES */}
      {activeSubTab === 'rd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
            <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">R&D Upgrade Trees</h2>
                <p className="text-sm text-gray-500">Invest team funds into factory departments. Each upgrade level grants a score boost during race simulations.</p>
              </div>
              {myClubRecord && (
                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-800 font-mono font-bold text-sm">
                  Budget: ${myClubRecord.budget.toLocaleString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'aero', title: 'Aerodynamic Package', icon: WindIcon, desc: 'Wind tunnel validation, front wing endplates & diffuser floor profile.' },
                { key: 'engine', title: 'Power Unit Combustion', icon: Zap, desc: 'Turbocharger recovery MGU-H efficiency and battery storage yield.' },
                { key: 'crew', title: 'Pit Stop Crew Automation', icon: Wrench, desc: 'Pneumatic wheel gun torque optimizations and choreography drills.' },
                { key: 'tires', title: 'Tire Thermal Management', icon: Shield, desc: 'Suspension kinematics to reduce degradation in blistering high-speed corners.' },
                { key: 'chassis', title: 'Chassis Rigidity', icon: Shield, desc: 'Carbon fiber weaves for weight reduction and stiffness.' },
                { key: 'brakes', title: 'Brake by Wire System', icon: RefreshCw, desc: 'Optimized brake bias control and regenerative braking.' },
                { key: 'electronics', title: 'Telemetry Electronics', icon: Zap, desc: 'Real-time data processing and control electronics.' },
                { key: 'simulator', title: 'Driver Simulator Facility', icon: Cpu, desc: 'Virtual environment precision for driver setup training.' },
                { key: 'materials', title: 'Advanced Materials', icon: Zap, desc: 'Lightweight composites to lower the center of gravity and improve handling.' },
                { key: 'strategy', title: 'AI Strategy Engine', icon: Cpu, desc: 'Machine learning race pace predictions and optimal pit stop windows.' }
              ].map((tree) => {
                const currLvl = myClubRecord?.upgrades?.[tree.key] || 1;
                const costsMap: Record<number, number> = { 1: 200000, 2: 350000, 3: 550000, 4: 800000, 5: 1100000, 6: 1500000, 7: 2000000, 8: 2600000, 9: 3300000 };
                const nextCost = costsMap[currLvl];
                const isMax = currLvl >= 10;

                return (
                  <div key={tree.key} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                          <tree.icon size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-black font-mono text-xs uppercase">
                          Level {currLvl} / 10
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{tree.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{tree.desc}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-200/80">
                      {/* Level Progress */}
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                          <div
                            key={l}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              l <= currLvl ? 'bg-red-600 shadow-sm' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpgradeRD(tree.key)}
                        disabled={!myClubRecord || isMax}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                          isMax ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 hover:bg-black text-white'
                        }`}
                      >
                        {isMax ? 'Maximum Department Level Reached' : `Upgrade to L${currLvl + 1} ($${nextCost?.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: DYNAMIC SPONSORSHIPS */}
      {activeSubTab === 'sponsors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
            <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Dynamic Paddock Sponsorships</h2>
                <p className="text-sm text-gray-500">Sign up to 2 active commercial partners to earn upfront signing bonuses and race day cash payouts.</p>
              </div>
              {myClubRecord && (
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 text-blue-900 font-mono font-bold text-sm">
                  Active Partners: {myClubRecord.sponsors?.length || 0} / 2
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sponsorsPool.map((sponsor) => {
                const isSigned = myClubRecord?.sponsors?.includes(sponsor.id);

                return (
                  <div key={sponsor.id} className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                    isSigned ? 'bg-red-50/70 border-red-300 shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 shadow-md'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-red-600 font-mono tracking-wider">{sponsor.tier}</span>
                        {isSigned && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle size={12} /> Signed Contract</span>}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{sponsor.name}</h4>
                      <p className="text-sm font-mono font-bold text-gray-700 bg-gray-100 p-3 rounded-xl">
                        {sponsor.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleSponsor(sponsor.id)}
                        disabled={!myClubRecord}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                          isSigned ? 'bg-red-600 hover:bg-red-700 text-white shadow-md' : 'bg-gray-900 hover:bg-black text-white shadow-md'
                        }`}
                      >
                        {isSigned ? 'Terminate Sponsorship Contract' : 'Sign Sponsorship Agreement'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: SCOUTING */}
      {activeSubTab === 'scouting' && (
        <ScoutingTab currentUser={currentUser} clubRecord={myClubRecord} onRefresh={fetchData} setStatusMsg={setStatusMsg} />
      )}

      {/* SUB-VIEW 6: ADMIN RACE DIRECTOR CONTROLS */}
      {activeSubTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8 text-white shadow-2xl space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
              <Settings className="text-amber-400 h-8 w-8 animate-pulse" />
              <div>
                <h2 className="text-2xl font-black">Race Director (Admin)</h2>
                <p className="text-sm text-gray-400">Independent control center to add circuits, configure conditions, and run race simulations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add Circuit Form */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700 space-y-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <PlusCircle size={20} /> Create Championship Circuit
                </h3>
                <form onSubmit={handleAddCircuit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Grand Prix Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Silverstone British GP"
                      value={circuitForm.name}
                      onChange={(e) => setCircuitForm({ ...circuitForm, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Total Laps</label>
                      <input
                        type="number"
                        required
                        value={circuitForm.laps}
                        onChange={(e) => setCircuitForm({ ...circuitForm, laps: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Venue Locality</label>
                      <input
                        type="text"
                        placeholder="e.g. London"
                        value={circuitForm.locality}
                        onChange={(e) => setCircuitForm({ ...circuitForm, locality: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Practice Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Friday 14:00 UTC"
                        value={circuitForm.practiceTime}
                        onChange={(e) => setCircuitForm({ ...circuitForm, practiceTime: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Qualifying Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Saturday 15:00 UTC"
                        value={circuitForm.qualifyingTime}
                        onChange={(e) => setCircuitForm({ ...circuitForm, qualifyingTime: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Race Time</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sunday 14:00 UTC"
                        value={circuitForm.raceTime}
                        onChange={(e) => setCircuitForm({ ...circuitForm, raceTime: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase text-xs rounded-xl transition-all shadow-lg">
                    Add Circuit to Calendar
                  </button>
                </form>
              </div>

              {/* Race Sim Simulator */}
              <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <Play size={20} /> Simulate Grand Prix Weekend
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Executes driver performance simulation based on skill ratings + R&D upgrades + random variance. Automatically awards constructor points, distributes $50k/point prize money, triggers sponsor payouts, and pays driver salaries.
                  </p>
                </div>

                <button
                  onClick={handleSimulateRace}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase text-sm rounded-xl transition-all shadow-2xl shadow-red-600/30 tracking-wider flex items-center justify-center gap-2"
                >
                  <Play size={18} fill="currentColor" /> Run Race Simulation
                </button>
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Registered Clubs & Players</h3>
                <button
                  onClick={async () => {
                    setStatusMsg("Refreshing transfer market...");
                    try {
                      const res = await fetch('/api/admin/club-manager/refresh-market', { method: 'POST' });
                      const data = await res.json();
                      if (res.ok) {
                        setStatusMsg(data.message);
                        fetchData();
                      } else {
                        setStatusMsg(data.error);
                      }
                    } catch (e: any) {
                      setStatusMsg(e.message);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Refresh Market
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700 text-xs uppercase font-bold text-gray-400">
                      <th className="py-2 px-3">Manager</th>
                      <th className="py-2 px-3">Team Name</th>
                      <th className="py-2 px-3 text-right">Budget</th>
                      <th className="py-2 px-3">Seat 1</th>
                      <th className="py-2 px-3">Seat 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.map((c) => (
                      <tr key={c.username} className="border-b border-gray-700/50">
                        <td className="py-2 px-3 text-sm text-gray-200">@{c.username}</td>
                        <td className="py-2 px-3 text-sm font-bold text-white" style={{ color: c.teamColor }}>{c.clubName}</td>
                        <td className="py-2 px-3 text-sm text-emerald-400 text-right font-mono">${c.budget.toLocaleString()}</td>
                        <td className="py-2 px-3 text-sm text-gray-300">{c.driver1?.name || '-'}</td>
                        <td className="py-2 px-3 text-sm text-gray-300">{c.driver2?.name || '-'}</td>
                      </tr>
                    ))}
                    {clubs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-sm text-gray-500">No clubs registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function WindIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
    </svg>
  );
}

export default ClubManagerTab;
