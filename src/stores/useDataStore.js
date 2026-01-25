import { create } from 'zustand';

/**
 * @typedef {'planning'|'active'|'complete'} PaintingStatus
 *
 * @typedef {Object} Painting
 * @property {string} id
 * @property {string} title
 * @property {PaintingStatus} status
 * @property {string} [description]
 * @property {string} [imageUrl]
 * @property {string} [createdAt]
 *
 * @typedef {Object} Supply
 * @property {string} id
 * @property {string} name
 * @property {number} quantity
 * @property {string} unit
 * @property {number} lowThreshold
 * @property {number} [color] - Hex color for liquid display
 *
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [targetDate]
 * @property {boolean} [completed]
 */

/**
 * Data store for paintings, supplies, and plans
 */
const useDataStore = create((set, get) => ({
  /** @type {Painting[]} */
  paintings: [],
  /** @type {Supply[]} */
  supplies: [],
  /** @type {Plan[]} */
  plans: [],

  // === Painting Actions ===
  /**
   * @param {Painting} painting
   */
  addPainting: (painting) => set((state) => ({
    paintings: [...state.paintings, { ...painting, id: painting.id || crypto.randomUUID() }]
  })),

  /**
   * @param {string} id
   * @param {Partial<Painting>} data
   */
  updatePainting: (id, data) => set((state) => ({
    paintings: state.paintings.map((p) => p.id === id ? { ...p, ...data } : p)
  })),

  /**
   * @param {string} id
   */
  deletePainting: (id) => set((state) => ({
    paintings: state.paintings.filter((p) => p.id !== id)
  })),

  // === Supply Actions ===
  /**
   * @param {Supply} supply
   */
  addSupply: (supply) => set((state) => ({
    supplies: [...state.supplies, { ...supply, id: supply.id || crypto.randomUUID() }]
  })),

  /**
   * @param {string} id
   * @param {Partial<Supply>} data
   */
  updateSupply: (id, data) => set((state) => ({
    supplies: state.supplies.map((s) => s.id === id ? { ...s, ...data } : s)
  })),

  /**
   * @param {string} id
   */
  deleteSupply: (id) => set((state) => ({
    supplies: state.supplies.filter((s) => s.id !== id)
  })),

  // === Plan Actions ===
  /**
   * @param {Plan} plan
   */
  addPlan: (plan) => set((state) => ({
    plans: [...state.plans, { ...plan, id: plan.id || crypto.randomUUID() }]
  })),

  /**
   * @param {string} id
   * @param {Partial<Plan>} data
   */
  updatePlan: (id, data) => set((state) => ({
    plans: state.plans.map((p) => p.id === id ? { ...p, ...data } : p)
  })),

  /**
   * @param {string} id
   */
  deletePlan: (id) => set((state) => ({
    plans: state.plans.filter((p) => p.id !== id)
  })),

  // === Persistence ===
  /**
   * Load data from storage
   */
  hydrate: async () => {
    try {
      const stored = localStorage.getItem('davinci-workshop-data');
      if (stored) {
        const data = JSON.parse(stored);
        set({
          paintings: data.paintings || [],
          supplies: data.supplies || [],
          plans: data.plans || [],
        });
      }
    } catch (e) {
      console.warn('Failed to hydrate data store:', e);
    }
  },

  /**
   * Save current data to storage
   */
  persist: () => {
    try {
      const { paintings, supplies, plans } = get();
      localStorage.setItem('davinci-workshop-data', JSON.stringify({ paintings, supplies, plans }));
    } catch (e) {
      console.warn('Failed to persist data store:', e);
    }
  },

  /**
   * Clear all data
   */
  reset: () => {
    set({ paintings: [], supplies: [], plans: [] });
    localStorage.removeItem('davinci-workshop-data');
  },

  /**
   * Seed with sample data (for development/demo)
   * @param {{ paintings?: Painting[], supplies?: Supply[], plans?: Plan[] }} data
   */
  seed: (data) => {
    set({
      paintings: data.paintings || [],
      supplies: data.supplies || [],
      plans: data.plans || [],
    });
    // Persist seeded data
    const { paintings, supplies, plans } = { ...get(), ...data };
    localStorage.setItem('davinci-workshop-data', JSON.stringify({ paintings, supplies, plans }));
  },
}));

export default useDataStore;
