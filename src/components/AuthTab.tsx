import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogIn, UserPlus, LogOut, CheckCircle2, ShieldAlert, Award, Hash, Timer, Zap, Sparkles, Cpu, Gauge, Trophy, RefreshCw, Trash2, Users, Settings, ShieldCheck, Lock, Unlock, Ban, KeyRound, Fingerprint, ShieldEllipsis, AlertTriangle, Database, Clock, Check, Shield, Bell, BadgeCheck, Compass, Gamepad2, Tv, Calendar, MapPin, Newspaper, Flag } from 'lucide-react';

interface UserSession {
  username: string;
  givenName: string;
  familyName: string;
  email: string;
  passportNumber: string;
  isAdmin?: boolean;
}

const TEAM_COLORS: Record<string, string> = {
  'Ferrari': '#EF1A2D',
  'Red Bull Racing': '#3671C6',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8700',
  'Aston Martin': '#229971',
  'Alpine': '#0093CC',
  'Williams': '#64C4FF',
  'Racing Bulls': '#6692FF',
  'Haas F1 Team': '#B6BABD',
  'Audi': '#F20000',
  'Cadillac Formula 1 Team': '#E5A93B',
};

const F1_2026_CALENDAR = [
  { gp: "Australia", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "China", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Japan", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Bahrain", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Saudi Arabia", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Miami", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Canada", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Monaco", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Barcelona", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Austria", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Great Britain", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Belgium", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Hungary", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Netherlands", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Italy (Monza)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Spain (Madrid)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Azerbaijan", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Singapore", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "United States (Austin)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Mexico City", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "São Paulo", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Las Vegas", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Qatar", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Abu Dhabi", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] }
];

const getSessionsForGp = (gpName: string): string[] => {
  if (!gpName) return ["FP1", "FP2", "FP3", "Qualifying", "Race"];
  const cleanGp = gpName.toLowerCase().replace(/\bgp\b/g, '').replace(/grand prix/g, '').trim();
  const found = F1_2026_CALENDAR.find(c => 
    c.gp.toLowerCase().includes(cleanGp) || 
    cleanGp.includes(c.gp.toLowerCase())
  );
  return found ? found.sessions : ["FP1", "FP2", "FP3", "Qualifying", "Race"];
};

const DRIVER_TAGS_2026 = [
  { code: "NOR", name: "NOR (Lando Norris - McLaren)" },
  { code: "PIA", name: "PIA (Oscar Piastri - McLaren)" },
  { code: "LEC", name: "LEC (Charles Leclerc - Ferrari)" },
  { code: "HAM", name: "HAM (Lewis Hamilton - Ferrari)" },
  { code: "RUS", name: "RUS (George Russell - Mercedes)" },
  { code: "ANT", name: "ANT (Kimi Antonelli - Mercedes)" },
  { code: "VER", name: "VER (Max Verstappen - Red Bull Racing)" },
  { code: "HAD", name: "HAD (Isack Hadjar - Red Bull Racing)" },
  { code: "ALO", name: "ALO (Fernando Alonso - Aston Martin)" },
  { code: "STR", name: "STR (Lance Stroll - Aston Martin)" },
  { code: "GAS", name: "GAS (Pierre Gasly - Alpine)" },
  { code: "COL", name: "COL (Franco Colapinto - Alpine)" },
  { code: "SAI", name: "SAI (Carlos Sainz Jr. - Williams)" },
  { code: "ALB", name: "ALB (Alexander Albon - Williams)" },
  { code: "OCO", name: "OCO (Esteban Ocon - Haas F1 Team)" },
  { code: "BEA", name: "BEA (Oliver Bearman - Haas F1 Team)" },
  { code: "LAW", name: "LAW (Liam Lawson - Racing Bulls)" },
  { code: "LIN", name: "LIN (Arvid Lindblad - Racing Bulls)" },
  { code: "HUL", name: "HUL (Nico Hülkenberg - Audi)" },
  { code: "BOR", name: "BOR (Gabriel Bortoleto - Audi)" },
  { code: "PER", name: "PER (Sergio Pérez - Cadillac Formula 1 Team)" },
  { code: "BOT", name: "BOT (Valtteri Bottas - Cadillac Formula 1 Team)" }
];

interface AuthTabProps {
  onSessionUpdate?: (user: UserSession | null) => void;
}

export default function AuthTab({ onSessionUpdate }: AuthTabProps = {}) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Synchronize dynamic updates back to App.tsx instantly
  useEffect(() => {
    onSessionUpdate?.(currentUser);
  }, [currentUser, onSessionUpdate]);

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

  // Change Email Fields & Statuses
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailSubmitting, setEmailSubmitting] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Account Security states
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [secLoading, setSecLoading] = useState<boolean>(false);
  const [secSuccess, setSecSuccess] = useState<string | null>(null);
  const [secError, setSecError] = useState<string | null>(null);

  // 2FA details
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [totpCode, setTotpCode] = useState<string>('582 914');
  const [totpSecondsLeft, setTotpSecondsLeft] = useState<number>(30);

  // Biometric toggle
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  // Sidebar config state
  const [sidebarConfig, setSidebarConfig] = useState<Record<string, boolean>>(() => {
    try {
      const cached = localStorage.getItem(`sidebar_visibility_${currentUser?.username || 'guests'}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return {
      dashboard: true,
      news: true,
      schedule: true,
      standings: true,
      drivers: true,
      'live-stream': true,
      circuits: true,
      compare: true,
      laps: true,
      polls: true,
      predictions: true,
      'club-manager': true,
      auth: true,
    };
  });

  const handleToggleSidebarItem = (itemId: string) => {
    if (itemId === 'dashboard' || itemId === 'auth') return;
    const updated = {
      ...sidebarConfig,
      [itemId]: sidebarConfig[itemId] === false ? true : false
    };
    setSidebarConfig(updated);
    localStorage.setItem(`sidebar_visibility_${currentUser?.username || 'guests'}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('sidebar-customization-changed'));
  };

  useEffect(() => {
    if (currentUser) {
      try {
        const cached = localStorage.getItem(`sidebar_visibility_${currentUser.username}`);
        if (cached) {
          setSidebarConfig(JSON.parse(cached));
          return;
        }
      } catch (e) {}
    }
    setSidebarConfig({
      dashboard: true,
      news: true,
      schedule: true,
      standings: true,
      drivers: true,
      'live-stream': true,
      circuits: true,
      compare: true,
      laps: true,
      polls: true,
      predictions: true,
      'club-manager': true,
      auth: true,
    });
  }, [currentUser]);

  // Active sessions logs list
  const [sessions, setSessions] = useState<any[]>([
    { id: 1, location: 'Monaco Paddock Suite Lounge (Current)', device: 'AI Studio Sandbox Environment', ip: '172.56.230.14', time: 'Active now', icon: 'Cpu' },
    { id: 2, location: 'Silverstone Timing Wall Hub', device: 'Ubuntu Terminal Agent', ip: '93.184.216.34', time: '4 hours ago', icon: 'Settings' },
    { id: 3, location: 'Singapore Marina Bay Command', device: 'iPad Timing Monitor', ip: '104.244.42.1', time: 'Yesterday', icon: 'Gauge' }
  ]);

  // Admin Panel states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState<boolean>(false);
  const [predLockSetting, setPredLockSetting] = useState<boolean>(false);
  const [pointsToAward, setPointsToAward] = useState<string>('25');
  const [adminActionSuccess, setAdminActionSuccess] = useState<string | null>(null);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [globalVisibleTabs, setGlobalVisibleTabs] = useState<Record<string, boolean>>({
    predictions: true,
    schedule: true,
    standings: true,
    circuits: true,
    drivers: true,
    news: true,
    compare: true,
    laps: true,
    liveStream: true,
    clubManager: true,
    polls: true
  });

  // New States for Telemetry CSV Uploads
  const [uploadYear, setUploadYear] = useState<string>('2026');
  const [uploadDriver, setUploadDriver] = useState<string>('NOR');
  const [uploadSession, setUploadSession] = useState<string>('Race');
  const [uploadGp, setUploadGp] = useState<string>('Australia');

  // New login security step states
  const [loginStep, setLoginStep] = useState<number>(0); // 0=Form, 1=2FA OTP verification, 2=TPM Biometrics authentication
  const [loginRequire2FA, setLoginRequire2FA] = useState<boolean>(false);
  const [loginOtpCode, setLoginOtpCode] = useState<string>('');
  const [loginTpmScanning, setLoginTpmScanning] = useState<boolean>(false);
  const [loginTpmSuccess, setLoginTpmSuccess] = useState<boolean>(false);

  // Synchronize available upload sessions when Grand Prix location changes
  useEffect(() => {
    const validSessions = getSessionsForGp(uploadGp);
    if (validSessions.length > 0 && !validSessions.includes(uploadSession)) {
      setUploadSession(validSessions[0]);
    }
  }, [uploadGp]);
  const [lapsFileName, setLapsFileName] = useState<string>('');
  const [lapsCsvContent, setLapsCsvContent] = useState<string>('');
  const [telemetryFileName, setTelemetryFileName] = useState<string>('');
  const [telemetryCsvContent, setTelemetryCsvContent] = useState<string>('');
  const [uploadingTelemetry, setUploadingTelemetry] = useState<boolean>(false);
  const [uploadedDatasets, setUploadedDatasets] = useState<any[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState<boolean>(false);
  const [deletingTelemetryId, setDeletingTelemetryId] = useState<string | null>(null);

  // States for Paddock Bulletins (Admin Notifications section)
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [bulletinTitle, setBulletinTitle] = useState<string>('');
  const [bulletinContent, setBulletinContent] = useState<string>('');
  const [bulletinCategory, setBulletinCategory] = useState<string>('ALERT');
  const [bulletinExpiry, setBulletinExpiry] = useState<string>('0'); 
  const [editingBulletinId, setEditingBulletinId] = useState<string | null>(null);
  const [loadingBulletins, setLoadingBulletins] = useState<boolean>(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'laps' | 'telemetry') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'laps') {
      setLapsFileName(file.name);
    } else {
      setTelemetryFileName(file.name);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (type === 'laps') {
        setLapsCsvContent(text);
      } else {
        setTelemetryCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadTelemetry = async () => {
    if (!uploadYear || !uploadGp || !uploadSession || !uploadDriver) {
      setAdminActionError("Please fill out year, GP location, session, and driver name before uploading.");
      return;
    }
    if (!lapsCsvContent) {
      setAdminActionError("Please select a valid Lap Times CSV file.");
      return;
    }
    if (!telemetryCsvContent) {
      setAdminActionError("Please select a valid Telemetry CSV file.");
      return;
    }

    setUploadingTelemetry(true);
    setAdminActionError(null);
    setAdminActionSuccess(null);

    try {
      const res = await fetch('/api/admin/upload-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: uploadYear,
          gp: uploadGp,
          session: uploadSession,
          driver: uploadDriver,
          lapsCsv: lapsCsvContent,
          telemetryCsv: telemetryCsvContent
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to publish dataset to backend");
      }

      setAdminActionSuccess(`Dataset published successfully! ${uploadYear} ${uploadGp} ${uploadSession} [${uploadDriver}] is now active.`);
      
      // Clear files
      setLapsFileName('');
      setLapsCsvContent('');
      setTelemetryFileName('');
      setTelemetryCsvContent('');
      fetchUploadedDatasets();
    } catch (err: any) {
      setAdminActionError(err.message || 'An upload error occurred.');
    } finally {
      setUploadingTelemetry(false);
    }
  };

  const fetchUploadedDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const res = await fetch('/api/admin/uploaded-telemetries');
      if (res.ok) {
        const list = await res.json();
        setUploadedDatasets(list);
      }
    } catch (e) {
      console.error("Failed to load uploaded datasets inside AuthTab", e);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const handleDeleteTelemetry = async (id: string, label: string, bypassConfirm: boolean = false) => {
    if (!bypassConfirm) {
      if (!confirm(`Are you sure you want to delete the F1 telemetry dataset: ${label}?`)) return;
    }
    setAdminActionError(null);
    setAdminActionSuccess(null);
    try {
      const res = await fetch(`/api/admin/delete-telemetry/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete from database");
      }
      setAdminActionSuccess(`Deleted dataset: ${label}`);
      setDeletingTelemetryId(null);
      fetchUploadedDatasets();
    } catch (err: any) {
      setAdminActionError(err.message || "An error occurred while deleting telemetry");
    }
  };

  const fetchBulletins = async () => {
    setLoadingBulletins(true);
    try {
      const res = await fetch('/api/announcements');
      if (!res.ok) throw new Error("Server returned an error");
      const data = await res.json();
      if (data.success && data.announcements) {
        setBulletins(data.announcements);
      }
    } catch (err) {
      console.error('Error loading bulletins:', err);
    } finally {
      setLoadingBulletins(false);
    }
  };

  const handleCreateOrUpdateBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinTitle.trim() || !bulletinContent.trim()) {
      setAdminActionError('Please fill in both title and content fields.');
      return;
    }
    
    setAdminActionError(null);
    setAdminActionSuccess(null);

    try {
      const bodyPayload = {
        title: bulletinTitle.trim(),
        content: bulletinContent.trim(),
        category: bulletinCategory.trim().toUpperCase(),
        expiryMinutes: parseInt(bulletinExpiry) || 0,
        createdBy: 'Administrator'
      };

      let url = '/api/announcements';
      let method = 'POST';

      if (editingBulletinId) {
        url = `/api/announcements/${editingBulletinId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();
      if (data.success) {
        setAdminActionSuccess(
          editingBulletinId 
            ? 'Official paddock notification successfully updated.' 
            : 'New official paddock notification published to board.'
        );
        // Clear form
        setBulletinTitle('');
        setBulletinContent('');
        setBulletinCategory('ALERT');
        setBulletinExpiry('0');
        setEditingBulletinId(null);
        fetchBulletins();
      } else {
        setAdminActionError(data.error || 'Failed to submit paddock notification.');
      }
    } catch (err: any) {
      setAdminActionError(err.message || 'An error occurred during submission.');
    }
  };

  const handleEditBulletinClick = (b: any) => {
    setEditingBulletinId(b.id);
    setBulletinTitle(b.title);
    setBulletinContent(b.content);
    setBulletinCategory(b.category || 'ALERT');
    
    if (b.expiresAt) {
      const minutesRemaining = Math.max(1, Math.round((new Date(b.expiresAt).getTime() - Date.now()) / 60000));
      setBulletinExpiry(String(minutesRemaining));
    } else {
      setBulletinExpiry('0');
    }
    setAdminActionError(null);
    setAdminActionSuccess(null);
  };

  const handleDeleteBulletin = async (id: string) => {
    setAdminActionError(null);
    setAdminActionSuccess(null);
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setAdminActionSuccess('Notification successfully deleted.');
        fetchBulletins();
      } else {
        setAdminActionError(data.error || 'Failed to delete notification.');
      }
    } catch (err: any) {
      setAdminActionError(err.message || 'Error deleting notification.');
    }
  };

  const fetchAdminUsers = async () => {
    setLoadingAdmin(true);
    setAdminActionError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to load registered F1 users roster');
      const data = await res.json();
      setAdminUsers(data);
    } catch (err: any) {
      setAdminActionError(err.message || 'Error loading users.');
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleTogglePredictionsLock = () => {
    const nextState = !predLockSetting;
    setPredLockSetting(nextState);
    localStorage.setItem('f1_predictions_globallock', String(nextState));
    setAdminActionSuccess(`Prediction lock status is now set to: ${nextState ? 'LOCKED' : 'OPEN'}`);
    setTimeout(() => setAdminActionSuccess(null), 3500);
  };

  const handleAwardAdminPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(pointsToAward);
    if (isNaN(pts) || pts < 0) {
      setAdminActionError('Please enter a valid numeric points value.');
      return;
    }
    localStorage.setItem('f1_predictions_score_system', String(pts));
    setAdminActionSuccess(`Successfully awarded ${pts} points to all fantasy prediction accounts!`);
    setTimeout(() => setAdminActionSuccess(null), 4000);
  };

  const handleDeleteUser = async (userToDel: string) => {
    if (userToDel === 'Admin') {
      alert("Cannot delete the system Administrator!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user @${userToDel}? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameToDelete: userToDel })
      });
      if (!res.ok) throw new Error('Failed to delete user.');
      setAdminActionSuccess(`Successfully removed user account @${userToDel}!`);
      fetchAdminUsers();
      setTimeout(() => setAdminActionSuccess(null), 3000);
    } catch (err: any) {
      setAdminActionError(err.message || 'Error occurred.');
    }
  };

  const handleToggleBanUser = async (userToToggle: string) => {
    if (userToToggle === 'Admin') {
      alert("The Admin account cannot be banned.");
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to toggle the block/ban status of user @${userToToggle}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/toggle-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameToToggle: userToToggle })
      });
      if (!res.ok) throw new Error('Failed to change user ban status.');
      const data = await res.json();
      setAdminActionSuccess(`Successfully changed status for @${userToToggle}: ${data.isBanned ? 'BANNED' : 'UNBANNED / ACTIVE'}`);
      fetchAdminUsers();
      setTimeout(() => setAdminActionSuccess(null), 3000);
    } catch (err: any) {
      setAdminActionError(err.message || 'Error occurred.');
    }
  };

  const handleToggleVerifyUser = async (userToToggle: string, style?: string) => {
    try {
      const res = await fetch('/api/admin/users/toggle-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameToToggle: userToToggle, verifyStyle: style })
      });
      if (!res.ok) throw new Error('Failed to change user verification status.');
      const data = await res.json();
      setAdminActionSuccess(`Successfully changed verification for @${userToToggle}: ${data.isVerified ? 'VERIFIED (' + data.verifyStyle.toUpperCase() + ')' : 'UNVERIFIED'}`);
      fetchAdminUsers();
      setTimeout(() => setAdminActionSuccess(null), 3000);
    } catch (err: any) {
      setAdminActionError(err.message || 'Error occurred.');
    }
  };

  const handleClearAllUsers = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you absolutely sure you want to delete ALL registered users? This cannot be undone!")) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users/clear', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear database.');
      setAdminActionSuccess("Roster Database cleared successfully!");
      fetchAdminUsers();
      setTimeout(() => setAdminActionSuccess(null), 3000);
    } catch (err: any) {
      setAdminActionError(err.message);
    }
  };

  // OpenF1 Real Drivers and Teams cached sets
  const [openF1Drivers, setOpenF1Drivers] = useState<string[]>([]);
  const [openF1Teams, setOpenF1Teams] = useState<string[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);

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

    // Populates exclusive teams and drivers lists from user requirements
    const populateDriversAndTeams = () => {
      setLoadingDrivers(true);
      const names = [
        'Lando Norris',
        'Oscar Piastri',
        'Charles Leclerc',
        'Lewis Hamilton',
        'George Russell',
        'Kimi Antonelli',
        'Max Verstappen',
        'Isack Hadjar',
        'Fernando Alonso',
        'Lance Stroll',
        'Pierre Gasly',
        'Franco Colapinto',
        'Carlos Sainz Jr',
        'Alexander Albon',
        'Esteban Ocon',
        'Oliver Bearman',
        'Liam Lawson',
        'Arvid Lindblad',
        'Nico Hülkenberg',
        'Gabriel Bortoleto',
        'Sergio Pérez',
        'Valtteri Bottas'
      ].sort();
      const teams = [
        'McLaren',
        'Ferrari',
        'Mercedes',
        'Red Bull Racing',
        'Aston Martin',
        'Alpine',
        'Williams',
        'Haas F1 Team',
        'Racing Bulls',
        'Audi',
        'Cadillac Formula 1 Team'
      ].sort();
      setOpenF1Drivers(names);
      setOpenF1Teams(teams);
      setLoadingDrivers(false);
    };
    populateDriversAndTeams();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch('/api/prediction-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.visibleTabs) setGlobalVisibleTabs(data.visibleTabs);
      }
    } catch (err) {
      console.error("Failed to load global admin settings", err);
    }
  };

  useEffect(() => {
    if (currentUser?.username === 'Admin') {
      fetchAdminUsers();
      fetchUploadedDatasets();
      fetchBulletins();
      fetchAdminSettings();
      const cachedLock = localStorage.getItem('f1_predictions_globallock');
      setPredLockSetting(cachedLock === 'true');
    }
  }, [currentUser]);

  const handleToggleTabVisibility = async (tabKey: string, currentValue: boolean) => {
    try {
      // First get current full settings
      const resSettings = await fetch('/api/prediction-settings');
      let currentSettings = {};
      if (resSettings.ok) {
        currentSettings = await resSettings.json();
      }
      
      const updatedTabs = { ...globalVisibleTabs, [tabKey]: !currentValue };
      
      const payload = {
        ...currentSettings,
        visibleTabs: updatedTabs
      };
      
      const res = await fetch('/api/admin/prediction-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Failed to update global tab visibility.");
      }
      
      setGlobalVisibleTabs(updatedTabs);
      setAdminActionSuccess(`Successfully ${!currentValue ? 'ENABLED' : 'DISABLED'} ${tabKey} tab for all users.`);
      setTimeout(() => setAdminActionSuccess(null), 3000);
    } catch (err: any) {
      setAdminActionError(err.message || 'Error updating settings.');
      setTimeout(() => setAdminActionError(null), 3000);
    }
  };

  const savePreferences = (team: string, driver: string) => {
    setFavouriteTeam(team);
    setFavouriteDriver(driver);
    localStorage.setItem('f1_pref_team', team);
    localStorage.setItem('f1_pref_driver', driver);
    setSuccessMsg('VIP Driver and Team profile choices updated successfully!');
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail.trim()) {
      setEmailError('Please specify a valid new email address.');
      return;
    }

    setEmailSubmitting(true);
    try {
      const response = await fetch('/api/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, newEmail: newEmail.trim() })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update email');
      }

      const updatedUser = { ...currentUser, email: resData.email };
      setCurrentUser(updatedUser);
      localStorage.setItem('f1_user_session', JSON.stringify(updatedUser));
      setEmailSuccess('Your registered email address has been successfully updated!');
      setNewEmail('');
    } catch (err: any) {
      setEmailError(err.message || 'Connecting to authenticated database failed.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  // Account security handlers & authentications
  useEffect(() => {
    if (!is2FAEnabled) return;
    const interval = setInterval(() => {
      setTotpSecondsLeft((prev) => {
        if (prev <= 1) {
          const rand = Math.floor(100000 + Math.random() * 900000).toString();
          setTotpCode(`${rand.slice(0, 3)} ${rand.slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [is2FAEnabled]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecError(null);
    setSecSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSecError('Please fill in all requested fields to modify credentials.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecError('New passwords do not match confirm mismatch.');
      return;
    }
    if (newPassword.length < 6) {
      setSecError('Password must be at least 6 characters for optimal security.');
      return;
    }

    setSecLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to modify security credentials.');
      }
      setSecSuccess('Your secure paddock credentials updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecError(err.message || 'Error occurred updating password.');
    } finally {
      setSecLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: number, locationName: string) => {
    if (!window.confirm(`Revoke authentication token and terminate session at ${locationName}?`)) {
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleToggleBiometricSim = () => {
    if (!biometricEnabled) {
      const confirmation = window.confirm(`Fingerprint Passkey Vault: Would you like to bind this machine's TPM biometric device to @${currentUser?.username} paddock session identity?`);
      if (confirmation) {
        setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
    }
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

  const completeLoginWithSession = (session: any) => {
    setCurrentUser(session);
    localStorage.setItem('f1_user_session', JSON.stringify(session));
    setSuccessMsg(`Welcome back, ${session.givenName}!`);
    clearForm();
    setLoginStep(0);
    setLoginRequire2FA(false);
  };

  const handleVerifyOtpStep = async () => {
    setErrorMsg(null);
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

      if (!/^\d{6}$/.test(loginOtpCode)) {
        throw new Error('Please input a valid 6-digit numeric OTP security code.');
      }

      completeLoginWithSession(resData.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification code mismatch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTpmHardwareTrigger = () => {
    setErrorMsg(null);
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please specify Username and Password first to perform TPM handshakes.');
      return;
    }
    setLoginStep(2);
    setLoginTpmScanning(false);
    setLoginTpmSuccess(false);
  };

  const handleStartTpmScan = () => {
    setLoginTpmScanning(true);
    setErrorMsg(null);
    setTimeout(async () => {
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

        setLoginTpmSuccess(true);
        setLoginTpmScanning(false);
        setTimeout(() => {
          completeLoginWithSession(resData.user);
        }, 1000);
      } catch (err: any) {
        setLoginStep(0);
        setLoginTpmScanning(false);
        setErrorMsg(err.message || 'TPM identification mismatch.');
      }
    }, 2400);
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

      if (loginRequire2FA) {
        setLoginStep(1);
        setSubmitting(false);
        return;
      }

      completeLoginWithSession(session);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error.');
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
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Favorite F1 Driver</label>
                    {loadingDrivers && (
                      <span className="text-[8px] font-mono bg-blue-50 text-blue-600 px-1 rounded animate-pulse">Syncing...</span>
                    )}
                  </div>
                  <select
                    id="fav-driver-select"
                    value={favouriteDriver}
                    onChange={(e) => savePreferences(favouriteTeam, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 outline-none rounded-xl py-3 px-3.5 font-semibold text-xs focus:ring-1 focus:ring-black cursor-pointer transition-all"
                  >
                    {(openF1Drivers.length > 0 ? openF1Drivers : [
                      'Alexander Albon',
                      'Arvid Lindblad',
                      'Carlos Sainz Jr',
                      'Charles Leclerc',
                      'Esteban Ocon',
                      'Fernando Alonso',
                      'Franco Colapinto',
                      'Gabriel Bortoleto',
                      'George Russell',
                      'Isack Hadjar',
                      'Kimi Antonelli',
                      'Lance Stroll',
                      'Lando Norris',
                      'Lewis Hamilton',
                      'Liam Lawson',
                      'Max Verstappen',
                      'Nico Hülkenberg',
                      'Oliver Bearman',
                      'Oscar Piastri',
                      'Pierre Gasly',
                      'Sergio Pérez',
                      'Valtteri Bottas'
                    ]).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Favorite F1 Team</label>
                    {loadingDrivers && (
                      <span className="text-[8px] font-mono bg-blue-50 text-blue-600 px-1 rounded animate-pulse">Syncing...</span>
                    )}
                  </div>
                  <select
                    id="fav-team-select"
                    value={favouriteTeam}
                    onChange={(e) => savePreferences(e.target.value, favouriteDriver)}
                    className="w-full bg-gray-50 border border-gray-200 outline-none rounded-xl py-3 px-3.5 font-semibold text-xs focus:ring-1 focus:ring-black cursor-pointer transition-all"
                  >
                    {(openF1Teams.length > 0 ? openF1Teams : [
                      'Alpine',
                      'Aston Martin',
                      'Audi',
                      'Cadillac Formula 1 Team',
                      'Ferrari',
                      'Haas F1 Team',
                      'McLaren',
                      'Mercedes',
                      'Racing Bulls',
                      'Red Bull Racing',
                      'Williams'
                    ]).map(t => (
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

            {/* ADVANCED PADDOCK SECURITY CONTROL HUB */}
            <div id="paddock-security-vault" className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm select-none">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-500 font-mono font-black tracking-widest uppercase block mb-1">Paddock Security Vault</span>
                  <h3 className="text-lg font-black text-black">Credentials & Terminal Safeguards</h3>
                  <p className="text-xs text-gray-500">Configure multi-layered security protections for your Formula 1 VIP profile.</p>
                </div>
                <div className="p-3 bg-neutral-900 text-red-500 rounded-2xl shrink-0 hidden sm:block">
                  <Fingerprint size={22} className="animate-pulse" />
                </div>
              </div>

              {/* Password credentials alteration */}
              <div className="space-y-4">
                <h4 className="text-xs font-black font-mono tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                  <KeyRound size={14} className="text-red-500" />
                  <span>Update Paddock Password</span>
                </h4>

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-4 py-2.5 text-xs font-semibold select-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">New Password</label>
                      <input 
                        type="password"
                        placeholder="Min 6 chars"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-4 py-2.5 text-xs font-semibold select-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-gray-450 uppercase tracking-wider block">Confirm New Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-4 py-2.5 text-xs font-semibold select-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={secLoading}
                      className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 shrink-0"
                    >
                      {secLoading ? <RefreshCw size={13} className="animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>

                {secError && (
                  <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg font-mono flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-rose-500" />
                    <span>{secError}</span>
                  </div>
                )}
                {secSuccess && (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg font-mono flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{secSuccess}</span>
                  </div>
                )}
              </div>

              {/* Email credentials alteration */}
              <div className="space-y-4 pt-5 border-t border-gray-100">
                <h4 className="text-xs font-black font-mono tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                  <User size={14} className="text-red-500" />
                  <span>Update Registered Email Address</span>
                </h4>

                <form onSubmit={handleChangeEmail} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">New Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. driver@formula1.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-4 py-2.5 text-xs font-semibold select-all"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm disabled:opacity-50 shrink-0"
                    >
                      {emailSubmitting ? <RefreshCw size={13} className="animate-spin" /> : 'Update Email'}
                    </button>
                  </div>
                </form>

                {emailError && (
                  <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg font-mono flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-rose-500" />
                    <span>{emailError}</span>
                  </div>
                )}
                {emailSuccess && (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg font-mono flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{emailSuccess}</span>
                  </div>
                )}
              </div>

              {/* Shifting 2FA & Passkey Toggles side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-gray-100">
                {/* Simulated Shifting 2FA */}
                <div className="space-y-3.5 bg-neutral-50/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black font-sans text-black leading-none mb-1">Two-Factor Authentication</h4>
                      <p className="text-[10px] text-gray-500">Enable shifting TOTP security verification.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={is2FAEnabled}
                        onChange={(e) => {
                          setIs2FAEnabled(e.target.checked);
                          if(e.target.checked) {
                            setTotpSecondsLeft(30);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-650"></div>
                    </label>
                  </div>

                  {is2FAEnabled ? (
                    <div className="bg-neutral-900 text-white rounded-xl p-3 flex items-center justify-between border border-neutral-800">
                      <div>
                        <span className="text-[8px] font-mono text-neutral-450 uppercase block tracking-widest leading-none mb-1.5">VALID PADDOCK TOKEN</span>
                        <strong className="text-base font-mono tracking-wider font-semibold text-red-500">{totpCode}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-red-500 animate-spin flex items-center justify-center text-[9px] font-mono font-black text-rose-400">
                          {totpSecondsLeft}
                        </div>
                        <span className="text-[9px] font-mono text-neutral-450">s left</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-450 bg-white border border-gray-150 rounded-xl p-3 text-center border-dashed">
                      Disabled. Turn on checkbox to generate dynamic credentials tokens.
                    </div>
                  )}
                </div>

                {/* Simulated WebAuthn Fingerprint Passkey */}
                <div className="space-y-3.5 bg-neutral-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black font-sans text-black leading-none mb-1">TPM Hardware Passkey</h4>
                      <p className="text-[10px] text-gray-500">Sign in instantly using local client biometrics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={biometricEnabled}
                        onChange={handleToggleBiometricSim}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-650"></div>
                    </label>
                  </div>

                  {biometricEnabled ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                      <Fingerprint size={15} className="text-emerald-600 animate-pulse" />
                      <span className="font-mono text-[10px]">Passkey ID: key-cebric-tpm-f1-secure</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-450 bg-white border border-gray-150 rounded-xl p-3 text-center border-dashed">
                      Disabled. Pair a local cryptographic security certificate.
                    </div>
                  )}
                </div>

                {/* Sidebar Customizer Beta */}
                <div className="bg-neutral-50/50 border border-gray-100 rounded-2xl p-5 mt-5 col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings size={16} className="text-red-500 animate-[spin_8s_linear_infinite]" />
                    <div>
                      <h4 className="text-sm font-black font-sans text-black leading-none mb-1">Customize Sidebar Tabs (BETA)</h4>
                      <p className="text-[10px] text-gray-500 font-mono">Toggle options to show or hide specialized paddock channels. User Hub and Dashboard cannot be deactivated.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
                    {[
                      { id: 'dashboard', label: 'Dashboard 🔒' },
                      { id: 'news', label: 'News Feed' },
                      { id: 'schedule', label: 'Race Schedule' },
                      { id: 'standings', label: 'Standings' },
                      { id: 'drivers', label: 'Drivers & Teams' },
                      { id: 'live-stream', label: 'Live Stream' },
                      { id: 'circuits', label: 'Circuits' },
                      { id: 'compare', label: 'Head to Head' },
                      { id: 'laps', label: 'Lap Telemetry' },
                      { id: 'polls', label: 'Paddock Polls' },
                      { id: 'predictions', label: 'F1 Prediction' },
                      { id: 'club-manager', label: 'Club Manager Team' },
                      { id: 'auth', label: 'User Hub 🔒' },
                    ].map((item) => {
                      const isLocked = item.id === 'dashboard' || item.id === 'auth';
                      const isVisible = isLocked ? true : (sidebarConfig[item.id] !== false);
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-mono transition-all ${
                            isLocked 
                              ? 'bg-neutral-150 text-neutral-400 border-neutral-250' 
                              : isVisible 
                                ? 'bg-white text-black border-red-500/20 hover:border-red-500/40' 
                                : 'bg-neutral-50 text-neutral-400 border-neutral-150 opacity-60'
                          }`}
                        >
                          <span className="font-extrabold">{item.label}</span>
                          {!isLocked ? (
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={isVisible}
                                disabled={isLocked}
                                onChange={() => handleToggleSidebarItem(item.id)}
                                className="sr-only peer"
                              />
                              <div className="w-7 h-3.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                          ) : (
                            <span className="text-[9px] font-bold text-neutral-400 font-mono select-none">LOCKED</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* SPECIAL ADMIN PANEL */}
            {currentUser.username === 'Admin' && (
              <div id="admin-panel" className="bg-neutral-950 text-white rounded-3xl p-6 md:p-8 space-y-6 border border-neutral-800 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(239,26,45,0.04),_transparent_50%)] pointer-events-none" />
                
                <div className="border-b border-neutral-800 pb-4 flex items-center gap-2">
                  <Settings size={20} className="text-red-500 animate-[spin_5s_linear_infinite]" />
                  <div>
                    <span className="text-[10px] text-red-500 font-mono font-black tracking-widest uppercase block leading-none mb-1">Cebric Engine Cockpit</span>
                    <h3 className="text-lg font-black tracking-tight text-white leading-none">System Administration Controls</h3>
                  </div>
                </div>

                {adminActionSuccess && (
                  <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>{adminActionSuccess}</span>
                  </div>
                )}

                {adminActionError && (
                  <div className="text-xs bg-red-500/10 text-rose-400 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <span>{adminActionError}</span>
                  </div>
                )}

                {/* Module Visibility Engine */}
                <div className="bg-neutral-900 border border-neutral-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className="text-[#27F4D2]" />
                      <span className="text-[10px] text-[#27F4D2] font-mono font-black uppercase tracking-wider">Module Visibility Engine</span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">Global Override</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                    {[
                      { key: 'predictions', label: 'Matchup', icon: Compass },
                      { key: 'schedule', label: 'Schedule', icon: Calendar },
                      { key: 'standings', label: 'Standings', icon: Trophy },
                      { key: 'circuits', label: 'Circuits', icon: MapPin },
                      { key: 'drivers', label: 'Drivers', icon: User },
                      { key: 'news', label: 'News', icon: Newspaper },
                      { key: 'compare', label: 'Compare', icon: Users },
                      { key: 'laps', label: 'Telemetry', icon: Gamepad2 },
                      { key: 'liveStream', label: 'Live Stream', icon: Tv },
                      { key: 'clubManager', label: 'Manager', icon: Settings },
                      { key: 'polls', label: 'Polls', icon: CheckCircle2 }
                    ].map(({ key, label, icon: Icon }) => {
                      const isVisible = globalVisibleTabs?.[key as keyof typeof globalVisibleTabs] ?? true;
                      return (
                        <div 
                          key={key} 
                          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-colors cursor-pointer select-none ${isVisible ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                          onClick={() => handleToggleTabVisibility(key, isVisible)}
                        >
                          <Icon size={14} className={isVisible ? 'text-emerald-500' : 'text-red-500'} />
                          <span className={`font-bold uppercase tracking-wider ${isVisible ? 'text-emerald-500' : 'text-red-500'}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Users list roster manager */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-4 md:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Users size={15} className="text-neutral-450" />
                      <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Database Roster ({adminUsers.length})</span>
                    </div>
                    {adminUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllUsers}
                        className="text-[10px] text-red-400 hover:text-red-500 font-mono flex items-center gap-1 cursor-pointer outline-none bg-none border-none animate-pulse"
                      >
                        <Trash2 size={11} /> Clear Database
                      </button>
                    )}
                  </div>

                  {loadingAdmin ? (
                    <div className="py-6 text-center text-xs font-mono text-neutral-500">
                      Reading local DatabaseUser.json record logs...
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div className="py-6 text-center text-xs font-mono text-neutral-550 border border-dashed border-neutral-850 rounded-xl select-none">
                      No registered user profiles found in DatabaseUser.json.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-neutral-950 scrollbar-thin scrollbar-thumb-neutral-855 scrollbar-track-transparent">
                      {adminUsers.map((u) => (
                        <div key={u.username} className="flex items-center justify-between text-xs font-mono py-2.5 first:pt-0">
                          <div>
                            <span className="text-white font-extrabold flex items-center gap-1.5">
                              @{u.username}
                              {u.isVerified && (
                                u.verifyStyle === 'admin' ? (
                                  <BadgeCheck size={14} className="text-purple-500 fill-purple-500/10 shrink-0" title="Admin Verified" />
                                ) : u.verifyStyle === 'premium' ? (
                                  <BadgeCheck size={14} className="text-red-500 fill-red-500/10 shrink-0" title="Premium Verified Player" />
                                ) : (
                                  <BadgeCheck size={14} className="text-blue-500 fill-blue-500/10 shrink-0" title="Verified Player" />
                                )
                              )}
                              {u.isBanned && (
                                <span className="text-[8px] bg-rose-600 text-white font-mono font-black uppercase px-1.5 py-0.5 rounded ml-1.5 inline-block align-middle">
                                  BANNED
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-neutral-455 block leading-normal mt-0.5">
                              {u.givenName} {u.familyName} • Passport {u.passportNumber || "None"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9.5px] text-neutral-550 block hidden sm:inline">{u.email}</span>
                            {u.username !== 'Admin' && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerifyUser(u.username, 'regular')}
                                  className={`p-1.5 rounded transition-all cursor-pointer outline-none border-none ${
                                    u.isVerified && u.verifyStyle !== 'admin' && u.verifyStyle !== 'premium'
                                      ? 'text-blue-450 bg-blue-950/50 border border-blue-900/60'
                                      : 'text-neutral-500 hover:text-blue-400 hover:bg-neutral-800'
                                  }`}
                                  title="Toggle Regular Verification badge (Blue)"
                                >
                                  <BadgeCheck size={12} className={u.isVerified && u.verifyStyle !== 'admin' && u.verifyStyle !== 'premium' ? "animate-pulse mb-0.5" : "mb-0.5"} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerifyUser(u.username, 'premium')}
                                  className={`p-1.5 rounded transition-all cursor-pointer outline-none border-none ${
                                    u.isVerified && u.verifyStyle === 'premium'
                                      ? 'text-red-500 bg-red-950/50 border border-red-900/60 font-bold'
                                      : 'text-neutral-555 hover:text-red-500 hover:bg-neutral-800'
                                  }`}
                                  title="Toggle Premium User Verification badge (Red)"
                                >
                                  <BadgeCheck size={12} className="text-red-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerifyUser(u.username, 'admin')}
                                  className={`p-1.5 rounded transition-all cursor-pointer outline-none border-none ${
                                    u.isVerified && u.verifyStyle === 'admin'
                                      ? 'text-purple-400 bg-purple-950/50 border border-purple-900/60 font-bold'
                                      : 'text-neutral-555 hover:text-purple-400 hover:bg-neutral-800'
                                  }`}
                                  title="Toggle Premium Admin Verification badge (Purple)"
                                >
                                  <BadgeCheck size={12} className="text-purple-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleBanUser(u.username)}
                                  className={`p-1.5 rounded transition-all cursor-pointer outline-none border-none ${
                                    u.isBanned 
                                      ? 'text-rose-500 hover:text-rose-400 bg-rose-500/10' 
                                      : 'text-neutral-500 hover:text-amber-500 hover:bg-neutral-800'
                                  }`}
                                  title={u.isBanned ? `Unban user @${u.username}` : `Ban user @${u.username}`}
                                >
                                  <Ban size={12} className={u.isBanned ? "animate-pulse" : ""} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded hover:bg-neutral-800 transition-all cursor-pointer outline-none border-none bg-transparent"
                                  title={`Delete User @${u.username}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telemetry CSV Dataset Upload Form */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-4 md:p-5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-neutral-850 pb-2">
                    <Timer size={15} className="text-red-500 animate-[pulse_1.5s_infinite]" />
                    <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">Telemetry & Laps CSV Database Upload</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase">Year</label>
                      <select 
                        value={uploadYear} 
                        onChange={(e) => setUploadYear(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white outline-none font-semibold focus:border-red-500"
                      >
                        <option value="2026">2026</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase">Driver Tag</label>
                      <select 
                        value={uploadDriver} 
                        onChange={(e) => setUploadDriver(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white outline-none font-semibold focus:border-red-500"
                      >
                        {DRIVER_TAGS_2026.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase">Grand Prix Location</label>
                      <select 
                        value={uploadGp} 
                        onChange={(e) => setUploadGp(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white outline-none font-semibold focus:border-red-500"
                      >
                        {F1_2026_CALENDAR.map(c => (
                          <option key={c.gp} value={c.gp}>{c.gp}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase">Session</label>
                      <select 
                        value={uploadSession} 
                        onChange={(e) => setUploadSession(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white outline-none font-semibold focus:border-red-500"
                      >
                        {getSessionsForGp(uploadGp).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lap Times CSV upload drag-zone */}
                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase font-mono">
                        Lap Times CSV File
                      </label>
                      <div className="border border-dashed border-neutral-800 rounded-xl p-3 bg-neutral-950 hover:border-red-800/80 transition text-center relative pointer-events-auto">
                        <input 
                          type="file" 
                          accept=".csv,.txt"
                          onChange={(e) => handleFileSelect(e, 'laps')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="block text-[10px] text-neutral-400 font-medium">
                          {lapsFileName ? `✓ ${lapsFileName}` : "Drag & Drop or Click Laps CSV"}
                        </span>
                        <span className="block text-[8px] text-neutral-600 mt-0.5">Time,Driver,LapTime,LapNumber...</span>
                      </div>
                    </div>

                    {/* Telemetry CSV upload drop-zone */}
                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 font-mono font-bold uppercase font-mono">
                        Car Telemetry CSV File
                      </label>
                      <div className="border border-dashed border-neutral-800 rounded-xl p-3 bg-neutral-950 hover:border-red-800/80 transition text-center relative pointer-events-auto">
                        <input 
                          type="file" 
                          accept=".csv,.txt"
                          onChange={(e) => handleFileSelect(e, 'telemetry')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="block text-[10px] text-neutral-400 font-medium">
                          {telemetryFileName ? `✓ ${telemetryFileName}` : "Drag & Drop or Click Telemetry CSV"}
                        </span>
                        <span className="block text-[8px] text-neutral-650 mt-0.5">Date,Speed,nGear,Throttle,Brake,X,Y,Z...</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUploadTelemetry}
                    disabled={uploadingTelemetry}
                    className="w-full py-2.5 bg-red-650 hover:bg-red-755 text-white text-xs font-black rounded-xl uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingTelemetry ? "Pushing files to system..." : "Publish Telemetry to App State"}
                  </button>
                </div>

                {/* Telemetry Datasets Manager list and action center */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-4 md:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Database size={15} className="text-red-500" />
                      <span className="text-[10px] text-neutral-300 font-mono font-bold uppercase tracking-wider">Active Telemetry Database Hub ({uploadedDatasets.length})</span>
                    </div>
                  </div>

                  {loadingDatasets ? (
                     <div className="py-4 text-center text-xs font-mono text-neutral-500 animate-pulse">
                       Loading active DB datasets records...
                     </div>
                  ) : uploadedDatasets.length === 0 ? (
                    <div className="py-4 text-center text-xs font-mono text-neutral-500 border border-dashed border-neutral-850 rounded-xl select-none">
                      No administrator custom datasets have been uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                      {uploadedDatasets.map((d) => {
                        const label = `${d.year} ${d.gp} (${d.session}) - [${d.driver}]`;
                        const isDeleting = deletingTelemetryId === d.id;
                        return (
                          <div 
                            key={d.id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono p-3 rounded-xl border transition-all ${
                              isDeleting 
                                ? 'bg-red-950/20 border-red-900/50' 
                                : 'bg-[#0d1017] border-neutral-850 hover:border-neutral-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[8px] font-bold">
                                  {d.year}
                                </span>
                                <span className="text-white font-extrabold text-[11px]">
                                  🏁 {d.gp}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-900/30 text-red-400 text-[8px] font-extrabold uppercase">
                                  {d.session}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Active Pilot tag: <strong className="text-red-400 font-mono text-[11px]">{d.driver}</strong>
                              </div>
                            </div>

                            <div className="mt-2.5 sm:mt-0 flex items-center justify-end">
                              {isDeleting ? (
                                <div className="flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                                  <span className="text-[9px] text-red-400 font-bold mr-1">Really Delete?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTelemetry(d.id, label, true)}
                                    className="px-2 py-1 bg-red-650 hover:bg-red-755 text-white font-black rounded text-[9px] uppercase cursor-pointer transition-colors border-none"
                                  >
                                    Yes, Purge
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingTelemetryId(null)}
                                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded text-[9px] uppercase cursor-pointer transition-colors border-none"
                                  >
                                    Keep
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeletingTelemetryId(d.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900/50 hover:bg-red-950/30 border border-neutral-800 hover:border-red-900/40 rounded text-neutral-400 hover:text-red-400 transition-all cursor-pointer text-[10px]"
                                  title={`Delete ${label}`}
                                >
                                  <Trash2 size={11} />
                                  <span>Remove Entry</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* PADDOCK BULLETIN & SYSTEM NOTIFICATIONS MANAGER */}
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-3 md:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-300 font-mono font-bold uppercase tracking-wider">
                        Paddock Bulletins & Notifications Center
                      </span>
                    </div>
                  </div>

                  {/* Creator Form */}
                  <form onSubmit={handleCreateOrUpdateBulletin} className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-8 space-y-1">
                        <label className="block text-[8px] text-neutral-450 uppercase font-bold">Bulletin Header / Title</label>
                        <input 
                          type="text"
                          required
                          value={bulletinTitle}
                          onChange={(e) => setBulletinTitle(e.target.value)}
                          placeholder="e.g. RED FLAG IN SECTOR 3, SESSION PAUSED"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="md:col-span-4 space-y-1">
                        <label className="block text-[8px] text-neutral-450 uppercase font-bold">Severity / Category</label>
                        <select
                          value={bulletinCategory}
                          onChange={(e) => setBulletinCategory(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white outline-none focus:border-red-500 font-semibold"
                        >
                          <option value="ALERT">ALERT</option>
                          <option value="DIRECTIVE">DIRECTIVE</option>
                          <option value="WEATHER">WEATHER</option>
                          <option value="PADDOCK_INFO">PADDOCK INFO</option>
                          <option value="TECHNICAL">TECHNICAL</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] text-neutral-450 uppercase font-bold">Detailed Content / Notice body</label>
                      <textarea
                        required
                        rows={2}
                        value={bulletinContent}
                        onChange={(e) => setBulletinContent(e.target.value)}
                        placeholder="Describe the bulletin or paddock instructions in detail..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white outline-none focus:border-red-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[8px] text-neutral-450 uppercase font-bold">Expiration Timer (Minutes)</label>
                        <select
                          value={bulletinExpiry}
                          onChange={(e) => setBulletinExpiry(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white outline-none focus:border-red-500 font-semibold"
                        >
                          <option value="0">∞ Keep active indefinitely</option>
                          <option value="1">⏱️ 1 Minute (For testing)</option>
                          <option value="5">⏱️ 5 Minutes</option>
                          <option value="15">⏱️ 15 Minutes</option>
                          <option value="30">⏱️ 30 Minutes</option>
                          <option value="60">⏱️ 1 Hour</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-red-650 hover:bg-red-755 text-white font-bold rounded-lg uppercase tracking-wider transition duration-150 text-[10px] cursor-pointer outline-none"
                        >
                          {editingBulletinId ? "Update Bulletin" : "Publish to Paddock"}
                        </button>
                        {editingBulletinId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBulletinId(null);
                              setBulletinTitle('');
                              setBulletinContent('');
                              setBulletinCategory('ALERT');
                              setBulletinExpiry('0');
                            }}
                            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-355 rounded-lg uppercase transition-all duration-150 font-bold text-[10px] cursor-pointer outline-none"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  {/* Active Bulletins Board */}
                  <div className="border-t border-neutral-850 pt-3 space-y-2">
                    <span className="block text-[8px] text-neutral-455 uppercase font-mono font-bold">Active Bulletins Board ({bulletins.length})</span>
                    {loadingBulletins ? (
                      <div className="text-center py-2 text-[10.5px] font-mono text-neutral-500 animate-pulse">
                        Retrieving notifications feed...
                      </div>
                    ) : bulletins.length === 0 ? (
                      <div className="text-center py-4 text-[10px] font-mono text-neutral-550 border border-dashed border-neutral-850 rounded-xl">
                        No active paddock notices scheduled.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {bulletins.map((b) => (
                          <div key={b.id} className="flex items-center justify-between bg-neutral-955 p-2.5 border border-neutral-850 rounded-lg text-xs font-mono">
                            <div className="space-y-0.5 truncate pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  b.category === 'ALERT' ? 'bg-red-950/80 text-red-400 border border-red-900/40' : 'bg-neutral-800 text-neutral-300'
                                }`}>
                                  {b.category}
                                </span>
                                <span className="text-white font-bold truncate max-w-sm hover:text-red-400 cursor-help" title={b.content}>
                                  {b.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5" title={b.content}>{b.content}</p>
                              {b.expiresAt && (
                                <span className="text-[9px] text-rose-450 block mt-0.5">
                                  ⏱️ Auto-Expires: {new Date(b.expiresAt).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditBulletinClick(b)}
                                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer outline-none"
                                title="Edit Notice"
                              >
                                <Settings size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBulletin(b.id)}
                                className="p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer outline-none"
                                title="Delete Notice"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
            className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
          >
            {/* Form Title */}
            <header className="text-center space-y-1.5 pb-2 border-b border-gray-100">
              <div className="w-12 h-12 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight leading-none">
                {isRegistering ? 'Register Cebric' : 'Sign in to Cebric'}
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

            {/* Form Fields & Multi-step login */}
            {loginStep === 1 ? (
              <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-red-50 text-red-800 p-3.5 border border-red-150 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock size={13} className="text-[#EF1A2D] animate-spin" style={{ animationDuration: '4s' }} />
                    <span>MFA OTP Authorization Requested</span>
                  </div>
                  <p className="text-[11px] text-gray-550 font-medium leading-relaxed">
                    To protect your VIP telemetry access, please input your shifting 6-digit passkey token.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">6-Digit Verification Token</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g., 582914"
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value)}
                    className="w-full text-center tracking-[0.3em] font-mono bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-3 text-sm text-black font-extrabold transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep(0);
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-850 font-mono font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer border-none"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtpStep}
                    disabled={loginOtpCode.length < 6}
                    className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-mono font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md border-none disabled:opacity-50"
                  >
                    Authorize Session
                  </button>
                </div>
              </div>
            ) : loginStep === 2 ? (
              <div className="space-y-6 text-center py-2 animate-[fadeIn_0.2s_ease-out]">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black font-sans uppercase text-gray-800 tracking-tight leading-none">TPM Client Handshake Vault</h4>
                  <p className="text-[10px] text-gray-400 font-mono font-medium">VERIFYING @{username} VIA SECURE PHYSICAL CHIP ID</p>
                </div>

                {/* Simulated fingerprint pad */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-red-100/50 border-2 border-red-500/25 ${loginTpmScanning ? 'animate-ping' : ''}`} />
                  
                  <button
                    type="button"
                    onClick={handleStartTpmScan}
                    disabled={loginTpmScanning || loginTpmSuccess}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border shadow-md cursor-pointer outline-none ${
                      loginTpmSuccess 
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : loginTpmScanning
                        ? 'bg-red-50/50 text-[#EF1A2D] border-red-400'
                        : 'bg-neutral-950 text-white border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    {loginTpmSuccess ? (
                      <Check size={36} className="animate-pulse" />
                    ) : (
                      <Sparkles size={32} className={loginTpmScanning ? "animate-pulse text-[#EF1A2D]" : ""} />
                    )}
                  </button>

                  {/* Horizontal scanning laser bar */}
                  {loginTpmScanning && (
                    <div className="absolute left-4 right-4 h-[3px] bg-red-500 shadow-[0_0_10px_#EF1A2D] rounded-full animate-bounce top-10" />
                  )}
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <div className="text-[10px] font-mono text-gray-450 uppercase leading-normal">
                    {loginTpmSuccess ? (
                      <span className="text-emerald-600 font-black">✔ CRYPT-PAIR SHIELD REGISTERED</span>
                    ) : loginTpmScanning ? (
                      <span className="text-red-500 font-black animate-pulse">⚡ COMMUNICATING LOCAL TPM ENCLAVE...</span>
                    ) : (
                      <span>Tap target trigger to verify local biometric key pair</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep(0);
                      setErrorMsg(null);
                    }}
                    disabled={loginTpmScanning}
                    className="flex-1 py-2 bg-neutral-150 hover:bg-neutral-200 text-neutral-800 font-mono font-bold rounded-xl text-[10px] uppercase cursor-pointer border-none disabled:opacity-40"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 font-sans">
                
                {/* Grid block for givenName/familyName if registering */}
                {isRegistering && (
                  <>
                    <div className="grid grid-cols-2 gap-3 animate-none">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block font-sans">Given Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Lewis"
                          value={givenName}
                          onChange={(e) => setGivenName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block font-sans">Family Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Hamilton"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block font-sans">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g., lewis@mercedes.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block font-sans">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., lewisham44"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors font-mono"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block font-sans">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-black outline-none rounded-xl px-3 py-2.5 text-xs text-black font-semibold transition-colors font-mono"
                  />
                </div>

                {/* Paddock Vault Security Gateway (Only on Login) */}
                {!isRegistering && (
                  <div className="border border-dashed border-gray-200 rounded-2xl p-4 space-y-3 bg-neutral-50/50 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                      <Shield size={14} className="text-[#EF1A2D]" />
                      <span className="text-[10px] font-mono font-black text-black uppercase tracking-wider">Paddock Gateway Crypt-Shield</span>
                    </div>
                    
                    <p className="text-[9.5px] leading-relaxed text-gray-450 font-mono">
                      Enhance your paddock authentication profile using modern local TPM device standards or shifting TOTP security gates.
                    </p>

                    <div className="flex flex-col gap-2 pt-1">
                      {/* Two-Factor Option toggle */}
                      <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-gray-700 bg-white border border-gray-150 rounded-xl p-2 md:p-2.5 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-gray-400" />
                          <span>Strict Two-Factor (OTP) challenge</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={loginRequire2FA}
                          onChange={(e) => setLoginRequire2FA(e.target.checked)}
                          className="rounded border-gray-300 text-red-650 focus:ring-red-500 w-4 h-4 cursor-pointer"
                        />
                      </label>

                      {/* TPM Hardware Passkey Button */}
                      <button
                        type="button"
                        onClick={handleTpmHardwareTrigger}
                        className="flex items-center justify-between text-left text-xs font-semibold text-gray-750 bg-white border border-gray-150 hover:border-neutral-500 active:border-black rounded-xl p-2 md:p-2.5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={12} className="text-red-500" />
                          <span>Authenticate via TPM Hardware Passkey</span>
                        </div>
                        <span className="text-[8px] font-mono font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">TPM 2.0</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submission button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-neutral-950/10 text-xs tracking-wide uppercase outline-none disabled:opacity-50 font-mono"
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
            )}

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
