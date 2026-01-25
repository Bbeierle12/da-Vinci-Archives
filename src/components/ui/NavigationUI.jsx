import { useWorkshopStore } from '../../stores';

/**
 * Station navigation buttons
 */
export default function NavigationUI() {
  const currentStation = useWorkshopStore((s) => s.currentStation);
  const isTransitioning = useWorkshopStore((s) => s.isTransitioning);
  const goToStation = useWorkshopStore((s) => s.goToStation);
  const returnToOverview = useWorkshopStore((s) => s.returnToOverview);

  const stations = [
    { id: 'dashboard', label: 'Dashboard', icon: '⚙' },
    { id: 'gallery', label: 'Gallery', icon: '🎨' },
    { id: 'inventory', label: 'Inventory', icon: '⚗' },
    { id: 'plans', label: 'Plans', icon: '📜' },
  ];

  return (
    <nav className="navigation-ui">
      {currentStation ? (
        <button
          onClick={returnToOverview}
          disabled={isTransitioning}
          className="nav-btn back-btn"
        >
          ← Overview
        </button>
      ) : (
        <div className="station-buttons">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => goToStation(station.id)}
              disabled={isTransitioning}
              className="nav-btn station-btn"
            >
              <span className="station-icon">{station.icon}</span>
              <span className="station-label">{station.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
