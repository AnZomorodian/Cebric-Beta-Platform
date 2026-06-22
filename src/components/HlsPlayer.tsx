import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle, RefreshCw, Disc } from 'lucide-react';

interface HlsPlayerProps {
  url: string;
  title: string;
}

export default function HlsPlayer({ url, title }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0); // Default to muted/0
  const [isLoading, setIsLoading] = useState(true);
  const [canAttemptRecover, setCanAttemptRecover] = useState(true);
  const hlsRef = useRef<Hls | null>(null);

  // Keep a reference to volume value for when we unmute
  const lastActiveVolume = useRef<number>(0.8);

  const initPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsLoading(true);

    // Stop and destroy previous instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 15,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 5,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Autoplay was blocked or failed", err);
            setIsPlaying(false);
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("Fatal HLS network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Fatal HLS media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error");
              setError("Live stream stream source has gone offline/private.");
              setIsLoading(false);
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native support (Safari, iOS Safari, etc.)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Native autoplay blocked", err);
            setIsPlaying(false);
          });
      });
      video.addEventListener('error', () => {
        setError("Your browser native HLS playback encountered an error.");
        setIsLoading(false);
      });
    } else {
      setError("This browser does not support HLS (.m3u8) playback natively or through MSE.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Play failed", err));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const newMuteState = !isMuted;
    video.muted = newMuteState;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      setVolume(0);
    } else {
      const activeVol = lastActiveVolume.current || 0.8;
      video.volume = activeVol;
      setVolume(activeVol);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const val = parseFloat(e.target.value);
    setVolume(val);
    video.volume = val;
    
    if (val > 0) {
      setIsMuted(false);
      video.muted = false;
      lastActiveVolume.current = val;
    } else {
      setIsMuted(true);
      video.muted = true;
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReload = () => {
    initPlayer();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group select-none overflow-hidden"
    >
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-neutral-950 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(239,26,45,0.15) 0%, transparent 70%)' }} />

      <video
        ref={videoRef}
        className="w-full h-full max-h-full object-contain cursor-pointer aspect-video bg-black z-0 relative"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center z-20 space-y-3 pointer-events-auto">
          <div className="relative flex items-center justify-center">
            <Disc className="w-12 h-12 text-[#EF1A2D] animate-spin" />
            <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-white text-xs font-black uppercase tracking-widest font-mono">Tuning Stream Audio/Video</p>
            <p className="text-[10px] text-neutral-400 font-mono tracking-wider mt-1 uppercase">ESTABLISHING LIVE FEED LINK</p>
          </div>
        </div>
      )}

      {/* Error State Overlay */}
      {error && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center text-center p-6 z-20 space-y-4 pointer-events-auto border border-red-900/40">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-[#EF1A2D] animate-bounce">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-white text-xs font-black uppercase tracking-widest font-mono">BROADCAST OFFLINE OR RESTRICTED</p>
            <p className="text-[10px] text-neutral-400 font-mono leading-relaxed uppercase">{error}</p>
          </div>
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-neutral-900 hover:bg-[#EF1A2D] hover:text-white text-neutral-300 font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center gap-1.5 border border-neutral-800"
          >
            <RefreshCw size={12} /> Retry Hotlink Connection
          </button>
        </div>
      )}

      {/* Play state indicator overlays */}
      {!isPlaying && !isLoading && !error && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 cursor-pointer pointer-events-auto"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 hover:bg-[#EF1A2D] text-white flex items-center justify-center border border-white/20 hover:border-transparent transition-all hover:scale-110 shadow-2xl">
            <Play size={28} className="ml-1 fill-current" />
          </div>
        </div>
      )}

      {/* Top Banner Feed Indicator */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10 transition-opacity opacity-0 group-hover:opacity-100 duration-300">
        <div className="flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-md border border-neutral-800/80 backend-banner backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[9px] font-black font-mono tracking-wider text-white uppercase">
            LIVE BROADCAST FEED
          </span>
        </div>
      </div>

      {/* Bottom Custom Playback Bar controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pt-10 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-between gap-4 pointer-events-auto">
        
        {/* Play/Pause & Mute controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            className="text-white hover:text-[#EF1A2D] transition-colors focus:outline-none"
            title={isPlaying ? "Pause Stream" : "Play Stream"}
          >
            {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-white hover:text-[#EF1A2D] transition-colors focus:outline-none"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 mt-0.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#EF1A2D]"
              style={{
                background: `linear-gradient(to right, #EF1A2D 0%, #EF1A2D ${volume * 100}%, #404040 ${volume * 100}%, #404040 100%)`
              }}
            />
          </div>
        </div>

        {/* Live track badges & Fullscreen */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono font-black text-[#EF1A2D] bg-[#EF1A2D]/10 border border-[#EF1A2D]/35 px-2.5 py-0.5 rounded tracking-wide uppercase">
            HLS INTERACTIVE FEED
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-neutral-400 hover:text-white transition-colors focus:outline-none p-1"
            title="Toggle Fullscreen"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
