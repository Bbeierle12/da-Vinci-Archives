import useMaterials from '../../hooks/useMaterials';

/**
 * Workshop floor with wooden planks appearance
 */
export default function Floor() {
  const { wood } = useMaterials();

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <primitive object={wood} attach="material" />
    </mesh>
  );
}
