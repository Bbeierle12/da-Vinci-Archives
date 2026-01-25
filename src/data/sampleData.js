/**
 * Sample data for testing the workshop
 * Import and use useDataStore.getState().seed(sampleData) in dev
 */

export const samplePaintings = [
  {
    id: 'painting-1',
    title: 'The Last Supper',
    status: 'complete',
    description: 'Mural depicting the final meal of Jesus with his disciples',
  },
  {
    id: 'painting-2',
    title: 'Mona Lisa',
    status: 'active',
    description: 'Portrait of Lisa Gherardini',
  },
  {
    id: 'painting-3',
    title: 'Vitruvian Man',
    status: 'complete',
    description: 'Study of ideal human proportions',
  },
  {
    id: 'painting-4',
    title: 'Lady with an Ermine',
    status: 'planning',
    description: 'Portrait of Cecilia Gallerani',
  },
  {
    id: 'painting-5',
    title: 'Salvator Mundi',
    status: 'active',
    description: 'Christ as Savior of the World',
  },
];

export const sampleSupplies = [
  {
    id: 'supply-1',
    name: 'Ultramarine Blue',
    quantity: 75,
    unit: 'ml',
    lowThreshold: 20,
    color: 0x1e4d8c,
  },
  {
    id: 'supply-2',
    name: 'Burnt Sienna',
    quantity: 45,
    unit: 'ml',
    lowThreshold: 20,
    color: 0x8b4513,
  },
  {
    id: 'supply-3',
    name: 'Lead White',
    quantity: 15,
    unit: 'ml',
    lowThreshold: 25,
    color: 0xf5f5f5,
  },
  {
    id: 'supply-4',
    name: 'Verdigris Green',
    quantity: 60,
    unit: 'ml',
    lowThreshold: 15,
    color: 0x4a7c59,
  },
  {
    id: 'supply-5',
    name: 'Vermilion Red',
    quantity: 8,
    unit: 'ml',
    lowThreshold: 10,
    color: 0xe34234,
  },
  {
    id: 'supply-6',
    name: 'Linseed Oil',
    quantity: 90,
    unit: 'ml',
    lowThreshold: 30,
    color: 0xd4a017,
  },
  {
    id: 'supply-7',
    name: 'Lamp Black',
    quantity: 55,
    unit: 'ml',
    lowThreshold: 15,
    color: 0x1a1a1a,
  },
];

export const samplePlans = [
  {
    id: 'plan-1',
    title: 'Flying Machine Design',
    description: 'Ornithopter based on bird wing mechanics',
    targetDate: '1490-06-15',
    completed: false,
  },
  {
    id: 'plan-2',
    title: 'Armored Vehicle',
    description: 'Covered cart with cannons for military use',
    targetDate: '1490-08-01',
    completed: false,
  },
  {
    id: 'plan-3',
    title: 'Canal Lock System',
    description: 'Improved water management for Milan canals',
    targetDate: '1489-12-01',
    completed: true,
  },
  {
    id: 'plan-4',
    title: 'Diving Apparatus',
    description: 'Underwater breathing device for naval warfare',
    targetDate: '1491-03-20',
    completed: false,
  },
];

/**
 * All sample data combined
 */
export const sampleData = {
  paintings: samplePaintings,
  supplies: sampleSupplies,
  plans: samplePlans,
};

export default sampleData;
