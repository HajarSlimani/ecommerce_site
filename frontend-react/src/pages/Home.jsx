import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { currency, weekOffer, FALLBACK_IMAGE } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const FEATURES = [
  {
    icon: '✓',
    title: 'Grade certifié',
    text: 'Chaque unité est inspectée et notée NEW, A ou B avant sa mise en ligne — aucune surprise à la livraison.'
  },
  {
    icon: '⟲',
    title: 'Retours sous 30 jours',
    text: "Le produit ne convient pas ? Il est repris et remboursé, sans justification à fournir."
  },
  {
    icon: '⚑',
    title: 'Garantie 12 mois',
    text: 'Toutes les unités reconditionnées sont couvertes pendant un an contre les défauts matériels.'
  },
  {
    icon: '⇄',
    title: 'Prix ajusté en continu',
    text: 'Un moteur de pricing recalcule les tarifs selon le stock et la demande pour rester compétitif.'
  }
];

const TESTIMONIALS = [
  {
    initials: 'ML',
    name: 'Meryem L.',
    role: 'Cliente vérifiée',
    quote: "Manette reçue grade A, impeccable. Le prix a même baissé de quelques euros entre ma commande et l'expédition."
  },
  {
    initials: 'YB',
    name: 'Yassine B.',
    role: 'Client vérifié',
    quote: 'Le système de grade rassure vraiment : je savais exactement dans quel état arriverait le clavier.'
  },
  {
    initials: 'SK',
    name: 'Sofia K.',
    role: 'Cliente vérifiée',
    quote: 'Livraison rapide, écran nickel malgré le grade B annoncé. Je recommande sans hésiter.'
  }
];

export default function Home() {
  const { products, categories, addToCart } = useShop();
  const navigate = useNavigate();

  const popular = useMemo(() => products.slice(0, 4), [products]);
  const heroProduct = popular[0];

  function goToProduct(product) {
    navigate('/shop');
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Reconditionné · Certifié par grade</span>
          <h1>Du matériel gaming remis à neuf, jamais remis en question.</h1>
          <p className="lede">
            Reforge sélectionne et inspecte des jeux, périphériques et accessoires d'occasion, puis leur
            attribue un grade NEW, A ou B avant de les proposer à prix ajusté.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Découvrir la boutique
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/shop')}>
              Voir les meilleures ventes
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{products.length || '—'}</strong>
              <span>références en stock</span>
            </div>
            <div className="hero-stat">
              <strong>12 mois</strong>
              <span>de garantie</span>
            </div>
            <div className="hero-stat">
              <strong>30 jours</strong>
              <span>pour changer d'avis</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          {heroProduct && (
            <img
              src={heroProduct.imageUrl}
              alt=""
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          )}
          {heroProduct && (
            <div className="hero-card-float">
              <div>
                <div className="label">Nouveauté du moment</div>
                <div className="value">{heroProduct.name}</div>
              </div>
              <div className="price">{currency.format(heroProduct.basePrice || 0)}</div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">Acheter par catégorie</span>
            <h2>Trois familles de produits reconditionnés</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button className="category-card" key={category.id ?? category.name} onClick={() => navigate('/shop')}>
              <span className="count">
                {category.productCount != null ? `${category.productCount} produits` : 'Collection'}
              </span>
              <div>
                <h3>{category.name}</h3>
                <span className="accent">Voir la sélection →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">Sélection du moment</span>
            <h2>Produits populaires</h2>
          </div>
          <button className="view-link" onClick={() => navigate('/shop')}>
            Tout voir
          </button>
        </div>
        {popular.length ? (
          <div className="product-grid">
            {popular.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={goToProduct}
                onQuickAdd={(p) => addToCart(p.units?.[0]?.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">Le catalogue se charge, revenez dans un instant.</div>
        )}
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">Pourquoi Reforge</span>
            <h2>Pourquoi nous choisir</h2>
          </div>
        </div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="eyebrow">Avis clients</span>
            <h2>Ce qu'en disent nos clients</h2>
          </div>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <span className="testimonial-stars">★★★★★</span>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{testimonial.initials}</span>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="promo-banner">
        <div>
          <span className="eyebrow">{weekOffer.headline}</span>
          <h2>{weekOffer.text}</h2>
          <p>Valable sur toute la boutique, sans code promo à saisir.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>
          {weekOffer.cta}
        </button>
      </section>
    </>
  );
}
