import React, { useEffect, useState } from 'react';
import { authFetchJson, currency } from '../../lib/api.js';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetchJson('/api/admin/orders')
      .then(setOrders)
      .catch((err) => setError(err.message || 'Impossible de charger les commandes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Commandes</span>
          <h1 style={{ fontSize: 30 }}>Toutes les commandes</h1>
        </div>
      </div>

      <section className="panel">
        {loading && <div className="empty-state">Chargement…</div>}
        {error && <div className="empty-state">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-state">Aucune commande n'a encore été passée.</div>
        )}

        {!loading && !error && orders.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Articles</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="num">Montant</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="mono">#{order.id}</td>
                  <td>{order.buyerEmail}</td>
                  <td>{order.itemCount}</td>
                  <td><span className="badge-status" data-status={order.status}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="mono num">{currency.format(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
