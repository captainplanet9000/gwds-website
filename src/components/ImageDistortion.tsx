'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ImageDistortionProps {
  imageUrl: string;
  intensity?: number;
  style?: React.CSSProperties;
}

function DisplacementPlane({ imageUrl, intensity = 0.4 }: { imageUrl: string; intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { viewport } = useThree();

  // Load textures
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(imageUrl);
  }, [imageUrl]);

  // Simplex noise displacement map (generated)
  const displacementMap = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size);
    
    for (let i = 0; i < size * size; i++) {
      // Simple noise approximation
      const x = (i % size) / size;
      const y = Math.floor(i / size) / size;
      const noise = Math.sin(x * 10 + y * 8) * 0.5 + Math.sin(x * 15 - y * 12) * 0.3 + Math.sin(x * 20 + y * 16) * 0.2;
      data[i] = ((noise + 1) / 2) * 255;
    }
    
    const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDisplacement: { value: displacementMap },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: 0.0 },
        uHover: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uDisplacement;
        uniform vec2 uMouse;
        uniform float uIntensity;
        uniform float uHover;
        varying vec2 vUv;

        void main() {
          vec2 displacement = texture2D(uDisplacement, vUv).rg;
          vec2 distortedUv = vUv;
          
          // Distance from mouse
          float dist = distance(vUv, uMouse);
          float radius = 0.3;
          float strength = smoothstep(radius, 0.0, dist) * uHover * uIntensity;
          
          // Apply displacement
          distortedUv += (displacement - 0.5) * strength;
          
          vec4 color = texture2D(uTexture, distortedUv);
          gl_FragColor = color;
        }
      `,
    });
  }, [texture, displacementMap]);

  // Mouse tracking with smooth lerp
  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    
    // Smooth mouse lerp
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
    
    material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    
    // Smooth hover transition
    const targetHover = isHovered ? 1.0 : 0.0;
    material.uniforms.uHover.value += (targetHover - material.uniforms.uHover.value) * 0.05;
    material.uniforms.uIntensity.value = intensity;
  });

  const handlePointerMove = (e: THREE.Event) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    
    // Convert to UV coordinates
    mouseRef.current.targetX = e.uv!.x;
    mouseRef.current.targetY = e.uv!.y;
  };

  return (
    <mesh
      ref={meshRef}
      material={shaderMaterial}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
    </mesh>
  );
}

export default function ImageDistortion({ imageUrl, intensity = 0.4, style }: ImageDistortionProps) {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <DisplacementPlane imageUrl={imageUrl} intensity={intensity} />
      </Canvas>
    </div>
  );
}
