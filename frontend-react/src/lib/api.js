export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const DEMO_USER_ID = 1;

export const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

// Repli hors-ligne : utilisé uniquement si GET /api/categories échoue
// (backend indisponible). En temps normal, ShopContext charge les
// catégories réelles depuis l'API.
export const fallbackCategories = [
  { id: 'games', name: 'Jeux', accent: 'Voir les jeux' },
  { id: 'gear', name: 'Matériel', accent: 'Voir le matériel' },
  { id: 'accessories', name: 'Accessoires', accent: 'Voir les accessoires' }
];

export const weekOffer = {
  headline: 'Offre de la semaine',
  text: '-10 % sur toute la sélection grade NEW',
  cta: 'Voir la boutique'
};

export const fallbackProducts = [
  {
    id: 1,
    name: 'Lenovo ThinkPad X1',
    description: 'Ultrabook professionnel reconditionné.',
    basePrice: 999,
    category: 'Laptops',
    stock: 2,
    imageUrl: 'https://picsum.photos/seed/thinkpad-x1/480/360',
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

// Le backend n'expose pas encore de champ imageUrl pour les produits.
// En attendant, on génère une image de repli stable (toujours la même pour
// un même produit) afin que chaque carte affiche un visuel cohérent, et on
// respecte un éventuel item.imageUrl dès qu'il sera disponible côté API.
export function productImage(item) {
  if (item?.imageUrl) {
    return item.imageUrl;
  }
  const seed = encodeURIComponent(item?.name || item?.id || 'produit');
  return `https://picsum.photos/seed/${seed}/480/360`;
}

export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
      <rect width="480" height="360" fill="#F4F5F7"/>
      <text x="50%" y="50%" font-family="Inter, sans-serif" font-size="16" fill="#6B7280" text-anchor="middle">Image indisponible</text>
    </svg>`
  );

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
    imageUrl: item.imageUrl || productImage(item),
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
