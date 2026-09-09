'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Market-depth wave field — the <gwds-hero> element from the Claude Design
 * source (hero3d.js), ported to a React client component.
 *
 * The original loaded three.js from a CDN at runtime; here we import the
 * dependency already in package.json so the bundle stays self-contained and
 * the field renders without a third-party request.
 *
 * The wave maths, camera framing, lighting and colour ramp are kept identical
 * to the design so the motion matches the source exactly. Defaults are the
 * design's `hyperliquid` HERO palette and `standard` wave density.
 */

type CivalHero3DProps = {
  cols?: number;
  rows?: number;
  /** Colour ramp, shortest bars -> tallest. */
  low?: string;
  mid?: string;
  hi?: string;
  hot?: string;
  /** Fog colour — should match the section background it sits on. */
  fog?: string;
};

export default function CivalHero3D({
  cols: baseCols = 54,
  rows: baseRows = 26,
  low = '#1d3b40',
  mid = '#2f8e83',
  hi = '#50d2c1',
  hot = '#97fce4',
  fog = '#0a1416',
}: CivalHero3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Bail out cleanly if the browser/GPU can't give us a context. The hero still
    // reads correctly without it — the section keeps its background and scrims.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('CivalHero3D: WebGL unavailable, skipping wave field', e);
      return;
    }

    let dead = false;
    let raf = 0;

    const gap = 0.78;

    // Every frame walks the full instance list in JS, so the field is thinned on
    // small screens — at phone width the wave reads the same at roughly half the
    // density, for roughly a third of the per-frame work.
    const vw = window.innerWidth;
    const densityScale = vw < 480 ? 0.55 : vw < 900 ? 0.75 : 1;
    const cols = Math.max(18, Math.round(baseCols * densityScale));
    const rows = Math.max(10, Math.round(baseRows * densityScale));
    const count = cols * rows;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, vw < 900 ? 1.25 : 1.5));
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(fog).getHex(), 26, 62);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
    const camBase = new THREE.Vector3(0, 9.4, 24.5);
    camera.position.copy(camBase);
    camera.lookAt(0, 1.4, 0);

    scene.add(new THREE.HemisphereLight(0xfff4e2, 0x6b6250, 0.85));
    const key = new THREE.DirectionalLight(0xffe9cd, 1.55);
    key.position.set(-11, 18, 12);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa8b98a, 0.5);
    rim.position.set(14, 6, -12);
    scene.add(rim);

    const geo = new THREE.BoxGeometry(0.5, 1, 0.5);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.52, metalness: 0.06 });
    const bars = new THREE.InstancedMesh(geo, mat, count);
    bars.name = 'depth-field';
    scene.add(bars);

    // Static per-instance data: grid position and a radial falloff that keeps
    // the field from ending in a hard edge.
    const px = new Float32Array(count);
    const pz = new Float32Array(count);
    const fall = new Float32Array(count);
    let i = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++, i++) {
        const x = (c - (cols - 1) / 2) * gap;
        const z = (r - (rows - 1) / 2) * gap;
        px[i] = x;
        pz[i] = z;
        const nx = x / ((cols * gap) / 2);
        const nz = z / ((rows * gap) / 2);
        fall[i] = Math.max(0, 1 - Math.pow(nx * nx * 0.82 + nz * nz * 1.05, 1.25));
      }
    }

    const cLow = new THREE.Color(low);
    const cMid = new THREE.Color(mid);
    const cHi = new THREE.Color(hi);
    const cHot = new THREE.Color(hot);
    const col = new THREE.Color();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2;
      ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    host.addEventListener('pointermove', onMove);

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Widen the lens on portrait viewports so the field still fills the frame.
      camera.fov = w / h < 1 ? 46 : 34;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: '120px' });
    io.observe(host);

    const t0 = performance.now();
    let tick = 0;
    const frame = () => {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      tick++;
      // Recolouring every 3rd frame is imperceptible and saves a lot of work.
      const recolour = tick % 3 === 0;
      // Reduced motion: hold the field at a fixed, pleasant point in the cycle.
      const t = reduce ? 4.2 : (performance.now() - t0) / 1000;

      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;
      camera.position.set(camBase.x + mx * 2.6, camBase.y - my * 1.5, camBase.z);
      camera.lookAt(mx * 0.6, 1.4, 0);

      for (let k = 0; k < count; k++) {
        const x = px[k];
        const z = pz[k];
        const w1 = Math.sin(x * 0.34 - t * 1.15 + Math.sin(z * 0.19 + t * 0.33) * 1.35);
        const w2 = Math.sin(x * 0.11 + z * 0.26 + t * 0.62);
        const w3 = Math.sin(x * 0.72 + t * 2.1) * 0.22;
        const e = (w1 * 0.62 + w2 * 0.34 + w3) * 0.5 + 0.5;
        const h = 0.14 + Math.pow(Math.max(e, 0), 1.5) * 5.6 * fall[k] + fall[k] * 0.22;
        pos.set(x, 0, z);
        scl.set(1, h, 1);
        m.compose(pos, q, scl);
        bars.setMatrixAt(k, m);

        if (recolour || tick < 4) {
          const v = Math.min(1, h / 4.1);
          if (v < 0.45) col.lerpColors(cLow, cMid, v / 0.45);
          else if (v < 0.82) col.lerpColors(cMid, cHi, (v - 0.45) / 0.37);
          else col.lerpColors(cHi, cHot, (v - 0.82) / 0.18);
          bars.setColorAt(k, col);
        }
      }
      bars.instanceMatrix.needsUpdate = true;
      if (bars.instanceColor && (recolour || tick < 4)) bars.instanceColor.needsUpdate = true;
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      bars.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // release the GL context, not just the JS objects
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [baseCols, baseRows, low, mid, hi, hot, fog]);

  return <div ref={hostRef} style={{ display: 'block', position: 'relative', width: '100%', height: '100%' }} />;
}
