import { create } from 'zustand';

/**
 * @typedef {'dashboard'|'gallery'|'inventory'|'plans'} StationId
 * @typedef {'fly'|'orbit'} CameraMode
 */

/**
 * Workshop navigation and interaction state
 */
const useWorkshopStore = create((set, get) => ({
  // Navigation
  /** @type {StationId|null} */
  currentStation: null,
  /** @type {boolean} */
  isTransitioning: false,
  /** @type {CameraMode} */
  cameraMode: 'fly',

  // Selection
  /** @type {string|null} */
  hoveredId: null,
  /** @type {string|null} */
  selectedId: null,

  // Actions
  /**
   * Navigate camera to a station
   * @param {StationId} id
   */
  goToStation: (id) => {
    set({ currentStation: id, isTransitioning: true, cameraMode: 'fly' });
    // Transition to orbit mode after camera animation completes
    setTimeout(() => set({ isTransitioning: false, cameraMode: 'orbit' }), 1500);
  },

  /**
   * Return camera to overview position
   */
  returnToOverview: () => {
    set({ currentStation: null, isTransitioning: true, cameraMode: 'fly', selectedId: null });
    setTimeout(() => set({ isTransitioning: false }), 1500);
  },

  /**
   * Set hovered object ID (for highlighting)
   * @param {string|null} id
   */
  setHovered: (id) => set({ hoveredId: id }),

  /**
   * Set selected object ID (for detail panels)
   * @param {string|null} id
   */
  setSelected: (id) => set({ selectedId: id }),

  /**
   * Clear selection
   */
  clearSelection: () => set({ selectedId: null, hoveredId: null }),
}));

export default useWorkshopStore;
