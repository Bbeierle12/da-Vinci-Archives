import { Gear } from '../prefabs';

/**
 * Decorative gears mounted on walls and surfaces
 */
export default function DecorativeGears() {
  // Wall-mounted decorative gears
  const gears = [
    // Back wall cluster
    { position: [-3, 3.5, -12.4], rotation: [0, 0, 0], radius: 0.8, teeth: 16, speed: 0.2 },
    { position: [-1.5, 3, -12.4], rotation: [0, 0, 0.3], radius: 0.5, teeth: 10, speed: -0.35 },
    { position: [-2, 4.2, -12.4], rotation: [0, 0, 0.1], radius: 0.4, teeth: 8, speed: 0.4 },

    // Right side
    { position: [12.4, 2.5, -3], rotation: [0, -Math.PI / 2, 0], radius: 0.6, teeth: 12, speed: 0.25 },
    { position: [12.4, 3.3, -2], rotation: [0, -Math.PI / 2, 0.2], radius: 0.35, teeth: 8, speed: -0.5 },

    // Left side
    { position: [-12.4, 3, 4], rotation: [0, Math.PI / 2, 0], radius: 0.7, teeth: 14, speed: 0.18 },
    { position: [-12.4, 3.8, 3], rotation: [0, Math.PI / 2, 0.15], radius: 0.45, teeth: 10, speed: -0.3 },

    // Near ceiling
    { position: [5, 5, -8], rotation: [Math.PI / 2, 0, 0], radius: 1, teeth: 20, speed: 0.1 },
    { position: [6.2, 5, -7], rotation: [Math.PI / 2, 0, 0], radius: 0.6, teeth: 12, speed: -0.18 },
  ];

  return (
    <group>
      {gears.map((gear, i) => (
        <Gear
          key={i}
          position={gear.position}
          rotation={gear.rotation}
          radius={gear.radius}
          teeth={gear.teeth}
          speed={gear.speed}
          thickness={0.08}
        />
      ))}
    </group>
  );
}
