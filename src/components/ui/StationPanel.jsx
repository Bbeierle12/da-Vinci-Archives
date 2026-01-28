import { useWorkshopStore, useDataStore } from '../../stores';
import { selectDashboardMetrics, selectLowStockSupplies } from '../../stores/selectors';

/**
 * Dashboard station info panel
 */
function DashboardPanel() {
  const metrics = useDataStore(selectDashboardMetrics);

  return (
    <div className="station-panel dashboard-panel" role="region" aria-label="Dashboard overview">
      <h2>Workshop Overview</h2>

      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-value">{metrics.totalPaintings}</span>
          <span className="metric-label">Paintings</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.byStatus.active}</span>
          <span className="metric-label">In Progress</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.byStatus.complete}</span>
          <span className="metric-label">Complete</span>
        </div>
        <div className="metric">
          <span className="metric-value">{metrics.totalSupplies}</span>
          <span className="metric-label">Supplies</span>
        </div>
      </div>

      {metrics.lowStockCount > 0 && (
        <div className="warning-banner" role="alert">
          ⚠ {metrics.lowStockCount} supplies running low
        </div>
      )}

      <div className="panel-footer">
        <span>{metrics.upcomingPlans} plans pending</span>
      </div>
    </div>
  );
}

/**
 * Gallery station info panel
 */
function GalleryPanel() {
  const paintings = useDataStore((s) => s.paintings);
  const selectedId = useWorkshopStore((s) => s.selectedId);
  const setSelected = useWorkshopStore((s) => s.setSelected);
  const updatePainting = useDataStore((s) => s.updatePainting);

  const selected = paintings.find((p) => p.id === selectedId);

  const cycleStatus = () => {
    if (!selected) return;
    const statusOrder = ['planning', 'active', 'complete'];
    const currentIndex = statusOrder.indexOf(selected.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updatePainting(selected.id, { status: nextStatus });
  };

  return (
    <div className="station-panel gallery-panel" role="region" aria-label="Gallery panel">
      <h2>Gallery</h2>

      {selected ? (
        <div className="detail-view">
          <h3>{selected.title}</h3>
          <p className="description">{selected.description || 'No description'}</p>

          <div className="status-control">
            <span className={`status-badge status-${selected.status}`}>
              {selected.status}
            </span>
            <button onClick={cycleStatus} className="btn-small" aria-label="Change painting status">
              Change Status
            </button>
          </div>

          <button onClick={() => setSelected(null)} className="btn-close">
            Close
          </button>
        </div>
      ) : (
        <div className="panel-hint">
          <p>Click a painting to view details</p>
          <div className="painting-list">
            {paintings.map((p) => (
              <div
                key={p.id}
                className={`list-item status-${p.status}`}
                onClick={() => setSelected(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(p.id);
                  }
                }}
                aria-label={`Select ${p.title}`}
              >
                {p.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inventory station info panel
 */
function InventoryPanel() {
  const supplies = useDataStore((s) => s.supplies);
  const lowStock = useDataStore(selectLowStockSupplies);
  const selectedId = useWorkshopStore((s) => s.selectedId);
  const setSelected = useWorkshopStore((s) => s.setSelected);
  const updateSupply = useDataStore((s) => s.updateSupply);

  const selected = supplies.find((s) => s.id === selectedId);

  const adjustQuantity = (delta) => {
    if (!selected) return;
    const newQty = Math.max(0, Math.min(100, selected.quantity + delta));
    updateSupply(selected.id, { quantity: newQty });
  };

  return (
    <div className="station-panel inventory-panel" role="region" aria-label="Inventory panel">
      <h2>Inventory</h2>

      {selected ? (
        <div className="detail-view">
          <h3>{selected.name}</h3>

          <div className="quantity-display">
            <div className="quantity-bar" role="progressbar" aria-valuenow={selected.quantity} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="quantity-fill"
                style={{
                  width: `${selected.quantity}%`,
                  backgroundColor: selected.quantity <= selected.lowThreshold ? '#cc4444' : '#c9a227',
                }}
              />
            </div>
            <span className="quantity-text">
              {selected.quantity} {selected.unit}
            </span>
          </div>

          <div className="quantity-controls">
            <button onClick={() => adjustQuantity(-10)} className="btn-small" aria-label="Decrease by 10">-10</button>
            <button onClick={() => adjustQuantity(-1)} className="btn-small" aria-label="Decrease by 1">-1</button>
            <button onClick={() => adjustQuantity(1)} className="btn-small" aria-label="Increase by 1">+1</button>
            <button onClick={() => adjustQuantity(10)} className="btn-small" aria-label="Increase by 10">+10</button>
          </div>

          {selected.quantity <= selected.lowThreshold && (
            <div className="warning-text" role="alert">⚠ Low stock warning</div>
          )}

          <button onClick={() => setSelected(null)} className="btn-close">
            Close
          </button>
        </div>
      ) : (
        <div className="panel-hint">
          <p>Click a vessel to adjust quantity</p>
          {lowStock.length > 0 && (
            <div className="low-stock-list">
              <h4>Low Stock:</h4>
              {lowStock.map((s) => (
                <div
                  key={s.id}
                  className="list-item warning"
                  onClick={() => setSelected(s.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(s.id);
                    }
                  }}
                  aria-label={`Select ${s.name}, ${s.quantity} ${s.unit} remaining`}
                >
                  {s.name}: {s.quantity} {s.unit}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Plans station info panel
 */
function PlansPanel() {
  const plans = useDataStore((s) => s.plans);
  const selectedId = useWorkshopStore((s) => s.selectedId);
  const setSelected = useWorkshopStore((s) => s.setSelected);
  const updatePlan = useDataStore((s) => s.updatePlan);

  const selected = plans.find((p) => p.id === selectedId);

  const toggleComplete = () => {
    if (!selected) return;
    updatePlan(selected.id, { completed: !selected.completed });
  };

  return (
    <div className="station-panel plans-panel" role="region" aria-label="Plans panel">
      <h2>Plans</h2>

      {selected ? (
        <div className="detail-view">
          <h3>{selected.title}</h3>
          <p className="description">{selected.description}</p>

          {selected.targetDate && (
            <p className="target-date">Target: {selected.targetDate}</p>
          )}

          <div className="completion-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selected.completed || false}
                onChange={toggleComplete}
                aria-label={`Mark ${selected.title} as ${selected.completed ? 'incomplete' : 'complete'}`}
              />
              <span>Completed</span>
            </label>
          </div>

          <button onClick={() => setSelected(null)} className="btn-close">
            Close
          </button>
        </div>
      ) : (
        <div className="panel-hint">
          <p>Click a scroll to view plan details</p>
          <div className="plans-list">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`list-item ${p.completed ? 'completed' : ''}`}
                onClick={() => setSelected(p.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(p.id);
                  }
                }}
                aria-label={`Select plan: ${p.title}${p.completed ? ' (completed)' : ''}`}
              >
                {p.completed && '✓ '}{p.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main station panel - renders appropriate panel based on current station
 */
export default function StationPanel() {
  const currentStation = useWorkshopStore((s) => s.currentStation);

  if (!currentStation) return null;

  const panels = {
    dashboard: DashboardPanel,
    gallery: GalleryPanel,
    inventory: InventoryPanel,
    plans: PlansPanel,
  };

  const PanelComponent = panels[currentStation];
  if (!PanelComponent) return null;

  return <PanelComponent />;
}
