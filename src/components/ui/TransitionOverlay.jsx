import { useWorkshopStore } from '../../stores';

/**
 * Station name labels
 */
const STATION_NAMES = {
  dashboard: 'The Dashboard',
  gallery: 'The Gallery',
  inventory: 'The Inventory',
  plans: 'The Plans',
};

/**
 * Overlay that shows during camera transitions
 */
export default function TransitionOverlay() {
  const currentStation = useWorkshopStore((s) => s.currentStation);
  const isTransitioning = useWorkshopStore((s) => s.isTransitioning);

  if (!isTransitioning) return null;

  const stationName = currentStation
    ? STATION_NAMES[currentStation]
    : 'Workshop Overview';

  return (
    <div className="transition-overlay">
      <div className="transition-content">
        <span className="transition-label">Traveling to</span>
        <h2 className="transition-destination">{stationName}</h2>
      </div>
    </div>
  );
}
