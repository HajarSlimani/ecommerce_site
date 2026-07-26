export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const DEMO_USER_ID = 1;

export const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

export const categories = [
  { name: 'Jeux', key: 'games', accent: 'Play now' },
  { name: 'Matériel', key: 'gear', accent: 'Upgrade gear' },
  { name: 'Accessoires', key: 'accessories', accent: 'Best picks' }
];

export const weekOffer = {
  headline: 'OFFRES DE LA SEMAINE',
  text: '-10 % sur tous les jeux',
  cta: 'Acheter'
};

export const fallbackProducts = [
  {
    id: 1,
    name: 'Lenovo ThinkPad X1',
    description: 'Ultrabook professionnel reconditionné.',
    basePrice: 999,
    category: 'Laptops',
    stock: 2,
    units: [
      { id: 1, serialNumber: 'SN-X1-001', grade: 'A', currentPrice: 999, status: 'AVAILABLE' },
      { id: 2, serialNumber: 'SN-X1-002', grade: 'B', currentPrice: 949, status: 'AVAILABLE' }
    ],
    priceHistory: []
  }
];

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

export function normalizeProducts(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    basePrice: Number(item.basePrice || 0),
    category: item.category,
    stock: Number(item.stock || 0),
    units: Array.isArray(item.units)
      ? item.units.map((unit) => ({
          id: unit.id,
          serialNumber: unit.serialNumber,
          grade: unit.grade,
          currentPrice: Number(unit.currentPrice || 0),
          status: unit.status
        }))
      : [],
    priceHistory: Array.isArray(item.priceHistory) ? item.priceHistory : []
  }));
}
