'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CatmullRomCurve3, Group, MathUtils, Vector3 } from 'three';
import { probeWebGL2 } from './webgl';

function Pavilion() {
  const pavilion = useRef<Group>(null);
  const satellites = useRef<Group>(null);
  const jewel = useRef<Group>(null);
  const time = useRef(0);
  const arch = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-1.15, -1.2, 0),
        new Vector3(-1.15, 0.25, 0),
        ...Array.from({ length: 17 }, (_, i) => {
          const angle = Math.PI - ((i + 1) * Math.PI) / 18;
          return new Vector3(
            Math.cos(angle) * 1.15,
            0.25 + Math.sin(angle) * 1.35,
            0,
          );
        }),
        new Vector3(1.15, 0.25, 0),
        new Vector3(1.15, -1.2, 0),
      ]),
    [],
  );
  useFrame(({ pointer }, delta) => {
    const step = Math.min(delta, 0.05);
    time.current += step;
    if (pavilion.current)
      pavilion.current.rotation.y = MathUtils.damp(
        pavilion.current.rotation.y,
        0.3 + pointer.x * 0.14,
        3,
        step,
      );
    if (satellites.current) satellites.current.rotation.y += step * 0.1;
    if (jewel.current) {
      jewel.current.rotation.y += step * 0.22;
      jewel.current.position.y = 0.3 + Math.sin(time.current * 0.65) * 0.09;
    }
  });
  return (
    <group position={[0, -0.05, 0]}>
      <group ref={pavilion} rotation={[0, 0.3, 0]}>
        {[0, 1, 2].map((index) => (
          <group key={index} rotation={[0, (index * Math.PI) / 3, 0]}>
            <mesh>
              <tubeGeometry args={[arch, 80, 0.038, 8, false]} />
              <meshStandardMaterial
                color="#d7bd81"
                metalness={0.65}
                roughness={0.28}
              />
            </mesh>
          </group>
        ))}
        {[
          [-1.33, 1.65],
          [-1.22, 1.44],
          [-1.1, 1.25],
        ].map(([y, radius]) => (
          <group key={y} position={[0, y, 0]}>
            <mesh>
              <cylinderGeometry args={[radius, radius, 0.12, 64]} />
              <meshStandardMaterial
                color="#176357"
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.065, 0]}>
              <torusGeometry args={[radius, 0.013, 8, 100]} />
              <meshStandardMaterial
                color="#dfc692"
                metalness={0.6}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.38, 0]}>
          <torusGeometry args={[0.62, 0.018, 8, 96]} />
          <meshStandardMaterial
            color="#dec89b"
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
        <group ref={jewel} position={[0, 0.3, 0]}>
          <mesh>
            <octahedronGeometry args={[0.52]} />
            <meshStandardMaterial
              color="#76ae90"
              metalness={0.5}
              roughness={0.18}
            />
          </mesh>
          <mesh rotation={[0.2, 0.3, 0.1]}>
            <octahedronGeometry args={[0.66]} />
            <meshBasicMaterial color="#d4c394" wireframe />
          </mesh>
        </group>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.25, 0.4, 0.65, 32]} />
          <meshStandardMaterial
            color="#d5bd86"
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>
      </group>
      <group ref={satellites} rotation={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <torusGeometry args={[2, 0.007, 6, 128]} />
          <meshBasicMaterial color="#bba879" transparent opacity={0.5} />
        </mesh>
        {[0, 1, 2, 3].map((index) => (
          <group
            key={index}
            position={[
              Math.cos((index * Math.PI) / 2) * 2,
              -0.7,
              Math.sin((index * Math.PI) / 2) * 2,
            ]}
          >
            <mesh>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial
                color="#e3ca92"
                metalness={0.45}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <torusGeometry args={[2.2, 0.008, 6, 128]} />
        <meshBasicMaterial color="#bba879" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => onFailure();
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  return null;
}

export default function PavilionScene({
  active,
  fallback,
  onFailure,
}: {
  active: boolean;
  fallback: ReactNode;
  onFailure: () => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const available = probeWebGL2();
      setSupported(available);
      if (!available) onFailure();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [onFailure]);
  if (supported !== true) return fallback;
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [3.4, 2.1, 6.4], fov: 38 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={fallback}
    >
      <hemisphereLight args={['#ffefd2', '#164d40', 2]} />
      <directionalLight position={[2, 4, 3]} intensity={3} color="#fff0d5" />
      <directionalLight
        position={[-3, 1, -2]}
        intensity={2.5}
        color="#91c9b4"
      />
      <pointLight position={[0, 2, 1]} intensity={8} color="#edcb8c" />
      <Pavilion />
      <ContextGuard onFailure={onFailure} />
    </Canvas>
  );
}
