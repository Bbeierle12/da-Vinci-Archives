import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Shared materials for the workshop
 * Memoized to prevent recreation on every render
 */
export default function useMaterials() {
  return useMemo(() => ({
    // Metals
    brass: new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      metalness: 0.85,
      roughness: 0.25,
    }),
    darkBrass: new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      metalness: 0.7,
      roughness: 0.35,
    }),
    copper: new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.8,
      roughness: 0.3,
    }),

    // Woods
    wood: new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      roughness: 0.8,
      metalness: 0.1,
    }),
    darkWood: new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.85,
      metalness: 0.05,
    }),

    // Stone & surfaces
    stone: new THREE.MeshStandardMaterial({
      color: 0x4a4540,
      roughness: 0.9,
    }),
    parchment: new THREE.MeshStandardMaterial({
      color: 0xf4e4bc,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),

    // Glass & liquids
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.1,
      thickness: 0.5,
    }),

    // Candle
    wax: new THREE.MeshStandardMaterial({
      color: 0xfff8dc,
      roughness: 0.6,
    }),
    flame: new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.9,
    }),
  }), []);
}

/**
 * Create a liquid material with specified color
 * @param {number} color - Hex color
 * @param {number} [opacity=0.8]
 */
export function createLiquidMaterial(color, opacity = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.2,
    metalness: 0.1,
  });
}
