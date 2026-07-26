import React from 'react';
import { currency, FALLBACK_IMAGE } from '../lib/api.js';
import GradeSeal from './GradeSeal.jsx';

export default function ProductCard({ product, active, onSelect, onQuickAdd }) {
  const topGrade = product.units?.[0]?.grade;

  return (
    <button
      className={`product-card ${active ? 'active' : ''}`}
      onClick={() => onSelect?.(product)}
      type="button"
    >
      <div className="product-media">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <GradeSeal grade={topGrade} />
        {onQuickAdd && (
          <span
            className="product-quick-add"
            role="button"
            aria-label="Ajout rapide au panier"
            onClick={(event) => {
              event.stopPropagation();
              onQuickAdd(product);
            }}
          >
            +
          </span>
        )}
      </div>

      <div className="product-body">
        <span className="product-category">{product.category || 'Produit'}</span>
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{currency.format(product.basePrice || 0)}</span>
          <span className="product-stock">{product.stock} en stock</span>
        </div>
      </div>
    </button>
  );
}
