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
      <div className="section-head">
        <div>
          <span className="eyebrow">Espace admin</span>
          <h2>Tableau de bord</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Produits" value={products.length} helper="Catalogue live" />
        <StatCard label="Panier démo" value={currency.format(totalCart)} helper="User démo #1" />
        <StatCard label="Prix moyen" value={currency.format(avgPrice)} helper="Base catalogue" />
        <StatCard label="Commandes" value={orders.length} helper="Checkout" />
        <StatCard label="Unités" value={totalUnits} helper="Toutes références" />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Produit à ajuster</span>
              <h2>Sélection</h2>
            </div>
          </div>

          {products.map((product) => (
            <button
              key={product.id}
              className={`admin-row ${product.id === selectedProduct?.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedProductId(product.id);
                setSelectedUnitId(product.units?.[0]?.id || null);
              }}
              type="button"
            >
              <span>{product.name}</span>
              <strong>{currency.format(product.basePrice || 0)}</strong>
            </button>
          ))}
        </section>

        <aside className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Moteur de prix dynamique</span>
              <h2>{selectedProduct?.name || '—'}</h2>
            </div>
          </div>

          <div className="summary-row">
            <span className="label">Prix de base</span>
            <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Unité sélectionnée</span>
            <strong>{selectedUnit?.serialNumber || '—'}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Prix unité</span>
            <strong>{selectedUnit ? currency.format(selectedUnit.currentPrice) : '—'}</strong>
          </div>

          <label className="range-field">
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

          <button
            className="btn btn-primary btn-full"
            onClick={() => refreshPricing()}
            disabled={busy || loading}
            type="button"
          >
            Recalculer le prix
          </button>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Toutes les commandes</span>
            <h2>Commandes récentes</h2>
          </div>
        </div>
        {orders.length ? (
          orders.map((order) => (
            <div className="order-row" key={order.id}>
              <div>
                <strong>Commande #{order.id}</strong>
                <span className="meta">{order.status} · {new Date(order.createdAt).toLocaleString('fr-FR')}</span>
              </div>
              <span className="amount">{currency.format(order.totalAmount)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">Aucune commande pour le moment.</div>
        )}
      </section>
    </>
  );
}
