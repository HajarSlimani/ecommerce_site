import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { authFetchJson, currency } from '../../lib/api.js';
import GradeBar from '../../components/GradeBar.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        authFetchJson('/api/admin/stats'),
        authFetchJson('/api/admin/orders')
      ]);
      setStats(statsResponse);
      setOrders(ordersResponse.slice(0, 6));
    } catch (err) {
      setError(err.message || 'Impossible de charger le dashboard.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="empty-state">Chargement du dashboard…</div>;
  }

  if (error) {
    return <div className="empty-state">{error}</div>;
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 style={{ fontSize: 30 }}>Vue d'ensemble</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Chiffre d'affaires</span>
          <strong>{currency.format(stats.revenue || 0)}</strong>
          <p>Total des commandes non annulées</p>
        </div>
        <div className="stat-card">
          <span>Commandes</span>
          <strong>{stats.orderCount}</strong>
          <p>Tous statuts confondus</p>
        </div>
        <div className="stat-card">
          <span>Produits actifs</span>
          <strong>{stats.productCount}</strong>
          <p>Fiches catalogue</p>
        </div>
        <div className="stat-card">
          <span>Unités disponibles</span>
          <strong>{stats.availableUnits}</strong>
          <p>Prêtes à la vente</p>
        </div>
        <div className="stat-card">
          <span>Comptes clients</span>
          <strong>{stats.userCount}</strong>
          <p>Inscrits sur Reforge</p>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 32 }}>
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Signature Reforge</span>
              <h2>Stock par grade</h2>
            </div>
          </div>
          <GradeBar breakdown={stats.gradeBreakdown} />
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Activité récente</span>
              <h2>Dernières commandes</h2>
            </div>
            <NavLink to="/admin/commandes" className="btn btn-ghost btn-sm">Tout voir</NavLink>
          </div>

          {orders.length === 0 && <div className="empty-state">Aucune commande pour l'instant.</div>}

          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <div>
                <strong>Commande #{order.id}</strong>
                <span className="meta">{order.buyerEmail} · {new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge-status" data-status={order.status}>{order.status}</span>
                <span className="amount">{currency.format(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
