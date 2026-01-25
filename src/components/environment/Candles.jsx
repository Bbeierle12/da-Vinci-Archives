import { Candle } from '../prefabs';

/**
 * Positioned candles throughout the workshop
 */
export default function Candles() {
  // Candle positions and configurations
  const candles = [
    // Near dashboard
    { position: [-2, 1.1, -1.5], height: 0.25 },
    { position: [2, 1.1, -1.5], height: 0.3 },

    // Near gallery
    { position: [-9, 2, -2], height: 0.35 },
    { position: [-9, 2, 2], height: 0.28 },
    { position: [-11, 1.5, 0], height: 0.32 },

    // Near inventory
    { position: [9, 1.8, -1], height: 0.3 },
    { position: [9, 1.8, 1], height: 0.25 },

    // Near plans
    { position: [-1, 1.2, -9], height: 0.3 },
    { position: [1, 1.2, -9], height: 0.28 },

    // Ambient around room
    { position: [-5, 1.5, 5], height: 0.35 },
    { position: [5, 1.5, 5], height: 0.3 },
    { position: [0, 1.5, 8], height: 0.32 },
  ];

  return (
    <group>
      {candles.map((candle, i) => (
        <group key={i} position={candle.position}>
          {/* Candle holder (simple cylinder) */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.1, 12]} />
            <meshStandardMaterial color={0x8b7355} metalness={0.6} roughness={0.4} />
          </mesh>
          <Candle height={candle.height} lit={true} />
        </group>
      ))}
    </group>
  );
}
