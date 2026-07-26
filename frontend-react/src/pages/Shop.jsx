import React from 'react';
import { currency } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';

export default function Shop() {
  const {
    products,
    selectedProduct,
    selectedUnit,
    setSelectedProductId,
    setSelectedUnitId,
    addToCart,
    busy,
    loading,
    message
  } = useShop();

  return (
    <>
      <section className="panel-header standalone">
        <div>
          <p className="panel-kicker">Catalogue complet</p>
          <h2>Boutique</h2>
        </div>
        {message && <span className="status-pill">{message}</span>}
      </section>

      <section className="content-grid shop-grid">
        <section className="panel">
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
                  <div className="product-hover-overlay">
                    <span
                      className="quick-add"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedProductId(product.id);
                        setSelectedUnitId(product.units?.[0]?.id || null);
                        addToCart(product.units?.[0]?.id);
                      }}
                    >
                      Ajout rapide
                    </span>
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-category">{product.category || 'Produit'}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <strong>{currency.format(product.basePrice || 0)}</strong>
                    <span>{product.stock} en stock</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="panel product-detail-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Produit sélectionné</p>
              <h2>{selectedProduct?.name || '—'}</h2>
            </div>
          </div>

          <p className="hero-text">{selectedProduct?.description}</p>

          <div className="pricing-summary">
            <div>
              <span className="summary-label">Prix</span>
              <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
            </div>
            <div>
              <span className="summary-label">Unité sélectionnée</span>
              <strong>{selectedUnit?.serialNumber || '—'}</strong>
            </div>
          </div>

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
            <button className="primary-btn full" onClick={() => addToCart()} disabled={busy || loading || !selectedUnit}>
              Ajouter au panier
            </button>
          </div>
        </aside>
      </section>
    </>
  );
}
