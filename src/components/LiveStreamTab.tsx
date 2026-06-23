import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, Users, Settings, Plus, Edit2, Trash2, ExternalLink, Volume2, VolumeX, MessageSquare, Send, Eye, Video, AlertCircle, RefreshCw, Radio, BadgeCheck } from 'lucide-react';
import HlsPlayer from './HlsPlayer';

interface LiveStream {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'twitch' | 'custom' | 'ok_ru';
  status: 'live' | 'upcoming' | 'offline';
  category: string;
  description: string;
}

// Utility to auto-detect platform from stream URL
const detectPlatformFromUrl = (url: string): 'youtube' | 'twitch' | 'custom' | 'ok_ru' => {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('ok.ru')) {
    return 'ok_ru';
  }
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (cleanUrl.includes('twitch.tv')) {
    return 'twitch';
  }
  return 'custom';
};

// Utility to extract OK.ru video/live ID
const extractOkRuId = (url: string): string => {
  const match = url.match(/(?:ok\.ru\/(?:video|videoembed|live|embed)\/|ok\.ru\/embed\/)(\d+)/i) || url.match(/ok\.ru\D*(\d+)/i);
  if (match) {
    return match[1];
  }
  const numericMatch = url.match(/\d{10,}/);
  if (numericMatch) {
    return numericMatch[0];
  }
  return '';
};

