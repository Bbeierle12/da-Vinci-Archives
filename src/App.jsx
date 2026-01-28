import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { useDataStore } from './stores';
import { useDeviceDetection } from './hooks';
import CameraRig from './components/CameraRig';
import { Environment } from './components/environment';
import { Dashboard, Gallery, Inventory, Plans } from './components/stations';
import {
  NavigationUI,
  StationPanel,
  LoadingScreen,
  TransitionOverlay,
} from './components/ui';
import sampleData from './data/sampleData';

import './App.css';

/**
 * Scene lighting and atmosphere
 */
function SceneSetup() {
  return (
    <>
      {/* Fog for depth */}
      <fog attach="fog" args={[0x1a1510, 8, 25]} />

      {/* Warm ambient light */}
      <ambientLight intensity={0.15} color={0xffeedd} />

      {/* Moonlight through window */}
      <directionalLight
        position={[-5, 8, 5]}
        intensity={0.3}
        color={0xaaccff}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
    </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const hydrate = useDataStore((s) => s.hydrate);
  const seed = useDataStore((s) => s.seed);
  const { isMobile } = useDeviceDetection();

  // Calculate optimal DPR for mobile devices
  const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio;

  // Hydrate data on mount, seed sample data if empty
  useEffect(() => {
    hydrate().then(() => {
      // If no data after hydrate, seed with sample data
      const state = useDataStore.getState();
      if (state.paintings.length === 0 && state.supplies.length === 0) {
        seed(sampleData);
      }
    });
  }, [hydrate, seed]);

  return (
    <div className="app-container">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      <Canvas
        dpr={dpr}
        shadows={!isMobile}
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 5, 12] }}
        gl={{
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          antialias: !isMobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        <SceneSetup />
        <CameraRig />
        <Environment />

        {/* Stations */}
        <Dashboard position={[0, 0, -2]} />
        <Gallery position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Inventory position={[10, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Plans position={[0, 0, -10]} />
      </Canvas>

      {/* UI Overlay */}
      <div className="ui-overlay">
        <h1 className="title">Da Vinci Workshop</h1>
        <StationPanel />
        <NavigationUI />
      </div>

      {/* Transition overlay during camera movement */}
      <TransitionOverlay />

      {/* Vignette overlay */}
      <div className="vignette" />
    </div>
  );
}
