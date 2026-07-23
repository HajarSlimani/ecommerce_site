import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const DEMO_USER_ID = 1;

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
});

const highlightSteps = [
  {
    title: 'Produits',
    text: 'Catalogue mis à jour depuis Spring Boot avec les unités et le stock en direct.'
  },
  {
    title: 'Promo',
    text: 'Le moteur FastAPI peut recalculer le prix recommandé selon la demande simulée.'
  },
  {
    title: 'Contactez-nous',
    text: 'Le panier et le checkout restent reliés aux endpoints backend pour le test complet.'
  }
];

const categories = [
  { name: 'Jeux', key: 'games', accent: 'Play now' },
  { name: 'Matériel', key: 'gear', accent: 'Upgrade gear' },
  { name: 'Accessoires', key: 'accessories', accent: 'Best picks' }
];

const weekOffer = {
  headline: 'OFFRES DE LA SEMAINE',
  text: '-10 % sur tous les jeux',
  cta: 'Acheter'
};

const fallbackProducts = [
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

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pricingScore, setPricingScore] = useState(0.78);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const selectedUnit = useMemo(() => {
    if (!selectedProduct) {
      return null;
    }

    return selectedProduct.units?.find((unit) => unit.id === selectedUnitId) || selectedProduct.units?.[0] || null;
  }, [selectedProduct, selectedUnitId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct && !selectedProductId) {
      setSelectedProductId(selectedProduct.id);
    }
  }, [selectedProduct, selectedProductId]);

  async function loadData() {
    setLoading(true);
    try {
      const [productsResponse, cartResponse, ordersResponse] = await Promise.all([
        fetchJson('/api/products'),
        fetchJson(`/api/cart/${DEMO_USER_ID}`),
        fetchJson(`/api/orders/${DEMO_USER_ID}`)
      ]);

      const normalizedProducts = normalizeProducts(productsResponse);
      setProducts(normalizedProducts.length ? normalizedProducts : fallbackProducts);
      setSelectedProductId(normalizedProducts[0]?.id || fallbackProducts[0].id);
      setSelectedUnitId(normalizedProducts[0]?.units?.[0]?.id || fallbackProducts[0].units[0].id);
      setCart(cartResponse);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setMessage('Boutique chargée et connectée au backend.');
    } catch (error) {
      setProducts(fallbackProducts);
      setSelectedProductId(fallbackProducts[0].id);
      setSelectedUnitId(fallbackProducts[0].units[0].id);
      setMessage('Backend indisponible, affichage du mode démo local.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshPricing() {
    if (!selectedProduct) {
      return;
    }

    setBusy(true);
    try {
      await fetchJson(`/api/products/${selectedProduct.id}/price/refresh?demandScore=${pricingScore}`, {
        method: 'POST'
      });
      await loadData();
      setMessage('Prix dynamique recalculé avec succès.');
    } catch (error) {
      setMessage('Impossible de recalculer le prix pour le moment.');
    } finally {
      setBusy(false);
    }
  }

  async function addToCart() {
    if (!selectedUnit) {
      return;
    }

    setBusy(true);
    try {
      const updatedCart = await fetchJson(`/api/cart/${DEMO_USER_ID}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUnitId: selectedUnit.id, quantity: 1 })
      });
      setCart(updatedCart);
      setMessage('Article ajouté au panier.');
    } catch (error) {
      setMessage('Impossible d’ajouter cet article au panier.');
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    try {
      const order = await fetchJson(`/api/orders/${DEMO_USER_ID}/checkout`, {
        method: 'POST'
      });
      setOrders((current) => [order, ...current]);
      const refreshedCart = await fetchJson(`/api/cart/${DEMO_USER_ID}`);
      setCart(refreshedCart);
      setMessage('Commande validée.');
    } catch (error) {
      setMessage('Checkout impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  }

  const totalCart = cart?.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;
  const totalUnits = products.reduce((sum, product) => sum + (product.units?.length || 0), 0);
  const avgPrice = products.length
    ? products.reduce((sum, product) => sum + Number(product.basePrice || 0), 0) / products.length
    : 0;

  return (
    <div className="app-shell">
      <div className="scanline" />
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="topbar">
        <div>
          <div className="brand">ARCADE</div>
          <div className="brand-subtitle">Gaming store with dynamic pricing</div>
        </div>

        <nav className="topnav">
          <a href="#catalogue">Collection</a>
          <a href="#pricing">Atelier prix</a>
          <a href="#promo">Promo</a>
          <a href="#cart">Contact</a>
        </nav>

        <div className="top-actions">
          <button className="ghost-chip">Connexion</button>
          <button className="cart-chip">🛒</button>
        </div>
      </header>

      <main className="layout">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">Boutique de jeux</p>
            <h1>
              Améliorez votre jeu
            </h1>
            <p className="hero-brand-line">CYBER KID INFINI</p>
            <p className="hero-text">
              Disponible sur PC et console. Une boutique pensée comme un site vitrine gaming :
              hero fort, best sellers, promos et catégories.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={refreshPricing} disabled={busy || loading}>
                Acheter
              </button>
              <button className="secondary-btn" onClick={addToCart} disabled={busy || loading}>
                Ajouter au panier
              </button>
            </div>

            <div className="status-pill">{message || 'Prêt à tester'}</div>
          </div>

          <div className="hero-visual">
            <div className="hero-caption">New drop / cyber selection</div>
            <div className="hero-orb hero-orb-a" />
            <div className="hero-orb hero-orb-b" />
            <div className="floating-card floating-card-main">
              <div className="floating-label">Prix recommandé</div>
              <div className="floating-value">
                {selectedProduct ? currency.format(selectedProduct.basePrice) : '—'}
              </div>
              <div className="floating-meta">Moteur dynamique connecté</div>
            </div>

            <div className="floating-card floating-card-side">
              <div className="floating-label">Stock total</div>
              <div className="floating-value">{totalUnits}</div>
              <div className="floating-meta">unités disponibles</div>
            </div>

            <div className="floating-card floating-card-mini">
              <div className="floating-label">Panier</div>
              <div className="floating-value">{currency.format(totalCart)}</div>
              <div className="floating-meta">demande active</div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard label="Produits" value={products.length} helper="Catalogue live" />
          <StatCard label="Panier" value={currency.format(totalCart)} helper="User demo #1" />
          <StatCard label="Prix moyen" value={currency.format(avgPrice)} helper="Base catalogue" />
          <StatCard label="Commandes" value={orders.length} helper="Checkout" />
        </section>

        <section className="insight-grid">
          {highlightSteps.map((step, index) => (
            <article className="insight-card" key={step.title}>
              <span className="insight-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <section className="panel" id="catalogue">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Meilleures ventes</p>
                <h2>Best sellers</h2>
              </div>
              <a className="view-link" href="#catalogue">Tout voir</a>
            </div>

            <div className="carousel-strip">
              <button className="carousel-arrow">‹</button>
              <div className="product-grid">
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    className={`product-card ${product.id === selectedProduct?.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setSelectedUnitId(product.units?.[0]?.id || null);
                    }}
                  >
                    <div className="product-image">
                      <span>{index === 0 ? 'New' : index === 1 ? 'HOT' : 'Pro'}</span>
                    </div>
                    <div className="product-content">
                      <div className="product-category">Prix</div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-footer">
                        <strong>{currency.format(product.basePrice || 0)}</strong>
                        <span>Ajouter au panier</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button className="carousel-arrow">›</button>
            </div>
          </section>

          <aside className="panel pricing-panel" id="pricing">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Promo</p>
                <h2>Levier de jeu Raptor</h2>
              </div>
            </div>

            <div className="promo-tag">PROMO</div>

            <div className="pricing-summary">
              <div>
                <span className="summary-label">Prix original</span>
                <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
              </div>
              <div>
                <span className="summary-label">Prix promotionnel</span>
                <strong>{selectedProduct ? currency.format((selectedProduct.basePrice || 0) * 0.9) : '—'}</strong>
              </div>
              <div>
                <span className="summary-label">Unité sélectionnée</span>
                <strong>{selectedUnit?.serialNumber || '—'}</strong>
              </div>
            </div>

            <label className="range-label">
              Demande simulée
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pricingScore}
                onChange={(event) => setPricingScore(Number(event.target.value))}
              />
              <span>{pricingScore.toFixed(2)}</span>
            </label>

            <div className="unit-list">
              {selectedProduct?.units?.map((unit) => (
                <button
                  key={unit.id}
                  className={`unit-item ${unit.id === selectedUnit?.id ? 'selected' : ''}`}
                  onClick={() => setSelectedUnitId(unit.id)}
                >
                  <div>
                    <strong>{unit.serialNumber}</strong>
                    <p>{unit.grade} · {unit.status}</p>
                  </div>
                  <span>{currency.format(unit.currentPrice)}</span>
                </button>
              ))}
            </div>

            <div className="panel-actions">
              <button className="primary-btn full" onClick={refreshPricing} disabled={busy || loading}>
                Recalculer
              </button>
              <button className="secondary-btn full" onClick={addToCart} disabled={busy || loading}>
                Ajouter au panier
              </button>
            </div>
          </aside>
        </section>

        <section className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.key}>
              <div>
                <p className="panel-kicker">Acheter par catégorie</p>
                <h3>{category.name}</h3>
              </div>
              <span>{category.accent}</span>
            </article>
          ))}
        </section>

        <section className="offer-panel" id="promo">
          <div>
            <p className="panel-kicker">Offres de la semaine</p>
            <h2>{weekOffer.headline}</h2>
            <p className="offer-emphasis">{weekOffer.text}</p>
          </div>
          <button className="primary-btn">{weekOffer.cta}</button>
        </section>

        <section className="gear-panel">
          <div className="gear-copy">
            <p className="panel-kicker">Améliorez votre matériel</p>
            <h2>Tout ce qu’il faut pour passer au niveau supérieur</h2>
          </div>
          <div className="gear-preview">
            <div className="gear-item">Wave Gen RX</div>
            <div className="gear-item">Souris sans fil X-2</div>
            <div className="gear-item">Chronosplit</div>
          </div>
        </section>

        <section className="content-grid bottom-grid" id="cart">
          <section className="panel cart-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Contactez-nous</p>
                <h2>Compte demo #{DEMO_USER_ID}</h2>
              </div>
              <span className="panel-badge">{cart?.status || 'ACTIVE'}</span>
            </div>

            <div className="cart-list">
              {cart?.items?.length ? (
                cart.items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div>
                      <strong>{item.productName}</strong>
                      <p>{item.quantity} × {currency.format(item.unitPrice)}</p>
                    </div>
                    <span>{currency.format(item.subtotal)}</span>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  Aucun article pour le moment. Ajoute une unité depuis le catalogue.
                </div>
              )}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <strong>{currency.format(totalCart)}</strong>
            </div>

            <button className="primary-btn full" onClick={checkout} disabled={busy || loading || !cart?.items?.length}>
              Valider la commande
            </button>
          </section>

          <section className="panel orders-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Historique</p>
                <h2>Dernières commandes</h2>
              </div>
            </div>

            <div className="orders-list">
              {orders.length ? (
                orders.slice(0, 4).map((order) => (
                  <article className="order-card" key={order.id}>
                    <div>
                      <strong>Commande #{order.id}</strong>
                      <p>{order.status} · {new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                    <span>{currency.format(order.totalAmount)}</span>
                  </article>
                ))
              ) : (
                <div className="empty-state">Aucune commande encore. Lance un checkout pour tester le flux complet.</div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

async function fetchJson(path, options = {}) {
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

function normalizeProducts(raw) {
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

export default App;
