import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Create a gear-shaped geometry
 * @param {number} radius - Outer radius
 * @param {number} teeth - Number of teeth
 * @param {number} thickness - Gear thickness
 */
export function useGearGeometry(radius = 0.5, teeth = 12, thickness = 0.1) {
  return useMemo(() => {
    const innerRadius = radius * 0.7;
    const toothHeight = radius * 0.15;
    const toothWidth = (Math.PI * 2) / teeth / 2;

    const shape = new THREE.Shape();

    // Create gear profile
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 1) / teeth) * Math.PI * 2;

      // Tooth base start
      const baseStartX = Math.cos(angle) * innerRadius;
      const baseStartY = Math.sin(angle) * innerRadius;

      // Tooth tip
      const toothMidAngle = angle + toothWidth / 2;
      const tipX = Math.cos(toothMidAngle) * (innerRadius + toothHeight);
      const tipY = Math.sin(toothMidAngle) * (innerRadius + toothHeight);

      // Tooth base end
      const baseEndAngle = angle + toothWidth;
      const baseEndX = Math.cos(baseEndAngle) * innerRadius;
      const baseEndY = Math.sin(baseEndAngle) * innerRadius;

      // Valley to next tooth
      const valleyAngle = nextAngle - toothWidth / 2;
      const valleyX = Math.cos(valleyAngle) * innerRadius;
      const valleyY = Math.sin(valleyAngle) * innerRadius;

      if (i === 0) {
        shape.moveTo(baseStartX, baseStartY);
      } else {
        shape.lineTo(baseStartX, baseStartY);
      }

      shape.lineTo(tipX, tipY);
      shape.lineTo(baseEndX, baseEndY);
      shape.lineTo(valleyX, valleyY);
    }

    shape.closePath();

    // Add center hole
    const holePath = new THREE.Path();
    const holeRadius = innerRadius * 0.3;
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: thickness * 0.1,
      bevelSize: thickness * 0.05,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [radius, teeth, thickness]);
}

/**
 * Create a vessel/bottle shape geometry
 * @param {number} radius - Base radius
 * @param {number} height - Total height
 * @param {number} neckHeight - Height of neck portion
 */
export function useVesselGeometry(radius = 0.3, height = 1, neckHeight = 0.3) {
  return useMemo(() => {
    const points = [];
    const bodyHeight = height - neckHeight;
    const neckRadius = radius * 0.3;

    // Bottom
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(radius * 0.8, 0));

    // Body curve
    points.push(new THREE.Vector2(radius, bodyHeight * 0.2));
    points.push(new THREE.Vector2(radius, bodyHeight * 0.7));

    // Shoulder
    points.push(new THREE.Vector2(radius * 0.6, bodyHeight * 0.9));

    // Neck
    points.push(new THREE.Vector2(neckRadius, bodyHeight));
    points.push(new THREE.Vector2(neckRadius, height - 0.05));

    // Rim
    points.push(new THREE.Vector2(neckRadius * 1.3, height));
    points.push(new THREE.Vector2(0, height));

    return new THREE.LatheGeometry(points, 24);
  }, [radius, height, neckHeight]);
}

/**
 * Create an easel frame geometry
 * @param {number} width
 * @param {number} height
 */
export function useEaselGeometry(width = 1, height = 1.2) {
  return useMemo(() => {
    const thickness = 0.05;
    const legAngle = Math.PI / 12; // 15 degrees

    // We'll return a group of geometries combined
    // For simplicity, use a box for the frame
    return new THREE.BoxGeometry(width, height, thickness);
  }, [width, height]);
}
