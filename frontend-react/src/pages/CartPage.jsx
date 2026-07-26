import React from 'react';
import { DEMO_USER_ID, currency } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';

export default function CartPage() {
  const { cart, orders, checkout, busy, loading, totalCart } = useShop();

  return (
    <section className="content-grid bottom-grid">
      <section className="panel cart-panel">
        <div className="panel-header">
          <div>
            <p className="panel-kicker">Votre panier</p>
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
            <div className="empty-state">Aucun article pour le moment. Ajoute une unité depuis la boutique.</div>
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
  );
}
