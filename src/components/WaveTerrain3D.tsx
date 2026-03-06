'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Large grid with BIG squares — zoomed in, fewer subdivisions = larger cells
  const geo = useMemo(() => new THREE.PlaneGeometry(80, 80, 60, 60), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.25;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Distance from center for radial falloff
      const dist = Math.sqrt(x * x + y * y);
      const falloff = Math.max(0, 1 - dist / 30);

      const wave =
        Math.sin(x * 0.15 + t) * 1.4 +
        Math.sin(y * 0.18 + t * 1.1) * 1.0 +
        Math.sin((x * 0.1 + y * 0.15) + t * 0.7) * 0.8 +
        Math.sin(x * 0.3 + y * 0.25 + t * 0.4) * 0.4 +
        Math.sin(dist * 0.2 + t * 0.6) * 0.5;

      pos.setZ(i, wave * falloff);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -3, -8]}>
      <meshStandardMaterial
        color="#7C3AED"
        wireframe
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function TerrainGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(80, 80, 50, 50), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.2;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const falloff = Math.max(0, 1 - dist / 30);

      const wave =
        Math.sin(x * 0.2 + t + 0.5) * 0.8 +
        Math.sin(y * 0.25 + t * 1.1 + 0.5) * 0.6 +
        Math.sin((x * 0.15 + y * 0.2) + t * 0.7 + 0.5) * 0.5;

      pos.setZ(i, wave * falloff * 0.95);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -3.05, -8]}>
      <meshBasicMaterial
        color="#8B5CF6"
        wireframe
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlowOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  const orbs = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        Math.random() * 1.5 - 2,
        (Math.random() - 0.5) * 12 - 4,
      ] as [number, number, number],
      scale: 0.03 + Math.random() * 0.08,
      speed: 0.15 + Math.random() * 0.35,
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const o = orbs[i];
      child.position.y = o.position[1] + Math.sin(t * o.speed + o.offset) * 0.6;
      child.position.x = o.position[0] + Math.sin(t * o.speed * 0.5 + o.offset) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <mesh key={i} position={o.position}>
          <sphereGeometry args={[o.scale, 16, 16]} />
          <meshBasicMaterial color="#A78BFA" transparent opacity={0.5} />
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
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#A78BFA" distance={15} />
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
          camera={{ position: [0, 4, 8], fov: 60, near: 0.1, far: 150 }}
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
