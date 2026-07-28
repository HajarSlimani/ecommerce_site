import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/shop', label: 'Boutique' }
];

export default function Layout() {
  const { cart } = useShop();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">Reforge</span>
            <span className="brand-tagline">Tech reconditionnée, certifiée</span>
          </NavLink>

          <nav className="topnav">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="top-actions">
            {user ? (
              <>
                <span className="icon-btn" style={{ cursor: 'default' }}>{user.email}</span>
                <button className="icon-btn" type="button" onClick={handleLogout}>Déconnexion</button>
              </>
            ) : (
              <NavLink to="/login" className="icon-btn">Connexion</NavLink>
            )}
            <NavLink to="/cart" className="cart-chip">
              Panier
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </NavLink>
            <button
              className="mobile-toggle"
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="container" style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 16 }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : '')}
                style={{ padding: '10px 0' }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="layout">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <span className="brand-mark">Reforge</span>
            <p>
              Jeux, périphériques et accessoires gaming reconditionnés, chaque unité inspectée et notée
              par grade (NEW, A, B) avant la mise en vente.
            </p>
          </div>

          <div className="footer-col">
            <h4>Boutique</h4>
            <ul>
              <li><NavLink to="/shop">Tous les produits</NavLink></li>
              <li><NavLink to="/cart">Mon panier</NavLink></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Confiance</h4>
            <ul>
              <li>Garantie 12 mois</li>
              <li>Grades certifiés</li>
              <li>Retours sous 30 jours</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Espace</h4>
            <ul>
              <li><NavLink to="/admin">Espace admin</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Reforge</span>
          <span>Projet académique — moteur de pricing dynamique</span>
        </div>
      </footer>
    </div>
  );
}
