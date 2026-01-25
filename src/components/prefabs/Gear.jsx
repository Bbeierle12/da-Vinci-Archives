import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import { useGearGeometry } from '../../hooks/useGeometries';
import useMaterials from '../../hooks/useMaterials';

/**
 * Animated gear component
 *
 * @param {Object} props
 * @param {number} [props.radius=0.5] - Outer radius
 * @param {number} [props.teeth=12] - Number of teeth
 * @param {number} [props.thickness=0.1] - Gear thickness
 * @param {number} [props.speed=0.3] - Rotation speed (rad/s), 0 for static
 * @param {boolean} [props.clockwise=true] - Rotation direction
 */
export default function Gear({
  radius = 0.5,
  teeth = 12,
  thickness = 0.1,
  speed = 0.3,
  clockwise = true,
  ...props
}) {
  const ref = useRef();
  const geometry = useGearGeometry(radius, teeth, thickness);
  const { brass } = useMaterials();

  useFrame((_, delta) => {
    if (ref.current && speed) {
      const direction = clockwise ? 1 : -1;
      ref.current.rotation.z += speed * delta * direction;
    }
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={brass}
      castShadow
      receiveShadow
      {...props}
    />
  );
}
