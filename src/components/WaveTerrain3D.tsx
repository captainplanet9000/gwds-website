'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  // Massive grid, low subdivision = BIG squares that fill the entire viewport
  const geo = useMemo(() => new THREE.PlaneGeometry(120, 120, 40, 40), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.25;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const wave =
        Math.sin(x * 0.08 + t) * 1.8 +
        Math.sin(y * 0.1 + t * 1.1) * 1.2 +
        Math.sin((x * 0.06 + y * 0.08) + t * 0.7) * 1.0 +
        Math.sin(x * 0.15 + y * 0.12 + t * 0.4) * 0.5;

      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial
        color="#7C3AED"
        wireframe
        transparent
        opacity={0.14}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function TerrainGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(120, 120, 35, 35), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.2;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const wave =
        Math.sin(x * 0.08 + t + 0.5) * 1.8 +
        Math.sin(y * 0.1 + t * 1.1 + 0.5) * 1.2 +
        Math.sin((x * 0.06 + y * 0.08) + t * 0.7 + 0.5) * 1.0;

      pos.setZ(i, wave * 0.95);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2.1, 0]}>
      <meshBasicMaterial
        color="#8B5CF6"
        wireframe
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlowOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  const orbs = useMemo(() =>
    Array.from({ length: 6 }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 2 - 3,
        (Math.random() - 0.5) * 20,
      ] as [number, number, number],
      scale: 0.03 + Math.random() * 0.06,
      speed: 0.15 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const o = orbs[i];
      child.position.y = o.position[1] + Math.sin(t * o.speed + o.offset) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <mesh key={i} position={o.position}>
          <sphereGeometry args={[o.scale, 16, 16]} />
          <meshBasicMaterial color="#A78BFA" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[0, 8, 5]} intensity={0.4} color="#7C3AED" />
      <Terrain />
      <TerrainGlow />
      <GlowOrbs />
    </>
  );
}

export default function WaveTerrain3D({ height = '100vh', opacity = 1 }: { height?: string; opacity?: number }) {
  return (
    <div style={{
      width: '100%',
      height,
      position: 'absolute',
      inset: 0,
      opacity,
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 2, 4], fov: 75, near: 0.1, far: 200 }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
