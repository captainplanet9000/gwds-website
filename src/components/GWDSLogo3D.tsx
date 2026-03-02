'use client';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GWDSText() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle auto-rotation
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15 + pointer.x * 0.3;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.05 + pointer.y * 0.15;

    // Breathing scale
    const scale = 1 + Math.sin(t * 0.5) * 0.02;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={1.2}
          height={0.35}
          curveSegments={24}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={8}
        >
          GWDS
          <meshStandardMaterial
            color="#8B5CF6"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={2}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function FloatingParticles() {
  const count = 120;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
      ],
      speed: 0.1 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
      scale: 0.01 + Math.random() * 0.03,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3,
        p.position[2] + Math.sin(t * p.speed * 0.5 + p.offset) * 0.4,
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
      <meshBasicMaterial color="#8B5CF6" transparent opacity={0.4} />
    </instancedMesh>
  );
}

function WaveGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 20, 80, 80);
    return g;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave = Math.sin(x * 0.5 + t * 0.8) * 0.3 +
                   Math.sin(y * 0.3 + t * 0.6) * 0.2 +
                   Math.sin((x + y) * 0.4 + t * 0.4) * 0.15;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -3]}>
      <meshStandardMaterial
        color="#8B5CF6"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#E8E8E8" />
      <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#8B5CF6" />
      <pointLight position={[0, 0, 4]} intensity={0.8} color="#8B5CF6" distance={10} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <GWDSText />
      </Float>

      <FloatingParticles />
      <WaveGrid />

      <Environment preset="city" />
    </>
  );
}

export default function GWDSLogo3D({ height = '60vh' }: { height?: string }) {
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
          color: '#333',
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
        }}>
          LOADING
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
