// ═══════════════════════════════════════════════════
// src/utils/store.js  —  ONE PC · Utilidades de tienda
// ═══════════════════════════════════════════════════

const PROD_KEY  = "onepc_products";
const BRAND_KEY = "onepc_brands";
const COMP_KEY  = "onepc_components";

// ── Helpers ──────────────────────────────────────────
const read  = (key, fallback) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } };
const write = (key, val, event) => {
  try {
    const json = JSON.stringify(val);
    localStorage.setItem(key, json);
    // Custom event — mismo tab
    if (event) window.dispatchEvent(new Event(event));
    // StorageEvent manual — para que App.jsx lo reciba en cualquier tab/contexto
    try {
      window.dispatchEvent(new StorageEvent("storage", {
        key, newValue: json, storageArea: localStorage,
        url: window.location.href,
      }));
    } catch(_) {}
  } catch(e) {
    if (e.name === "QuotaExceededError") alert("⚠️ Almacenamiento lleno. Usa imágenes más pequeñas.");
  }
};
const uid   = () => Date.now() + Math.random().toString(36).slice(2, 6);

// ── Status helper ─────────────────────────────────────
const calcStatus = (stock) => {
  if (stock === 0) return "Agotado";
  if (stock <= 5)  return "Pocas unidades";
  return "Disponible";
};

// ══════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════
export const getProducts = () => read(PROD_KEY, []);
export const saveProducts = (list) => write(PROD_KEY, list, "onepc_updated");

export const addProduct = (data) => {
  const products = getProducts();
  const product = {
    ...data,
    id:        uid(),
    createdAt: Date.now(),
    rating:    data.rating  || 0,
    reviews:   data.reviews || 0,
    status:    calcStatus(+data.stock || 0),
  };
  saveProducts([...products, product]);
  return product;
};

export const updateProduct = (id, data) => {
  const products = getProducts().map(p =>
    p.id === id
      ? { ...p, ...data, id, updatedAt: Date.now(), status: calcStatus(+data.stock ?? p.stock) }
      : p
  );
  saveProducts(products);
};

export const deleteProduct = (id) => {
  saveProducts(getProducts().filter(p => p.id !== id));
};

export const updateStock = (id, delta) => {
  const products = getProducts().map(p => {
    if (p.id !== id) return p;
    const stock = Math.max(0, (p.stock || 0) + delta);
    return { ...p, stock, status: calcStatus(stock) };
  });
  saveProducts(products);
};

// ══════════════════════════════════════════════════════
// BRANDS
// ══════════════════════════════════════════════════════
const DEFAULT_BRANDS = [
  { id: 1, name: "AMD",      activo: true },
  { id: 2, name: "Intel",    activo: true },
  { id: 3, name: "NVIDIA",   activo: true },
  { id: 4, name: "ASUS",     activo: true },
  { id: 5, name: "MSI",      activo: true },
  { id: 6, name: "GIGABYTE", activo: true },
  { id: 7, name: "HP",       activo: true },
  { id: 8, name: "SAMSUNG",  activo: true },
];

export const getBrands      = () => read(BRAND_KEY, DEFAULT_BRANDS);
export const saveBrands     = (list) => { write(BRAND_KEY, list, "onepc_brands_updated"); };
export const addBrand       = (data) => saveBrands([...getBrands(), { ...data, id: uid(), activo: true }]);
export const updateBrand    = (id, data) => saveBrands(getBrands().map(b => b.id === id ? { ...b, ...data } : b));
export const deleteBrand    = (id) => saveBrands(getBrands().filter(b => b.id !== id));
export const toggleBrand    = (id) => saveBrands(getBrands().map(b => b.id === id ? { ...b, activo: !b.activo } : b));

// ══════════════════════════════════════════════════════
// COMPONENTS (per-product configurator)
// ══════════════════════════════════════════════════════

// Tipos de componente según tipo de producto
export const COMP_TYPES_TORRE = [
  { key: "ram",          label: "Memoria RAM"       },
  { key: "ssd",          label: "Almacenamiento SSD" },
  { key: "gpu",          label: "Tarjeta Gráfica"   },
  { key: "fuente",       label: "Fuente de Poder"   },
  { key: "refrigeracion",label: "Refrigeración"     },
];

export const COMP_TYPES_PORTATIL = [
  { key: "ram",  label: "Memoria RAM"        },
  { key: "ssd",  label: "Almacenamiento SSD" },
  { key: "gpu",  label: "Tarjeta Gráfica"    },
];

// Opciones base por defecto para cada tipo
export const DEFAULT_OPTIONS = {
  ram: [
    { label: "8 GB DDR4",  price: 0,       incluido: true  },
    { label: "16 GB DDR4", price: 150000,  incluido: false },
    { label: "32 GB DDR4", price: 380000,  incluido: false },
  ],
  ssd: [
    { label: "256 GB NVMe", price: 0,       incluido: true  },
    { label: "512 GB NVMe", price: 120000,  incluido: false },
    { label: "1 TB NVMe",   price: 220000,  incluido: false },
  ],
  gpu: [
    { label: "Gráfica integrada",  price: 0,       incluido: true  },
    { label: "RX 6600 8 GB",       price: 800000,  incluido: false },
    { label: "RTX 4060 8 GB",      price: 1400000, incluido: false },
  ],
  fuente: [
    { label: "500W 80+ Bronze", price: 0,      incluido: true  },
    { label: "650W 80+ Gold",   price: 120000, incluido: false },
    { label: "750W 80+ Gold",   price: 190000, incluido: false },
  ],
  refrigeracion: [
    { label: "Ventilador stock",       price: 0,      incluido: true  },
    { label: "Cooler 120mm disipador", price: 90000,  incluido: false },
    { label: "Líquida AIO 240mm",      price: 280000, incluido: false },
  ],
};

export const getAllComponents        = () => read(COMP_KEY, {});
export const getProductComponents   = (productId) => (read(COMP_KEY, {}))[productId] || {};
export const saveProductComponents  = (productId, comps) => {
  const all = getAllComponents();
  write(COMP_KEY, { ...all, [productId]: comps });
};
export const deleteProductComponents = (productId) => {
  const all = getAllComponents();
  delete all[productId];
  write(COMP_KEY, all);
};