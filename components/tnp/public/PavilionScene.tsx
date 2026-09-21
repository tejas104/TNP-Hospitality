'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  type Material,
  SRGBColorSpace,
  TextureLoader,
} from 'three';
import { probeWebGL2 } from './webgl';
import { QUARTER, type CubeMotion } from './hospitality-cube-motion';

// Original image_gen artwork, revised at the user's request to feature a male
// lead Planner. Four illustrative scenes share one 268,216-byte local atlas.
// These are illustrated cube faces, not live event data or animated people.
const ATLAS = '/images/hospitality-cube-worlds.webp';
const QUADRANTS = [
  [0, 0.5],
  [0.5, 0.5],
  [0, 0],
  [0.5, 0],
] as const;

function IllustratedCube({
  motion,
  clock,
  revision,
  onReady,
}: {
  motion: RefObject<CubeMotion>;
  clock: RefObject<number>;
  revision: number;
  onReady: () => void;
}) {
  const root = useRef<Group>(null);
  const atlas = useLoader(TextureLoader, ATLAS);
  useEffect(onReady, [onReady]);
  const { invalidate } = useThree();
  const maps = useMemo(
    () =>
      QUADRANTS.map(([x, y]) => {
        const map = atlas.clone();
        map.colorSpace = SRGBColorSpace;
        // Half-pixel inset prevents adjacent atlas quadrants bleeding at the edge.
        const inset = 0.5 / 1254;
        map.repeat.set(0.5 - inset * 2, 0.5 - inset * 2);
        map.offset.set(x + inset, y + inset);
        map.anisotropy = 4;
        map.needsUpdate = true;
        return map;
      }),
    [atlas],
  );
  const edges = useMemo(() => {
    const box = new BoxGeometry(2.26, 2.26, 2.26);
    const geometry = new EdgesGeometry(box);
    box.dispose();
    return geometry;
  }, []);
  useEffect(
    () => () => {
      maps.forEach((map) => map.dispose());
      edges.dispose();
    },
    [maps, edges],
  );
  // Per-face materials, faded by how directly each face looks at the camera:
  // the presented face is fully opaque, turning faces dissolve toward the side.
  const faces = useRef<Material[][]>([]);
  const pose = useCallback(() => {
    if (!root.current) return;
    const angle = motion.current.angle;
    root.current.rotation.y = -angle;
    faces.current.forEach((materials, index) => {
      const facing = Math.cos(index * QUARTER - angle);
      const t = Math.min(1, Math.max(0, (facing - 0.25) / 0.7));
      const opacity = t * t * (3 - 2 * t);
      materials.forEach((material) => {
        material.opacity = opacity;
        material.visible = opacity > 0.01;
      });
    });
  }, [motion]);
  // `revision` changes whenever the angle moves without a running frame loop.
  useLayoutEffect(() => {
    pose();
    invalidate();
  }, [revision, invalidate, pose]);
  useFrame(() => {
    if (!root.current) return;
    pose();
    root.current.position.y = Math.sin(clock.current * 0.38) * 0.025;
  });
  return (
    <group ref={root}>
      {maps.map((map, index) => (
        <group key={index} rotation={[0, index * QUARTER, 0]}>
          <mesh position={[0, 0, 1.48]}>
            <planeGeometry args={[2.68, 2.68]} />
            <meshStandardMaterial
              ref={(material) => {
                (faces.current[index] ??= [])[0] = material!;
              }}
              color="#c9ad73"
              metalness={0.5}
              roughness={0.38}
              transparent
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0, 1.495]}>
            <planeGeometry args={[2.48, 2.48]} />
            <meshBasicMaterial
              ref={(material) => {
                (faces.current[index] ??= [])[1] = material!;
              }}
              map={map}
              toneMapped={false}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ead6ae" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}
function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const gl = useThree((state) => state.gl);
  const renderer = useRef(gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  useFrame(() => {
    const gl = renderer.current;
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    gl.domElement.dataset.dpr = String(gl.getPixelRatio());
  });
  return null;
}
export default function PavilionScene({
  active,
  fallback,
  onFailure,
  onReady,
  motion,
  clock,
  mobile,
  revision,
}: {
  active: boolean;
  fallback: ReactNode;
  onFailure: () => void;
  onReady: () => void;
  motion: RefObject<CubeMotion>;
  clock: RefObject<number>;
  mobile: boolean;
  revision: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const available = probeWebGL2();
      setSupported(available);
      if (!available) onFailure();
    }, 0);
    return () => clearTimeout(timer);
  }, [onFailure]);
  if (supported !== true) return fallback;
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      camera={{ position: [0, 0, 7.5], fov: 34 }}
      frameloop={active ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'low-power' }}
      fallback={fallback}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0, 0);
      }}
    >
      <hemisphereLight args={['#fff7e7', '#808080', 2]} />
      <directionalLight position={[2, 5, 4]} intensity={3} color="#fff1d8" />
      <IllustratedCube
        motion={motion}
        clock={clock}
        revision={revision}
        onReady={onReady}
      />
      <ContextGuard onFailure={onFailure} />
    </Canvas>
  );
}
