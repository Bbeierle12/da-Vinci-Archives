import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import useMaterials from '../../hooks/useMaterials';

/**
 * Candle with animated flame and flickering point light
 *
 * @param {Object} props
 * @param {boolean} [props.lit=true] - Whether candle is lit
 * @param {number} [props.height=0.3] - Candle body height
 * @param {number} [props.radius=0.03] - Candle body radius
 */
export default function Candle({ lit = true, height = 0.3, radius = 0.03, ...props }) {
  const flameRef = useRef();
  const lightRef = useRef();
  const { wax, flame } = useMaterials();

  useFrame(({ clock }) => {
    if (!lit) return;

    const t = clock.getElapsedTime();

    // Flame flicker - scale and slight movement
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 8) * 0.2 + Math.sin(t * 13) * 0.1;
      flameRef.current.scale.x = 1 + Math.sin(t * 7) * 0.1;
      flameRef.current.position.x = Math.sin(t * 5) * 0.003;
    }

    // Light intensity flicker
    if (lightRef.current) {
      lightRef.current.intensity = 0.7 + Math.sin(t * 5) * 0.15 + Math.sin(t * 11) * 0.08;
    }
  });

  const flameHeight = 0.08;
  const wickHeight = 0.02;

  return (
    <group {...props}>
      {/* Candle body */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius * 1.1, height, 12]} />
        <primitive object={wax} attach="material" />
      </mesh>

      {/* Wick */}
      <mesh position={[0, height / 2 + wickHeight / 2, 0]}>
        <cylinderGeometry args={[0.002, 0.002, wickHeight, 6]} />
        <meshBasicMaterial color={0x333333} />
      </mesh>

      {lit && (
        <>
          {/* Flame - elongated cone */}
          <mesh
            ref={flameRef}
            position={[0, height / 2 + wickHeight + flameHeight / 2, 0]}
          >
            <coneGeometry args={[0.015, flameHeight, 8]} />
            <primitive object={flame} attach="material" />
          </mesh>

          {/* Inner flame (brighter core) */}
          <mesh position={[0, height / 2 + wickHeight + flameHeight * 0.3, 0]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color={0xffffcc} transparent opacity={0.9} />
          </mesh>

          {/* Point light */}
          <pointLight
            ref={lightRef}
            position={[0, height / 2 + flameHeight, 0]}
            color={0xffaa55}
            intensity={0.8}
            distance={5}
            decay={2}
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
          />
        </>
      )}
    </group>
  );
}
