// ═══════════════════════════════════════════════════
// src/utils/store.js — ONE PC · Supabase backend
// ═══════════════════════════════════════════════════

const SUPABASE_URL = "https://kakdalmfgzdqexanrcbn.supabase.co";
const SUPABASE_KEY = "sb_publishable_qwTzGRKJmC3EUnrRzxq_xA_BHmtxJAN";

const headers = {
  "Content-Type":  "application/json",
  "apikey":        SUPABASE_KEY,
  "Authorization": "Bearer " + SUPABASE_KEY,
  "Prefer":        "return=representation",
};

async function sbGet(table) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers });
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

async function sbUpsert(table, body) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:  "POST",
      headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body:    JSON.stringify(body),
    });
    return r.ok;
  } catch { return false; }
}

async function sbDelete(table, match) {
  try {
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${v}`).join("&");
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: "DELETE", headers,
    });
    return r.ok;
  } catch { return false; }
}

// ── Dispatch eventos para que App.jsx refresque ────
function dispatch(event) {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(event));
}

// ══════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════
export async function getProducts() {
  const rows = await sbGet("products");
  return rows.map(r => r.data).sort((a,b) => b.id - a.id);
}

export async function saveProducts(list) {
  // Borra todo y reinserta (usado para limpiar)
  await fetch(`${SUPABASE_URL}/rest/v1/products?id=gte.0`, { method:"DELETE", headers });
  if (list.length > 0) {
    await sbUpsert("products", list.map(p => ({ id: p.id, data: p })));
  }
  dispatch("onepc_updated");
}

export async function addProduct(p) {
  const stock = +p.stock || 0;
  const price = +p.price || 0;
  const oldPrice = +p.oldPrice || price;
  const discount = +p.discount || (oldPrice > price ? Math.round((1 - price/oldPrice)*100) : 0);
  const np = {
    id: Date.now(),
    name: p.name||"", brand: p.brand||"", brandId: p.brandId||null,
    category: p.category||"Torres", subcategory: p.subcategory||"",
    productType: p.productType||"torre",
    price, oldPrice, discount, stock,
    img: p.img||"", images: p.images||[], description: p.description||"",
    sku: p.sku||"SKU-"+Date.now(),
    rating: 5, reviews: 0,
    status: stock===0?"Agotado":stock<=5?"Pocas unidades":"Disponible",
  };
  await sbUpsert("products", [{ id: np.id, data: np }]);
  dispatch("onepc_updated");
  return np;
}

export async function updateProduct(id, data) {
  const stock = +data.stock || 0;
  const products = await getProducts();
  const existing = products.find(p => p.id === id) || {};
  const updated = {
    ...existing, ...data,
    id,
    price: +data.price||0,
    oldPrice: +data.oldPrice||+data.price||0,
    discount: +data.discount||0,
    stock,
    status: stock===0?"Agotado":stock<=5?"Pocas unidades":"Disponible",
  };
  await sbUpsert("products", [{ id, data: updated }]);
  dispatch("onepc_updated");
}

export async function deleteProduct(id) {
  await sbDelete("products", { id });
  dispatch("onepc_updated");
}

export async function updateStock(id, delta) {
  const products = await getProducts();
  const p = products.find(p => p.id === id);
  if (!p) return;
  const stock = Math.max(0, (p.stock||0) + delta);
  const updated = { ...p, stock, status: stock===0?"Agotado":stock<=5?"Pocas unidades":"Disponible" };
  await sbUpsert("products", [{ id, data: updated }]);
  dispatch("onepc_updated");
}

// ══════════════════════════════════════════════════════
// BRANDS
// ══════════════════════════════════════════════════════
const DEFAULT_BRANDS = [
  {id:1,name:"ASUS",logo:"",activo:true},{id:2,name:"MSI",logo:"",activo:true},
  {id:3,name:"HP",logo:"",activo:true},{id:4,name:"Lenovo",logo:"",activo:true},
  {id:5,name:"Acer",logo:"",activo:true},{id:6,name:"Dell",logo:"",activo:true},
  {id:7,name:"AMD",logo:"",activo:true},{id:8,name:"Intel",logo:"",activo:true},
];

export async function getBrands() {
  const rows = await sbGet("brands");
  if (rows.length === 0) return DEFAULT_BRANDS;
  return rows.map(r => r.data);
}

export async function saveBrands(list) {
  await fetch(`${SUPABASE_URL}/rest/v1/brands?id=gte.0`, { method:"DELETE", headers });
  if (list.length > 0) await sbUpsert("brands", list.map(b => ({ id: b.id, data: b })));
  dispatch("onepc_brands_updated");
}

export async function addBrand(b) {
  const list = await getBrands();
  const nb = { id: Date.now(), name: b.name||"", logo: b.logo||"", activo: true };
  await sbUpsert("brands", [{ id: nb.id, data: nb }]);
  dispatch("onepc_brands_updated");
  return [...list, nb];
}

export async function updateBrand(id, data) {
  const list = await getBrands();
  const updated = list.map(b => b.id===id ? {...b,...data} : b);
  await saveBrands(updated);
}

export async function deleteBrand(id) {
  await sbDelete("brands", { id });
  dispatch("onepc_brands_updated");
}

export async function toggleBrand(id) {
  const list = await getBrands();
  const updated = list.map(b => b.id===id ? {...b,activo:!b.activo} : b);
  await saveBrands(updated);
}

// ══════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════
export async function getAllComponents() {
  const rows = await sbGet("components");
  const result = {};
  rows.forEach(r => { result[r.product_id] = r.data; });
  return result;
}

export async function getProductComponents(pid) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/components?product_id=eq.${pid}&select=*`, { headers });
    if (!r.ok) return {};
    const rows = await r.json();
    return rows[0]?.data || {};
  } catch { return {}; }
}

