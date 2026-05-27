const KEYS = {
  products:   "onepc_products",
  banners:    "onepc_banners",
  categories: "onepc_categories",
  brands:     "onepc_brands",
  components: "onepc_components",
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function read(key, fallback=[]) {
  try { const d=localStorage.getItem(key); return d?JSON.parse(d):fallback; } catch { return fallback; }
}
function write(key, data, event) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event(event||key+"_updated"));
    window.dispatchEvent(new StorageEvent("storage",{key,newValue:JSON.stringify(data),storageArea:localStorage}));
  } catch(e) {
    if(e.name==="QuotaExceededError") {
      alert("⚠️ Almacenamiento lleno. Usa imágenes más pequeñas o limpia el caché.");
    }
  }
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export function getProducts()    { return read(KEYS.products); }
export function saveProducts(p)  { write(KEYS.products, p, "onepc_updated"); }

export function addProduct(p) {
  const stock=+p.stock||0;
  const price=+p.price||0;
  const oldPrice=+p.oldPrice||price;
  const discount=+p.discount||(oldPrice>price?Math.round((1-price/oldPrice)*100):0);
  const np={
    id:Date.now(), name:p.name||"", brand:p.brand||"", brandId:p.brandId||null,
    category:p.category||"Torres", subcategory:p.subcategory||"",
    productType:p.productType||"torre", // "torre" | "portatil"
    price, oldPrice, discount, stock,
    img:p.img||"", description:p.description||"",
    sku:p.sku||"SKU-"+Date.now(),
    rating:5, reviews:0,
    status:stock===0?"Agotado":stock<=5?"Pocas unidades":"Disponible",
    components:p.components||{}, // componentes configurados
  };
  const list=[np,...getProducts()];
  saveProducts(list);
  return np;
}

export function updateProduct(id,data) {
  const stock=+data.stock||0;
  const list=getProducts().map(p=>p.id===id?{
    ...p,...data,
    price:+data.price||0, oldPrice:+data.oldPrice||+data.price||0,
    discount:+data.discount||0, stock,
    status:stock===0?"Agotado":stock<=5?"Pocas unidades":"Disponible",
  }:p);
  saveProducts(list);
}

export function deleteProduct(id)  { saveProducts(getProducts().filter(p=>p.id!==id)); }
export function updateStock(id,d)  {
  const list=getProducts().map(p=>{
    if(p.id!==id) return p;
    const s=Math.max(0,(p.stock||0)+d);
    return{...p,stock:s,status:s===0?"Agotado":s<=5?"Pocas unidades":"Disponible"};
  });
  saveProducts(list);
}

// ── BRANDS ────────────────────────────────────────────────────────────────────
const DEFAULT_BRANDS = [
  {id:1,name:"ASUS",   logo:"",activo:true},
  {id:2,name:"MSI",    logo:"",activo:true},
  {id:3,name:"HP",     logo:"",activo:true},
  {id:4,name:"Lenovo", logo:"",activo:true},
  {id:5,name:"Acer",   logo:"",activo:true},
  {id:6,name:"Dell",   logo:"",activo:true},
  {id:7,name:"AMD",    logo:"",activo:true},
  {id:8,name:"Intel",  logo:"",activo:true},
];

export function getBrands()   { return read(KEYS.brands, DEFAULT_BRANDS); }
export function saveBrands(b) { write(KEYS.brands, b, "onepc_brands_updated"); }

export function addBrand(b) {
  const list=[...getBrands(),{id:Date.now(),name:b.name||"",logo:b.logo||"",activo:true}];
  saveBrands(list); return list;
}
export function updateBrand(id,data) { saveBrands(getBrands().map(b=>b.id===id?{...b,...data}:b)); }
export function deleteBrand(id)      { saveBrands(getBrands().filter(b=>b.id!==id)); }
export function toggleBrand(id)      { saveBrands(getBrands().map(b=>b.id===id?{...b,activo:!b.activo}:b)); }

// ── COMPONENTS CONFIG ─────────────────────────────────────────────────────────
// Estructura: { productId: { ram:[{label,price,incluido}], ssd:[...], gpu:[...], fuente:[...], refrigeracion:[...] } }
const DEFAULT_COMPONENTS = {};

export function getAllComponents()          { return read(KEYS.components, DEFAULT_COMPONENTS); }
export function getProductComponents(pid)  { return getAllComponents()[pid]||{}; }
export function saveAllComponents(c)       { write(KEYS.components, c, "onepc_components_updated"); }

export function saveProductComponents(pid, comps) {
  const all={...getAllComponents(),[pid]:comps};
  saveAllComponents(all);
}

export function deleteProductComponents(pid) {
  const all=getAllComponents(); delete all[pid]; saveAllComponents(all);
}

// ── COMPONENT TYPES ───────────────────────────────────────────────────────────
export const COMP_TYPES_TORRE = [
  {key:"ram",          label:"Memoria RAM"},
  {key:"ssd",          label:"Almacenamiento SSD M.2"},
  {key:"gpu",          label:"Tarjeta Gráfica"},
  {key:"fuente",       label:"Fuente de Poder"},
  {key:"refrigeracion",label:"Refrigeración"},
];

export const COMP_TYPES_PORTATIL = [
  {key:"ram", label:"Memoria RAM"},
  {key:"ssd", label:"Almacenamiento SSD M.2"},
];

export const DEFAULT_OPTIONS = {
  ram:           [{label:"16 GB DDR4",price:0,incluido:true},{label:"32 GB DDR4",price:180000,incluido:false},{label:"64 GB DDR4",price:420000,incluido:false}],
  ssd:           [{label:"512 GB NVMe",price:0,incluido:true},{label:"1 TB NVMe",price:150000,incluido:false},{label:"2 TB NVMe",price:350000,incluido:false}],
  gpu:           [{label:"Integrada",price:0,incluido:true},{label:"RTX 3050",price:650000,incluido:false},{label:"RTX 4060",price:1200000,incluido:false},{label:"RTX 4070",price:1900000,incluido:false}],
  fuente:        [{label:"350W Estándar",price:0,incluido:true},{label:"650W Bronze",price:120000,incluido:false},{label:"750W Gold",price:280000,incluido:false}],
  refrigeracion: [{label:"Aire estándar",price:0,incluido:true},{label:"Aire premium",price:80000,incluido:false},{label:"Líquida 240mm",price:250000,incluido:false},{label:"Líquida 360mm",price:420000,incluido:false}],
};

// ── BANNERS / CATEGORIES (compatibilidad) ─────────────────────────────────────
export function getBanners()    { return read(KEYS.banners,    []); }
export function saveBanners(b)  { write(KEYS.banners, b, "onepc_banners_updated"); }
export function getCategories() { return read(KEYS.categories, []); }
export function saveCategories(c){ write(KEYS.categories, c, "onepc_categories_updated"); }