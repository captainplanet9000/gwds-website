'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GWDSText() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle auto-rotation with mouse parallax
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.1 + pointer.x * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.03 + pointer.y * 0.08;

    // Subtle breathing
    const scale = 1 + Math.sin(t * 0.4) * 0.015;
    groupRef.current.scale.setScalar(scale);
  });

  // Scale text to viewport
  const textScale = Math.min(viewport.width / 8, 1.3);

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.4 * textScale}
          height={0.5}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.025}
          bevelOffset={0}
          bevelSegments={12}
          letterSpacing={0.08}
        >
          GWDS
          {/* Main face — rich metallic purple */}
          <meshPhysicalMaterial
            color="#9333EA"
            metalness={1}
            roughness={0.12}
            envMapIntensity={3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={1}
          />
        </Text3D>
      </Center>

      {/* Glow plane behind text */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[8 * textScale, 3 * textScale]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const count = 80;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
      ],
      speed: 0.08 + Math.random() * 0.25,
      offset: Math.random() * Math.PI * 2,
      scale: 0.008 + Math.random() * 0.025,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.4,
        p.position[1] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.25,
        p.position[2] + Math.sin(t * p.speed * 0.4 + p.offset) * 0.3,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#A78BFA" transparent opacity={0.35} />
    </instancedMesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#E8E8E8" />
      <directionalLight position={[-4, 4, -4]} intensity={0.7} color="#8B5CF6" />
      <pointLight position={[0, 0, 5]} intensity={1.2} color="#A78BFA" distance={12} />
      <pointLight position={[-3, 2, 3]} intensity={0.4} color="#C084FC" distance={8} />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
        <GWDSText />
      </Float>

      <FloatingParticles />

      <Environment preset="city" />
    </>
  );
}

export default function GWDSLogo3D({ height = '50vh' }: { height?: string }) {
  return (
    <div style={{
      width: '100%',
      height,
      position: 'relative',
    }}>
      <Suspense fallback={
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#8B5CF6',
            fontFamily: 'var(--font-display)',
            opacity: 0.5,
          }}>
            GWDS
          </span>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0.2, 5.5], fov: 42 }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
