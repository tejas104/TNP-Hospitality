'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CatmullRomCurve3, Group, MathUtils, Mesh, Vector3 } from 'three';
import { probeWebGL2 } from './webgl';

// An illustrative event landscape: arrival, welcome and celebration connected
// by a continuous brass route. The moving beads represent a guest journey.
function GuestJourney() {
  const landscape = useRef<Group>(null);
  const guests = useRef<(Mesh | null)[]>([]);
  const time = useRef(0);
  const path = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-2.1, -0.6, 0.9),
        new Vector3(-1.45, -0.5, 0.55),
        new Vector3(-0.8, -0.1, -0.55),
        new Vector3(0.15, 0.05, -0.8),
        new Vector3(1.1, 0.35, -0.15),
        new Vector3(1.65, 0.4, 0.8),
        new Vector3(0.8, 0.55, 1.05),
        new Vector3(0.2, 0.65, 0.35),
      ]),
    [],
  );
  useFrame(({ pointer }, delta) => {
    const step = Math.min(delta, 0.05);
    time.current += step;
    if (landscape.current)
      landscape.current.rotation.y = MathUtils.damp(
        landscape.current.rotation.y,
        -0.2 + pointer.x * 0.12,
        3,
        step,
      );
    guests.current.forEach((guest, index) => {
      if (guest)
        guest.position.copy(
          path.getPointAt((time.current * 0.035 + index / 5) % 1),
        );
    });
  });
  return (
    <group ref={landscape} rotation={[0, -0.2, 0]} position={[0, -0.2, 0]}>
      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[4.5, 0.18, 3]} />
        <meshStandardMaterial
          color="#123f38"
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>
      {[
        [-1.5, -0.75, 0.45, 1.1, 0.25, 1.3],
        [-0.5, -0.5, -0.45, 1.4, 0.65, 1.5],
        [0.95, -0.3, 0.35, 1.8, 1.05, 1.75],
      ].map(([x, y, z, w, h, d], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={['#3e7768', '#527f6c', '#d4c6a0'][index]}
              roughness={0.5}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[0, h / 2 + 0.015, 0]}>
            <boxGeometry args={[w + 0.03, 0.025, d + 0.03]} />
            <meshStandardMaterial
              color="#d9bd7a"
              metalness={0.65}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
      <mesh>
        <tubeGeometry args={[path, 100, 0.025, 8, false]} />
        <meshStandardMaterial
          color="#f1d69b"
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            guests.current[index] = node;
          }}
        >
          <sphereGeometry args={[0.065, 16, 12]} />
          <meshStandardMaterial
            color="#fff6d5"
            emissive="#d7ac54"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      <group position={[-1.65, -0.12, 0.7]}>
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.06, 0.7, 0.06]} />
            <meshStandardMaterial
              color="#dfc690"
              metalness={0.65}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.66, 0.06, 0.06]} />
          <meshStandardMaterial
            color="#dfc690"
            metalness={0.65}
            roughness={0.2}
          />
        </mesh>
      </group>
      <mesh position={[-0.45, 0.02, -0.35]}>
        <boxGeometry args={[0.55, 0.35, 0.25]} />
        <meshStandardMaterial color="#e9dfc6" roughness={0.5} />
      </mesh>
      <group position={[0.8, 0.45, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.09, 40]} />
          <meshStandardMaterial color="#f1e8d1" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 0.22, 16]} />
          <meshStandardMaterial
            color="#dfc690"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 3) * 0.6,
              -0.09,
              Math.sin((i * Math.PI) / 3) * 0.6,
            ]}
          >
            <cylinderGeometry args={[0.09, 0.09, 0.2, 16]} />
            <meshStandardMaterial color="#315d4f" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {[
        [-1.8, -0.35, -0.85],
        [0.35, 0.3, -0.95],
        [1.75, 0.35, -0.35],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
            <meshStandardMaterial color="#d2b674" />
          </mesh>
          <mesh position={[0, 0.3, 0]} scale={[1, 1.5, 1]}>
            <sphereGeometry args={[0.17, 16, 12]} />
            <meshStandardMaterial color="#729079" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onFailure);
    return () => canvas.removeEventListener('webglcontextlost', onFailure);
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
      camera={{ position: [4.7, 4.5, 6.5], fov: 37 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={fallback}
    >
      <hemisphereLight args={['#fff4de', '#164d40', 2.5]} />
      <directionalLight position={[2, 5, 3]} intensity={3} color="#fff0d5" />
      <directionalLight position={[-3, 2, -2]} intensity={2} color="#91c9b4" />
      <GuestJourney />
      <ContextGuard onFailure={onFailure} />
    </Canvas>
  );
}
