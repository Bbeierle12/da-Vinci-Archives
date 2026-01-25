/**
 * Selectors for derived state from useDataStore
 * Use with: useDataStore(selectDashboardMetrics)
 */

/**
 * Dashboard metrics computed from data store
 * @param {import('./useDataStore').default extends { getState: () => infer S } ? S : never} state
 */
export const selectDashboardMetrics = (state) => ({
  totalPaintings: state.paintings.length,
  byStatus: {
    planning: state.paintings.filter((p) => p.status === 'planning').length,
    active: state.paintings.filter((p) => p.status === 'active').length,
    complete: state.paintings.filter((p) => p.status === 'complete').length,
  },
  lowStockCount: state.supplies.filter((s) => s.quantity <= s.lowThreshold).length,
  totalSupplies: state.supplies.length,
  upcomingPlans: state.plans.filter((p) => !p.completed).length,
  completedPlans: state.plans.filter((p) => p.completed).length,
});

/**
 * Get paintings grouped by status
 * @param {Object} state
 */
export const selectPaintingsByStatus = (state) => ({
  planning: state.paintings.filter((p) => p.status === 'planning'),
  active: state.paintings.filter((p) => p.status === 'active'),
  complete: state.paintings.filter((p) => p.status === 'complete'),
});

/**
 * Get supplies that are low in stock
 * @param {Object} state
 */
export const selectLowStockSupplies = (state) =>
  state.supplies.filter((s) => s.quantity <= s.lowThreshold);

/**
 * Get incomplete plans sorted by target date
 * @param {Object} state
 */
export const selectUpcomingPlans = (state) =>
  state.plans
    .filter((p) => !p.completed)
    .sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate) - new Date(b.targetDate);
    });
