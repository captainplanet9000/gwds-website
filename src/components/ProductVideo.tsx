'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProductVideo({ videoUrl, productName, accent = '#8B5CF6' }: { videoUrl: string; productName: string; accent?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) setShowControls(true);
    else scheduleHide();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isPlaying, scheduleHide]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen?.();
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  };

  const controlBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
    transition: 'opacity 0.2s',
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseMove={scheduleHide}
      onTouchStart={scheduleHide}
      style={{
        position: 'relative',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        border: isFullscreen ? 'none' : `1px solid ${accent}30`,
        background: '#000',
        cursor: 'pointer',
      }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', display: 'block', aspectRatio: isFullscreen ? undefined : '16/9', objectFit: 'cover', height: isFullscreen ? '100%' : undefined }}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
      />

      {/* Big play button — only when paused */}
      {!isPlaying && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', pointerEvents: 'none' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${accent}CC`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${accent}40`,
            }}
          >
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none"><path d="M28 16L0 32V0L28 16Z" fill="white" /></svg>
          </motion.div>
        </div>
      )}

      {/* Controls bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          padding: '24px 16px 12px',
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s, transform 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 2,
            cursor: 'pointer',
            marginBottom: 10,
            position: 'relative',
          }}
        >
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: accent,
            borderRadius: 2,
            transition: 'width 0.1s linear',
          }} />
          {/* Scrub handle */}
          <div style={{
            position: 'absolute',
            left: `${progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.2s',
          }} />
        </div>

        {/* Buttons row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Play/Pause */}
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={controlBtnStyle} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><rect x="3" y="2" width="4" height="14" rx="1" /><rect x="11" y="2" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M4 2L16 9L4 16V2Z" /></svg>
            )}
          </button>

          {/* Time */}
          <span style={{ fontSize: 12, color: '#ccc', fontFamily: 'var(--font-mono, monospace)', minWidth: 80, userSelect: 'none' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Mute/Unmute */}
          <button onClick={toggleMute} style={controlBtnStyle} aria-label={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            )}
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={controlBtnStyle} aria-label="Fullscreen">
            {isFullscreen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
