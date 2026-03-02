'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(30, 30, 128, 128), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.3;
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave =
        Math.sin(x * 0.3 + t) * 0.6 +
        Math.sin(y * 0.4 + t * 1.2) * 0.4 +
        Math.sin((x * 0.2 + y * 0.3) + t * 0.8) * 0.3 +
        Math.sin(x * 0.8 + y * 0.6 + t * 0.5) * 0.15;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.8, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial
        color="#8B5CF6"
        wireframe
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlowSpheres() {
  const groupRef = useRef<THREE.Group>(null);

  const spheres = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      position: [(Math.random() - 0.5) * 8, Math.random() * 2 - 1, (Math.random() - 0.5) * 6] as [number, number, number],
      scale: 0.05 + Math.random() * 0.1,
      speed: 0.3 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const s = spheres[i];
      child.position.y = s.position[1] + Math.sin(t * s.speed + s.offset) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.position}>
          <sphereGeometry args={[s.scale, 16, 16]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[0, 5, 3]} intensity={0.3} color="#8B5CF6" />
      <Terrain />
      <GlowSpheres />
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
    }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 3, 8], fov: 50 }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
