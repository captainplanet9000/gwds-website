'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ProductVideo({ videoUrl, productName, accent = '#8B5CF6' }: { videoUrl: string; productName: string; accent?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${accent}30`,
        background: '#000',
        cursor: 'pointer',
      }}
      onClick={handlePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
        loop
        muted
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play button overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.35)',
          transition: 'all 0.3s',
          pointerEvents: 'none',
        }}
      >
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: `${accent}CC`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${accent}40`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <path d="M28 16L0 32V0L28 16Z" fill="white" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          padding: '6px 14px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          opacity: isPlaying ? 0 : 1,
          transition: 'opacity 0.3s',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        ▶ Watch Product Demo
      </div>
    </motion.div>
  );
}
