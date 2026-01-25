# Da Vinci Workshop

An interactive 3D workshop environment inspired by Leonardo da Vinci's studio. Built with React Three Fiber and Zustand.

## Features

- **3D Workshop Environment** - Immersive scene with animated gears, flickering candles, and atmospheric lighting
- **Four Interactive Stations**
  - **Dashboard** - Overview metrics with mechanical orrery and gauges
  - **Gallery** - Easels displaying paintings with status tracking
  - **Inventory** - Cabinet with glass vessels showing supply levels
  - **Plans** - Drafting table with scrolls for project planning
- **Smooth Camera Transitions** - Fly-to navigation between stations with orbit controls
- **Persistent Data** - LocalStorage saves your paintings, supplies, and plans
- **Responsive UI** - Station detail panels with editing capabilities

## Tech Stack

- **React 19** + **Vite**
- **React Three Fiber** - Declarative 3D with Three.js
- **@react-three/drei** - Useful R3F helpers
- **Zustand** - Lightweight state management
- **CSS** - Custom styling with Renaissance theme

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── stores/           # Zustand state management
├── hooks/            # Shared materials & geometries
├── data/             # Sample data
├── components/
│   ├── CameraRig     # Camera transitions & orbit controls
│   ├── prefabs/      # Reusable 3D objects (Gear, Candle)
│   ├── environment/  # Workshop scene (Floor, Walls, etc.)
│   ├── stations/     # Interactive stations
│   └── ui/           # React DOM overlays
└── App.jsx           # Root component
```

## License

MIT
