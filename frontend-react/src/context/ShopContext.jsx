import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_USER_ID, fallbackProducts, fetchJson, normalizeProducts } from '../lib/api.js';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pricingScore, setPricingScore] = useState(0.78);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const selectedUnit = useMemo(() => {
    if (!selectedProduct) {
      return null;
    }
    return selectedProduct.units?.find((unit) => unit.id === selectedUnitId) || selectedProduct.units?.[0] || null;
  }, [selectedProduct, selectedUnitId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct && !selectedProductId) {
      setSelectedProductId(selectedProduct.id);
    }
  }, [selectedProduct, selectedProductId]);

  async function loadData() {
    setLoading(true);
    try {
      const [productsResponse, cartResponse, ordersResponse] = await Promise.all([
        fetchJson('/api/products'),
        fetchJson(`/api/cart/${DEMO_USER_ID}`),
        fetchJson(`/api/orders/${DEMO_USER_ID}`)
      ]);

      const normalizedProducts = normalizeProducts(productsResponse);
      setProducts(normalizedProducts.length ? normalizedProducts : fallbackProducts);
      setSelectedProductId(normalizedProducts[0]?.id || fallbackProducts[0].id);
      setSelectedUnitId(normalizedProducts[0]?.units?.[0]?.id || fallbackProducts[0].units[0].id);
      setCart(cartResponse);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setMessage('Boutique chargée et connectée au backend.');
    } catch (error) {
      setProducts(fallbackProducts);
      setSelectedProductId(fallbackProducts[0].id);
      setSelectedUnitId(fallbackProducts[0].units[0].id);
      setMessage('Backend indisponible, affichage du mode démo local.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshPricing(productId = selectedProduct?.id) {
    if (!productId) {
      return;
    }

    setBusy(true);
    try {
      await fetchJson(`/api/products/${productId}/price/refresh?demandScore=${pricingScore}`, {
        method: 'POST'
      });
      await loadData();
      setMessage('Prix dynamique recalculé avec succès.');
    } catch (error) {
      setMessage('Impossible de recalculer le prix pour le moment.');
    } finally {
      setBusy(false);
    }
  }

  async function addToCart(unitId = selectedUnit?.id) {
    if (!unitId) {
      return;
    }

    setBusy(true);
    try {
      const updatedCart = await fetchJson(`/api/cart/${DEMO_USER_ID}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUnitId: unitId, quantity: 1 })
      });
      setCart(updatedCart);
      setMessage('Article ajouté au panier.');
    } catch (error) {
      setMessage('Impossible d’ajouter cet article au panier.');
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    try {
      const order = await fetchJson(`/api/orders/${DEMO_USER_ID}/checkout`, {
        method: 'POST'
      });
      setOrders((current) => [order, ...current]);
      const refreshedCart = await fetchJson(`/api/cart/${DEMO_USER_ID}`);
      setCart(refreshedCart);
      setMessage('Commande validée.');
    } catch (error) {
      setMessage('Checkout impossible pour le moment.');
    } finally {
      setBusy(false);
    }
  }

  const totalCart = cart?.items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;
  const totalUnits = products.reduce((sum, product) => sum + (product.units?.length || 0), 0);
  const avgPrice = products.length
    ? products.reduce((sum, product) => sum + Number(product.basePrice || 0), 0) / products.length
    : 0;

  const value = {
    products,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    selectedUnit,
    selectedUnitId,
    setSelectedUnitId,
    cart,
    orders,
    loading,
    busy,
    message,
    pricingScore,
    setPricingScore,
    loadData,
    refreshPricing,
    addToCart,
    checkout,
    totalCart,
    totalUnits,
    avgPrice
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
