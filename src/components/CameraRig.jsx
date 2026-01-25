import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { useWorkshopStore } from '../stores';

/**
 * Camera positions for each station and overview
 * @type {Record<string, { pos: [number, number, number], lookAt: [number, number, number] }>}
 */
const STATION_CAMERAS = {
  overview: { pos: [0, 5, 12], lookAt: [0, 0, 0] },
  dashboard: { pos: [0, 3, 2], lookAt: [0, 1.5, -2] },
  gallery: { pos: [-6, 3, 0], lookAt: [-10, 2, 0] },
  inventory: { pos: [6, 2.5, 0], lookAt: [10, 1.5, 0] },
  plans: { pos: [0, 3, -6], lookAt: [0, 2, -10] },
};

/** Interpolation speed for camera movement */
const LERP_SPEED = 0.03;

/**
 * Camera controller that handles:
 * - Smooth transitions between stations (fly mode)
 * - Orbit controls when at a station (orbit mode)
 */
export default function CameraRig() {
  const currentStation = useWorkshopStore((s) => s.currentStation);
  const cameraMode = useWorkshopStore((s) => s.cameraMode);

  // Get target camera position
  const target = STATION_CAMERAS[currentStation || 'overview'];

  // Refs for smooth interpolation
  const positionRef = useRef(new THREE.Vector3(...target.pos));
  const lookAtRef = useRef(new THREE.Vector3(...target.lookAt));

  useFrame(({ camera }) => {
    if (cameraMode === 'fly') {
      // Smooth interpolation to target position
      const targetPos = new THREE.Vector3(...target.pos);
      const targetLookAt = new THREE.Vector3(...target.lookAt);

      positionRef.current.lerp(targetPos, LERP_SPEED);
      lookAtRef.current.lerp(targetLookAt, LERP_SPEED);

      camera.position.copy(positionRef.current);
      camera.lookAt(lookAtRef.current);
    }
  });

  // Orbit controls only enabled when in orbit mode at a station
  if (cameraMode === 'orbit' && currentStation) {
    return (
      <OrbitControls
        target={target.lookAt}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        enableDamping
        dampingFactor={0.05}
      />
    );
  }

  return null;
}
