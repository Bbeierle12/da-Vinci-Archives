import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useDataStore, useWorkshopStore } from '../../stores';
import { selectUpcomingPlans } from '../../stores/selectors';
import useMaterials from '../../hooks/useMaterials';

/**
 * Rolled scroll/document
 */
function Scroll({ plan, position = [0, 0, 0], rotation = [0, 0, 0], onClick }) {
  const groupRef = useRef();
  const { parchment, darkWood } = useMaterials();
  const hoveredId = useWorkshopStore((s) => s.hoveredId);
  const setHovered = useWorkshopStore((s) => s.setHovered);

  const isHovered = hoveredId === plan.id;
  const isCompleted = plan.completed;

  // Hover animation - slight unroll
  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = isHovered ? 0.1 : 0;
      groupRef.current.rotation.x += (targetRotation - groupRef.current.rotation.x) * 0.1;
    }
  });

  const scrollLength = 0.4;
  const scrollRadius = 0.03;

  return (
    <group position={position} rotation={rotation}>
      <group
        ref={groupRef}
        onPointerEnter={() => setHovered(plan.id)}
        onPointerLeave={() => setHovered(null)}
        onClick={onClick}
      >
        {/* Rolled parchment body */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[scrollRadius, scrollRadius, scrollLength, 16]} />
          <primitive object={parchment} attach="material" />
        </mesh>

        {/* End caps / wooden rollers */}
        <mesh position={[-scrollLength / 2 - 0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[scrollRadius * 1.3, scrollRadius * 1.3, 0.02, 12]} />
          <primitive object={darkWood} attach="material" />
        </mesh>
        <mesh position={[scrollLength / 2 + 0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[scrollRadius * 1.3, scrollRadius * 1.3, 0.02, 12]} />
          <primitive object={darkWood} attach="material" />
        </mesh>

        {/* Completion indicator - wax seal */}
        {isCompleted && (
          <mesh position={[0, scrollRadius + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.005, 12]} />
            <meshStandardMaterial color={0x8b0000} />
          </mesh>
        )}

        {/* Hover glow */}
        {isHovered && (
          <mesh>
            <sphereGeometry args={[scrollRadius * 3, 12, 12]} />
            <meshBasicMaterial color={0xc9a227} transparent opacity={0.2} />
          </mesh>
        )}

        {/* Ribbon tie */}
        <mesh position={[0, scrollRadius, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[scrollRadius + 0.005, 0.003, 8, 16]} />
          <meshStandardMaterial color={isCompleted ? 0x5a8f5a : 0x8b0000} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Drafting/work table with angled surface
 */
function DraftingTable({ position = [0, 0, 0] }) {
  const { wood, darkWood, brass } = useMaterials();

  return (
    <group position={position}>
      {/* Angled work surface */}
      <mesh position={[0, 0.9, 0]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 1.2]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Frame/edge */}
      <mesh position={[0, 0.92, -0.55]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.84, 0.08, 0.04]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Ledge at bottom to hold papers */}
      <mesh position={[0, 0.78, 0.5]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.04, 0.08]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Legs */}
      {[[-0.75, 0.4, -0.4], [0.75, 0.4, -0.4], [-0.75, 0.35, 0.4], [0.75, 0.35, 0.4]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.06, i < 2 ? 0.8 : 0.7, 0.06]} />
          <primitive object={darkWood} attach="material" />
        </mesh>
      ))}

      {/* Cross braces */}
      <mesh position={[0, 0.2, -0.4]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.04]} />
        <primitive object={darkWood} attach="material" />
      </mesh>
      <mesh position={[0, 0.15, 0.4]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.04]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Brass corner accents */}
      {[[-0.88, 0.92, -0.55], [0.88, 0.92, -0.55]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.04, 0.1, 0.04]} />
          <primitive object={brass} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Scroll storage rack
 */
function ScrollRack({ position = [0, 0, 0], children }) {
  const { wood, darkWood } = useMaterials();

  return (
    <group position={position}>
      {/* Side panels */}
      <mesh position={[-0.5, 0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.3]} />
        <primitive object={darkWood} attach="material" />
      </mesh>
      <mesh position={[0.5, 0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.3]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Horizontal dividers */}
      {[0.15, 0.4, 0.65].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.96, 0.02, 0.28]} />
          <primitive object={wood} attach="material" />
        </mesh>
      ))}

      {/* Scrolls placed on rack */}
      {children}
    </group>
  );
}

/**
 * Plans station - drafting table and scroll storage
 */
export default function Plans(props) {
  const plans = useDataStore((s) => s.plans);
  const upcomingPlans = useDataStore(selectUpcomingPlans);
  const setSelected = useWorkshopStore((s) => s.setSelected);

  return (
    <group {...props}>
      {/* Main drafting table */}
      <DraftingTable position={[0, 0, 0]} />

      {/* Currently active plan on table */}
      {upcomingPlans.length > 0 && (
        <group position={[0, 1.05, 0]} rotation={[-0.3, 0, 0]}>
          {/* Unrolled parchment */}
          <mesh>
            <planeGeometry args={[1.2, 0.9]} />
            <meshStandardMaterial color={0xf4e4bc} side={THREE.DoubleSide} />
          </mesh>

          {/* Weights holding it down */}
          {[[-0.5, 0.35, 0.02], [0.5, 0.35, 0.02], [-0.5, -0.35, 0.02], [0.5, -0.35, 0.02]].map((pos, i) => (
            <mesh key={i} position={pos}>
              <cylinderGeometry args={[0.04, 0.05, 0.03, 12]} />
              <meshStandardMaterial color={0x8b7355} metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* Scroll storage rack - to the side */}
      <ScrollRack position={[-1.5, 0, 0.5]}>
        {plans.slice(0, 6).map((plan, i) => {
          const row = Math.floor(i / 2);
          const col = i % 2;
          return (
            <Scroll
              key={plan.id}
              plan={plan}
              position={[-0.2 + col * 0.4, 0.25 + row * 0.25, 0]}
              onClick={() => setSelected(plan.id)}
            />
          );
        })}
      </ScrollRack>

      {/* Quill and ink well */}
      <group position={[0.7, 0.95, -0.3]}>
        {/* Ink well */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
          <meshStandardMaterial color={0x1a1510} />
        </mesh>
        {/* Ink */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
          <meshStandardMaterial color={0x000020} />
        </mesh>
        {/* Quill */}
        <mesh position={[0.08, 0.1, 0]} rotation={[0.3, 0, 0.5]}>
          <coneGeometry args={[0.005, 0.2, 6]} />
          <meshStandardMaterial color={0xf5f5dc} />
        </mesh>
      </group>

      {/* Compass/divider tool */}
      <group position={[-0.6, 0.95, -0.2]} rotation={[0, 0.3, 0]}>
        <mesh rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.01, 0.15, 0.01]} />
          <meshStandardMaterial color={0xc9a227} metalness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.01, 0.15, 0.01]} />
          <meshStandardMaterial color={0xc9a227} metalness={0.8} />
        </mesh>
      </group>

      {/* Empty state message area */}
      {plans.length === 0 && (
        <group position={[0, 1.05, 0]} rotation={[-0.3, 0, 0]}>
          <mesh>
            <planeGeometry args={[1, 0.7]} />
            <meshStandardMaterial color={0x3a3530} transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}
