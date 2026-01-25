import useMaterials from '../../hooks/useMaterials';

/**
 * Wooden ceiling beams for the workshop
 */
export default function CeilingBeams() {
  const { darkWood } = useMaterials();

  const beamWidth = 0.3;
  const beamHeight = 0.4;
  const roomSize = 25;
  const ceilingHeight = 5.5;
  const beamCount = 5;

  const beams = [];
  for (let i = 0; i < beamCount; i++) {
    const z = -roomSize / 2 + (roomSize / (beamCount + 1)) * (i + 1);
    beams.push({ z, key: `beam-${i}` });
  }

  return (
    <group>
      {beams.map(({ z, key }) => (
        <mesh key={key} position={[0, ceilingHeight, z]} castShadow>
          <boxGeometry args={[roomSize, beamHeight, beamWidth]} />
          <primitive object={darkWood} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
