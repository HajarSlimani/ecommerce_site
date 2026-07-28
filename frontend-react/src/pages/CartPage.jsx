import React from 'react';
import { Link } from 'react-router-dom';
import { currency } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartPage() {
  const { cart, orders, checkout, busy, loading, totalCart, isAuthenticated } = useShop();
  const { user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        Connecte-toi pour voir ton panier et tes commandes.{' '}
        <Link to="/login">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="two-col">
      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Votre panier</span>
            <h2>{user?.email}</h2>
          </div>
          <span className="status-pill">{cart?.status || 'ACTIVE'}</span>
        </div>

        {cart?.items?.length ? (
          cart.items.map((item) => (
            <div className="cart-row" key={item.id}>
              <div className="cart-row-info">
                <strong>{item.productName}</strong>
                <span>{item.quantity} × {currency.format(item.unitPrice)}</span>
              </div>
              <span className="product-price">{currency.format(item.subtotal)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">Aucun article pour le moment. Ajoute une unité depuis la boutique.</div>
        )}

        <div className="cart-total-row">
          <span>Total</span>
          <strong>{currency.format(totalCart)}</strong>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={checkout}
          disabled={busy || loading || !cart?.items?.length}
          type="button"
        >
          Valider la commande
        </button>
      </section>

      <section className="panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">Historique</span>
            <h2>Dernières commandes</h2>
          </div>
        </div>

        {orders.length ? (
          orders.slice(0, 4).map((order) => (
            <div className="order-row" key={order.id}>
              <div>
                <strong>Commande #{order.id}</strong>
                <span className="meta">{order.status} · {new Date(order.createdAt).toLocaleString('fr-FR')}</span>
              </div>
              <span className="amount">{currency.format(order.totalAmount)}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">Aucune commande encore. Lance un checkout pour tester le flux complet.</div>
        )}
      </section>
    </div>
  );
}
