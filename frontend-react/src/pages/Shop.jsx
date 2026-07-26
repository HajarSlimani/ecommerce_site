import React, { useEffect, useMemo, useState } from 'react';
import { currency, FALLBACK_IMAGE } from '../lib/api.js';
import { useShop } from '../context/ShopContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import GradeSeal from '../components/GradeSeal.jsx';

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom (A → Z)' }
];

export default function Shop() {
  const {
    products,
    selectedProduct,
    selectedUnit,
    setSelectedProductId,
    setSelectedUnitId,
    addToCart,
    busy,
    loading,
    message
  } = useShop();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return ['all', ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter((product) => product.category === activeCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (product) =>
          product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term)
      );
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sort === 'name-asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [products, activeCategory, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search, sort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectProduct(product) {
    setSelectedProductId(product.id);
    setSelectedUnitId(product.units?.[0]?.id || null);
  }

  return (
    <>
      <div className="section-head">
        <div>
          <span className="eyebrow">Catalogue complet</span>
          <h2>Boutique</h2>
        </div>
        {message && <span className="status-pill">{message}</span>}
      </div>

      <div className="two-col">
        <section>
          <div className="shop-toolbar">
            <div className="search-field">
              <input
                type="search"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Rechercher un produit"
              />
            </div>

            <div className="filter-pills" role="group" aria-label="Filtrer par catégorie">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category === 'all' ? 'Toutes catégories' : category}
                </button>
              ))}
            </div>

            <select
              className="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Trier les produits"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Trier : {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="results-count">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>

          {pageItems.length ? (
            <div className="product-grid">
              {pageItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  active={product.id === selectedProduct?.id}
                  onSelect={selectProduct}
                  onQuickAdd={(p) => {
                    selectProduct(p);
                    addToCart(p.units?.[0]?.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucun produit ne correspond à ta recherche pour le moment.</div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`page-btn ${page === pageNumber ? 'active' : ''}`}
                  onClick={() => setPage(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="detail-panel">
          <div className="product-media">
            {selectedProduct && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            )}
          </div>

          <span className="eyebrow">Produit sélectionné</span>
          <h2>{selectedProduct?.name || '—'}</h2>
          <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>{selectedProduct?.description}</p>

          <div className="summary-row">
            <span className="label">Prix</span>
            <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Unité sélectionnée</span>
            <strong>{selectedUnit?.serialNumber || '—'}</strong>
          </div>

          <div className="unit-list">
            {selectedProduct?.units?.map((unit) => (
              <button
                key={unit.id}
                className={`unit-item ${unit.id === selectedUnit?.id ? 'selected' : ''}`}
                onClick={() => setSelectedUnitId(unit.id)}
                type="button"
              >
                <div>
                  <strong>{unit.serialNumber}</strong>
                  <p><GradeSeal grade={unit.grade} /> · {unit.status}</p>
                </div>
                <span className="price">{currency.format(unit.currentPrice)}</span>
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={() => addToCart()}
            disabled={busy || loading || !selectedUnit}
            type="button"
          >
            Ajouter au panier
          </button>
        </aside>
      </div>
    </>
  );
}
