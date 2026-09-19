'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  CatmullRomCurve3,
  Group,
  InstancedMesh,
  MathUtils,
  Object3D,
  Vector3,
} from 'three';
import { probeWebGL2 } from './webgl';

// Original TNP event canopy: brass ribs and suspended ivory lights gather above
// a venue dais. Four different tokens orbit it; these are illustrative roles,
// never a visualization of people, tracking, availability or production data.
function CelebrationConstellation() {
  const canopy = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const pendants = useRef<InstancedMesh>(null);
  const clock = useRef(0);
  const finePointer = useRef(false);
  useEffect(() => {
    const query = matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => {
      finePointer.current = query.matches;
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const ribs = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index * Math.PI) / 6;
        return new CatmullRomCurve3([
          new Vector3(Math.cos(angle) * 0.12, 1.65, Math.sin(angle) * 0.12),
          new Vector3(Math.cos(angle) * 0.58, 1.35, Math.sin(angle) * 0.58),
          new Vector3(Math.cos(angle) * 1.36, 0.75, Math.sin(angle) * 1.36),
          new Vector3(Math.cos(angle) * 1.42, 0.35, Math.sin(angle) * 1.42),
          new Vector3(Math.cos(angle) * 1.02, -0.05, Math.sin(angle) * 1.02),
        ]);
      }),
    [],
  );
  useLayoutEffect(() => {
    if (!pendants.current) return;
    const dummy = new Object3D();
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      const inner = i % 2 === 0;
      dummy.position.set(
        Math.cos(angle) * (inner ? 0.76 : 1.18),
        inner ? -0.46 : -0.2,
        Math.sin(angle) * (inner ? 0.76 : 1.18),
      );
      dummy.scale.set(0.047, inner ? 0.23 : 0.16, 0.047);
      dummy.updateMatrix();
      pendants.current.setMatrixAt(i, dummy.matrix);
    }
    pendants.current.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(({ pointer }, delta) => {
    const step = Math.min(delta, 0.05);
    clock.current += step;
    if (canopy.current) {
      canopy.current.rotation.y = MathUtils.damp(
        canopy.current.rotation.y,
        -0.15 + (finePointer.current ? pointer.x * 0.1 : 0),
        3,
        step,
      );
      canopy.current.position.y = Math.sin(clock.current * 0.32) * 0.045;
    }
    if (orbit.current) orbit.current.rotation.y = clock.current * 0.035;
  });
  return (
    <group position={[0, 0.05, 0]}>
      <group ref={canopy} rotation={[0, -0.15, 0]}>
        {ribs.map((curve, index) => (
          <mesh key={index}>
            <tubeGeometry args={[curve, 48, 0.014, 6, false]} />
            <meshStandardMaterial
              color="#dcc38a"
              metalness={0.72}
              roughness={0.3}
            />
          </mesh>
        ))}
        {[
          [1.42, 0.35],
          [1.02, -0.05],
          [0.23, 1.6],
        ].map(([radius, y]) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.022, 8, 72]} />
            <meshStandardMaterial
              color="#edd49b"
              metalness={0.7}
              roughness={0.26}
            />
          </mesh>
        ))}
        <instancedMesh ref={pendants} args={[undefined, undefined, 24]}>
          <sphereGeometry args={[1, 10, 12]} />
          <meshStandardMaterial
            color="#fff2cf"
            emissive="#edd49b"
            emissiveIntensity={0.7}
            metalness={0.25}
            roughness={0.22}
          />
        </instancedMesh>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 6) * 0.76,
              -0.13,
              Math.sin((i * Math.PI) / 6) * 0.76,
            ]}
          >
            <cylinderGeometry args={[0.004, 0.004, 0.6, 4]} />
            <meshBasicMaterial color="#bcad83" transparent opacity={0.65} />
          </mesh>
        ))}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 2.3, 6]} />
          <meshStandardMaterial
            color="#dcc38a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.62, 0]} scale={[1, 1.4, 1]}>
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial
            color="#fff0cf"
            emissive="#d8ae60"
            emissiveIntensity={0.45}
            metalness={0.45}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, -1.06, 0]}>
          <cylinderGeometry args={[1.28, 1.36, 0.07, 64]} />
          <meshStandardMaterial
            color="#008080"
            metalness={0.45}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.28, 0.012, 6, 72]} />
          <meshStandardMaterial
            color="#ddc28a"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, -1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 48]} />
          <meshBasicMaterial color="#d9c795" transparent opacity={0.12} />
        </mesh>
      </group>
      <group rotation={[0.13, 0, -0.13]} position={[0, -0.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1, 1]}>
          <torusGeometry args={[2.02, 0.006, 5, 112]} />
          <meshBasicMaterial color="#c9b482" transparent opacity={0.55} />
        </mesh>
        <group ref={orbit}>
          {[0, 1, 2, 3].map((index) => (
            <group
              key={index}
              position={[
                Math.cos((index * Math.PI) / 2) * 2.4,
                0,
                Math.sin((index * Math.PI) / 2) * 2,
              ]}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.24, 0.24, 0.025, 32]} />
                <meshStandardMaterial
                  color="#008080"
                  metalness={0.5}
                  roughness={0.35}
                />
              </mesh>
              <mesh rotation={[0, 0, 0]}>
                <torusGeometry args={[0.24, 0.012, 6, 32]} />
                <meshStandardMaterial
                  color="#e3c98f"
                  metalness={0.55}
                  roughness={0.25}
                />
              </mesh>
              {index === 0 ? (
                [-0.09, 0, 0.09].map((x, i) => (
                  <mesh key={x} position={[x, i === 1 ? 0.06 : -0.03, 0.04]}>
                    <sphereGeometry args={[0.052, 12, 10]} />
                    <meshStandardMaterial
                      color="#f5e8c4"
                      emissive="#bca16b"
                      emissiveIntensity={0.25}
                    />
                  </mesh>
                ))
              ) : index === 1 ? (
                <mesh rotation={[0, 0, 0.25]}>
                  <boxGeometry args={[0.16, 0.22, 0.035]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.35}
                    roughness={0.3}
                  />
                </mesh>
              ) : index === 2 ? (
                <mesh>
                  <octahedronGeometry args={[0.15]} />
                  <meshStandardMaterial
                    color="#e5bc83"
                    metalness={0.5}
                    roughness={0.25}
                  />
                </mesh>
              ) : (
                <mesh rotation={[Math.PI / 2, 0, 0.4]}>
                  <torusGeometry args={[0.1, 0.033, 8, 24]} />
                  <meshStandardMaterial
                    color="#eadfc3"
                    metalness={0.65}
                    roughness={0.25}
                  />
                </mesh>
              )}
            </group>
          ))}
        </group>
      </group>
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
      camera={{ position: [3.6, 2.1, 6.6], fov: 42 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={fallback}
    >
      <hemisphereLight args={['#fff4de', '#202020', 2.5]} />
      <directionalLight position={[2, 5, 3]} intensity={3} color="#fff0d5" />
      <directionalLight position={[-3, 2, -2]} intensity={2} color="#ffffff" />
      <CelebrationConstellation />
      <ContextGuard onFailure={onFailure} />
    </Canvas>
  );
}
