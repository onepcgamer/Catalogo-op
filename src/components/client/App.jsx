// ═══════════════════════════════════════════════════
// src/App.jsx  —  ONE PC · Tienda principal · v2
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getProducts, saveProducts, addProduct, updateProduct, deleteProduct, updateStock,
  getBrands, saveBrands, addBrand, updateBrand, deleteBrand, toggleBrand,
  getAllComponents, getProductComponents, saveProductComponents, deleteProductComponents,
  getBanners, saveBanners, getCategories, saveCategories,
  COMP_TYPES_TORRE, COMP_TYPES_PORTATIL, COMP_TYPES_MONITOR, DEFAULT_OPTIONS,
} from "../../utils/store.js";

// Guard: solo corre en cliente (Astro SSR safe)
const isBrowser = typeof window !== "undefined";

// datos desde Supabase via store.js

const DEFAULT_CATS = [
  { id: 1, name: "Combos",      img: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=200&q=80", desc: "Arma tu set perfecto" },
  { id: 2, name: "Torres",      img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&q=80", desc: "Potencia y diseño" },
  { id: 3, name: "Portátiles",  img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&q=80", desc: "Rendimiento portátil" },
  { id: 4, name: "Monitores",   img: "https://images.unsplash.com/photo-1527443224154-c4a573d5f5b7?w=200&q=80", desc: "Imágenes increíbles" },
  { id: 5, name: "Componentes", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80", desc: "Mejora tu equipo" },
  { id: 6, name: "Accesorios",  img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&q=80", desc: "Completa tu setup" },
];

const DEFAULT_HERO = [
  { title: "Tu experiencia gamer", highlight: "al máximo nivel",       sub: "Equipos de alto rendimiento para llevar tu juego al siguiente nivel.", img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80" },
  { title: "Portátiles gamer",     highlight: "para los exigentes",    sub: "Rendimiento extremo donde lo necesites. Diseñados para ganar.",        img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80" },
  { title: "Componentes",          highlight: "de última generación",  sub: "Arma o actualiza tu PC con las mejores piezas del mercado.",            img: "https://images.unsplash.com/photo-1555617766-c94804975da5?w=1200&q=80" },
];

const BRANDS = [
  { name: "AMD",      logo: "https://cdn.worldvectorlogo.com/logos/amd-logo-1.svg",         h: 30 },
  { name: "Intel",    logo: "https://1000marcas.net/wp-content/uploads/2020/02/logo-Intel.png", h: 36 },
  { name: "NVIDIA",   logo: "https://e7.pngegg.com/pngimages/534/277/png-clipart-nvidia-geforce-graphics-processing-unit-logo-nvidia-electronics-text-thumbnail.png", h: 28 },
  { name: "ASUS",     logo: "https://cdn.freebiesupply.com/logos/large/2x/asus-6630-logo-png-transparent.png", h: 38 },
  { name: "MSI",      logo: "https://1000marcas.net/wp-content/uploads/2020/03/logo-MSI.png", h: 34 },
  { name: "GIGABYTE", logo: "https://brandslogos.com/wp-content/uploads/images/large/gigabyte-logo-black-and-white-1.png", h: 24 },
  { name: "HP",       logo: "https://cdn.worldvectorlogo.com/logos/hp-2.svg",               h: 34 },
  { name: "SAMSUNG",  logo: "https://logoeps.com/wp-content/uploads/2013/05/samsung-group-vector-logo.png", h: 38 },
];
const REVIEWS = [
  { name: "Juan P.",   city: "Bogotá, Colombia",   stars: 5, text: "Excelente atención y el envío fue súper rápido. Mi PC llegó en perfecto estado y funciona increíble." },
  { name: "María G.",  city: "Medellín, Colombia",  stars: 5, text: "Armar mi PC con sus componentes fue muy fácil y la asesoría personalizada me ayudó mucho." },
  { name: "Carlos M.", city: "Cali, Colombia",       stars: 5, text: "Los mejores precios del mercado y garantía real. Totalmente recomendados para gamers." },
];

const fmt    = n => "$" + Number(n).toLocaleString("es-CO");
const WA     = "573202344876";
const openWA = msg => window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");

// ── CSS global ────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { overflow-x: hidden; scroll-behavior: smooth; }
  body { font-family: 'Poppins', sans-serif; background: #fff; color: #111; overflow-x: hidden; max-width: 100vw; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

  /* ── BUTTONS ── */
  .btn-primary  { background: #5b21b6; color: #fff; border: none; border-radius: 8px; padding: 11px 22px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; font-family: 'Poppins', sans-serif; }
  .btn-primary:hover { background: #4c1d95; transform: translateY(-1px); }
  .btn-outline  { background: transparent; color: #fff; border: 2px solid #fff; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; }
  .btn-cart     { width: 100%; background: #fff; color: #111; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 10px 0; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s; margin-top: 10px; font-family: 'Poppins', sans-serif; }
  .btn-cart:hover { border-color: #5b21b6; color: #5b21b6; }

  /* ── TYPOGRAPHY ── */
  .section-title { font-size: clamp(18px, 2.5vw, 26px); font-weight: 800; margin-bottom: 4px; }
  .section-link  { font-size: 13px; color: #5b21b6; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
  .section-link:hover { text-decoration: underline; }

  /* ── CARDS ── */
  .product-card  { border: 1.5px solid #f0f0f0; border-radius: 14px; overflow: hidden; cursor: pointer; transition: all .22s; background: #fff; }
  .product-card:hover { border-color: #5b21b6; box-shadow: 0 8px 32px #5b21b611; transform: translateY(-4px); }
  .product-card:hover .pcard-img { transform: scale(1.04); }
  .pcard-img     { width: 100%; height: clamp(130px,20vw,200px); object-fit: cover; transition: transform .35s; display: block; background: #f9fafb; }
  .cat-card      { border: 1.5px solid #f0f0f0; border-radius: 14px; overflow: hidden; cursor: pointer; transition: all .22s; text-align: center; background: #fff; }
  .cat-card:hover { border-color: #5b21b6; box-shadow: 0 8px 24px #5b21b611; transform: translateY(-3px); }

  /* ── NAV ── */
  .nav-link      { font-size: 14px; font-weight: 500; color: #d1d5db; cursor: pointer; transition: color .18s; padding: 4px 0; white-space: nowrap; }
  .nav-link:hover { color: #fff; }
  .nav-link.active { color: #a78bfa; font-weight: 700; }

  /* ── MISC ── */
  .badge-discount { background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; position: absolute; top: 10px; left: 10px; }
  .review-card   { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 14px; padding: 20px; flex: 1; min-width: 0; width: 100%; }
  .footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: #fff; }
  .footer-link   { font-size: 13px; color: #9ca3af; cursor: pointer; margin-bottom: 8px; display: block; transition: color .18s; }
  .footer-link:hover { color: #fff; }
  .input-field   { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 11px 14px; font-size: 13px; outline: none; transition: border-color .18s; font-family: 'Poppins', sans-serif; }
  .input-field:focus { border-color: #5b21b6; }

  /* ── WHATSAPP FAB ── */
  .wa-fab { position: fixed; bottom: 20px; right: 16px; z-index: 998; cursor: pointer; transition: transform .25s, box-shadow .25s; width: 50px; height: 50px; border-radius: 50%; background: #25d366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px #25d36655; }
  .wa-fab:hover { transform: scale(1.12); box-shadow: 0 8px 32px #25d36688; }

  /* ── HERO ── */
  .hero-wrap { position: relative; overflow: hidden; background: #000; width: 100%; height: 56vw; min-height: 300px; max-height: 700px; }
  .hero-wrap img { object-position: center center; }
  .hero-img  { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity .4s; }
  .hero-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,.4); border: none; color: #fff; font-size: 22px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: background .18s; backdrop-filter: blur(6px); }
  .hero-arrow:hover { background: rgba(0,0,0,.7); }

  /* ── GRIDS ── */
  .cat-grid    { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
  .prod-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .promo-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 32px 0; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; gap: 32px; margin-bottom: 40px; }
  .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
  .benefits-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .reviews-row { display: flex; gap: 16px; }
  .brands-row  { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .product-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; }
  .addi-banner { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
  .newsletter-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; }

  /* ── VISIBILITY ── */
  .hide-mobile  { display: flex; }
  .hide-desktop { display: none; }

  /* ══════════════════════════════════════════════
     TABLET  ≤ 1024px
  ══════════════════════════════════════════════ */
  @media (max-width: 1024px) {
    .cat-grid    { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .prod-grid   { grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
    .hero-wrap   { height: 60vw; max-height: 580px; }
  }

  /* ══════════════════════════════════════════════
     MOBILE  ≤ 768px
  ══════════════════════════════════════════════ */
  @media (max-width: 768px) {
    /* visibility */
    .hide-mobile  { display: none !important; }
    .hide-desktop { display: flex !important; }

    /* hero */
    .hero-wrap   { height: 45vw; min-height: 200px; max-height: 300px; }
    .hero-arrow  { width: 32px; height: 32px; font-size: 18px; }

    /* grids */
    .cat-grid    { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
    .prod-grid   { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .promo-grid  { grid-template-columns: 1fr; gap: 12px; }
    .benefits-row { grid-template-columns: 1fr 1fr; gap: 14px; }
    .reviews-row  { flex-direction: column; }
    .brands-row   { gap: 10px; justify-content: center; }
    .footer-grid  { grid-template-columns: 1fr 1fr; gap: 20px; }
    .cart-layout  { grid-template-columns: 1fr; }
    .addi-banner  { flex-direction: column; gap: 16px; text-align: center; align-items: flex-start; }
    .newsletter-inner { flex-direction: column; align-items: flex-start; }
    .footer-bottom    { flex-direction: column; gap: 12px; align-items: center; }
    .product-grid-2col { grid-template-columns: 1fr; gap: 24px; }

    /* cards */
    .pcard-img   { height: clamp(110px,28vw,160px); }
    .cat-card .cat-desc { display: none; }

    /* wa fab */
    .wa-fab { bottom: 16px; right: 12px; width: 46px; height: 46px; }
  }

  /* ══════════════════════════════════════════════
     SMALL MOBILE  ≤ 480px
  ══════════════════════════════════════════════ */
  @media (max-width: 480px) {
    .cat-grid  { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; }
    .hero-wrap { height: 44vw; }
    .prod-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  }

  @media (min-width: 769px) { .hide-desktop { display: none !important; } }
`;

// ── ICONS ─────────────────────────────────────────────
const Ico = ({ d, s = 18, c = "currentColor", fill = "none" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IcoCart    = ({ s = 18, c = "currentColor" }) => <Ico d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" s={s} c={c} />;
const IcoHeart   = ({ f, s = 18 }) => <Ico d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={f ? "#ef4444" : "none"} c={f ? "#ef4444" : "currentColor"} s={s} />;
const IcoUser    = ({ s = 18 }) => <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" s={s} />;
const IcoSearch  = ({ s = 18 }) => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" s={s} />;
const IcoStar    = ({ f, s = 14 }) => <Ico d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={f ? "#f59e0b" : "none"} c="#f59e0b" s={s} />;
const IcoArrow   = ({ s = 16 }) => <Ico d="M5 12h14M12 5l7 7-7 7" s={s} />;
const IcoBack    = ({ s = 18 }) => <Ico d="M19 12H5M12 5l-7 7 7 7" s={s} />;
const IcoTrash   = ({ s = 18 }) => <Ico d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" c="#ef4444" s={s} />;
const IcoMenu    = ({ s = 22 }) => <Ico d="M3 12h18M3 6h18M3 18h18" s={s} />;
const IcoTruck   = ({ s = 22 }) => <Ico d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" s={s} />;
const IcoShield  = ({ s = 22 }) => <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" s={s} />;
const IcoLock    = ({ s = 22 }) => <Ico d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4" s={s} />;
const IcoHeadset = ({ s = 22 }) => <Ico d="M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" s={s} />;

// ── WhatsApp icon — SVG inline (sin depender de archivos externos) ────────────
const IcoWA = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#25d366" />
    <path d="M22.9 9.07A9.71 9.71 0 0016.05 6C10.56 6 6.1 10.47 6.1 15.97c0 1.75.46 3.46 1.33 4.97L6 26l5.19-1.36a9.78 9.78 0 004.86 1.24h.004c5.49 0 9.95-4.47 9.95-9.97 0-2.66-1.03-5.17-2.91-7.04zm-6.85 15.33h-.003a8.12 8.12 0 01-4.13-1.13l-.3-.18-3.08.81.82-3-.19-.31a8.09 8.09 0 01-1.24-4.32c0-4.48 3.64-8.12 8.13-8.12 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.75c-.002 4.49-3.66 8.12-8.14 8.12zm4.46-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42l-.47-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2.01 0 1.19.86 2.34.98 2.5.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" fill="white" />
  </svg>
);

const Stars = ({ r, s = 14 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => <IcoStar key={i} f={i <= Math.round(r)} s={s} />)}
  </div>
);

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 745 391.6" style={{height:38,width:"auto",display:"block",flexShrink:0}}>
    <defs><style>{`.cls-1{fill:#ff3939}.cls-2{fill:#dc853d}.cls-3{fill:#090ff4}.cls-4{fill:#db0c09}.cls-5{fill:#cb11df}.cls-6{fill:#8bf43d}`}</style></defs>
    <g>
      <path className="cls-1" d="M384.9,324.4H81.9L48.5,263.2l69.2-161.3,302.2,2,35.3,58ZM91.7,307.9H374.1l62.6-144.8-26.1-42.8-282.1-1.9L66.7,262.3Z" transform="translate(-48.5 -101.9)"/>
      <path className="cls-1" d="M288.3,280.6H177.4l-11.7-18.8,49.6-121H322l18.4,25.5ZM187.1,263.2h90.1l43.2-94.9-7.3-10.1H227l-41.8,102Z" transform="translate(-48.5 -101.9)"/>
      <path className="cls-2" d="M316.2,493.4l141-331.1H761.4l32,65.3-90.1,90.7H593.5l-35.2-57.6h75.3l28.2-27.5-5.5-11.9H568.8L490.1,404.7ZM468,178.8,349,458.3l128.4-65.5,80.5-187.9H666.8l14.7,32-41.3,40.2H587.6l15.1,24.8h93.8l77-77.6-22.3-45.5Z" transform="translate(-48.5 -101.9)"/>
      <polygon className="cls-3" points="88.5 337.8 147.4 337.8 125.1 391.5 66.2 391.5 88.5 337.8"/>
      <polygon className="cls-4" points="158 337.8 216.9 337.8 194.6 391.5 135.7 391.5 158 337.8"/>
      <polygon className="cls-5" points="226.7 337.8 285.7 337.8 263.4 391.5 204.4 391.5 226.7 337.8"/>
      <polygon className="cls-6" points="185 272.8 243.9 272.8 221.6 326.5 162.7 326.5 185 272.8"/>
    </g>
  </svg>
);

// ── PRODUCT CARD ───────────────────────────────────────
const ProductCard = ({ p, onOpen, onAdd, wish, onWish }) => (
  <div className="product-card" onClick={() => onOpen(p)}>
    <div style={{ position: "relative", overflow: "hidden" }}>
      <img className="pcard-img" src={p.img} alt={p.name} loading="lazy" />
      {p.discount > 0 && <span className="badge-discount">-{p.discount}%</span>}
      <button
        onClick={e => { e.stopPropagation(); onWish(p.id); }}
        style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px #0002" }}
      >
        <IcoHeart f={wish.includes(p.id)} s={16} />
      </button>
      {p.stock === 0 && (
        <div style={{ position: "absolute", inset: 0, background: "#00000077", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, background: "#ef444488", padding: "4px 12px", borderRadius: 20 }}>Agotado</span>
        </div>
      )}
    </div>
    <div style={{ padding: "12px 14px 14px" }}>
      <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5 }}>{p.brand}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.35, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 }}>{p.name}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>{fmt(p.price)}</span>
        {p.discount > 0 && <span style={{ background: "#fee2e2", color: "#ef4444", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4 }}>-{p.discount}%</span>}
      </div>
      {p.oldPrice > p.price && <p style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through", marginBottom: 2 }}>{fmt(p.oldPrice)}</p>}
      <button className="btn-cart" onClick={e => { e.stopPropagation(); onAdd(p); }}>
        Agregar al carrito <IcoCart s={14} />
      </button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════
// PRODUCT VIEW — fuera de App para evitar re-montaje
function ProductView({ p, onBack, onAddCart }) {
// ══════════════════════════════════════════════════════
  if (!p) return null;

  const [allComps, setAllComps] = useState({});
  useEffect(() => {
    getProductComponents(p.id).then(comps => setAllComps({ [p.id]: comps }));
  }, [p.id]);
  const comps     = allComps[p.id] || {};
  const hasComps  = Object.keys(comps).length > 0;
  const compLabels = {
    ram: "Memoria RAM", ssd: "Almacenamiento SSD",
    gpu: "Tarjeta Gráfica", fuente: "Fuente de Poder", refrigeracion: "Refrigeración",
  };

  // ── Galería ────────────────────────────────────────────────────────
  // p.images = array de URLs adicionales guardadas desde admin
  // p.img    = imagen principal (siempre existe)
  const allImages = [p.img, ...(p.images || [])].filter(Boolean);

  const [activeImg, setActiveImg] = useState(0);
  const lightboxTouchX = useRef(0);
  const [zoom,      setZoom]      = useState(false);   // hover zoom activo
  const [lightbox,  setLightbox]  = useState(false);   // modal pantalla completa
  const [mousePos,  setMousePos]  = useState({ x: 50, y: 50 }); // % para zoom

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setMousePos({ x, y });
  };

  // ── Componentes configurables ──────────────────────────────────────
  const [curSel, setCurSel] = useState(
    () => Object.fromEntries(Object.keys(comps).map(k => [k, 0]))
  );
  const setSel     = (key, val) => setCurSel(prev => ({ ...prev, [key]: val }));
  const extras     = Object.entries(curSel).reduce((s, [k, i]) => s + (comps[k]?.[i]?.price || 0), 0);
  const finalPrice = p.price + extras;

  const handleBuyWA = () => {
    const specs = Object.entries(curSel)
      .map(([k, i]) => {
        const opt = comps[k]?.[i];
        return opt ? `• ${compLabels[k] || k}: ${opt.label}${opt.price > 0 ? " (+" + fmt(opt.price) + ")" : ""}` : null;
      })
      .filter(Boolean).join("\n");
    openWA(`Hola! Me interesa:\n*${p.name}*\n${p.sku ? "SKU: " + p.sku + "\n" : ""}\n${specs ? specs + "\n" : ""}\n*Precio: ${fmt(finalPrice)}*`);
  };

  // ── CSS específico de galería ──────────────────────────────────────
  const galleryCss = `
    .gallery-main {
      width: 100%; height: clamp(220px, 50vw, 400px); object-fit: cover; display: block;
      transition: transform .1s ease;
      cursor: zoom-in;
    }
    .gallery-main.zoomed {
      cursor: zoom-out;
      transform: scale(1.85);
      transform-origin: var(--ox, 50%) var(--oy, 50%);
      transition: transform-origin 0s;
    }
    .thumb-btn {
      border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;
      cursor: pointer; transition: all .18s; background: #fff; padding: 0;
      width: clamp(56px,14vw,72px); height: clamp(56px,14vw,72px); flex-shrink: 0;
    }
    .thumb-btn:hover { border-color: #a78bfa; }
    .thumb-btn.active { border-color: #5b21b6; box-shadow: 0 0 0 2px #5b21b633; }
    .thumb-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .lightbox-overlay {
      position: fixed; inset: 0; background: #000000ee; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn .18s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .lightbox-img {
      max-width: 90vw; max-height: 90vh; object-fit: contain;
      border-radius: 8px; box-shadow: 0 0 60px #0008;
      animation: scaleIn .2s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes scaleIn { from { transform: scale(.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    .lightbox-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: #ffffff22; border: none; color: #fff; font-size: 28px;
      width: 48px; height: 48px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .18s; backdrop-filter: blur(4px);
    }
    .lightbox-nav:hover { background: #ffffff44; }
    .lightbox-close {
      position: absolute; top: 20px; right: 20px;
      background: #ffffff22; border: none; color: #fff; font-size: 22px;
      width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .18s;
    }
    .lightbox-close:hover { background: #ffffff44; }
    .lightbox-dots {
      position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px;
    }
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <style>{galleryCss}</style>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightbox(false)}
          onTouchStart={e => { lightboxTouchX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - lightboxTouchX.current;
            if (Math.abs(dx) > 50) {
              if (dx < 0) setActiveImg(i => (i + 1) % allImages.length);
              else setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
            }
          }}
        >
          <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>

          {allImages.length > 1 && (
            <button className="lightbox-nav" style={{ left: 20 }}
              onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + allImages.length) % allImages.length); }}
            >‹</button>
          )}

          <img className="lightbox-img" src={allImages[activeImg]} alt={p.name} onClick={e => e.stopPropagation()} />

          {allImages.length > 1 && (
            <button className="lightbox-nav" style={{ right: 20 }}
              onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % allImages.length); }}
            >›</button>
          )}

          {allImages.length > 1 && (
            <div className="lightbox-dots">
              {allImages.map((_, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                  style={{ width: i === activeImg ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === activeImg ? "#a78bfa" : "#ffffff66", cursor: "pointer", transition: "all .25s" }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px clamp(14px,3vw,24px)", display: "flex", alignItems: "center", gap: 8, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13, fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver
        </button>
        <span style={{ color: "#e5e7eb" }}>/</span>
        <span style={{ fontSize: 13, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
      </div>

      <div
        style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(20px,4vw,40px) clamp(16px,3vw,28px)" }}
        className="product-grid-2col"
      >
        {/* ── COLUMNA GALERÍA ── */}
        <div>
          {/* Imagen principal con zoom */}
          <div
            style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff", position: "relative" }}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              className={`gallery-main${zoom ? " zoomed" : ""}`}
              src={allImages[activeImg]}
              alt={p.name}
              style={{ "--ox": mousePos.x + "%", "--oy": mousePos.y + "%" }}
              onClick={() => setLightbox(true)}
              loading="eager"
            />
            {/* Badge descuento */}
            {p.discount > 0 && (
              <span style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>
                -{p.discount}%
              </span>
            )}
            {/* Botón lupa */}
            <button
              onClick={() => setLightbox(true)}
              style={{ position: "absolute", bottom: 12, right: 12, background: "#fff", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px #0003", opacity: .85 }}
              title="Ver en grande"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
            {/* Contador si hay varias */}
            {allImages.length > 1 && (
              <div style={{ position: "absolute", top: 12, right: 12, background: "#00000077", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                {activeImg + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`thumb-btn${i === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`Vista ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Hint zoom */}
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/></svg>
            Pasa el cursor para hacer zoom · Clic para ampliar
          </p>
        </div>

        {/* ── COLUMNA INFO ── */}
        <div>
          <p style={{ fontSize: 11, color: "#5b21b6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
            {[p.brand, p.category].filter(Boolean).join(" · ")}
          </p>
          <h1 style={{ fontSize: "clamp(17px,2.2vw,24px)", fontWeight: 800, lineHeight: 1.3, color: "#111", marginBottom: 10 }}>{p.name}</h1>

          {p.rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i <= Math.round(p.rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{p.rating} ({p.reviews || 0} reseñas)</span>
            </div>
          )}

          {/* Precio */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 900, color: "#111", letterSpacing: "-0.5px" }}>{fmt(finalPrice)}</span>
              {p.discount > 0 && <span style={{ background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>-{p.discount}%</span>}
            </div>
            {p.oldPrice > p.price && <p style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>{fmt(p.oldPrice)}</p>}
            {extras > 0 && <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginTop: 3 }}>+{fmt(extras)} en mejoras seleccionadas</p>}
          </div>

          {/* Especificaciones */}
          {p.description && (
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 20px", border: "1px solid #e5e7eb", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Especificaciones técnicas</p>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.9, whiteSpace: "pre-line" }}>{p.description}</p>
            </div>
          )}

          {/* Selectores de componentes */}
          {hasComps && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 16, textTransform: "uppercase", letterSpacing: .8 }}>Personaliza tu equipo</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {Object.entries(comps).map(([key, opts]) => {
                  if (!opts || opts.length === 0) return null;
                  const idx    = curSel[key] ?? 0;
                  const selOpt = opts[idx];
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{compLabels[key] || key}</label>
                        {selOpt?.price > 0
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6" }}>+{fmt(selOpt.price)}</span>
                          : <span style={{ fontSize: 11, color: "#9ca3af" }}>Incluido</span>
                        }
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {opts.map((o, i) => (
                          <button
                            key={i}
                            onClick={() => setSel(key, i)}
                            style={{
                              border: `1.5px solid ${idx === i ? "#5b21b6" : "#e5e7eb"}`,
                              borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600,
                              cursor: "pointer", background: idx === i ? "#eff6ff" : "#fff",
                              color: idx === i ? "#5b21b6" : "#374151",
                              transition: "all .15s", whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif",
                            }}
                          >
                            {o.label}
                            {o.price > 0 && <span style={{ fontSize: 10, marginLeft: 5, opacity: .75 }}>+{fmt(o.price)}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen de precio con upgrades */}
              {extras > 0 && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                    <span>Precio base</span><span>{fmt(p.price)}</span>
                  </div>
                  {Object.entries(curSel).map(([k, i]) => {
                    const opt = comps[k]?.[i];
                    if (!opt || opt.price === 0) return null;
                    return (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5b21b6", marginBottom: 3 }}>
                        <span>{compLabels[k] || k}</span><span>+{fmt(opt.price)}</span>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 8, color: "#111" }}>
                    <span>Total</span><span>{fmt(finalPrice)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => onAddCart({ ...p, price: finalPrice, name: p.name + (extras > 0 ? " (personalizado)" : "") })}
              style={{ flex: 1, background: "#5b21b6", color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Poppins',sans-serif", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#4c1d95"}
              onMouseLeave={e => e.currentTarget.style.background = "#5b21b6"}
            >
              Agregar al carrito
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
            </button>
            <button
              onClick={handleBuyWA}
              style={{ flex: 1, background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Poppins',sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
              onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}
            >
              {/* WhatsApp SVG inline */}
              <svg width={20} height={20} viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#25d366"/>
                <path d="M22.9 9.07A9.71 9.71 0 0016.05 6C10.56 6 6.1 10.47 6.1 15.97c0 1.75.46 3.46 1.33 4.97L6 26l5.19-1.36a9.78 9.78 0 004.86 1.24h.004c5.49 0 9.95-4.47 9.95-9.97 0-2.66-1.03-5.17-2.91-7.04zm-6.85 15.33h-.003a8.12 8.12 0 01-4.13-1.13l-.3-.18-3.08.81.82-3-.19-.31a8.09 8.09 0 01-1.24-4.32c0-4.48 3.64-8.12 8.13-8.12 2.17 0 4.21.85 5.74 2.38a8.07 8.07 0 012.38 5.75c-.002 4.49-3.66 8.12-8.14 8.12zm4.46-6.08c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42l-.47-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2.01 0 1.19.86 2.34.98 2.5.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" fill="white"/>
              </svg>
              Comprar por WhatsApp
            </button>
          </div>

          {p.stock > 0 && p.stock <= 5 && (
            <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>⚡ Solo quedan {p.stock} unidades</p>
          )}
          {p.stock === 0 && (
            <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Producto agotado</p>
          )}

          {/* Garantías */}
          <div style={{ display: "flex", gap: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0", flexWrap: "wrap" }}>
            {[
              ["Contra entrega", "A todo el país"],
              ["Garantía 12 meses", "Defectos de fábrica"],
              ["Compra segura", "Datos protegidos"],
            ].map(([t, s]) => (
              <div key={t} style={{ flex: 1, minWidth: 90 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 2 }}>{t}</p>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ── CATEGORY VIEW — standalone (fuera de App para evitar reset de estado)
// ── PRICE RANGE SLIDER — standalone, sin inputs superpuestos ─────────────────
function PriceSlider({ min, max, valueMin, valueMax, onChange, fmt }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null); // "min" | "max" | null

  const pct = v => max > min ? ((v - min) / (max - min)) * 100 : 0;

  const valueFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const step = Math.max(1000, Math.round((max - min) / 100));
    return Math.round((min + ratio * (max - min)) / step) * step;
  };

  const startDrag = (thumb, e) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const v = valueFromEvent(e);
      if (dragging === "min" && v < valueMax) onChange(v, valueMax);
      if (dragging === "max" && v > valueMin) onChange(valueMin, v);
    };
    const onUp = () => setDragging(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, valueMin, valueMax]);

  const lPct = pct(valueMin);
  const rPct = pct(valueMax);

  const thumbStyle = (active) => ({
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#5b21b6",
    border: "3px solid #fff",
    boxShadow: active ? "0 0 0 3px #5b21b644, 0 2px 8px #5b21b655" : "0 2px 6px #5b21b644",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
    transition: "box-shadow .15s",
    zIndex: 2,
  });

  return (
    <div style={{ padding: "4px 11px 0" }}>
      {/* Valores */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Mínimo</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6" }}>{fmt(valueMin)}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Máximo</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6" }}>{fmt(valueMax)}</p>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{ position: "relative", height: 4, background: "#e5e7eb", borderRadius: 2, margin: "11px 0" }}
        onClick={(e) => {
          // Click en el track: mover el thumb más cercano
          const v = valueFromEvent(e);
          const distMin = Math.abs(v - valueMin);
          const distMax = Math.abs(v - valueMax);
          if (distMin <= distMax && v < valueMax) onChange(v, valueMax);
          else if (v > valueMin) onChange(valueMin, v);
        }}
      >
        {/* Fill */}
        <div style={{
          position: "absolute", height: 4, background: "#5b21b6", borderRadius: 2,
          left: lPct + "%", width: (rPct - lPct) + "%",
        }} />

        {/* Thumb mínimo */}
        <div
          style={{ ...thumbStyle(dragging === "min"), left: lPct + "%" }}
          onMouseDown={(e) => startDrag("min", e)}
          onTouchStart={(e) => startDrag("min", e)}
        />
        {/* Thumb máximo */}
        <div
          style={{ ...thumbStyle(dragging === "max"), left: rPct + "%" }}
          onMouseDown={(e) => startDrag("max", e)}
          onTouchStart={(e) => startDrag("max", e)}
        />
      </div>

      {/* Extremos */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 10, color: "#c4b5fd" }}>{fmt(min)}</span>
        <span style={{ fontSize: 10, color: "#c4b5fd" }}>{fmt(max)}</span>
      </div>
    </div>
  );
}

function CategoryView({ PRODUCTS, selCat, search, onSearch, goHome, openProd, addCart, wish, toggleWish, fmt, openWA }) {
  const onChange = onSearch || (() => {});
  const [filterBrands, setFilterBrands] = useState([]);
  const [rangeMin,     setRangeMin]     = useState(0);
  const [rangeMax,     setRangeMax]     = useState(0);
  const [rangeReady,   setRangeReady]   = useState(false);
  const [sortBy,       setSortBy]       = useState("default");
  const [filterOpen,   setFilterOpen]   = useState(false);

  const baseProd    = PRODUCTS.filter(p => selCat === "Todos" || p.category === selCat);
  const availBrands = [...new Set(baseProd.map(p => p.brand).filter(Boolean))].sort();
  const minPriceAll = baseProd.length ? Math.min(...baseProd.map(p => p.price)) : 0;
  const maxPriceAll = baseProd.length ? Math.max(...baseProd.map(p => p.price)) : 0;

  // Reset cuando cambia categoría
  useEffect(() => {
    setFilterBrands([]);
    setRangeReady(false);
    setRangeMin(0);
    setRangeMax(0);
    setSortBy("default");
  }, [selCat]);

  // Init sliders
  useEffect(() => {
    if (!rangeReady && maxPriceAll > 0) {
      setRangeMin(minPriceAll);
      setRangeMax(maxPriceAll);
      setRangeReady(true);
    }
  }, [maxPriceAll, minPriceAll, rangeReady]);

  const toggleBrand  = b => setFilterBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const clearFilters = () => { setFilterBrands([]); setRangeMin(minPriceAll); setRangeMax(maxPriceAll); setSortBy("default"); setRangeReady(true); };

  const priceFiltered = rangeReady && (rangeMin > minPriceAll || rangeMax < maxPriceAll);
  const activeFilters = filterBrands.length + (priceFiltered ? 1 : 0);

  let result = baseProd.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchBrand  = filterBrands.length === 0 || filterBrands.includes(p.brand);
    const matchMin    = !rangeReady || p.price >= rangeMin;
    const matchMax    = !rangeReady || p.price <= rangeMax;
    return matchSearch && matchBrand && matchMin && matchMax;
  });

  if (sortBy === "asc")      result = [...result].sort((a,b) => a.price - b.price);
  if (sortBy === "desc")     result = [...result].sort((a,b) => b.price - a.price);
  if (sortBy === "discount") result = [...result].sort((a,b) => (b.discount||0) - (a.discount||0));
  if (sortBy === "name")     result = [...result].sort((a,b) => a.name.localeCompare(b.name));

  const CSS = [
    ".cat-sidebar{width:240px;flex-shrink:0;}",
    ".filter-section{border-bottom:1px solid #f0f0f0;padding-bottom:18px;margin-bottom:18px;}",
    ".filter-section:last-child{border-bottom:none;}",
    ".brand-chip{display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;}",
    ".brand-chip input{width:16px;height:16px;accent-color:#5b21b6;cursor:pointer;flex-shrink:0;}",
    ".brand-chip label{font-size:13px;color:#374151;cursor:pointer;flex:1;}",
    ".brand-chip label:hover{color:#5b21b6;}",
    ".sort-sel{width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:13px;outline:none;font-family:'Poppins',sans-serif;background:#fff;cursor:pointer;}",
    ".filter-drawer{position:fixed;inset:0;z-index:200;display:flex;}",
    ".filter-panel{background:#fff;width:300px;max-width:90vw;height:100%;overflow-y:auto;padding:24px;box-shadow:4px 0 24px rgba(0,0,0,0.08);}",
    "@media(max-width:900px){.cat-sidebar{display:none;}}",
    "@media(min-width:901px){.filter-drawer{display:none!important;}}",
  ].join(" ")

  // Sidebar JSX — inline, no sub-component para evitar remount
  const sidebarJSX = (
    <>
      {/* Ordenar */}
      <div className="filter-section">
        <p style={{fontSize:12,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Ordenar por</p>
        <select className="sort-sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="default">Relevancia</option>
          <option value="asc">Precio: menor a mayor</option>
          <option value="desc">Precio: mayor a menor</option>
          <option value="discount">Mayor descuento</option>
          <option value="name">Nombre A-Z</option>
        </select>
      </div>

      {/* Precio */}
      {maxPriceAll > 0 && (
        <div className="filter-section">
          <p style={{fontSize:12,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:.8,marginBottom:14}}>Precio</p>
          <PriceSlider
            min={minPriceAll} max={maxPriceAll}
            valueMin={rangeMin} valueMax={rangeMax}
            fmt={fmt}
            onChange={(newMin, newMax) => { setRangeMin(newMin); setRangeMax(newMax); }}
          />
        </div>
      )}

      {/* Marcas */}
      {availBrands.length > 0 && (
        <div className="filter-section">
          <p style={{fontSize:12,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:.8,marginBottom:10}}>Marca</p>
          {availBrands.map(b => (
            <div key={b} className="brand-chip">
              <input type="checkbox" id={"brand-"+b} checked={filterBrands.includes(b)} onChange={()=>toggleBrand(b)}/>
              <label htmlFor={"brand-"+b}>{b}</label>
              <span style={{fontSize:11,color:"#9ca3af"}}>({baseProd.filter(p=>p.brand===b).length})</span>
            </div>
          ))}
        </div>
      )}

      {/* Limpiar */}
      {activeFilters > 0 && (
        <button onClick={clearFilters} style={{width:"100%",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Poppins',sans-serif",marginTop:4}}>
          Limpiar filtros ({activeFilters})
        </button>
      )}
    </>
  );

  return (
    <div style={{minHeight:"100vh"}}>
      <style>{CSS}</style>

      {/* Drawer móvil */}
      {filterOpen && (
        <div className="filter-drawer">
          <div className="filter-panel">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <p style={{fontSize:15,fontWeight:800}}>Filtros</p>
              <button onClick={()=>setFilterOpen(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            {sidebarJSX}
          </div>
          <div style={{flex:1,background:"#00000055"}} onClick={()=>setFilterOpen(false)}/>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,zIndex:50}}>
        {/* Fila superior */}
        <div style={{padding:"10px clamp(14px,3vw,24px)",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={goHome} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:"#374151",fontWeight:600,fontSize:14,fontFamily:"'Poppins',sans-serif",flexShrink:0}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Inicio
          </button>
          <span style={{color:"#e5e7eb"}}>/</span>
          <span style={{fontSize:14,fontWeight:700,color:"#5b21b6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selCat==="Todos"?"Todos los productos":selCat}</span>
          <span style={{fontSize:13,color:"#9ca3af",flexShrink:0}}>({result.length})</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            {activeFilters > 0 && <span style={{background:"#5b21b6",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{activeFilters} filtros</span>}
            <button onClick={()=>setFilterOpen(true)} className="hide-desktop" style={{background:"#f3f4f6",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>
              ⚙️{activeFilters > 0 ? " ("+activeFilters+")" : " Filtros"}
            </button>
          </div>
        </div>
        {/* Barra búsqueda móvil — siempre visible en CategoryView */}
        <div className="hide-desktop" style={{padding:"0 14px 10px"}}>
          <div style={{position:"relative"}}>
            <input
              value={search}
              onChange={e => onChange(e.target.value)}
              placeholder={"Buscar en " + (selCat==="Todos"?"todos los productos":selCat) + "..."}
              style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"9px 70px 9px 14px",fontSize:13,outline:"none",fontFamily:"'Poppins',sans-serif",color:"#111"}}
            />
            {search && (
              <button onClick={()=>onChange("")} style={{position:"absolute",right:66,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#9ca3af",fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
            )}
            <div style={{position:"absolute",right:0,top:0,bottom:0,display:"flex",alignItems:"center",paddingRight:8}}>
              <span style={{background:"#f3f4f6",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,color:"#374151"}}>{result.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"clamp(16px,3vw,28px)",display:"flex",gap:24,alignItems:"flex-start"}}>

        {/* Sidebar desktop */}
        <div className="cat-sidebar">
          <div style={{background:"#fff",borderRadius:14,border:"1px solid #e5e7eb",padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <p style={{fontSize:14,fontWeight:800}}>Filtros</p>
              {activeFilters > 0 && <button onClick={clearFilters} style={{fontSize:11,color:"#5b21b6",background:"none",border:"none",cursor:"pointer",fontWeight:600,fontFamily:"'Poppins',sans-serif"}}>Limpiar</button>}
            </div>
            {sidebarJSX}
          </div>
        </div>

        {/* Productos */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}} className="hide-mobile">
            <p style={{fontSize:13,color:"#6b7280"}}><strong style={{color:"#111"}}>{result.length}</strong> productos encontrados</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Ordenar:</span>
              <select className="sort-sel" style={{width:"auto"}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                <option value="default">Relevancia</option>
                <option value="asc">Precio ↑</option>
                <option value="desc">Precio ↓</option>
                <option value="discount">Mayor descuento</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {result.length === 0 ? (
            <div style={{textAlign:"center",padding:80,color:"#9ca3af"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <p style={{fontSize:16,fontWeight:600,marginBottom:8}}>Sin resultados</p>
              <p style={{fontSize:13,marginBottom:20}}>Prueba con otros filtros</p>
              <button onClick={clearFilters} style={{background:"#5b21b6",color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>Limpiar filtros</button>
            </div>
          ) : (
            <div className="prod-grid">
              {result.map(p => (
                <ProductCard key={p.id} p={p} onOpen={openProd} onAdd={addCart} wish={wish} onWish={toggleWish}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── HEADER — componente externo para evitar stale closures ──────────────
function AppHeader({ menuOpen, setMenu, search, setSearch,
                     cartCount, openCat, openConfig, openWA, goHome, setView, setSelCat, setSearchOpen }) {
  return (
    <header style={{ background: "rgba(15,15,15,0.96)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 4px 24px #000a", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,32px)", display: "flex", alignItems: "center", gap: "clamp(12px,2vw,24px)", height: "clamp(52px,7vw,64px)" }}>
        <button onClick={() => setMenu(v => !v)} className="hide-desktop" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center" }}>
          <IcoMenu />
        </button>
        <div onClick={goHome} style={{ cursor: "pointer", flexShrink: 0 }}><Logo /></div>

        <nav className="hide-mobile" style={{ display: "flex", gap: 24 }}>
          <span className="nav-link" onClick={() => openCat("Todos")} style={{ cursor: "pointer" }}>Productos</span>

          <span className="nav-link active" onClick={() => openCat("Todos")} style={{ cursor: "pointer" }}>Ofertas</span>
          <span className="nav-link" onClick={openConfig} style={{ cursor: "pointer" }}>Configura tu PC</span>
          <span className="nav-link" onClick={() => openWA("Hola! Necesito ayuda 😊")} style={{ cursor: "pointer" }}>Soporte</span>
        </nav>

        <div style={{ flex: 1, position: "relative", maxWidth: 340, display: "flex" }} className="hide-mobile">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if(e.key === "Enter") { setSelCat("Todos"); setView("category"); window.scrollTo(0,0); } }}
            placeholder="Buscar productos..."
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "8px 40px 8px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Poppins', sans-serif" }}
          />
          <div onClick={() => { if(search.trim()) { setSelCat("Todos"); setView("category"); window.scrollTo(0,0); } }}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#666", cursor: "pointer" }}>
            <IcoSearch />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto", flexShrink: 0 }}>
          <div style={{ color: "#d1d5db", cursor: "pointer" }} className="hide-desktop" onClick={() => setSearchOpen(v => !v)}><IcoSearch s={20} /></div>
          <div style={{ color: "#d1d5db", cursor: "pointer" }} className="hide-mobile"><IcoUser /></div>
          <div style={{ color: "#d1d5db", cursor: "pointer" }}><IcoHeart s={18} /></div>
          <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setView("cart")}>
            <IcoCart s={22} c="#d1d5db" />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -8, right: -8, background: "#5b21b6", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AppInner() {
  const [view,      setView]     = useState("home");
  const [selCat,    setSelCat]   = useState("Todos");
  const [selProd,   setSelProd]  = useState(null);
  const [cart,      setCart]     = useState([]);
  const [wish,      setWish]     = useState([]);
  const [search,    setSearch]   = useState("");
  const [menuOpen,  setMenu]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catMenu,   setCatMenu]  = useState(false);
  const [heroSlide, setHero]     = useState(0);
  const [toast,     setToast]    = useState("");
  const [email,     setEmail]    = useState("");
  const [onlyStock, setOnlyStock]= useState(false);
  const [PRODUCTS,  setPRODUCTS] = useState([]);
  const [banners,   setBanners]  = useState([]);
  const [cats,      setCats]     = useState(DEFAULT_CATS);

  // Sync con localStorage — carga inicial + eventos cross-tab
  useEffect(() => {
    // Carga inicial garantizada en cliente (Astro SSR safe)
    const reloadAll = async () => {
      const [prods, bans, cats] = await Promise.all([
        getProducts(),
        getBanners(),
        getCategories(),
      ]);
      setPRODUCTS(prods);
      setBanners(bans);
      setCats(cats);
    };
    reloadAll();

    // StorageEvent: cambios desde otras pestañas (cross-tab)
    const hs = () => reloadAll();

    // Eventos custom: cambios desde el mismo tab
    const hp = () => getProducts().then(setPRODUCTS);
    const hb = () => getBanners().then(setBanners);
    const hc = () => getCategories().then(setCats);

    // visibilitychange: cuando el usuario vuelve a esta pestaña (móvil Safari)
    const hVis = () => { if (document.visibilityState === "visible") reloadAll(); };

    // focus: cuando la ventana gana foco (desktop, Android)
    const hFocus = () => reloadAll();

    window.addEventListener("storage",               hs);
    window.addEventListener("onepc_updated",         hp);
    window.addEventListener("onepc_banners_updated", hb);
    window.addEventListener("onepc_cats_updated",    hc);
    document.addEventListener("visibilitychange",    hVis);
    window.addEventListener("focus",                 hFocus);

    // Leer al montar — por si ya había datos guardados
    reloadAll();

    return () => {
      window.removeEventListener("storage",               hs);
      window.removeEventListener("onepc_updated",         hp);
      window.removeEventListener("onepc_banners_updated", hb);
      window.removeEventListener("onepc_cats_updated",    hc);
      document.removeEventListener("visibilitychange",    hVis);
      window.removeEventListener("focus",                 hFocus);
    };
  }, []);

  const heroBanners = banners.filter(b => b.id?.startsWith("hero") && b.activo && b.img);
  const heroData    = heroBanners.length > 0 ? heroBanners.map((b, i) => ({ ...DEFAULT_HERO[i % 3], img: b.img, focusX: b.focusX||'center', focusY: b.focusY||'center' })) : DEFAULT_HERO.map(h=>({...h,focusX:'center',focusY:'center'}));
  const CATEGORIES  = cats.length > 0
    ? cats.map(c => ({ name: c.name, img: c.img || DEFAULT_CATS.find(d => d.name === c.name)?.img || DEFAULT_CATS[0].img, desc: c.desc || DEFAULT_CATS.find(d => d.name === c.name)?.desc || "" }))
    : DEFAULT_CATS;

  // Auto-slide hero
  useEffect(() => {
    const t = setInterval(() => setHero(h => (h + 1) % heroData.length), 4500);
    return () => clearInterval(t);
  }, [heroData.length]);



  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const addCart   = p  => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
    showToast("✓ Agregado al carrito");
  };
  const removeCart = id  => setCart(prev => prev.filter(i => i.id !== id));
  const changeQty  = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const toggleWish = id  => setWish(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const openProd   = p   => { setSelProd(p); setView("product"); window.scrollTo(0, 0); };
  const openCat    = cat => { setSelCat(cat); setView("category"); window.scrollTo(0, 0); setCatMenu(false); setMenu(false); };

  const goHome     = ()  => { setView("home"); setSelCat("Todos"); window.scrollTo(0, 0); };
  const openConfig = ()  => { setView("configurador"); window.scrollTo(0, 0); };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const filtered  = PRODUCTS.filter(p =>
    (selCat === "Todos" || p.category === selCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
  );

  // ── HEADER ────────────────────────────────────────────
  // Header → componente externo AppHeader
  // ── MOBILE MENU ───────────────────────────────────────
  const MobileMenu = () => (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", animation: "slideIn .22s ease" }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }`}</style>
      <div style={{ background: "#0c0c0f", width: 280, maxWidth: "88vw", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Header del drawer */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)" }}>
          <Logo />
          <button onClick={() => setMenu(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✕</button>
        </div>
        {/* Buscador */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if(e.key === "Enter") { setMenu(false); setView("category"); } }}
              placeholder="Buscar productos..."
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 40px 10px 36px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Poppins', sans-serif" }}
            />
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#666" }}><IcoSearch s={15} /></div>
            <button
              onClick={() => { setMenu(false); setView("category"); }}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#5b21b6", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
            >Buscar</button>
          </div>
        </div>
        {/* Nav links */}
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: 1.2, padding: "10px 8px 6px" }}>Categorías</p>
          {["Todos", ...CATEGORIES.map(c => c.name)].map(c => (
            <button key={c} onClick={() => { openCat(c === "Todos" ? "Todos" : c); }}
              style={{ width: "100%", background: "none", border: "none", color: "#d1d5db", fontSize: 14, padding: "11px 10px", cursor: "pointer", borderRadius: 10, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Poppins', sans-serif", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span>{c === "Todos" ? "🛍️ Todos los productos" : c}</span>
              <span style={{ color: "#444", fontSize: 16 }}>›</span>
            </button>
          ))}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
          <button onClick={() => { openConfig(); setMenu(false); }}
            style={{ width: "100%", background: "rgba(91,33,182,0.15)", border: "1px solid rgba(91,33,182,0.3)", color: "#a78bfa", fontSize: 14, padding: "12px 10px", cursor: "pointer", borderRadius: 10, textAlign: "left", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
            ⚙️ Configura tu PC
          </button>
        </nav>
        {/* Footer del drawer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => openWA("Hola! Necesito ayuda 😊")}
            style={{ width: "100%", background: "#25d366", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IcoWA s={18} /> Escríbenos
          </button>
        </div>
      </div>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setMenu(false)} />
    </div>
  );

  // ── HOME VIEW ─────────────────────────────────────────
  const HomeView = () => (
    <div>
      {/* HERO SLIDER — imagen limpia, sin texto superpuesto */}
      <div className="hero-wrap" style={{ position: "relative", overflow: "hidden", background: "#000", width: "100%" }}>


        {/* Track */}
        <div style={{ display: "flex", height: "100%", transition: "transform .6s cubic-bezier(.77,0,.18,1)", transform: `translateX(-${heroSlide * 100}%)`, willChange: "transform" }}>
          {heroData.map((h, i) => (
            <div key={i} style={{ minWidth: "100%", height: "100%", flexShrink: 0 }}>
              <img
                className="hero-img"
                src={h.img}
                alt={h.title}
                loading={i === 0 ? "eager" : "lazy"}
                style={{ objectPosition: `${h.focusX||'center'} ${h.focusY||'center'}` }}
              />
            </div>
          ))}
        </div>

        {/* Flecha izquierda */}
        {heroData.length > 1 && (
          <button className="hero-arrow" style={{ left: 12 }} onClick={() => setHero(h => (h - 1 + heroData.length) % heroData.length)}>‹</button>
        )}

        {/* Flecha derecha */}
        {heroData.length > 1 && (
          <button className="hero-arrow" style={{ right: 12 }} onClick={() => setHero(h => (h + 1) % heroData.length)}>›</button>
        )}

        {/* Dots */}
        {heroData.length > 1 && (
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
            {heroData.map((_, i) => (
              <div
                key={i}
                onClick={() => setHero(i)}
                style={{ width: heroSlide === i ? 24 : 8, height: 8, borderRadius: 4, background: heroSlide === i ? "#a78bfa" : "#ffffff66", cursor: "pointer", transition: "all .35s" }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,32px)" }}>

        {/* CATEGORÍAS */}
        <div style={{ padding: "clamp(28px,5vw,52px) 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: "#5b21b6", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Explora</p>
              <h2 className="section-title">Nuestras categorías</h2>
            </div>
            <span className="section-link" onClick={() => openCat("Todos")}>Ver todas <IcoArrow s={14} /></span>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map(c => (
              <div key={c.name} className="cat-card" onClick={() => openCat(c.name)}>
                <img src={c.img} alt={c.name} style={{ width: "100%", height: 100, objectFit: "cover" }} loading="lazy" />
                <div style={{ padding: "10px 10px 14px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{c.name}</p>
                  <p className="cat-desc" style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>{c.desc}</p>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #5b21b6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <span style={{ color: "#5b21b6", fontSize: 14 }}>+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BANNERS PROMO */}
        <div className="promo-grid" style={{ margin: "clamp(20px,4vw,40px) 0" }}>
          {(() => {
            const b = banners.find(b => b.id === "promo1" && b.img);
            return b
              ? <div style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", height: "clamp(140px,25vw,220px)" }} onClick={() => openCat("Todos")}><img src={b.img} alt="Promo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
              : (
                <div style={{ background: "linear-gradient(135deg,#1a0533,#2d1b69)", borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => openCat("Todos")}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45%", opacity: .4, overflow: "hidden" }}>
                    {PRODUCTS[0]?.img && <img src={PRODUCTS[0].img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <p style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginBottom: 6 }}>Ofertas<br />exclusivas</p>
                  <div style={{ background: "#5b21b6", borderRadius: 8, padding: "6px 12px", display: "inline-block", marginBottom: 10 }}>
                    <p style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>Hasta</p>
                    <p style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>40%</p>
                    <p style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>OFF</p>
                  </div>
                  <br />
                  <button className="btn-primary" style={{ fontSize: 12, padding: "8px 18px" }}>Ver ofertas</button>
                </div>
              );
          })()}
          {(() => {
            const b = banners.find(b => b.id === "promo2" && b.img);
            return b
              ? <div style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", height: "clamp(140px,25vw,220px)" }}><img src={b.img} alt="Promo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
              : (
                <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 16, padding: "28px 24px", position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => openWA("Hola! Quiero armar mi PC ideal.")}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", opacity: .5, overflow: "hidden" }}>
                    {PRODUCTS[7]?.img && <img src={PRODUCTS[7].img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <p style={{ color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>Arma tu<br />PC ideal</p>
                  <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20, maxWidth: 180 }}>Elige tus componentes.</p>
                  <button style={{ background: "#fff", color: "#0f172a", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Comenzar ahora</button>
                </div>
              );
          })()}
        </div>

        {/* PRODUCTOS DESTACADOS */}
        <div style={{ marginBottom: "clamp(28px,5vw,52px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: "#5b21b6", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Lo mejor</p>
              <h2 className="section-title">Productos destacados</h2>
            </div>
            <span className="section-link" onClick={() => openCat("Todos")}>Ver todos <IcoArrow s={14} /></span>
          </div>
          {PRODUCTS.length === 0
            ? (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", background: "#f9fafb", borderRadius: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>Aún no hay productos</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>Ve al panel admin para agregar tu catálogo</p>
              </div>
            )
            : (
              <div className="prod-grid">
                {PRODUCTS.slice(0, 8).map(p => <ProductCard key={p.id} p={p} onOpen={openProd} onAdd={addCart} wish={wish} onWish={toggleWish} />)}
              </div>
            )
          }
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={{ background: "#0f0f0f", padding: "clamp(20px,3vw,32px) 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,32px)" }}>
          <div className="benefits-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {[
              [<IcoTruck s={28} />, "Contra entrega",    "A todo el país"],
              [<IcoShield s={28} />, "Garantía",         "12 meses"],
              [<IcoLock s={28} />, "Pago seguro",        "Múltiples métodos"],
              [<IcoHeadset s={28} />, "Soporte",         "Siempre disponibles"],
            ].map(([icon, t, s], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: "#a78bfa", flexShrink: 0 }}>{icon}</div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t}</p><p style={{ fontSize: 12, color: "#6b7280" }}>{s}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BANNER ADDI */}
      <div style={{ background: "#f0f4ff", padding: "0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: 0 }}>
          {/* Imagen banner Addi */}
          <img
            src="/addi-banner.webp"
            alt="Addi — Compra ahora, paga después"
            style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "left center", maxHeight: "clamp(120px,22vw,220px)" }}
            loading="lazy"
          />
          {/* Botón "Conoce más" flotante */}
          <button
            onClick={() => openWA("Hola! Quisiera información sobre el financiamiento con Addi para comprar en ONE PC 😊")}
            style={{
              position: "absolute",
              bottom: "clamp(10px,3vw,28px)",
              left: "clamp(12px,4vw,40px)",
              background: "#3b5bdb", color: "#fff", border: "none",
              borderRadius: 8,
              padding: "clamp(7px,1.5vw,11px) clamp(14px,3vw,28px)",
              fontSize: "clamp(11px,2vw,14px)", fontWeight: 700,
              cursor: "pointer", fontFamily: "'Poppins',sans-serif",
              boxShadow: "0 4px 16px #3b5bdb55", transition: "background .2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#2f4ac4"}
            onMouseLeave={e => e.currentTarget.style.background = "#3b5bdb"}
          >
            💬 Conoce más
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,32px)" }}>

        {/* MARCAS */}
        <div style={{ padding: "clamp(24px,4vw,52px) 0" }}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>Las mejores marcas en un solo lugar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {BRANDS.map(b => (
              <div
                key={b.name}
                style={{ padding: "16px 20px", border: "1.5px solid #f0f0f0", borderRadius: 14, cursor: "pointer", transition: "all .22s", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", minHeight: 72 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#5b21b6"; e.currentTarget.style.boxShadow = "0 4px 16px #5b21b611"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <img
                  src={b.logo}
                  alt={b.name}
                  loading="lazy"
                  style={{ height: b.h, maxWidth: "80%", objectFit: "contain", filter: "grayscale(100%)", opacity: 0.65, transition: "all .22s" }}
                  onMouseEnter={e => { e.target.style.filter = "grayscale(0%)"; e.target.style.opacity = "1"; }}
                  onMouseLeave={e => { e.target.style.filter = "grayscale(100%)"; e.target.style.opacity = "0.65"; }}
                  onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
                />
                <span style={{ display: "none", fontSize: 13, fontWeight: 800, color: "#374151" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RESEÑAS */}
        <div style={{ marginBottom: "clamp(28px,5vw,52px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="reviews-row" style={{ display: "flex", gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <Stars r={r.stars} />
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "10px 0 14px" }}>"{r.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#5b21b6,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0a0a0f", padding: "clamp(32px,5vw,56px) clamp(16px,3vw,32px) 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 32, marginBottom: 40 }}>
            <div>
              <Logo />
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12, lineHeight: 1.7, maxWidth: 220 }}>Tu tienda gamer de confianza en Colombia.</p>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                {["📘", "📸", "▶️", "🎵"].map((icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, background: "#1f1f1f", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>{icon}</div>
                ))}
              </div>
            </div>
            <div className="footer-col">
              <h4>Categorías</h4>
              {CATEGORIES.map(c => <span key={c.name} className="footer-link" onClick={() => openCat(c.name)}>{c.name}</span>)}
            </div>
            <div className="footer-col">
              <h4>Ayuda</h4>
              {["Centro de ayuda", "Envíos y entregas", "Garantías", "Métodos de pago", "Términos"].map(c => <span key={c} className="footer-link">{c}</span>)}
            </div>
            <div className="footer-col">
              <h4>Mi cuenta</h4>
              {["Mi perfil", "Mis pedidos", "Mis favoritos", "Mis direcciones"].map(c => <span key={c} className="footer-link">{c}</span>)}
            </div>
            <div className="footer-col">
              <h4>Contacto</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => openWA("Hola!")}>
                  <IcoWA s={22} />
                  <div>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>WhatsApp</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>+57 320 234 4876</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✉️</span>
                  <div>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>Email</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>hola@onepc.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTop: "1px solid #1f1f1f", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "#4b5563" }}>© 2025 ONE PC Store. Todos los derechos reservados.</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["VISA", "MC", "PSE", "Addi"].map(b => <span key={b} style={{ background: "#1f1f1f", color: "#9ca3af", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>{b}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  // ── CATEGORY VIEW ─────────────────────────────────────
  // CategoryView → componente externo

  // ── CART VIEW ─────────────────────────────────────────
  const CartView = () => (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 60, zIndex: 50 }}>
        <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
          <IcoBack s={16} /> Seguir comprando
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, marginLeft: 8 }}>Mi Carrito</span>
        {cartCount > 0 && <span style={{ background: "#5b21b6", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{cartCount}</span>}
      </div>

      {cart.length === 0
        ? (
          <div style={{ textAlign: "center", padding: 100 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tu carrito está vacío</p>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 24 }}>Agrega productos para comenzar</p>
            <button className="btn-primary" onClick={goHome}>Ver productos</button>
          </div>
        )
        : (
          <div className="cart-layout" style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(20px,4vw,36px) clamp(16px,3vw,28px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map(item => (
                <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: 16, display: "flex", gap: 14, border: "1.5px solid #e5e7eb", alignItems: "center" }}>
                  <img src={item.img} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{fmt(item.price)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => changeQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)}  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>+</button>
                      <button onClick={() => removeCart(item.id)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}><IcoTrash s={16} /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div>
              <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1.5px solid #e5e7eb", position: "sticky", top: 100 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Resumen del pedido</h3>
                {cart.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ flex: 1, marginRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>{item.name} ×{item.qty}</span>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 12, paddingTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#22c55e", fontWeight: 600, marginBottom: 12 }}><span>Envío</span><span>Contra entrega</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, borderTop: "2px solid #f0f0f0", paddingTop: 12 }}><span>Total</span><span>{fmt(cartTotal)}</span></div>
                </div>
                <button
                  onClick={() => openWA(`Hola! Quiero realizar este pedido:\n\n${cart.map(i => `• ${i.name} ×${i.qty} — ${fmt(i.price * i.qty)}`).join("\n")}\n\n*Total: ${fmt(cartTotal)}*`)}
                  style={{ width: "100%", marginTop: 16, background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Poppins', sans-serif" }}
                >
                  <IcoWA s={20} /> Finalizar por WhatsApp
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Compra segura · Contra entrega</p>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );

  // ── CONFIGURADOR VIEW ─────────────────────────────────
  const ConfiguradorView = () => {
    const configProducts = PRODUCTS.filter(p => p.productType === "torre" || p.productType === "portatil");
    const [allComps, setAllComps] = useState({});
    useEffect(() => {
      import("../../utils/store.js").then(({ getAllComponents }) => getAllComponents().then(setAllComps));
    }, []);
    const [sel, setSel] = useState(() =>
      Object.fromEntries(configProducts.map(p => [p.id, Object.fromEntries(Object.keys(allComps[p.id] || {}).map(k => [k, 0]))]))
    );
    const getComps  = p => allComps[p.id] || {};
    const getPrice  = p => p.price + Object.entries(sel[p.id] || {}).reduce((s, [k, idx]) => s + (getComps(p)[k]?.[idx]?.price || 0), 0);
    const list = onlyStock ? configProducts.filter(p => p.stock > 0) : configProducts;
    const compLabels = { ram: "RAM", ssd: "SSD M.2", gpu: "Tarjeta Gráfica", fuente: "Fuente de Poder", refrigeracion: "Refrigeración" };

    if (list.length === 0) return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 60, zIndex: 50 }}>
          <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            <IcoBack s={16} /> Inicio
          </button>
          <span style={{ color: "#e5e7eb" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>Configura tu PC</span>
        </div>
        <div style={{ textAlign: "center", padding: 100, color: "#9ca3af" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚙️</div>
          <p style={{ fontSize: 16, fontWeight: 700 }}>No hay equipos configurables aún</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Agrega torres o portátiles desde el panel admin</p>
        </div>
      </div>
    );

    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 60, zIndex: 50 }}>
          <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            <IcoBack s={16} /> Inicio
          </button>
          <span style={{ color: "#e5e7eb" }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>Configura tu PC</span>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: "#5b21b6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Personaliza</p>
            <h1 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 900, marginBottom: 6 }}>Configura tu PC ideal</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>El precio se actualiza en tiempo real según tus selecciones.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, background: "#fff", padding: "10px 16px", borderRadius: 10, border: "1px solid #e5e7eb", width: "fit-content" }}>
            <input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#5b21b6", cursor: "pointer" }} />
            <label style={{ fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151" }}>Mostrar solo en stock</label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {list.map(p => {
              const comps    = getComps(p);
              const hasComps = Object.keys(comps).length > 0;
              const finalPrice = getPrice(p);
              const extras   = finalPrice - p.price;
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 12px #0001" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>
                    <div style={{ position: "relative" }}>
                      {p.img
                        ? <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", minHeight: 180, objectFit: "cover", display: "block" }} loading="lazy" />
                        : <div style={{ width: "100%", height: 180, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📦</div>
                      }
                      <div style={{ position: "absolute", top: 10, left: 10, background: p.productType === "portatil" ? "#3b82f6" : "#5b21b6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                        {p.productType === "portatil" ? "Portátil" : "Torre"}
                      </div>
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                        <div>
                          {p.brand && <p style={{ fontSize: 11, color: "#5b21b6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.brand}</p>}
                          <h3 style={{ fontSize: "clamp(14px,2vw,18px)", fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</h3>
                          {p.sku && <p style={{ fontSize: 11, color: "#9ca3af" }}>SKU: {p.sku}</p>}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#5b21b6" }}>{fmt(finalPrice)}</p>
                          {p.oldPrice > p.price && <p style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>{fmt(p.oldPrice)}</p>}
                          {extras > 0 && <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>+{fmt(extras)} en upgrades</p>}
                        </div>
                      </div>

                      {hasComps ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
                          {Object.entries(comps).map(([key, opts]) => {
                            if (!opts || opts.length === 0) return null;
                            return (
                              <div key={key}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>{compLabels[key] || key}</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {opts.map((o, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setSel(prev => ({ ...prev, [p.id]: { ...prev[p.id], [key]: i } }))}
                                      style={{ border: `1.5px solid ${(sel[p.id]?.[key] ?? 0) === i ? "#5b21b6" : "#e5e7eb"}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", background: (sel[p.id]?.[key] ?? 0) === i ? "#eff6ff" : "#fff", color: (sel[p.id]?.[key] ?? 0) === i ? "#5b21b6" : "#374151", transition: "all .15s", whiteSpace: "nowrap", fontFamily: "'Poppins', sans-serif" }}
                                    >
                                      {o.label}{o.price > 0 && <span style={{ fontSize: 9, marginLeft: 4, opacity: .75 }}>+{fmt(o.price)}</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px", marginBottom: 16, border: "1px solid #e5e7eb" }}>
                          <p style={{ fontSize: 12, color: "#9ca3af" }}>Sin componentes configurados para este producto.</p>
                        </div>
                      )}

                      {hasComps && extras > 0 && (
                        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: "1px solid #e9d5ff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151", marginBottom: 2 }}><span>Base</span><span>{fmt(p.price)}</span></div>
                          {Object.entries(sel[p.id] || {}).map(([k, idx]) => {
                            const opt = comps[k]?.[idx];
                            if (!opt || opt.price === 0) return null;
                            return <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5b21b6", marginBottom: 2 }}><span>{compLabels[k] || k}</span><span>+{fmt(opt.price)}</span></div>;
                          })}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 900, borderTop: "1px solid #e9d5ff", marginTop: 6, paddingTop: 6 }}><span>Total</span><span style={{ color: "#5b21b6" }}>{fmt(finalPrice)}</span></div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          onClick={() => {
                            const specs = Object.entries(sel[p.id] || {})
                              .map(([k, idx]) => { const opt = comps[k]?.[idx]; return opt ? `• ${compLabels[k] || k}: ${opt.label}${opt.price > 0 ? " (+" + fmt(opt.price) + ")" : ""}` : null; })
                              .filter(Boolean).join("\n");
                            openWA(`Hola! Quiero comprar:\n*${p.name}*\n\n${specs}\n\n*Total: ${fmt(finalPrice)}*`);
                          }}
                          style={{ flex: 1, minWidth: 140, background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Poppins', sans-serif" }}
                        >
                          <IcoWA s={18} /> Comprar
                        </button>
                        <button
                          onClick={() => {
                            const specs = Object.entries(sel[p.id] || {}).map(([k, idx]) => comps[k]?.[idx]?.label || "").filter(Boolean).join(" | ");
                            addCart({ ...p, price: finalPrice, name: `${p.name}${specs ? " (" + specs + ")" : ""}`, oldPrice: p.price });
                          }}
                          style={{ flex: 1, minWidth: 140, background: "#fff", color: "#5b21b6", border: "2px solid #5b21b6", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Poppins', sans-serif" }}
                        >
                          <IcoCart s={16} c="#5b21b6" /> Agregar al carrito
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER PRINCIPAL ──────────────────────────────────
  return (
    <>
      <style>{css}</style>

      {/* Toast notificación */}
      {toast && (
        <div style={{ position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 30, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: "0 8px 24px #22c55e44", whiteSpace: "nowrap", fontFamily: "'Poppins', sans-serif" }}>
          {toast}
        </div>
      )}

      {menuOpen && <MobileMenu />}
      <AppHeader
        menuOpen={menuOpen} setMenu={setMenu}
        search={search} setSearch={setSearch}
        cartCount={cartCount}
        openCat={openCat} openConfig={openConfig}
        openWA={openWA} goHome={goHome}
        setView={setView} setSelCat={setSelCat}
        setSearchOpen={setSearchOpen}
      />
      {/* Barra búsqueda móvil desplegable */}
      {searchOpen && (
        <div className="hide-desktop" style={{ background: "#0f0f0f", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: "clamp(52px,7vw,64px)", zIndex: 99 }}>
          <div style={{ position: "relative" }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if(e.key === "Enter" && search.trim()) { setSearchOpen(false); openCat("Todos"); } }}
              placeholder="Buscar productos..."
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "11px 80px 11px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Poppins', sans-serif" }}
            />
            <button
              onClick={() => { if(search.trim()) { setSearchOpen(false); openCat("Todos"); } }}
              style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "#5b21b6", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
            >Buscar</button>
          </div>
        </div>
      )}

      {view === "home"         && <HomeView />}
      {view === "category" && <CategoryView
        PRODUCTS={PRODUCTS}
        selCat={selCat}
        search={search}
        onSearch={setSearch}
        goHome={goHome}
        openProd={openProd}
        addCart={addCart}
        wish={wish}
        toggleWish={toggleWish}
        fmt={fmt}
        openWA={openWA}
      />}
      {view === "product"      && <ProductView p={selProd} onBack={() => setView("category")} onAddCart={addCart} />}
      {view === "cart"         && <CartView />}
      {view === "configurador" && <ConfiguradorView />}

      {/* WhatsApp FAB — oculto en carrito */}
      {view !== "cart" && (
        <div className="wa-fab" onClick={() => openWA("Hola! Quisiera más información sobre sus productos 😊")}>
          <IcoWA s={32} />
        </div>
      )}
    </>
  );

// Wrapper con guard de cliente
}
export default function App() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return <div style={{minHeight:"100vh",background:"#fff"}} />;
  return <AppInner />;
}