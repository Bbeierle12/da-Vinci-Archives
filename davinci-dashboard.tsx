import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// Main 3D Workshop Environment
export default function DaVinciWorkshop() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [currentStation, setCurrentStation] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const targetCameraPos = useRef(new THREE.Vector3(0, 5, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const stationsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const gearsRef = useRef([]);
  const candlesRef = useRef([]);
  
  const stations = {
    overview: { pos: [0, 5, 12], lookAt: [0, 0, 0], name: 'Workshop' },
    dashboard: { pos: [0, 3, 2], lookAt: [0, 1.5, -2], name: 'Dashboard' },
    gallery: { pos: [-6, 3, 0], lookAt: [-10, 2, 0], name: 'Gallery' },
    inventory: { pos: [6, 2.5, 0], lookAt: [10, 1.5, 0], name: 'Inventory' },
    plans: { pos: [0, 3, -6], lookAt: [0, 2, -10], name: 'Plans' }
  };

  // Create gear geometry
  const createGear = useCallback((radius, teeth, thickness, material) => {
    const shape = new THREE.Shape();
    const inner = radius * 0.6;
    
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.2) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.4) / teeth) * Math.PI * 2;
      const a4 = ((i + 0.6) / teeth) * Math.PI * 2;
      const a5 = ((i + 0.8) / teeth) * Math.PI * 2;
      
      if (i === 0) shape.moveTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
      shape.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
      shape.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
      shape.lineTo(Math.cos(a4) * inner, Math.sin(a4) * inner);
      shape.lineTo(Math.cos(a5) * inner, Math.sin(a5) * inner);
    }
    shape.closePath();
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, radius * 0.15, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    
    const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    return new THREE.Mesh(geo, material);
  }, []);

  // Create candle with flame
  const createCandle = useCallback((x, y, z) => {
    const group = new THREE.Group();
    
    // Candle body
    const candleGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 12);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.8 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    group.add(candle);
    
    // Flame (will be animated)
    const flameGeo = new THREE.ConeGeometry(0.04, 0.15, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.32;
    flame.name = 'flame';
    group.add(flame);
    
    // Point light
    const light = new THREE.PointLight(0xffaa55, 0.8, 5);
    light.position.y = 0.4;
    light.castShadow = true;
    light.shadow.mapSize.width = 256;
    light.shadow.mapSize.height = 256;
    group.add(light);
    
    group.position.set(x, y, z);
    return group;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1510);
    scene.fog = new THREE.Fog(0x1a1510, 8, 25);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 5, 12);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Materials
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8, metalness: 0.1 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4540, roughness: 0.9 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.3, metalness: 0.85 });
    const darkBrassMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.4, metalness: 0.7 });
    const parchmentMat = new THREE.MeshStandardMaterial({ color: 0xf4e4bc, roughness: 0.9, side: THREE.DoubleSide });
    
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffeedd, 0.15);
    scene.add(ambient);
    
    // Main directional light (moonlight through window)
    const moonLight = new THREE.DirectionalLight(0xaaccff, 0.3);
    moonLight.position.set(-5, 8, 5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 1;
    moonLight.shadow.camera.far = 30;
    moonLight.shadow.camera.left = -15;
    moonLight.shadow.camera.right = 15;
    moonLight.shadow.camera.top = 15;
    moonLight.shadow.camera.bottom = -15;
    scene.add(moonLight);
    
    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floor = new THREE.Mesh(floorGeo, woodMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Walls
    const wallGeo = new THREE.PlaneGeometry(30, 12);
    const backWall = new THREE.Mesh(wallGeo, stoneMat);
    backWall.position.set(0, 6, -12);
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    const leftWall = new THREE.Mesh(wallGeo, stoneMat);
    leftWall.position.set(-12, 6, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeo, stoneMat);
    rightWall.position.set(12, 6, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // Ceiling beams
    for (let i = -2; i <= 2; i++) {
      const beamGeo = new THREE.BoxGeometry(24, 0.4, 0.5);
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set(0, 8, i * 5);
      beam.castShadow = true;
      scene.add(beam);
    }
    
    // === DASHBOARD STATION (Center) ===
    const dashboardGroup = new THREE.Group();
    dashboardGroup.position.set(0, 0, -2);
    dashboardGroup.userData = { station: 'dashboard' };
    stationsRef.current.dashboard = dashboardGroup;
    
    // Orrery table
    const tableGeo = new THREE.CylinderGeometry(1.5, 1.3, 0.15, 32);
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 1;
    table.castShadow = true;
    table.receiveShadow = true;
    dashboardGroup.add(table);
    
    // Table pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.3, 0.5, 1, 16);
    const pedestal = new THREE.Mesh(pedestalGeo, woodMat);
    pedestal.position.y = 0.5;
    pedestal.castShadow = true;
    dashboardGroup.add(pedestal);
    
    // Central gear mechanism
    const centralGear = createGear(0.6, 16, 0.1, brassMat);
    centralGear.rotation.x = -Math.PI / 2;
    centralGear.position.y = 1.15;
    centralGear.castShadow = true;
    dashboardGroup.add(centralGear);
    gearsRef.current.push({ mesh: centralGear, speed: 0.3, axis: 'z' });
    
    // Orbiting smaller gears
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const smallGear = createGear(0.25, 8, 0.08, darkBrassMat);
      smallGear.rotation.x = -Math.PI / 2;
      smallGear.position.set(Math.cos(angle) * 1, 1.12, Math.sin(angle) * 1);
      smallGear.castShadow = true;
      dashboardGroup.add(smallGear);
      gearsRef.current.push({ mesh: smallGear, speed: -0.6, axis: 'z' });
    }
    
    scene.add(dashboardGroup);
    
    // === GALLERY STATION (Left wall) ===
    const galleryGroup = new THREE.Group();
    galleryGroup.position.set(-10, 0, 0);
    galleryGroup.userData = { station: 'gallery' };
    stationsRef.current.gallery = galleryGroup;
    
    // Easels with "paintings"
    for (let i = -1; i <= 1; i++) {
      const easelGroup = new THREE.Group();
      easelGroup.position.set(0, 0, i * 3);
      
      // Easel legs
      const legGeo = new THREE.BoxGeometry(0.08, 2.5, 0.08);
      const leg1 = new THREE.Mesh(legGeo, woodMat);
      leg1.position.set(-0.3, 1.25, 0.3);
      leg1.rotation.x = 0.1;
      leg1.castShadow = true;
      easelGroup.add(leg1);
      
      const leg2 = new THREE.Mesh(legGeo, woodMat);
      leg2.position.set(0.3, 1.25, 0.3);
      leg2.rotation.x = 0.1;
      leg2.castShadow = true;
      easelGroup.add(leg2);
      
      const leg3 = new THREE.Mesh(legGeo, woodMat);
      leg3.position.set(0, 1.25, -0.3);
      leg3.rotation.x = -0.15;
      leg3.castShadow = true;
      easelGroup.add(leg3);
      
      // Canvas
      const canvasGeo = new THREE.BoxGeometry(1.2, 1.5, 0.05);
      const canvasMat = new THREE.MeshStandardMaterial({ 
        color: [0xd4a574, 0xa8c4d4, 0xd4c4a4][i + 1], 
        roughness: 0.9 
      });
      const canvas = new THREE.Mesh(canvasGeo, canvasMat);
      canvas.position.set(0, 2.2, 0.1);
      canvas.rotation.x = -0.1;
      canvas.castShadow = true;
      easelGroup.add(canvas);
      
      // Frame
      const frameGeo = new THREE.BoxGeometry(1.35, 1.65, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 2.2, 0.08);
      frame.rotation.x = -0.1;
      frame.castShadow = true;
      easelGroup.add(frame);
      
      galleryGroup.add(easelGroup);
    }
    
    scene.add(galleryGroup);
    
    // === INVENTORY STATION (Right wall) ===
    const inventoryGroup = new THREE.Group();
    inventoryGroup.position.set(10, 0, 0);
    inventoryGroup.rotation.y = -Math.PI / 2;
    inventoryGroup.userData = { station: 'inventory' };
    stationsRef.current.inventory = inventoryGroup;
    
    // Apothecary cabinet
    const cabinetGeo = new THREE.BoxGeometry(4, 3, 0.8);
    const cabinet = new THREE.Mesh(cabinetGeo, woodMat);
    cabinet.position.y = 1.5;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    inventoryGroup.add(cabinet);
    
    // Shelves
    for (let row = 0; row < 3; row++) {
      const shelfGeo = new THREE.BoxGeometry(3.8, 0.05, 0.7);
      const shelf = new THREE.Mesh(shelfGeo, woodMat);
      shelf.position.set(0, 0.5 + row * 0.9, 0.1);
      inventoryGroup.add(shelf);
      
      // Glass vessels on shelves
      for (let j = -2; j <= 2; j++) {
        const vesselGroup = new THREE.Group();
        vesselGroup.position.set(j * 0.7, 0.5 + row * 0.9 + 0.3, 0.1);
        
        const vesselGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 16);
        const vesselMat = new THREE.MeshStandardMaterial({ 
          color: 0xffffff, 
          transparent: true, 
          opacity: 0.3, 
          roughness: 0.1 
        });
        const vessel = new THREE.Mesh(vesselGeo, vesselMat);
        vesselGroup.add(vessel);
        
        // Liquid inside
        const fillLevel = 0.2 + Math.random() * 0.25;
        const liquidGeo = new THREE.CylinderGeometry(0.1, 0.13, fillLevel, 16);
        const colors = [0xc41e3a, 0x1e4d8c, 0xcc7722, 0x2e8b57, 0x9932cc];
        const liquidMat = new THREE.MeshStandardMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.8
        });
        const liquid = new THREE.Mesh(liquidGeo, liquidMat);
        liquid.position.y = -0.25 + fillLevel / 2;
        vesselGroup.add(liquid);
        
        inventoryGroup.add(vesselGroup);
      }
    }
    
    scene.add(inventoryGroup);
    
    // === PLANS STATION (Back wall) ===
    const plansGroup = new THREE.Group();
    plansGroup.position.set(0, 0, -10);
    plansGroup.userData = { station: 'plans' };
    stationsRef.current.plans = plansGroup;
    
    // Drafting table
    const deskGeo = new THREE.BoxGeometry(3, 0.1, 2);
    const desk = new THREE.Mesh(deskGeo, woodMat);
    desk.position.set(0, 1, 0);
    desk.rotation.x = -0.2;
    desk.castShadow = true;
    desk.receiveShadow = true;
    plansGroup.add(desk);
    
    // Desk legs
    const deskLegGeo = new THREE.BoxGeometry(0.15, 1, 0.15);
    [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(deskLegGeo, woodMat);
      leg.position.set(x, 0.5, z);
      leg.castShadow = true;
      plansGroup.add(leg);
    });
    
    // Parchment scrolls on desk
    for (let i = -1; i <= 1; i++) {
      const scrollGeo = new THREE.PlaneGeometry(0.8, 1.2);
      const scroll = new THREE.Mesh(scrollGeo, parchmentMat);
      scroll.position.set(i * 0.9, 1.1, 0);
      scroll.rotation.x = -Math.PI / 2 - 0.2;
      scroll.rotation.z = (Math.random() - 0.5) * 0.2;
      scroll.castShadow = true;
      plansGroup.add(scroll);
    }
    
    // Wall-mounted sketches
    for (let i = -1; i <= 1; i++) {
      const sketchGeo = new THREE.PlaneGeometry(1.5, 2);
      const sketch = new THREE.Mesh(sketchGeo, parchmentMat);
      sketch.position.set(i * 2, 3.5, -1.9);
      sketch.castShadow = true;
      plansGroup.add(sketch);
    }
    
    // Gear decoration on wall
    const wallGear = createGear(0.8, 20, 0.15, brassMat);
    wallGear.position.set(3, 3.5, -1.85);
    wallGear.castShadow = true;
    plansGroup.add(wallGear);
    gearsRef.current.push({ mesh: wallGear, speed: 0.15, axis: 'z' });
    
    scene.add(plansGroup);
    
    // === CANDLES ===
    const candlePositions = [
      [-2, 1.1, -1.5], [2, 1.1, -1.5],
      [-9, 2, -2], [-9, 2, 2],
      [9.5, 1.5, -1], [9.5, 1.5, 1],
      [-1, 1.2, -9.5], [1, 1.2, -9.5]
    ];
    
    candlePositions.forEach(([x, y, z]) => {
      const candle = createCandle(x, y, z);
      scene.add(candle);
      candlesRef.current.push(candle);
    });
    
    // Decorative wall gears
    const wallGearPositions = [
      [-11.8, 5, -5, 1.2, 24], [-11.8, 3, -7, 0.5, 10], [-11.8, 4, -3, 0.7, 14],
      [11.8, 5, 5, 1, 20], [11.8, 3.5, 3, 0.6, 12]
    ];
    
    wallGearPositions.forEach(([x, y, z, r, t], i) => {
      const gear = createGear(r, t, 0.08, i % 2 === 0 ? brassMat : darkBrassMat);
      gear.position.set(x, y, z);
      gear.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      gear.castShadow = true;
      scene.add(gear);
      gearsRef.current.push({ mesh: gear, speed: 0.1 + Math.random() * 0.2, axis: 'z' });
    });
    
    // Raycaster for clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onClick = (e) => {
      if (isTransitioning) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const objects = Object.values(stationsRef.current).flatMap(g => g.children);
      const intersects = raycaster.intersectObjects(objects, true);
      
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.parent.userData?.station) {
          obj = obj.parent;
        }
        if (obj.parent?.userData?.station) {
          setCurrentStation(obj.parent.userData.station);
        }
      }
    };
    
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.style.cursor = 'pointer';
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();
      
      // Animate gears
      gearsRef.current.forEach(({ mesh, speed, axis }) => {
        mesh.rotation[axis] += speed * delta;
      });
      
      // Animate candle flames
      candlesRef.current.forEach((candle, i) => {
        const flame = candle.children.find(c => c.name === 'flame');
        const light = candle.children.find(c => c instanceof THREE.PointLight);
        if (flame) {
          flame.scale.y = 1 + Math.sin(elapsed * 8 + i) * 0.2;
          flame.scale.x = flame.scale.z = 1 + Math.sin(elapsed * 6 + i * 2) * 0.1;
        }
        if (light) {
          light.intensity = 0.7 + Math.sin(elapsed * 5 + i * 1.5) * 0.15;
        }
      });
      
      // Smooth camera movement
      camera.position.lerp(targetCameraPos.current, 0.03);
      currentLookAt.current.lerp(targetLookAt.current, 0.03);
      camera.lookAt(currentLookAt.current);
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);
    
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [createGear, createCandle]);
  
  // Handle station changes
  useEffect(() => {
    const station = currentStation ? stations[currentStation] : stations.overview;
    targetCameraPos.current.set(...station.pos);
    targetLookAt.current.set(...station.lookAt);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 1500);
  }, [currentStation]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet"/>
      
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Navigation UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          {currentStation && (
            <button
              onClick={() => setCurrentStation(null)}
              className="px-4 py-2 rounded transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(180deg, rgba(92,64,51,0.9), rgba(44,24,16,0.9))',
                border: '2px solid #c9a227',
                color: '#f4e4bc',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              ← Return to Workshop
            </button>
          )}
        </div>
        
        <div className="text-right" style={{ fontFamily: 'Caveat, cursive', color: '#c9a227', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          <div className="text-2xl">Bottega</div>
          <div className="text-sm opacity-70">The Workshop of Ideas</div>
        </div>
      </div>
      
      {/* Station indicators */}
      {!currentStation && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
          {['dashboard', 'gallery', 'inventory', 'plans'].map((s) => (
            <button
              key={s}
              onClick={() => setCurrentStation(s)}
              className="px-4 py-2 rounded transition-all hover:scale-105 hover:-translate-y-1"
              style={{ 
                background: 'linear-gradient(180deg, rgba(201,162,39,0.2), rgba(92,64,51,0.4))',
                border: '1px solid #c9a227',
                color: '#f4e4bc',
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              {stations[s].name}
            </button>
          ))}
        </div>
      )}
      
      {/* Station title when focused */}
      {currentStation && (
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f4e4bc', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          <div className="text-3xl font-bold">{stations[currentStation].name}</div>
          <div className="text-sm opacity-60 mt-1" style={{ fontFamily: 'Caveat, cursive' }}>
            Click objects to interact
          </div>
        </div>
      )}
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
        }}
      />
    </div>
  );
}
