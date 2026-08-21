'use client';
import { useEffect } from 'react';

export default function CursorLerp() {
  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    const cursorDot = dot;
    const cursorRing = ring;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    };

    window.addEventListener('mousemove', onMove);

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function animate() {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      animId = requestAnimationFrame(animate);
    }
    animate();

    // Scale on hover over interactive elements
    const onEnter = () => {
      cursorRing.style.transform = 'translate(-50%, -50%) scale(2)';
      cursorRing.style.borderColor = 'oklch(0.75 0.15 195 / 0.8)';
    };
    const onLeave = () => {
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRing.style.borderColor = 'oklch(0.65 0.29 295 / 0.6)';
    };

    const interactives = document.querySelectorAll('a, button, [role="button"]');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  );
}
