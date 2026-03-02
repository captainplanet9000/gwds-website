'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function OrbMesh({ color = '#8B5CF6', speed = 2, distort = 0.4 }: { color?: string; speed?: number; distort?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15 + pointer.y * 0.2;
    meshRef.current.rotation.y = t * 0.2 + pointer.x * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </Sphere>
    </Float>
  );
}

function OrbScene({ color }: { color: string }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 3, 3]} intensity={1} />
      <pointLight position={[-2, -1, 2]} intensity={0.5} color={color} />
      <OrbMesh color={color} />
    </>
  );
}

export default function ProductOrb3D({ color = '#8B5CF6', height = 300 }: { color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, pointerEvents: 'auto' }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <OrbScene color={color} />
        </Canvas>
      </Suspense>
    </div>
  );
}
