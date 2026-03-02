'use client';
import { useEffect, useRef } from 'react';

interface WaveConfig {
  freq: number;
  amp: number;
  speed: number;
  color: string;
  phase: number;
}

interface WaveCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  waves?: WaveConfig[];
  centerY?: number; // 0-1, defaults to 0.5
}

const defaultWaves: WaveConfig[] = [
  { freq: 0.008, amp: 60, speed: 0.02, color: 'oklch(0.65 0.29 295 / 0.5)', phase: 0 },
  { freq: 0.012, amp: 40, speed: 0.03, color: 'oklch(0.75 0.15 195 / 0.4)', phase: 2 },
  { freq: 0.006, amp: 80, speed: 0.015, color: 'oklch(0.70 0.25 340 / 0.3)', phase: 4 },
  { freq: 0.02, amp: 25, speed: 0.04, color: 'oklch(0.82 0.18 85 / 0.25)', phase: 1 },
];

export default function WaveCanvas({ className, style, waves = defaultWaves, centerY = 0.5 }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        for (let x = 0; x <= w; x += 2) {
          const y = h * centerY + Math.sin(x * wave.freq + frame * wave.speed + wave.phase) * wave.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      frame++;
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [waves, centerY]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  );
}
