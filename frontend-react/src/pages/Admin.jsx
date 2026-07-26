import React from 'react';
import { currency } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';

function StatCard({ label, value, helper }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

export default function Admin() {
  const {
    products,
    orders,
    selectedProduct,
    selectedUnit,
    setSelectedProductId,
    setSelectedUnitId,
    pricingScore,
    setPricingScore,
    refreshPricing,
    busy,
    loading,
    totalCart,
    totalUnits,
    avgPrice
  } = useShop();

  return (
    <>
      <section className="panel-header standalone">
        <div>
          <p className="panel-kicker">Espace admin</p>
          <h2>Tableau de bord</h2>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Produits" value={products.length} helper="Catalogue live" />
        <StatCard label="Panier demo" value={currency.format(totalCart)} helper="User demo #1" />
        <StatCard label="Prix moyen" value={currency.format(avgPrice)} helper="Base catalogue" />
        <StatCard label="Commandes" value={orders.length} helper="Checkout" />
        <StatCard label="Unités" value={totalUnits} helper="Toutes références" />
      </section>

      <section className="content-grid admin-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Produit à ajuster</p>
              <h2>Sélection</h2>
            </div>
          </div>

          <div className="admin-product-list">
            {products.map((product) => (
              <button
                key={product.id}
                className={`admin-product-row ${product.id === selectedProduct?.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setSelectedUnitId(product.units?.[0]?.id || null);
                }}
              >
                <span>{product.name}</span>
                <strong>{currency.format(product.basePrice || 0)}</strong>
              </button>
            ))}
          </div>
        </section>

        <aside className="panel pricing-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Moteur de prix dynamique</p>
              <h2>{selectedProduct?.name || '—'}</h2>
            </div>
          </div>

          <div className="pricing-summary">
            <div>
              <span className="summary-label">Prix de base</span>
              <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
            </div>
            <div>
              <span className="summary-label">Unité sélectionnée</span>
              <strong>{selectedUnit?.serialNumber || '—'}</strong>
            </div>
            <div>
              <span className="summary-label">Prix unité</span>
              <strong>{selectedUnit ? currency.format(selectedUnit.currentPrice) : '—'}</strong>
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
            <button className="primary-btn full" onClick={() => refreshPricing()} disabled={busy || loading}>
              Recalculer le prix
            </button>
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Toutes les commandes</p>
            <h2>Commandes récentes</h2>
          </div>
        </div>
        <div className="orders-list">
          {orders.length ? (
            orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <strong>Commande #{order.id}</strong>
                  <p>{order.status} · {new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <span>{currency.format(order.totalAmount)}</span>
              </article>
            ))
          ) : (
            <div className="empty-state">Aucune commande pour le moment.</div>
          )}
        </div>
      </section>
    </>
  );
}
