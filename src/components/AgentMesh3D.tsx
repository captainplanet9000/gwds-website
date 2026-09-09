'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AGENT MESH — hero element for "your own AI agent hedge fund".
 *
 * WHY THIS AND NOT ANOTHER WAVE FIELD
 * CivalHero3D renders a market-depth surface: it shows a MARKET. What is being sold is not a
 * market, it is a set of autonomous agents that watch one and act on it. Every moving part here
 * maps to something the software actually does:
 *
 *   the surface         a live depth field, breathing
 *   6 orbiting nodes    the six autonomous agents (the real SKU count)
 *   node scale          an agent evaluating - size tracks its conviction
 *   arcs between nodes  agent-to-agent coordination (the consensus path)
 *   beam to the floor   an execution: that agent just pushed an order into the book
 *
 * So it reads as "agents trading" rather than generic crypto motion, and it stays honest: it shows
 * ACTIVITY, never an implied return.
 *
 * PERFORMANCE, deliberately
 * A full-viewport nav overlay recently made this site look broken, so this is built never to be the
 * heavy thing on the page:
 *   - one InstancedMesh for the surface, one for the agents; no per-frame allocation
 *   - stops rendering entirely when scrolled out of view (IntersectionObserver)
 *   - honours prefers-reduced-motion by drawing a single static frame
 *   - devicePixelRatio capped at 2
 *   - full dispose() + forceContextLoss() on unmount so WebGL contexts are not leaked
 *   - no CDN fetch; three.js is already a dependency
 */

