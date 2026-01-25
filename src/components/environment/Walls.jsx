import useMaterials from '../../hooks/useMaterials';

/**
 * Workshop walls - stone/plaster appearance
 */
export default function Walls() {
  const { stone } = useMaterials();

  const wallHeight = 6;
  const roomSize = 25;

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
        <planeGeometry args={[roomSize, wallHeight]} />
        <primitive object={stone} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-roomSize / 2, wallHeight / 2, 0]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[roomSize, wallHeight]} />
        <primitive object={stone} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[roomSize / 2, wallHeight / 2, 0]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[roomSize, wallHeight]} />
        <primitive object={stone} attach="material" />
      </mesh>
    </group>
  );
}
