import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useShop } from '../context/ShopContext.jsx';

export default function Layout() {
  const { cart } = useShop();
  const itemCount = cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  return (
    <div className="app-shell">
      <div className="scanline" />
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="topbar">
        <div>
          <div className="brand">ARCADE</div>
          <div className="brand-subtitle">Boutique de jeux</div>
        </div>

        <nav className="topnav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Accueil
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
            Boutique
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
            Panier
          </NavLink>
        </nav>

        <div className="top-actions">
          <button className="ghost-chip">Connexion</button>
          <NavLink to="/cart" className="cart-chip">
            🛒{itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </NavLink>
        </div>
      </header>

      <main className="layout">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} ARCADE</span>
        <NavLink to="/admin" className="admin-link">
          Espace admin
        </NavLink>
      </footer>
    </div>
  );
}
