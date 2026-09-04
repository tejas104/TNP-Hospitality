'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import { DoubleSide, Group, TextureLoader } from 'three';
import { media } from '@/data/media';

const orbitImages = [
  'palace-courtyard',
  'tablescape',
  'wedding-couple',
  'floral',
  'event-hall',
  'hostess',
  'ballroom',
  'terrace',
].map((id) => media.find((item) => item.id === id)?.src ?? media[0].src);

const particlePoints = Array.from({ length: 90 }, (_, index) => {
  const seed = Math.sin(index * 999) * 10000;
  const value = seed - Math.floor(seed);
  const valueB = Math.sin((index + 17) * 321) * 10000;
  const valueC = valueB - Math.floor(valueB);
  const valueD = Math.sin((index + 31) * 123) * 10000;
  const valueE = valueD - Math.floor(valueD);

  return {
    id: index,
    x: (value - 0.5) * 8,
    y: (valueC - 0.5) * 5,
    z: (valueE - 0.5) * 4,
    s: 0.01 + value * 0.025,
  };
});

export default function EventOrbit() {
  return (
    <div className="event-orbit" aria-hidden="true">
      <Canvas dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0.35, 8.2]} fov={34} />
          <ambientLight intensity={1.25} />
          <pointLight position={[3, 4, 4]} color="#BBA879" intensity={1.3} />
          <pointLight position={[-4, -2, 3]} color="#0F6B68" intensity={1.1} />
          <OrbitGroup />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}

function OrbitGroup() {
  const group = useRef<Group>(null);
  const { pointer, viewport } = useThree();
  const textures = useLoader(TextureLoader, orbitImages, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  const planes = useMemo(
    () =>
      textures.map((texture, index) => {
        const angle = (index / textures.length) * Math.PI * 2;
        const radiusX = 3.25 + (index % 2) * 0.7;
        const radiusZ = 1.2 + (index % 3) * 0.38;
        return {
          texture,
          x: Math.cos(angle) * radiusX,
          y: Math.sin(angle * 1.7) * 0.9,
          z: Math.sin(angle) * radiusZ,
          rotY: -angle + Math.PI / 2,
          scale: index % 3 === 0 ? [1.75, 2.28, 1] : [2.25, 1.48, 1],
        };
      }),
    [textures],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.07;
    group.current.rotation.x += (pointer.y * 0.08 - group.current.rotation.x) * 0.04;
    group.current.position.x += (pointer.x * viewport.width * 0.035 - group.current.position.x) * 0.05;
  });

  return (
    <group ref={group}>
      {planes.map((plane, index) => (
        <Float
          key={plane.texture.uuid}
          speed={0.85}
          rotationIntensity={0.08}
          floatIntensity={0.16}
          floatingRange={[-0.08, 0.08]}
        >
          <mesh
            position={[plane.x, plane.y, plane.z]}
            rotation={[0.04 * Math.sin(index), plane.rotY, 0.03 * Math.cos(index)]}
          >
            <planeGeometry args={plane.scale as [number, number, number]} />
            <meshBasicMaterial
              map={plane.texture}
              transparent
              opacity={0.88}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Particles() {
  return (
    <group>
      {particlePoints.map((point) => (
        <mesh key={point.id} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[point.s, 8, 8]} />
          <meshBasicMaterial color="#E5E1CD" transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}
