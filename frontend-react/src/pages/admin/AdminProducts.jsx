import React, { useState } from 'react';
import { authFetchJson, currency } from '../../lib/api.js';
import { useShop } from '../../context/ShopContext.jsx';

const EMPTY_FORM = { categoryId: '', name: '', description: '', basePrice: '', imageUrl: '' };

export default function AdminProducts() {
  const {
    products,
    categories,
    selectedProduct,
    selectedUnit,
    setSelectedProductId,
    setSelectedUnitId,
    pricingScore,
    setPricingScore,
    refreshPricing,
    busy,
    loading,
    loadData
  } = useShop();

  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormError('');

    if (!form.categoryId || !form.name.trim() || !form.basePrice) {
      setFormError('Catégorie, nom et prix de base sont obligatoires.');
      return;
    }

    setCreating(true);
    try {
      await authFetchJson('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          description: form.description.trim() || null,
          basePrice: Number(form.basePrice),
          imageUrl: form.imageUrl.trim() || null
        })
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.message || 'La création du produit a échoué.');
    } finally {
      setCreating(false);
    }
  }

  function gradesOf(product) {
    const counts = {};
    (product.units || []).forEach((unit) => {
      counts[unit.grade] = (counts[unit.grade] || 0) + 1;
    });
    return counts;
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1 style={{ fontSize: 30 }}>Produits</h1>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Annuler' : '+ Ajouter un produit'}
        </button>
      </div>

      {showForm && (
        <section className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-title">
            <div>
              <span className="eyebrow">Nouvelle fiche</span>
              <h2>Ajouter un produit</h2>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-field">
              <label htmlFor="new-product-category">Catégorie</label>
              <select
                id="new-product-category"
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
              >
                <option value="">Choisir une catégorie…</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="new-product-name">Nom</label>
              <input
                id="new-product-name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="new-product-description">Description</label>
              <input
                id="new-product-description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="new-product-price">Prix de base (€)</label>
              <input
                id="new-product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(event) => updateField('basePrice', event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="new-product-image">URL image (optionnel)</label>
              <input
                id="new-product-image"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
              />
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button className="btn btn-primary btn-full" style={{ marginTop: 18 }} type="submit" disabled={creating}>
              {creating ? 'Création…' : 'Créer le produit'}
            </button>
          </form>
        </section>
      )}

      <div className="two-col">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Produit à ajuster</span>
              <h2>Sélection</h2>
            </div>
          </div>

          {products.map((product) => (
            <button
              key={product.id}
              className={`admin-row ${product.id === selectedProduct?.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedProductId(product.id);
                setSelectedUnitId(product.units?.[0]?.id || null);
              }}
              type="button"
            >
              <span>{product.name}</span>
              <strong>{currency.format(product.basePrice || 0)}</strong>
            </button>
          ))}
        </section>

        <aside className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">Moteur de prix dynamique</span>
              <h2>{selectedProduct?.name || '—'}</h2>
            </div>
          </div>

          <div className="summary-row">
            <span className="label">Prix de base</span>
            <strong>{selectedProduct ? currency.format(selectedProduct.basePrice || 0) : '—'}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Unité sélectionnée</span>
            <strong>{selectedUnit?.serialNumber || '—'}</strong>
          </div>
          <div className="summary-row">
            <span className="label">Prix unité</span>
            <strong>{selectedUnit ? currency.format(selectedUnit.currentPrice) : '—'}</strong>
          </div>

          <label className="range-field">
            Demande simulée
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={pricingScore}
              onChange={(event) => setPricingScore(Number(event.target.value))}
            />
            <span>{pricingScore.toFixed(2)}</span>
          </label>

          <button
            className="btn btn-primary btn-full"
            onClick={() => refreshPricing()}
            disabled={busy || loading}
            type="button"
          >
            Recalculer le prix
          </button>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-title">
          <div>
            <span className="eyebrow">Catalogue complet</span>
            <h2>{products.length} produits</h2>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Grades en stock</th>
              <th className="num">Unités</th>
              <th className="num">Prix de base</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const grades = gradesOf(product);
              return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Object.keys(grades).length === 0 && <span style={{ color: 'var(--muted)' }}>—</span>}
                      {Object.entries(grades).map(([grade, count]) => (
                        <span key={grade} className="grade-seal" data-grade={grade}>{grade} ×{count}</span>
                      ))}
                    </div>
                  </td>
                  <td className="mono num">{(product.units || []).length}</td>
                  <td className="mono num">{currency.format(product.basePrice || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
