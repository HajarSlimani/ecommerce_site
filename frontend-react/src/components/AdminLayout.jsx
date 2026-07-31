import React from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '◆', end: true },
  { to: '/admin/produits', label: 'Produits', icon: '▣' },
  { to: '/admin/commandes', label: 'Commandes', icon: '↗' }
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="empty-state">Chargement…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="access-denied">
        <span className="grade-seal" data-grade="C">Accès restreint</span>
        <h1>Réservé à l'équipe Reforge</h1>
        <p>Ce compte n'a pas les droits administrateur nécessaires pour ouvrir le dashboard.</p>
        <NavLink to="/" className="btn btn-secondary">Retour à la boutique</NavLink>
      </div>
    );
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="brand-mark">Reforge</span>
          <span className="brand-tagline">Espace admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="admin-nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-user-chip">{user.email}</span>
          <NavLink to="/" className="btn btn-ghost btn-sm">Retour à la boutique</NavLink>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
