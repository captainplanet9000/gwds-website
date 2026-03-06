'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function GWDSText() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.08 + pointer.x * 0.1;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.02 + pointer.y * 0.05;
    const scale = 1 + Math.sin(t * 0.4) * 0.01;
    groupRef.current.scale.setScalar(scale);
  });

  const textScale = Math.min(viewport.width / 7.5, 1.4);

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.5 * textScale}
          height={0.4}
          curveSegments={48}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={10}
          letterSpacing={0.1}
        >
          GWDS
          <meshStandardMaterial
            color="#9333EA"
            metalness={0.85}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function FloatingParticles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5,
      ],
      speed: 0.08 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2,
      scale: 0.008 + Math.random() * 0.02,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.3,
        p.position[1] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.2,
        p.position[2],
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
      <meshBasicMaterial color="#A78BFA" transparent opacity={0.3} />
    </instancedMesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 3, -3]} intensity={0.6} color="#8B5CF6" />
      <pointLight position={[0, 0, 4]} intensity={0.8} color="#A78BFA" distance={10} />

      <GWDSText />
      <FloatingParticles />
    </>
  );
}

export default function GWDSLogo3D({ height = '50vh' }: { height?: string }) {
  return (
    <div style={{
      width: '100%',
      height,
      position: 'relative',
      background: 'transparent',
    }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0.3, 5.5], fov: 40 }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
