import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { useDataStore, useWorkshopStore } from '../../stores';
import { selectLowStockSupplies } from '../../stores/selectors';
import useMaterials, { createLiquidMaterial } from '../../hooks/useMaterials';

/**
 * Glass vessel/bottle showing supply level
 */
function Vessel({ supply, position = [0, 0, 0], onClick }) {
  const groupRef = useRef();
  const { glass } = useMaterials();
  const hoveredId = useWorkshopStore((s) => s.hoveredId);
  const setHovered = useWorkshopStore((s) => s.setHovered);

  const isHovered = hoveredId === supply.id;
  const isLow = supply.quantity <= supply.lowThreshold;

  // Fill level 0-1
  const fillLevel = Math.min(1, Math.max(0, supply.quantity / 100));

  // Vessel dimensions
  const vesselHeight = 0.4;
  const vesselRadius = 0.08;
  const liquidHeight = vesselHeight * 0.7 * fillLevel;

  // Liquid color from supply or default
  const liquidColor = supply.color || (isLow ? 0xcc4444 : 0x1e4d8c);

  // Hover animation
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isHovered ? 1.1 : 1;
      groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * 0.1;
      groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * 0.1;
      groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * 0.1;
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerEnter={() => setHovered(supply.id)}
        onPointerLeave={() => setHovered(null)}
        onClick={onClick}
      >
        {/* Glass container */}
        <mesh>
          <cylinderGeometry args={[vesselRadius, vesselRadius * 1.2, vesselHeight, 16, 1, true]} />
          <primitive object={glass} attach="material" />
        </mesh>

        {/* Bottom */}
        <mesh position={[0, -vesselHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[vesselRadius * 1.2, 16]} />
          <primitive object={glass} attach="material" />
        </mesh>

        {/* Liquid */}
        {fillLevel > 0 && (
          <mesh position={[0, -vesselHeight / 2 + liquidHeight / 2 + 0.02, 0]}>
            <cylinderGeometry args={[vesselRadius * 0.95, vesselRadius * 1.15, liquidHeight, 16]} />
            <meshStandardMaterial
              color={liquidColor}
              transparent
              opacity={0.8}
              roughness={0.2}
            />
          </mesh>
        )}

        {/* Neck */}
        <mesh position={[0, vesselHeight / 2 + 0.05, 0]}>
          <cylinderGeometry args={[vesselRadius * 0.4, vesselRadius * 0.6, 0.1, 12]} />
          <primitive object={glass} attach="material" />
        </mesh>

        {/* Cork */}
        <mesh position={[0, vesselHeight / 2 + 0.12, 0]}>
          <cylinderGeometry args={[vesselRadius * 0.35, vesselRadius * 0.4, 0.08, 12]} />
          <meshStandardMaterial color={0x8b6914} roughness={0.9} />
        </mesh>

        {/* Low stock warning glow */}
        {isLow && (
          <pointLight
            position={[0, 0, 0]}
            color={0xff4444}
            intensity={0.3}
            distance={0.5}
          />
        )}

        {/* Hover highlight */}
        {isHovered && (
          <mesh>
            <sphereGeometry args={[vesselRadius * 2, 16, 16]} />
            <meshBasicMaterial color={0xc9a227} transparent opacity={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Storage cabinet/shelf unit
 */
function Cabinet({ position = [0, 0, 0], children }) {
  const { darkWood, wood } = useMaterials();

  const width = 2.5;
  const height = 2;
  const depth = 0.5;
  const shelfCount = 3;

  return (
    <group position={position}>
      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.02]} castShadow>
        <boxGeometry args={[width, height, 0.04]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Side panels */}
      <mesh position={[-width / 2 + 0.02, height / 2, 0]} castShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[width / 2 - 0.02, height / 2, 0]} castShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Shelves */}
      {Array.from({ length: shelfCount + 1 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, (i / shelfCount) * height, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width - 0.04, 0.03, depth]} />
          <primitive object={wood} attach="material" />
        </mesh>
      ))}

      {/* Content positioned on shelves */}
      {children}
    </group>
  );
}

/**
 * Inventory station - cabinet with supply vessels
 */
export default function Inventory(props) {
  const supplies = useDataStore((s) => s.supplies);
  const lowStock = useDataStore(selectLowStockSupplies);
  const setSelected = useWorkshopStore((s) => s.setSelected);

  // Arrange supplies on shelves
  const itemsPerShelf = 5;
  const shelfHeight = 2 / 3; // Cabinet height / shelves
  const startX = -1;
  const spacing = 0.5;

  return (
    <group {...props}>
      <Cabinet position={[0, 0, 0]}>
        {supplies.map((supply, i) => {
          const shelf = Math.floor(i / itemsPerShelf);
          const slot = i % itemsPerShelf;
          const x = startX + slot * spacing;
          const y = 0.3 + shelf * shelfHeight;

          return (
            <Vessel
              key={supply.id}
              supply={supply}
              position={[x, y, 0.1]}
              onClick={() => setSelected(supply.id)}
            />
          );
        })}

        {/* Empty state - show placeholder vessels */}
        {supplies.length === 0 && (
          <>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[-0.5 + i * 0.5, 0.3, 0.1]}>
                <cylinderGeometry args={[0.06, 0.08, 0.3, 12]} />
                <meshStandardMaterial color={0x3a3530} transparent opacity={0.3} />
              </mesh>
            ))}
          </>
        )}
      </Cabinet>

      {/* Work table in front */}
      <mesh position={[0, 0.45, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.06, 0.8]} />
        <meshStandardMaterial color={0x8b6914} roughness={0.8} />
      </mesh>
      {/* Table legs */}
      {[[-0.7, 0.22, 0.9], [0.7, 0.22, 0.9], [-0.7, 0.22, 1.5], [0.7, 0.22, 1.5]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.06, 0.44, 0.06]} />
          <meshStandardMaterial color={0x5c4033} />
        </mesh>
      ))}

      {/* Low stock warning indicator */}
      {lowStock.length > 0 && (
        <group position={[1.5, 1.5, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={0xff4444}
              emissive={0xff4444}
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight color={0xff4444} intensity={0.5} distance={2} />
        </group>
      )}
    </group>
  );
}
