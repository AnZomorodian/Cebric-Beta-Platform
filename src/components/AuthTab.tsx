import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, UserPlus, LogOut, CheckCircle2, ShieldAlert, Award, Hash, Timer, Zap, Sparkles, Cpu, Gauge, Trophy, RefreshCw } from 'lucide-react';

interface UserSession {
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  passportNumber: string;
}

const TEAM_COLORS: Record<string, string> = {
  'Ferrari': '#EF1A2D',
  'Red Bull Racing': '#3671C6',
  'Mercedes AMG': '#27F4D2',
  'McLaren': '#FF8700',
  'Aston Martin': '#229971',
  'Alpine': '#0093CC',
  'Williams': '#64C4FF',
  'Sauber': '#52E252',
  'RB': '#6692FF',
  'Haas': '#B6BABD',
};

export default function AuthTab() {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Form Fields
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [givenName, setGivenName] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Status message controls
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // VIP Customizations
  const [favouriteTeam, setFavouriteTeam] = useState<string>('Ferrari');
  const [favouriteDriver, setFavouriteDriver] = useState<string>('Charles Leclerc');

  // Load existing session & preferences on mount
  useEffect(() => {
    const cached = localStorage.getItem('f1_user_session');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (err) {
        localStorage.removeItem('f1_user_session');
      }
    }

    // Load VIP customization
    const cachedTeam = localStorage.getItem('f1_pref_team');
    const cachedDriver = localStorage.getItem('f1_pref_driver');
    if (cachedTeam) setFavouriteTeam(cachedTeam);
    if (cachedDriver) setFavouriteDriver(cachedDriver);
  }, []);

  const savePreferences = (team: string, driver: string) => {
    setFavouriteTeam(team);
    setFavouriteDriver(driver);
    localStorage.setItem('f1_pref_team', team);
    localStorage.setItem('f1_pref_driver', driver);
    setSuccessMsg('VIP Driver and Team profile choices updated successfully!');
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setGivenName('');
    setFamilyName('');
    setEmail('');
    setErrorMsg(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (!username.trim() || !password.trim() || !givenName.trim() || !familyName.trim() || !email.trim()) {
      setErrorMsg('All registration fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, givenName, familyName, email })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server registration failure');
      }

      setSuccessMsg('Registration completed successfully! You can login now.');
      setIsRegistering(false);
      clearForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error encountered.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please specify both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Invalid credentials');
      }

      const session = resData.user;
      setCurrentUser(session);
      localStorage.setItem('f1_user_session', JSON.stringify(session));
      setSuccessMsg(`Welcome back, ${session.givenName}!`);
      clearForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('f1_user_session');
    setCurrentUser(null);
    setSuccessMsg('Logged out successfully.');
    setErrorMsg(null);
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  const getDayGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div id="auth-panel" className="max-w-xl mx-auto py-6">
      <AnimatePresence mode="wait">
        {currentUser ? (
          // LOGGED IN USER SUITE
          <motion.div
            key="logged-in-suite"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            {/* Header banner */}
            <div className="text-center space-y-2 select-none">
              <span className="text-[10px] bg-emerald-550/10 text-emerald-600 font-mono font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
                Active Session
              </span>
              <h1 className="text-3xl font-black text-black">
                {getDayGreeting()}, {currentUser.givenName}!
              </h1>
              <p className="text-xs text-gray-400">
                Logged in successfully as <strong className="text-black font-semibold">@{currentUser.username}</strong>
              </p>
            </div>

            {/* Custom Interactive Virtual F1 Paddock Entry Pass Card */}
            <div 
              id="f1-paddock-pass-card"
              className="bg-neutral-950 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-neutral-800"
            >
              <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-red-500 font-black uppercase">
                    FIA FORMULA 1 WORLD CHAMPIONSHIP
                  </span>
                  <h3 className="text-xl font-mono tracking-tight font-black animate-pulse" style={{ textShadow: "0 0 10px rgba(239, 26, 45, 0.4)" }}>
                    PADDOCK ENTRY PASS
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-gray-500 block">PASSPORT NO</span>
                  <strong className="text-sm font-mono font-black text-[#FF9E00]" id="passport-code">
                    {currentUser.passportNumber || "A8854"}
                  </strong>
                </div>
              </div>

              {/* Passenger layout */}
              <div className="grid grid-cols-12 gap-6 pt-6 relative z-10 items-center">
                
                {/* Visual Avatar Emblem */}
                <div className="col-span-4 flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-650 to-red-800 rounded-2xl flex items-center justify-center text-white text-3xl font-black font-mono shadow-inner border border-red-550 relative select-none">
                    {(currentUser.givenName?.[0] || 'U').toUpperCase()}
                    {(currentUser.familyName?.[0] || 'P').toUpperCase()}
                    {/* Retro lines */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>

                {/* Info credentials */}
                <div className="col-span-8 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="leading-none">
                      <span className="text-[8px] text-gray-500 block uppercase">Given Name</span>
                      <strong className="text-white font-bold block mt-1 truncate">{currentUser.givenName}</strong>
                    </div>
                    <div className="leading-none">
                      <span className="text-[8px] text-gray-500 block uppercase">Family Name</span>
                      <strong className="text-white font-bold block mt-1 truncate">{currentUser.familyName}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="leading-none">
                      <span className="text-[8px] text-gray-500 block uppercase">Privilege Level</span>
                      <strong className="text-[#FF9E00] font-black block mt-1 uppercase">ALL ACCESS VIP</strong>
                    </div>
                    <div className="leading-none col-span-1">
                      <span className="text-[8px] text-gray-500 block uppercase">Database Status</span>
                      <strong className="text-emerald-400 font-bold block mt-1 uppercase">ACTIVE GEN-V</strong>
                    </div>
                  </div>

                  {/* Registered Email */}
                  <div className="text-xs font-mono leading-none pt-1 border-t border-neutral-850">
                    <span className="text-[8px] text-gray-500 block uppercase mb-1">Registered Email</span>
                    <strong className="text-gray-300 font-semibold block truncate select-all">{currentUser.email || "vip-guest@formula1.com"}</strong>
                  </div>
                </div>

              </div>

              {/* Barcode representation */}
              <div className="mt-8 border-t border-neutral-800/80 pt-4 flex flex-col items-center">
                <div className="h-8 bg-white/10 w-full rounded flex items-center justify-around px-4 opacity-75">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-white h-full"
                      style={{ 
                        width: indexToWidth(i),
                        opacity: i % 3 === 0 ? 0.3 : 1
                      }} 
                    />
                  ))}
                </div>
                <div className="flex justify-between w-full mt-2 font-mono text-[9px] text-gray-400 tracking-wider">
                  <span>SYSTEM DECK: HOLOGRAPHIC PASS</span>
                  <span className="text-amber-500 font-extrabold animate-pulse">VALIDATED TOKEN ACTIVE</span>
                </div>
              </div>

              {/* Abstract decorative graphic orbits */}
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none w-48 h-48 select-none">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[2] stroke-white">
                  <circle cx="50" cy="50" r="40" strokeDasharray="5 3" />
                  <circle cx="50" cy="50" r="30" />
                </svg>
              </div>
            </div>

            {/* ENHANCED PADDOCK FAVORITES CONFIGURATOR (PADDOCK FAVORITES & ROSTER HIGHLIGHT) */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm select-none">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] text-red-500 font-mono font-black tracking-widest uppercase block mb-1">PADDOCK IDENTITY SUITE</span>
                <h3 className="text-xl font-extrabold text-black">Paddock Favorites & Roster Highlight</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Choose your favorite Formula 1 constructor team and primary driver below to personalize your paddock telemetry card overlays and highlight profiles.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Favorite F1 Driver</label>
                  <select
                    id="fav-driver-select"
                    value={favouriteDriver}
                    onChange={(e) => savePreferences(favouriteTeam, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 outline-none rounded-xl py-3 px-3.5 font-semibold text-xs focus:ring-1 focus:ring-black cursor-pointer transition-all"
                  >
                    {[
                      'Max Verstappen',
                      'Sergio Perez',
                      'Lewis Hamilton',
                      'George Russell',
                      'Charles Leclerc',
                      'Carlos Sainz',
                      'Lando Norris',
                      'Oscar Piastri',
                      'Fernando Alonso',
                      'Lance Stroll',
                      'Pierre Gasly',
                      'Esteban Ocon',
                      'Alexander Albon',
                      'Yuki Tsunoda',
                      'Liam Lawson',
                      'Valtteri Bottas',
                      'Zhou Guanyu',
                      'Nico Hulkenberg',
                      'Kevin Magnussen',
                      'Franco Colapinto',
                      'Oliver Bearman',
                      'Jack Doohan',
                      'Kimi Antonelli'
                    ].sort().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Favorite F1 Team</label>
                  <select
                    id="fav-team-select"
                    value={favouriteTeam}
                    onChange={(e) => savePreferences(e.target.value, favouriteDriver)}
                    className="w-full bg-gray-50 border border-gray-200 outline-none rounded-xl py-3 px-3.5 font-semibold text-xs focus:ring-1 focus:ring-black cursor-pointer transition-all"
                  >
                    {[
                      'Ferrari',
                      'Red Bull Racing',
                      'Mercedes AMG',
                      'McLaren',
                      'Aston Martin',
                      'Alpine',
                      'Williams',
                      'RB',
                      'Sauber',
                      'Haas'
                    ].sort().map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enhanced Visual Customization Badge */}
              <div 
                className="flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 bg-neutral-50/60"
                style={{ 
                  borderColor: TEAM_COLORS[favouriteTeam] || '#E5E7EB',
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-inner animate-pulse shrink-0" 
                    style={{ backgroundColor: TEAM_COLORS[favouriteTeam] || '#FF1A2D' }} 
                  />
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-mono tracking-widest block uppercase">CURRENT SELECTION</span>
                    <span className="text-xs font-semibold text-gray-700 leading-none">
                      Paddock Highlighted: <strong className="text-black font-extrabold">{favouriteDriver}</strong>
                    </span>
                  </div>
                </div>
                <div 
                  className="px-3 py-1 text-[10px] font-mono font-bold rounded-lg text-white"
                  style={{ backgroundColor: TEAM_COLORS[favouriteTeam] || '#111' }}
                >
                  {favouriteTeam}
                </div>
              </div>
            </div>

            {/* Logout panel */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 flex items-center justify-between select-none shadow-xs">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-400 font-mono tracking-wider uppercase">Session termination</h4>
                <p className="text-xs text-gray-500 font-medium">Clear local authentication tokens and logout.</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors border border-rose-150 outline-none cursor-pointer"
              >
                <LogOut size={13} /> Secure Sign Out
              </button>
            </div>
          </motion.div>
        ) : (
          // LOGIN OR REGISTRATION PANELS
          <motion.div
            key={isRegistering ? 'reg-form' : 'login-form'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm select-none"
          >
            {/* Form Title */}
            <header className="text-center space-y-1.5 pb-2 border-b border-gray-100">
              <div className="w-12 h-12 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight leading-none">
                {isRegistering ? 'Register F1 Roster Account' : 'Sign in to F1 Explorer'}
              </h2>
              <p className="text-xs text-gray-450">
                {isRegistering 
                  ? 'Your profile details will persist directly within Local DatabaseUser.json file.' 
                  : 'Enter your credentials to unlock your VIP Paddock Pass access.'}
              </p>
            </header>

            {/* Alerts */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-150 rounded-xl p-3.5 flex items-start gap-2 text-xs text-rose-800 font-medium">
                <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3.5 flex items-start gap-2 text-xs text-emerald-850 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              
              {/* Grid block for givenName/familyName if registering */}
              {isRegistering && (
                <>
                  <div className="grid grid-cols-2 gap-3 animate-none">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Given Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Lewis"
                        value={givenName}
                        onChange={(e) => setGivenName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Family Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Hamilton"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., lewis@mercedes.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., lewisham44"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors"
                />
              </div>

              {/* Submission button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-neutral-950/10 text-xs tracking-wide uppercase outline-none disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRegistering ? (
                  <>
                    <UserPlus size={14} /> COMPLETE REGISTRATION
                  </>
                ) : (
                  <>
                    <LogIn size={14} /> SIGN IN TO DASHBOARD
                  </>
                )}
              </button>
            </form>

            {/* Selector Option Toggle */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  clearForm();
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer inline-flex items-center gap-1.5 outline-none"
              >
                {isRegistering ? (
                  <>
                    ALREADY REGISTERED? <span className="underline uppercase tracking-wide">SIGN IN NOW</span>
                  </>
                ) : (
                  <>
                    NEW USER SESSION? <span className="underline uppercase tracking-wide">CREATE AN ACCOUNT</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generate elegant pass barcode widths
function indexToWidth(idx: number): string {
  const widths = ['2px', '4px', '1px', '3px', '6px', '2px', '1px', '4px', '2px', '5px', '2px'];
  return widths[idx % widths.length];
}
