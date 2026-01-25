import Floor from './Floor';
import Walls from './Walls';
import CeilingBeams from './CeilingBeams';
import Candles from './Candles';
import DecorativeGears from './DecorativeGears';

/**
 * Complete workshop environment
 * Contains floor, walls, beams, candles, and decorative elements
 */
export default function Environment() {
  return (
    <group>
      <Floor />
      <Walls />
      <CeilingBeams />
      <Candles />
      <DecorativeGears />
    </group>
  );
}
