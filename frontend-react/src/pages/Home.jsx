import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, currency, weekOffer } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';

export default function Home() {
  const { products, addToCart, setSelectedProductId, setSelectedUnitId } = useShop();
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = useMemo(() => {
    const top = products.slice(0, 3);
    if (!top.length) {
      return [{ key: 'demo', tag: 'New drop', title: 'CYBER KID INFINI', text: 'La sélection cyber du moment.', price: null }];
    }
    const tags = ['New drop', 'HOT deal', 'Pro pick'];
    return top.map((product, index) => ({
      key: product.id,
      tag: tags[index] || 'Selection',
      title: product.name,
      text: product.description,
      price: product.basePrice
    }));
  }, [products]);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (slideIndex >= slides.length) {
      setSlideIndex(0);
    }
  }, [slides.length, slideIndex]);

  function openProduct(product) {
    setSelectedProductId(product.id);
    setSelectedUnitId(product.units?.[0]?.id || null);
    navigate('/shop');
  }

  function quickAdd(event, product) {
    event.stopPropagation();
    setSelectedProductId(product.id);
    setSelectedUnitId(product.units?.[0]?.id || null);
    addToCart(product.units?.[0]?.id);
  }

  return (
    <>
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Boutique de jeux</p>
          <h1>Améliorez votre jeu</h1>
          <p className="hero-brand-line">CYBER KID INFINI</p>
          <p className="hero-text">
            Disponible sur PC et console. Une boutique pensée comme un site vitrine gaming :
            hero fort, best sellers, promos et catégories.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate('/shop')}>
              Acheter
            </button>
            <button className="secondary-btn" onClick={() => navigate('/shop')}>
              Découvrir la boutique
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-caption">New drop / cyber selection</div>
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="floating-card floating-card-main">
            <div className="floating-label">Nouveauté</div>
            <div className="floating-value">{slides[slideIndex]?.title || '—'}</div>
            <div className="floating-meta">
              {slides[slideIndex]?.price != null ? currency.format(slides[slideIndex].price) : 'Bientôt disponible'}
            </div>
          </div>

          <div className="floating-card floating-card-side">
            <div className="floating-label">Catalogue</div>
            <div className="floating-value">{products.length}</div>
            <div className="floating-meta">références en stock</div>
          </div>
        </div>
      </section>

      <section className="banner-slider" aria-label="Meilleures ventes et nouveautés">
        <div className="banner-track">
          {slides.map((slide, index) => (
            <article key={slide.key} className={`banner-slide ${index === slideIndex ? 'active' : ''}`}>
              <span className="banner-tag">{slide.tag}</span>
              <h3>{slide.title}</h3>
              <p>{slide.text}</p>
              {slide.price != null && <strong>{currency.format(slide.price)}</strong>}
            </article>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="banner-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                className={`banner-dot ${index === slideIndex ? 'active' : ''}`}
                onClick={() => setSlideIndex(index)}
                aria-label={`Diapositive ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="content-grid single">
        <section className="panel" id="best-sellers">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Meilleures ventes</p>
              <h2>MEILLEURES VENTES</h2>
            </div>
            <button className="view-link" onClick={() => navigate('/shop')}>
              Tout voir
            </button>
          </div>

          <div className="product-grid">
            {products.slice(0, 6).map((product, index) => (
              <button key={product.id} className="product-card" onClick={() => openProduct(product)}>
                <div className="product-image">
                  <span>{index === 0 ? 'New' : index === 1 ? 'HOT' : 'Pro'}</span>
                  <div className="product-hover-overlay">
                    <span className="quick-add" onClick={(event) => quickAdd(event, product)}>
                      Ajout rapide
                    </span>
                  </div>
                </div>
                <div className="product-content">
                  <div className="product-category">{product.category || 'Prix'}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <strong>{currency.format(product.basePrice || 0)}</strong>
                    <span>Ajouter au panier</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="content-grid single">
        <div className="panel-header standalone">
          <div>
            <p className="panel-kicker">Acheter par catégorie</p>
            <h2>ACHETER PAR CATÉGORIE</h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button className={`category-card category-${category.key}`} key={category.key} onClick={() => navigate('/shop')}>
              <div className="category-glow" />
              <div>
                <p className="panel-kicker">Collection</p>
                <h3>{category.name}</h3>
              </div>
              <span>{category.accent} →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="offer-panel" id="promo">
        <div>
          <p className="panel-kicker">Offres de la semaine</p>
          <h2>{weekOffer.headline}</h2>
          <p className="offer-emphasis">{weekOffer.text}</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/shop')}>
          {weekOffer.cta}
        </button>
      </section>
    </>
  );
}
