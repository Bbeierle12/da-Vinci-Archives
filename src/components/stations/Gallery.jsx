import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useDataStore, useWorkshopStore } from '../../stores';
import useMaterials from '../../hooks/useMaterials';

/**
 * Status indicator colors
 */
const STATUS_COLORS = {
  planning: 0x6699cc,  // Blue
  active: 0xc9a227,    // Gold
  complete: 0x5a8f5a,  // Green
};

/**
 * Single easel with a painting canvas
 */
function Easel({ painting, position = [0, 0, 0], onClick }) {
  const groupRef = useRef();
  const { wood, parchment } = useMaterials();
  const hoveredId = useWorkshopStore((s) => s.hoveredId);
  const setHovered = useWorkshopStore((s) => s.setHovered);

  const isHovered = hoveredId === painting.id;

  // Subtle hover animation
  useFrame(() => {
    if (groupRef.current) {
      const targetY = isHovered ? 0.05 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  const canvasWidth = 0.8;
  const canvasHeight = 1;
  const statusColor = STATUS_COLORS[painting.status] || STATUS_COLORS.planning;

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Easel frame - A-frame legs */}
        <mesh position={[-0.3, 0.6, 0.1]} rotation={[0, 0, 0.15]} castShadow>
          <boxGeometry args={[0.04, 1.4, 0.04]} />
          <primitive object={wood} attach="material" />
        </mesh>
        <mesh position={[0.3, 0.6, 0.1]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.04, 1.4, 0.04]} />
          <primitive object={wood} attach="material" />
        </mesh>
        {/* Back leg */}
        <mesh position={[0, 0.5, 0.35]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <primitive object={wood} attach="material" />
        </mesh>

        {/* Cross bar */}
        <mesh position={[0, 0.5, 0.1]} castShadow>
          <boxGeometry args={[0.7, 0.04, 0.04]} />
          <primitive object={wood} attach="material" />
        </mesh>

        {/* Canvas ledge */}
        <mesh position={[0, 0.8, 0.05]} castShadow>
          <boxGeometry args={[0.9, 0.04, 0.08]} />
          <primitive object={wood} attach="material" />
        </mesh>

        {/* Canvas */}
        <mesh
          position={[0, 1.3, 0]}
          onPointerEnter={() => setHovered(painting.id)}
          onPointerLeave={() => setHovered(null)}
          onClick={onClick}
        >
          <boxGeometry args={[canvasWidth, canvasHeight, 0.03]} />
          <primitive object={parchment} attach="material" />
        </mesh>

        {/* Canvas frame */}
        <mesh position={[0, 1.3, 0.02]}>
          <boxGeometry args={[canvasWidth + 0.06, canvasHeight + 0.06, 0.02]} />
          <meshStandardMaterial color={0x5c4033} />
        </mesh>

        {/* Status indicator dot */}
        <mesh position={[canvasWidth / 2 - 0.08, 1.3 + canvasHeight / 2 - 0.08, 0.04]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
          />
        </mesh>

        {/* Hover highlight */}
        {isHovered && (
          <mesh position={[0, 1.3, -0.02]}>
            <boxGeometry args={[canvasWidth + 0.12, canvasHeight + 0.12, 0.01]} />
            <meshBasicMaterial color={0xc9a227} transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Empty easel placeholder when no paintings exist
 */
function EmptyEasel({ position = [0, 0, 0], message = 'No paintings' }) {
  const { wood, parchment } = useMaterials();

  return (
    <group position={position}>
      {/* Simplified easel */}
      <mesh position={[-0.25, 0.6, 0.1]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.04, 1.2, 0.04]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[0.25, 0.6, 0.1]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[0.04, 1.2, 0.04]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Empty canvas with question mark styling */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial color={0x3a3530} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Gallery station - displays paintings on easels
 */
export default function Gallery(props) {
  const paintings = useDataStore((s) => s.paintings);
  const setSelected = useWorkshopStore((s) => s.setSelected);

  // Arrange easels in a curved row
  const easelSpacing = 2.5;
  const curveRadius = 6;

  return (
    <group {...props}>
      {paintings.length > 0 ? (
        paintings.map((painting, i) => {
          // Arrange in an arc
          const totalAngle = Math.min(paintings.length - 1, 4) * 0.25;
          const angle = paintings.length > 1
            ? -totalAngle / 2 + (i / (paintings.length - 1)) * totalAngle
            : 0;

          const x = Math.sin(angle) * curveRadius;
          const z = Math.cos(angle) * curveRadius - curveRadius;

          return (
            <Easel
              key={painting.id}
              painting={painting}
              position={[x, 0, z]}
              onClick={() => setSelected(painting.id)}
            />
          );
        })
      ) : (
        // Show empty easels when no paintings
        <>
          <EmptyEasel position={[-2, 0, 0]} />
          <EmptyEasel position={[0, 0, 0]} />
          <EmptyEasel position={[2, 0, 0]} />
        </>
      )}

      {/* Gallery ambient - small table with supplies */}
      <mesh position={[0, 0.4, 3]} castShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.8, 8]} />
        <meshStandardMaterial color={0x5c4033} />
      </mesh>
    </group>
  );
}