export default function LiveStreamTab() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Admin access state (Strictly tied to active admin session)
  const currentUserRaw = localStorage.getItem('f1_user_session');
  let currentSessionUser: any = null;
  try {
    currentSessionUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
  } catch (e) {
    currentSessionUser = null;
  }
  const isAdmin = currentSessionUser && (currentSessionUser.isAdmin === true || currentSessionUser.role === 'admin' || currentSessionUser.username === 'Admin');

  // Form states for creating / editing stream links
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<'youtube' | 'twitch' | 'custom' | 'ok_ru'>('youtube');
  const [formStatus, setFormStatus] = useState<'live' | 'upcoming' | 'offline'>('live');
  const [formCategory, setFormCategory] = useState<string>('Main Broadcast');
  const [formDescription, setFormDescription] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Chat message states (Initialized completely empty)
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Media controls state
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Load stream links from backend DB
  const loadStreams = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch('/api/livestreams');
      if (!response.ok) {
        throw new Error(`Failed to load streams: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.streams)) {
        setStreams(data.streams);
        if (data.streams.length > 0) {
          setSelectedStream(data.streams[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching stream links:', err);
      setErrorStatus(err.message || 'Failed to fetch streams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  // Sync scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle adding / modifying live stream
  const handleSubmitStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;

    try {
      const payload = {
        title: formTitle.trim(),
        url: formUrl.trim(),
        platform: formPlatform,
        status: formStatus,
        category: formCategory.trim(),
        description: formDescription.trim()
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/livestreams/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/livestreams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          // Reset form
          setEditingId(null);
          setFormTitle('');
          setFormUrl('');
          setFormPlatform('youtube');
          setFormStatus('live');
          setFormCategory('Main Broadcast');
          setFormDescription('');
          setIsFormOpen(false);
          await loadStreams();
        }
      }
    } catch (err) {
      console.error('Error saving live stream config:', err);
    }
  };

  // Open Edit Mode
  const handleEditClick = (s: LiveStream) => {
    setEditingId(s.id);
    setFormTitle(s.title);
    setFormUrl(s.url);
    setFormPlatform(s.platform);
    setFormStatus(s.status);
    setFormCategory(s.category);
    setFormDescription(s.description);
    setIsFormOpen(true);
  };

  // Delete live stream
  const handleDeleteClick = async (id: string) => {
    try {
      const res = await fetch(`/api/livestreams/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedStream?.id === id) {
          setSelectedStream(null);
        }
        await loadStreams();
      }
    } catch (err) {
      console.error('Error deleting stream:', err);
    }
  };

  // Handle sending chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const userLabel = currentSessionUser?.username || 'GuestFans';
    const date = new Date();
    const timeStr = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: userLabel,
        text: newMsgText.trim(),
        time: timeStr,
        color: '#EF1A2D',
        isVerified: !!currentSessionUser?.isVerified,
        verifyStyle: currentSessionUser?.verifyStyle || 'regular'
      }
    ]);
    setNewMsgText('');
  };

  // Render iframe embeds safely
  const renderEmbed = (s: LiveStream) => {
    if (s.platform === 'youtube') {
      // Clean up youtube embeds
      let ytId = s.url;
      if (s.url.includes('embed/')) {
        ytId = s.url.substring(s.url.indexOf('embed/') + 6);
      } else if (s.url.includes('v=')) {
        const parts = s.url.split('v=');
        ytId = parts[1].split('&')[0];
      } else if (s.url.includes('youtu.be/')) {
        ytId = s.url.substring(s.url.indexOf('youtu.be/') + 9);
      }
      return (
        <iframe
          className="w-full h-full border-none shadow-xl"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=1&rel=0`}
          title={s.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    } else if (s.platform === 'twitch') {
      // Twitch embed parameters
      let channel = s.url;
      if (s.url.includes('channel=')) {
        channel = s.url.split('channel=')[1].split('&')[0];
      } else if (s.url.includes('twitch.tv/')) {
        channel = s.url.substring(s.url.indexOf('twitch.tv/') + 10).split('/')[0];
      }
      return (
        <iframe
          className="w-full h-full border-none shadow-xl"
          src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=true`}
          title={s.title}
          allowFullScreen
        />
      );
    } else if (s.platform === 'ok_ru' || s.url.toLowerCase().includes('ok.ru')) {
      const okId = extractOkRuId(s.url);
      if (okId) {
        return (
          <iframe
            className="w-full h-full border-none shadow-xl"
            src={`https://ok.ru/videoembed/${okId}`}
            title={s.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        );
      }
      return (
        <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden font-mono text-white">
          <AlertCircle size={40} className="text-[#EF1A2D] mb-4" />
          <p className="text-sm font-black tracking-widest uppercase mb-1">INVALID OK.RU STREAM SOURCE</p>
          <p className="text-xs text-neutral-450 mb-4 max-w-sm">Unable to parse OK.ru video or stream ID from the provided URL. Please verify the link.</p>
        </div>
      );
    } else {
      if (s.url.toLowerCase().includes('.m3u8')) {
        return <HlsPlayer url={s.url} title={s.title} />;
      }
      // Non-supported embeds/Raw URL Fallback custom F1 Player Canvas!
      return (
        <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden font-mono bg-[linear-gradient(rgba(10,10,10,0.9),rgba(20,20,20,0.85))]">
          {/* Virtual camera scanning pattern scan line */}
          <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239,26,45,0.03) 2px, rgba(239,26,45,0.03) 4px)' }} />
          
          <Radio size={40} className="text-[#EF1A2D] animate-ping duration-1000 mb-4" />
          <p className="text-white text-sm font-black tracking-widest uppercase mb-1">RAW BROADCAST FEED SIGNAL</p>
          <p className="text-xs text-neutral-400 mb-4 max-w-sm">No standard interactive player available for this customized endpoint. Click below to view external feed directly.</p>
          
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-650 hover:bg-red-755 text-white font-bold rounded-lg text-[10px] tracking-widest uppercase flex items-center gap-1.5 transition-colors shadow-lg"
          >
            Launch Stream Frame <ExternalLink size={12} />
          </a>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6" id="livestream-tab-layer">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-mono font-black tracking-widest bg-red-500/10 text-red-650 px-2 py-0.5 rounded uppercase">
              LIVE BROADCAST CHANNELS
            </span>
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-black">
            Paddock Stream Center
          </h2>
          <p className="text-xs text-gray-500">
            View live track feeds, co-streams, and paddock commentary links with telemetry overlays.
          </p>
        </div>

        {/* Minimal Actions Menu */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormTitle('');
                setFormUrl('');
                setFormPlatform('youtube');
                setFormStatus('live');
                setFormCategory('Main Broadcast');
                setFormDescription('');
                setIsFormOpen(!isFormOpen);
              }}
              className="px-3 py-1.5 bg-[#EF1A2D] hover:bg-[#c91222] text-white rounded-lg font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer outline-none shadow-sm"
            >
              <Plus size={12} /> {isFormOpen ? 'Close Editor' : 'Configure New Stream'}
            </button>
          )}
        </div>
      </div>

      {/* Admin Minimal Config Panel */}
      <AnimatePresence>
        {isAdmin && isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#111] border border-neutral-800 rounded-2xl p-5 text-white font-mono text-xs shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#EF1A2D] flex items-center gap-1.5">
                ⚙️ {editingId ? 'EDIT ACTIVE BROADCAST CONFIG' : 'REGISTER NEW STREAM FEED'}
              </span>
              <span className="text-[9px] text-neutral-500">PADDOCK CONTROL OVERRIDE</span>
            </div>

            <form onSubmit={handleSubmitStream} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 space-y-1">
                  <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Stream Title / Descriptor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silverstone FP2 Onboard - Lando Norris Feed"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-6 space-y-1">
                  <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Stream URL or Channel Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="YouTube, Twitch, or Odnoklassniki (ok.ru) URL"
                    value={formUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormUrl(val);
                      const detected = detectPlatformFromUrl(val);
                      if (detected !== 'custom') {
                        setFormPlatform(detected);
                      }
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Embed Service Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold outline-none uppercase"
                  >
                    <option value="youtube">💻 YouTube Embed</option>
                    <option value="twitch">🔮 Twitch Player</option>
                    <option value="ok_ru">🎥 Odnoklassniki (ok.ru) Player</option>
                    <option value="custom">🌐 Custom External Tab URL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Feed Live State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold outline-none uppercase"
                  >
                    <option value="live">🟢 LIVE SCREEN ACTION</option>
                    <option value="upcoming">🟡 UPCOMING RACE EVENTS</option>
                    <option value="offline">🔴 OFFLINE REPLAY ARCHIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Category Category</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Onboards / Pit Lane / Audio"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-red-650 hover:bg-red-755 text-white font-bold rounded-lg text-[9px] uppercase tracking-widest transition-colors duration-150 cursor-pointer border-none"
                  >
                    {editingId ? 'Modify Live Broadcast' : 'Publish Broadcast Feed'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase text-neutral-450 tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short description of this stream feed..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white outline-none focus:border-red-500 resize-none transition-colors"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stream Hub Layout */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 select-none">
          <span className="w-10 h-10 border-4 border-[#EF1A2D] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">TUNING PADDOCK CHANNELS...</p>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 select-none text-center">
          <Tv size={45} className="text-gray-300 mb-3" />
          <p className="text-gray-700 text-sm font-bold">Paddock stream channels are currently idle.</p>
          <p className="text-xs text-gray-400 font-mono mt-1 mb-4">
            {isAdmin 
              ? 'Click "Configure New Stream" to broadcast your first telemetry or track video.' 
              : 'Please check back later during live race sessions for official feeds.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Active Cinema Stream Display - Left 8 columns */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Embedded Stream Card */}
            {selectedStream && (
              <div className="bg-black rounded-2xl overflow-hidden border border-neutral-850 shadow-2xl flex flex-col relative group" id="paddock-media-theater">
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 select-none pointer-events-none">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black border tracking-wider uppercase text-white shadow-md ${
                    selectedStream.status === 'live' 
                      ? 'bg-red-650 border-red-500/30' 
                      : selectedStream.status === 'upcoming' 
                        ? 'bg-amber-500 text-neutral-900 border-amber-400/30' 
                        : 'bg-neutral-800 border-neutral-700'
                  }`}>
                    {selectedStream.status === 'live' ? '● LIVE BROADCAST' : selectedStream.status === 'upcoming' ? '⏱️ UPCOMING' : '📁 RECORDED'}
                  </span>
                  
                  <span className="bg-black/70 backdrop-blur-xs text-white border border-neutral-700 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase shadow-md">
                    {selectedStream.category}
                  </span>
                </div>

                {/* Aspect-Ratio Box containing the iframe or placeholder */}
                <div className="aspect-video w-full bg-[#0d0d0d] relative flex items-center justify-center">
                  {selectedStream.status === 'live' ? (
                    renderEmbed(selectedStream)
                  ) : (
                    <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center select-none font-mono text-xs">
                      <Tv size={35} className="text-neutral-600 mb-3" />
                      <p className="text-white font-extrabold uppercase tracking-widest mb-1 text-sm">{selectedStream.title}</p>
                      <p className="text-neutral-400 max-w-sm mb-4">
                        {selectedStream.status === 'upcoming' 
                          ? 'This session hasn’t commenced yet. Sign up for alerts to be pinged as soon as green flag signals launch!' 
                          : 'This stream archive has completed and is safely stored in paddock records.'}
                      </p>
                      
                      {selectedStream.status === 'offline' && (
                        <a
                          href={selectedStream.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-white font-bold rounded-lg tracking-wider text-[10px] uppercase flex items-center gap-1.5 transition-colors border border-neutral-750"
                        >
                          Launch Archive Recording <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stream details & description */}
            {selectedStream && (
              <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-2 relative shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-black uppercase text-black leading-tight">
                    {selectedStream.title}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 uppercase bg-gray-50 px-2 py-0.5 border border-gray-100 rounded">
                    Stream Sequence #{selectedStream.id}
                  </span>
                </div>
                {selectedStream.description && (
                  <p className="text-xs text-gray-500 italic font-mono leading-relaxed">
                    {selectedStream.description}
                  </p>
                )}
              </div>
            )}

            {/* Custom Channel Navigation Selector List */}
            <div className="space-y-2">
              <span className="text-[8px] font-mono font-black uppercase tracking-widest text-neutral-400 block px-0.5">
                📁 SELECT FEED OUTLET ({streams.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {streams.map((s) => {
                  const isCurrent = selectedStream?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStream(s)}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-2.5 relative select-none ${
                        isCurrent 
                          ? 'bg-neutral-950 border-neutral-900 text-white shadow-md shadow-neutral-950/20' 
                          : 'bg-white hover:bg-neutral-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            isCurrent ? 'bg-neutral-800 text-neutral-300' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {s.category}
                          </span>

                          {/* Quick Admin controls on channels */}
                          {isAdmin && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleEditClick(s)}
                                className={`p-1 rounded transition-colors ${
                                  isCurrent ? 'hover:bg-neutral-800 text-neutral-450 hover:text-white' : 'hover:bg-neutral-150 text-gray-400 hover:text-neutral-700'
                                }`}
                                title="Edit Link"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(s.id)}
                                className={`p-1 rounded transition-colors ${
                                  isCurrent ? 'hover:bg-neutral-800 text-neutral-450 hover:text-red-400' : 'hover:bg-neutral-150 text-gray-400 hover:text-red-500'
                                }`}
                                title="Delete Link"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1">
                          {s.title}
                        </h4>
                      </div>

                      <div className="flex justify-between items-center text-[10px] mt-1 font-mono">
                        <span className={isCurrent ? 'text-neutral-400' : 'text-gray-400'}>
                          Platform: <strong className="uppercase">{s.platform}</strong>
                        </span>
                        
                        <span className={`flex items-center gap-1 font-bold ${
                          s.status === 'live' 
                            ? 'text-red-500' 
                            : s.status === 'upcoming' 
                              ? 'text-amber-500' 
                              : isCurrent ? 'text-neutral-450' : 'text-gray-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Real-time Interactive Chat Outlaw - Right 4 columns */}
          <div className="lg:col-span-4 flex flex-col h-[520px] bg-neutral-950 text-white rounded-2xl border border-neutral-850 shadow-2xl relative overflow-hidden">
            
            {/* Chat header */}
            <div className="bg-neutral-900 border-b border-neutral-850 px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-red-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-black text-white">
                  PADDOCK DISKUSS CHAT
                </span>
              </div>
            </div>

            {/* Simulated Live Messages Scroller */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] h-0 scrollbar-thin">
              {chatMessages.map((m) => (
                <div key={m.id} className="space-y-0.5 animate-[fadeIn_0.2s]">
                  <div className="flex items-center justify-between text-[9px] text-neutral-500">
                    <span 
                      className="font-black hover:underline cursor-pointer flex items-center gap-1"
                      style={{ color: m.color || '#fff' }}
                    >
                      {m.user}
                      {m.isVerified && (
                        m.verifyStyle === 'admin' ? (
                          <BadgeCheck size={12} className="text-purple-500 fill-purple-500/10 shrink-0 inline" title="Admin Verified" />
                        ) : (
                          <BadgeCheck size={12} className="text-blue-550 fill-blue-500/10 shrink-0 inline" title="Verified Player" />
                        )
                      )}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-200 bg-neutral-900/50 border border-neutral-900 px-2 py-1 rounded-md leading-relaxed break-words">
                    {m.text}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="bg-neutral-900 border-t border-neutral-850 p-3 flex gap-2">
              <input
                type="text"
                required
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Type your commentary or race insight..."
                className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 transition-colors"
              />
              <button
                type="submit"
                className="bg-red-650 hover:bg-red-755 text-white p-2.5 rounded-xl transition-all flex items-center justify-center outline-none cursor-pointer border-none shadow-md hover:scale-105"
                title="Send insight"
              >
                <Send size={12} />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}