type Props = {
  /** Agent count. Defaults to 6 to match the six autonomous agents in the product. */
  agents?: number;
  cols?: number;
  rows?: number;
  bg?: string;
  surfaceLow?: string;
  surfaceHigh?: string;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function AgentMesh3D({
  agents = 6,
  cols = 44,
  rows = 22,
  bg = '#08110f',
  surfaceLow = '#12312c',
  surfaceHigh = '#2f8e83',
  accent = '#4ade9f',
  className,
  style,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const maybeHost = hostRef.current;
    if (!maybeHost) return;
    // Bind to a non-null local so the cleanup closure keeps the narrowing.
    const host: HTMLDivElement = maybeHost;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 14, 42);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 7.5, 15);
    camera.lookAt(0, 0.9, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(new THREE.Color(accent), 0.9);
    key.position.set(4, 10, 6);
    scene.add(key);

    // market surface: instanced bars on a grid
    const SPACING = 0.42;
    const count = cols * rows;
    const barGeo = new THREE.BoxGeometry(0.22, 1, 0.22);
    const barMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const surface = new THREE.InstancedMesh(barGeo, barMat, count);
    surface.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const colBuf = new Float32Array(count * 3);
    surface.instanceColor = new THREE.InstancedBufferAttribute(colBuf, 3);
    scene.add(surface);

    const cLow = new THREE.Color(surfaceLow);
    const cHigh = new THREE.Color(surfaceHigh);
    const tmpObj = new THREE.Object3D();
    const tmpCol = new THREE.Color();

    // agents: instanced polyhedra orbiting above the book
    const agentGeo = new THREE.IcosahedronGeometry(0.16, 2);
    const agentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent),
      emissive: new THREE.Color(accent),
      emissiveIntensity: 1.1,
      roughness: 0.35,
      metalness: 0.1,
    });
    const agentMesh = new THREE.InstancedMesh(agentGeo, agentMat, agents);
    scene.add(agentMesh);

    type Agent = { radius: number; speed: number; phase: number; height: number; conviction: number; nextFire: number };
    const fleet: Agent[] = Array.from({ length: agents }, (_, i) => ({
      radius: 3.2 + (i % 3) * 1.15,
      speed: 0.16 + (i % 4) * 0.045,
      phase: (i / agents) * Math.PI * 2,
      height: 2.4 + ((i * 7) % 5) * 0.42,
      conviction: 0.5,
      nextFire: 1.5 + i * 0.9,
    }));
    const agentPos = fleet.map(() => new THREE.Vector3());
    const firing = fleet.map(() => 0);

    // coordination arcs between nearby agents
    const linkMat = new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.16 });
    const linkGeo = new THREE.BufferGeometry();
    const maxLinks = (agents * (agents - 1)) / 2;
    const linkPos = new Float32Array(maxLinks * 6);
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
    const links = new THREE.LineSegments(linkGeo, linkMat);
    scene.add(links);

    // execution beams down into the book
    const beamMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#97fce4'), transparent: true, opacity: 0.7 });
    const beamGeo = new THREE.BufferGeometry();
    const beamPos = new Float32Array(agents * 6);
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    const beams = new THREE.LineSegments(beamGeo, beamMat);
    scene.add(beams);

    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;

    function drawSurface(t: number) {
      let i = 0;
      for (let x = 0; x < cols; x++) {
        for (let z = 0; z < rows; z++) {
          const px = (x - cols / 2) * SPACING;
          const pz = (z - rows / 2) * SPACING;
          const d = Math.hypot(px, pz);
          const h =
            Math.sin(px * 0.55 + t * 0.9) * 0.5 +
            Math.cos(pz * 0.42 - t * 0.65) * 0.4 +
            Math.sin(d * 0.7 - t * 1.1) * 0.35 +
            1.25;
          tmpObj.position.set(px, h / 2, pz);
          tmpObj.scale.set(1, Math.max(h, 0.08), 1);
          tmpObj.updateMatrix();
          surface.setMatrixAt(i, tmpObj.matrix);
          tmpCol.copy(cLow).lerp(cHigh, THREE.MathUtils.clamp((h - 0.4) / 1.9, 0, 1));
          tmpCol.toArray(colBuf, i * 3);
          i++;
        }
      }
      surface.instanceMatrix.needsUpdate = true;
      (surface.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;
    }

    function drawAgents(t: number, dt: number) {
      fleet.forEach((a, i) => {
        const ang = a.phase + t * a.speed;
        const p = agentPos[i].set(
          Math.cos(ang) * a.radius,
          a.height + Math.sin(t * 0.7 + i) * 0.22,
          Math.sin(ang) * a.radius,
        );
        a.conviction = 0.55 + Math.sin(t * (0.8 + i * 0.13) + i) * 0.45;
        a.nextFire -= dt;
        if (a.nextFire <= 0) {
          firing[i] = 0.55;
          a.nextFire = 2.6 + ((i * 37) % 34) / 10;
        }
        if (firing[i] > 0) firing[i] -= dt;

        tmpObj.position.copy(p);
        tmpObj.scale.setScalar(1 + a.conviction * 0.5 + (firing[i] > 0 ? 0.7 : 0));
        tmpObj.updateMatrix();
        agentMesh.setMatrixAt(i, tmpObj.matrix);

        const b = i * 6;
        if (firing[i] > 0) {
          beamPos[b] = p.x; beamPos[b + 1] = p.y; beamPos[b + 2] = p.z;
          beamPos[b + 3] = p.x; beamPos[b + 4] = 0.05; beamPos[b + 5] = p.z;
        } else {
          for (let k = 0; k < 6; k++) beamPos[b + k] = 0;
        }
      });
      agentMesh.instanceMatrix.needsUpdate = true;
      (beams.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

      let li = 0;
      for (let a = 0; a < agents; a++) {
        for (let b2 = a + 1; b2 < agents; b2++) {
          const o = li * 6;
          if (agentPos[a].distanceTo(agentPos[b2]) < 4.2) {
            linkPos[o] = agentPos[a].x; linkPos[o + 1] = agentPos[a].y; linkPos[o + 2] = agentPos[a].z;
            linkPos[o + 3] = agentPos[b2].x; linkPos[o + 4] = agentPos[b2].y; linkPos[o + 5] = agentPos[b2].z;
          } else {
            for (let k = 0; k < 6; k++) linkPos[o + k] = 0;
          }
          li++;
        }
      }
      (links.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      drawSurface(t);
      drawAgents(t, dt);
      camera.position.x = Math.sin(t * 0.06) * 1.6;
      camera.lookAt(0, 0.9, 0);
      renderer.render(scene, camera);
    }

    function resize() {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(host);

    if (reduced) {
      drawSurface(0);
      drawAgents(0, 0);
      renderer.render(scene, camera);
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      barGeo.dispose(); barMat.dispose();
      agentGeo.dispose(); agentMat.dispose();
      linkGeo.dispose(); linkMat.dispose();
      beamGeo.dispose(); beamMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [agents, cols, rows, bg, surfaceLow, surfaceHigh, accent]);

  return <div ref={hostRef} className={className} style={{ width: '100%', height: '100%', ...style }} aria-hidden="true" />;
}