export async function saveProductComponents(pid, comps) {
  await sbUpsert("components", [{ product_id: String(pid), data: comps }]);
}

export async function deleteProductComponents(pid) {
  await sbDelete("components", { product_id: pid });
}

// ══════════════════════════════════════════════════════
// BANNERS
// ══════════════════════════════════════════════════════
const DEFAULT_BANNERS_LIST = [
  {id:"hero1", label:"Banner Hero 1",           img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
  {id:"hero2", label:"Banner Hero 2",           img:"",imgMobile:"",activo:false,link:"",focusX:"center",focusY:"center"},
  {id:"hero3", label:"Banner Hero 3",           img:"",imgMobile:"",activo:false,link:"",focusX:"center",focusY:"center"},
  {id:"promo1",label:"Banner Oferta Izquierda", img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
  {id:"promo2",label:"Banner Oferta Derecha",   img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
];

export async function getBanners() {
  const rows = await sbGet("banners");
  if (rows.length === 0) return DEFAULT_BANNERS_LIST;
  // Merge con defaults para no perder banners nuevos
  return DEFAULT_BANNERS_LIST.map(def => {
    const found = rows.find(r => r.id === def.id);
    return found ? { ...def, ...found.data } : def;
  });
}

export async function saveBanners(list) {
  await sbUpsert("banners", list.map(b => ({ id: b.id, data: b })));
  dispatch("onepc_banners_updated");
}

// ══════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════
const DEFAULT_CATS_LIST = [
  {id:1,name:"Torres",      subcats:["Torres Gamer","Mini Torres"]},
  {id:2,name:"Portátiles",  subcats:["Portátiles Gamer","Portátiles Oficina"]},
  {id:3,name:"Monitores",   subcats:["Monitores Gamer","Monitores 4K"]},
  {id:4,name:"Accesorios",  subcats:["Teclados","Mouse","Audífonos"]},
  {id:5,name:"Componentes", subcats:["Procesadores","Tarjetas Gráficas","RAM","SSD"]},
  {id:6,name:"Combos",      subcats:["Combo Completo","Combo Periféricos"]},
];

export async function getCategories() {
  const rows = await sbGet("categories");
  if (rows.length === 0) return DEFAULT_CATS_LIST;
  return rows.map(r => r.data);
}

export async function saveCategories(list) {
  await fetch(`${SUPABASE_URL}/rest/v1/categories?id=gte.0`, { method:"DELETE", headers });
  if (list.length > 0) await sbUpsert("categories", list.map(c => ({ id: c.id, data: c })));
  dispatch("onepc_cats_updated");
}

// ══════════════════════════════════════════════════════
// COMPONENT TYPES (sin cambios — solo constantes)
// ══════════════════════════════════════════════════════
export const COMP_TYPES_TORRE = [
  {key:"ram",          label:"Memoria RAM"},
  {key:"ssd",          label:"Almacenamiento SSD M.2"},
  {key:"gpu",          label:"Tarjeta Gráfica"},
  {key:"fuente",       label:"Fuente de Poder"},
  {key:"refrigeracion",label:"Refrigeración"},
  {key:"monitor",      label:"Monitor"},
];

export const COMP_TYPES_PORTATIL = [
  {key:"ram", label:"Memoria RAM"},
  {key:"ssd", label:"Almacenamiento SSD M.2"},
];

export const COMP_TYPES_MONITOR = []; // Sin componentes configurables

export const DEFAULT_OPTIONS = {
  ram:           [{label:"16 GB DDR4",price:0,incluido:true},{label:"32 GB DDR4",price:180000,incluido:false},{label:"64 GB DDR4",price:420000,incluido:false}],
  ssd:           [{label:"512 GB NVMe",price:0,incluido:true},{label:"1 TB NVMe",price:150000,incluido:false},{label:"2 TB NVMe",price:350000,incluido:false}],
  gpu:           [{label:"Integrada",price:0,incluido:true},{label:"RTX 3050",price:650000,incluido:false},{label:"RTX 4060",price:1200000,incluido:false},{label:"RTX 4070",price:1900000,incluido:false}],
  fuente:        [{label:"350W Estándar",price:0,incluido:true},{label:"650W Bronze",price:120000,incluido:false},{label:"750W Gold",price:280000,incluido:false}],
  refrigeracion: [{label:"Aire estándar",price:0,incluido:true},{label:"Aire premium",price:80000,incluido:false},{label:"Líquida 240mm",price:250000,incluido:false},{label:"Líquida 360mm",price:420000,incluido:false}],
monitor:       [{label:"Sin monitor",price:0,incluido:true},{label:'Monitor 24" FHD',price:450000,incluido:false},{label:'Monitor 27" FHD',price:650000,incluido:false},{label:'Monitor 27" QHD',price:950000,incluido:false},{label:'Monitor 32" QHD',price:1200000,incluido:false},{label:'Monitor 32" 4K',price:1800000,incluido:false}],
};