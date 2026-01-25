import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { useDataStore } from '../../stores';
import { selectDashboardMetrics } from '../../stores/selectors';
import { Gear } from '../prefabs';
import useMaterials from '../../hooks/useMaterials';

/**
 * Pressure gauge that displays a value 0-100
 */
function PressureGauge({ value = 50, position = [0, 0, 0] }) {
  const needleRef = useRef();
  const { brass, darkBrass } = useMaterials();

  // Needle angle: 0 = -135deg, 100 = 135deg
  const targetAngle = ((value / 100) * 270 - 135) * (Math.PI / 180);

  useFrame(() => {
    if (needleRef.current) {
      // Smooth interpolation to target
      needleRef.current.rotation.z += (targetAngle - needleRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Gauge face */}
      <mesh>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color={0xf4e4bc} />
      </mesh>

      {/* Gauge rim */}
      <mesh>
        <ringGeometry args={[0.14, 0.16, 32]} />
        <primitive object={brass} attach="material" />
      </mesh>

      {/* Needle */}
      <group ref={needleRef}>
        <mesh position={[0, 0.05, 0.01]}>
          <boxGeometry args={[0.01, 0.12, 0.005]} />
          <primitive object={darkBrass} attach="material" />
        </mesh>
      </group>

      {/* Center cap */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.02, 16]} />
        <primitive object={brass} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Flip counter display showing a number
 */
function FlipCounter({ value = 0, digits = 2, position = [0, 0, 0] }) {
  const displayValue = String(Math.floor(value)).padStart(digits, '0');

  return (
    <group position={position}>
      {/* Counter housing */}
      <mesh>
        <boxGeometry args={[digits * 0.12 + 0.04, 0.18, 0.05]} />
        <meshStandardMaterial color={0x2a2520} />
      </mesh>

      {/* Digit windows */}
      {displayValue.split('').map((digit, i) => (
        <group key={i} position={[(i - (digits - 1) / 2) * 0.12, 0, 0.026]}>
          <mesh>
            <planeGeometry args={[0.1, 0.14]} />
            <meshStandardMaterial color={0x1a1510} />
          </mesh>
          {/* We'd use Text here in production - for now just colored boxes */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[0.06, 0.1]} />
            <meshStandardMaterial color={0xc9a227} emissive={0xc9a227} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Central orrery mechanism with rotating gears
 */
function Orrery() {
  const orbitRef = useRef();
  const { brass, wood } = useMaterials();

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Base table */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.3, 0.15, 32]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Table legs */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 1.1, 0.45, Math.sin(angle) * 1.1]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.1, 0.9, 8]} />
            <primitive object={wood} attach="material" />
          </mesh>
        );
      })}

      {/* Central gear */}
      <Gear
        radius={0.6}
        teeth={16}
        thickness={0.12}
        speed={0.3}
        position={[0, 1.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Orbiting arms with smaller gears */}
      <group ref={orbitRef} position={[0, 1.1, 0]}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const radius = 0.9;
          return (
            <group key={i}>
              {/* Arm */}
              <mesh
                position={[Math.cos(angle) * radius * 0.5, 0, Math.sin(angle) * radius * 0.5]}
                rotation={[0, -angle, 0]}
              >
                <boxGeometry args={[radius, 0.02, 0.06]} />
                <primitive object={brass} attach="material" />
              </mesh>

              {/* Satellite gear */}
              <Gear
                radius={0.25}
                teeth={8}
                thickness={0.08}
                speed={-0.6}
                position={[Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius]}
                rotation={[Math.PI / 2, 0, 0]}
              />
            </group>
          );
        })}
      </group>

      {/* Central spindle */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
        <primitive object={brass} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Dashboard station - metrics display with mechanical gauges and orrery
 */
export default function Dashboard(props) {
  const metrics = useDataStore(selectDashboardMetrics);

  // Calculate gauge values from metrics
  const paintingProgress = metrics.totalPaintings > 0
    ? (metrics.byStatus.complete / metrics.totalPaintings) * 100
    : 0;

  const stockLevel = metrics.totalSupplies > 0
    ? Math.max(0, 100 - (metrics.lowStockCount / metrics.totalSupplies) * 100)
    : 100;

  return (
    <group {...props}>
      <Orrery />

      {/* Gauge panel */}
      <group position={[0, 1.8, -0.8]} rotation={[-0.3, 0, 0]}>
        {/* Panel backing */}
        <mesh>
          <boxGeometry args={[1.2, 0.6, 0.05]} />
          <meshStandardMaterial color={0x5c4033} />
        </mesh>

        {/* Paintings gauge */}
        <group position={[-0.35, 0.1, 0.03]}>
          <PressureGauge value={paintingProgress} />
        </group>

        {/* Stock gauge */}
        <group position={[0.35, 0.1, 0.03]}>
          <PressureGauge value={stockLevel} />
        </group>

        {/* Counters */}
        <FlipCounter
          value={metrics.totalPaintings}
          digits={2}
          position={[-0.35, -0.15, 0.03]}
        />
        <FlipCounter
          value={metrics.upcomingPlans}
          digits={2}
          position={[0.35, -0.15, 0.03]}
        />
      </group>

      {/* Side gears */}
      <Gear
        radius={0.4}
        teeth={12}
        speed={0.4}
        position={[-1.2, 1.3, 0.5]}
        rotation={[0, Math.PI / 4, 0]}
      />
      <Gear
        radius={0.3}
        teeth={10}
        speed={-0.5}
        position={[1.2, 1.4, 0.3]}
        rotation={[0, -Math.PI / 6, 0]}
      />
    </group>
  );
}
