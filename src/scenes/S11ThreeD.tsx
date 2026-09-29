import React, { useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, FONTS } from '../tokens';
import { mulberry32 } from '../lib/rand';

/**
 * 11 — 3D
 * @remotion/three + @react-three/fiber: chrome torus knot, glass sphere,
 * instanced metallic pillars, soft shadows, a procedural studio environment
 * (PMREM baked from an emissive light rig — no HDR downloads, fully offline),
 * and a frame-driven camera dolly. Not a spinning cube.
 */

/** Bakes an offline environment map and applies it to the scene. */
const EnvProvider: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const mk = (color: string, intensity: number, w: number, h: number, pos: [number, number, number], rot: [number, number, number]) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(...pos);
      m.rotation.set(...rot);
      envScene.add(m);
    };
    // top key light (warm), orange rim left, cool fill right, dim floor bounce
    mk('#fff4e8', 30, 12, 12, [0, 7, 0], [Math.PI / 2, 0, 0]);
    mk('#ff4a1f', 14, 5, 16, [-9, 2, -2], [0, Math.PI / 2, 0]);
    mk('#cfe8ff', 9, 5, 16, [9, 2, 2], [0, -Math.PI / 2, 0]);
    mk('#ffffff', 3, 18, 18, [0, -4, 0], [-Math.PI / 2, 0, 0]);
    mk('#ffffff', 6, 6, 6, [0, 2, -9], [0, 0, 0]);

    const rt = pmrem.fromScene(envScene, 0.05);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

const SceneContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const pillarsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const pillars = useMemo(() => {
    const rnd = mulberry32(2024);
    const arr: { x: number; z: number; h: number }[] = [];
    for (let gx = -5; gx <= 5; gx++) {
      for (let gz = -5; gz <= 5; gz++) {
        if (Math.hypot(gx, gz) < 2.3) continue;
        arr.push({ x: gx * 2.2, z: gz * 2.2, h: 0.5 + rnd() * 2.8 });
      }
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    if (!pillarsRef.current) return;
    pillars.forEach((p, i) => {
      dummy.position.set(p.x, p.h / 2, p.z - 2);
      dummy.scale.set(0.42, p.h, 0.42);
      dummy.updateMatrix();
      pillarsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    pillarsRef.current.instanceMatrix.needsUpdate = true;
  }, [pillars, dummy]);

  const spin = t * 0.55;
  const camA = t * 0.16;
  const camR = interpolate(frame, [0, 350], [11.5, 7.4], { easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp' });
  const camY = 2.5 + Math.sin(t * 0.35) * 0.55;

  return (
    <>
      <color attach="background" args={['#0A0A0C']} />
      <fog attach="fog" args={['#0A0A0C', 14, 30]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[6, 11, 5]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
      />
      <pointLight position={[-7, 3.2, -4]} intensity={22} color="#ff4a1f" distance={22} />

      {/* chrome torus knot — the hero object */}
      <mesh position={[0, 2.15, 0]} rotation={[spin * 0.35, spin, 0]} castShadow>
        <torusKnotGeometry args={[1.05, 0.34, 220, 36]} />
        <meshStandardMaterial color="#e8e4dc" metalness={1} roughness={0.16} envMapIntensity={1.9} />
      </mesh>

      {/* glass sphere */}
      <mesh position={[2.8, 0.9, 1.7]}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshPhysicalMaterial transmission={1} thickness={1.5} roughness={0.05} ior={1.45} color="#ffffff" envMapIntensity={1.25} />
      </mesh>

      {/* accent sphere */}
      <mesh position={[-3.0, 0.62, 2.0]}>
        <sphereGeometry args={[0.6, 48, 48]} />
        <meshStandardMaterial color="#ff4a1f" metalness={0.4} roughness={0.28} />
      </mesh>

      {/* instanced pillars */}
      <instancedMesh ref={pillarsRef} args={[undefined as any, undefined as any, pillars.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8f8b84" metalness={0.93} roughness={0.3} envMapIntensity={1.15} />
      </instancedMesh>

      {/* reflective-ish floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#0f0f11" metalness={0.75} roughness={0.4} envMapIntensity={0.8} />
      </mesh>

      <CameraRig angle={camA} radius={camR} y={camY} />
    </>
  );
};

const CameraRig: React.FC<{ angle: number; radius: number; y: number }> = ({ angle, radius, y }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
    camera.lookAt(0, 1.7, 0);
  });
  return null;
};

export const S11ThreeD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas
        width={1920}
        height={1080}
        frameloop="always"
        shadows
        camera={{ fov: 42, position: [0, 2.5, 11.5] }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <EnvProvider />
        <SceneContent />
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: 96, bottom: 88, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted, letterSpacing: '0.18em' }}>
        R3F — CHROME · GLASS · INSTANCING · SHADOWS · PROCEDURAL LIGHT RIG
      </div>
    </AbsoluteFill>
  );
};
