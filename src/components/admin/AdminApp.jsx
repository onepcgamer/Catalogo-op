import { useState, useEffect, useRef } from "react";
import {
  getProducts, saveProducts, addProduct, updateProduct, deleteProduct, updateStock,
  getBrands, saveBrands, addBrand, updateBrand, deleteBrand, toggleBrand,
  getAllComponents, getProductComponents, saveProductComponents, deleteProductComponents,
  getBanners, saveBanners, getCategories, saveCategories,
  COMP_TYPES_TORRE, COMP_TYPES_PORTATIL, COMP_TYPES_MONITOR, DEFAULT_OPTIONS,
} from "../../utils/store.js";

const ADMIN_USER = { email:"admin@onepc.com", password:"onepc2024" };
const BANNER_KEY  = "onepc_banners";
const CAT_KEY     = "onepc_categories";
const EMPTY_FORM  = { name:"", brand:"", brandId:null, category:"Torres", subcategory:"", productType:"torre", price:"", oldPrice:"", discount:"", stock:"", description:"", img:"", sku:"" };

const DEFAULT_CATS = [
  {id:1,name:"Torres",subcats:["Torres Gamer","Mini Torres"]},
  {id:2,name:"Portátiles",subcats:["Portátiles Gamer","Portátiles Oficina"]},
  {id:3,name:"Monitores",subcats:["Monitores Gamer","Monitores 4K"]},
  {id:4,name:"Accesorios",subcats:["Teclados","Mouse","Audífonos"]},
  {id:5,name:"Componentes",subcats:["Procesadores","Tarjetas Gráficas","RAM","SSD"]},
  {id:6,name:"Combos",subcats:["Combo Completo","Combo Periféricos"]},
];
const DEFAULT_BANNERS = [
  {id:"hero1", label:"Banner Hero 1",            img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
  {id:"hero2", label:"Banner Hero 2",            img:"",imgMobile:"",activo:false,link:"",focusX:"center",focusY:"center"},
  {id:"hero3", label:"Banner Hero 3",            img:"",imgMobile:"",activo:false,link:"",focusX:"center",focusY:"center"},
  {id:"promo1",label:"Banner Oferta Izquierda",  img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
  {id:"promo2",label:"Banner Oferta Derecha",    img:"",imgMobile:"",activo:true, link:"",focusX:"center",focusY:"center"},
];
const FOCUS_X = [{v:"left",l:"← Izquierda"},{v:"center",l:"↔ Centro"},{v:"right",l:"→ Derecha"}];
const FOCUS_Y = [{v:"top",l:"↑ Arriba"},{v:"center",l:"↕ Centro"},{v:"bottom",l:"↓ Abajo"}];

const fmt        = n=>"$"+Number(n||0).toLocaleString("es-CO");
const parsePrice = v=>Number(String(v||"").replace(/\./g,"").replace(/,/g,".").replace(/[^0-9.]/g,""))||0;

// getCats → usar getCategories() de store.js
// getBannersL → usar getBanners() de store.js
// saveCats → usar saveCategories() de store.js
// saveBannersL → usar saveBanners() de store.js

function compressImg(file, cb, maxW=800, quality=0.65) {
  const canvas=document.createElement("canvas"), ctx=canvas.getContext("2d"), img=new Image(), url=URL.createObjectURL(file);
  img.onload=()=>{
    const r=Math.min(maxW/img.width,maxW/img.height,1);
    canvas.width=Math.round(img.width*r); canvas.height=Math.round(img.height*r);
    ctx.drawImage(img,0,0,canvas.width,canvas.height); URL.revokeObjectURL(url);
    cb(canvas.toDataURL("image/jpeg",quality));
  }; img.src=url;
}

const css=`
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif;}
  input,select,textarea,button{font-family:inherit;}
  .si{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:none;cursor:pointer;font-size:13px;color:#374151;text-align:left;margin-bottom:2px;transition:background .15s;}
  .si:hover{background:#f0f7ff;} .si.on{background:#eff6ff;color:#5b21b6;font-weight:700;}
  .card{background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:20px;}
  .btn{border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;}
  .btn-blue{background:#5b21b6;color:#fff;} .btn-blue:hover{background:#4c1d95;}
  .btn-green{background:#22c55e;color:#fff;} .btn-green:hover{background:#16a34a;}
  .btn-red{background:#ef4444;color:#fff;} .btn-red:hover{background:#dc2626;}
  .btn-gray{background:#f3f4f6;color:#374151;}
  .btn-outline{background:#fff;border:1px solid #e5e7eb;color:#374151;} .btn-outline:hover{border-color:#5b21b6;color:#5b21b6;}
  .btn-sm{padding:5px 10px;font-size:11px;border-radius:7px;}
  .bd{background:#dcfce7;color:#16a34a;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;}
  .ba{background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;}
  .bp{background:#fef3c7;color:#d97706;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;}
  .binact{background:#f3f4f6;color:#9ca3af;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;}
  .tab{border:none;background:none;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#6b7280;border-bottom:2px solid transparent;transition:all .18s;}
  .tab.on{color:#5b21b6;border-bottom:2px solid #5b21b6;}
  .inp{width:100%;border:1px solid #e5e7eb;border-radius:10px;padding:10px 14px;font-size:13px;outline:none;transition:border-color .18s;background:#fff;}
  .inp:focus{border-color:#5b21b6;}
  .up{border:2px dashed #e5e7eb;border-radius:12px;padding:16px;text-align:center;cursor:pointer;background:#f9fafb;transition:all .2s;}
  .up:hover{border-color:#5b21b6;background:#f5f3ff;}
  .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#22c55e;color:#fff;padding:10px 24px;border-radius:30px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 8px 24px #22c55e44;white-space:nowrap;}
  .sc{background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:14px 18px;display:flex;align-items:center;gap:12px;}
  .sidebar{width:210px;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;position:fixed;top:0;bottom:0;left:0;z-index:50;transition:transform .25s ease;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
  .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
  .banner-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  .comp-row{display:grid;grid-template-columns:1fr 120px 80px 36px;gap:8px;align-items:center;margin-bottom:8px;}
  .type-btn{border:2px solid #e5e7eb;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;background:#fff;color:#374151;transition:all .2s;flex:1;display:flex;align-items:center;gap:8px;justify-content:center;}
  .type-btn.on{border-color:#5b21b6;background:#eff6ff;color:#5b21b6;}
  .extra-slot{height:90px;border:2px dashed #e5e7eb;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:#f9fafb;gap:4px;transition:all .18s;}
  .extra-slot:hover{border-color:#5b21b6;background:#f5f3ff;}
  .extra-slot-filled{position:relative;border-radius:10px;overflow:hidden;border:2px solid #5b21b6;}
  .extra-slot-overlay{position:absolute;inset:0;background:#00000066;opacity:0;transition:opacity .18s;display:flex;align-items:center;justify-content:center;gap:6px;}
  .extra-slot-filled:hover .extra-slot-overlay{opacity:1;}
  @media(max-width:768px){
    .sidebar{transform:translateX(-100%);}
    .sidebar.open{transform:translateX(0);}
    .main-wrap{margin-left:0!important;}
    .two-col,.three-col,.banner-grid{grid-template-columns:1fr!important;}
    .hide-mob{display:none!important;}
    .comp-row{grid-template-columns:1fr 100px 60px 32px;}
  }
`;

const Ico      = ({d,s=18,c="currentColor",fill="none"})=><svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
const IcoEdit  = ()=><Ico d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>;
const IcoTrash = ({c="#ef4444"})=><Ico d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" c={c}/>;
const IcoPlus  = ()=><Ico d="M12 5v14M5 12h14"/>;
const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 745 391.6" style={{height:32,width:"auto",display:"block",flexShrink:0}}>
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
const Toast    = ({msg})=>msg?<div className="toast">{msg}</div>:null;
const Label    = ({t,hint,children})=><div><label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:4}}>{t}{hint&&<span style={{fontSize:10,color:"#9ca3af",fontWeight:400,marginLeft:6}}>{hint}</span>}</label>{children}</div>;
const SBadge   = ({s})=><span className={s==="Disponible"?"bd":s==="Agotado"?"ba":"bp"}>{s}</span>;

// ════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════
function Login({onLogin}){
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [show,setShow]=useState(false); const [err,setErr]=useState(""); const [ld,setLd]=useState(false);
  const go=()=>{
    if(!email||!pass){setErr("Completa todos los campos");return;}
    setErr("");setLd(true);
    setTimeout(()=>{if(email.trim()===ADMIN_USER.email&&pass===ADMIN_USER.password){onLogin();}else{setErr("Correo o contraseña incorrectos");setLd(false);}},600);
  };
  return(
    <div style={{minHeight:"100vh",background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 32px",width:"100%",maxWidth:380,boxShadow:"0 8px 32px #5b21b611",border:"1px solid #e5e7eb",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Logo/></div>
        <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>ONE PC – Administrador</h2>
        <p style={{fontSize:13,color:"#6b7280",marginBottom:24}}>Inicia sesión para acceder al panel</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,textAlign:"left"}}>
          <input className="inp" type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
          <div style={{position:"relative"}}>
            <input className="inp" type={show?"text":"password"} placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} style={{paddingRight:60}} onKeyDown={e=>e.key==="Enter"&&go()}/>
            <button onClick={()=>setShow(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:11}}>{show?"Ocultar":"Ver"}</button>
          </div>
          {err&&<p style={{color:"#ef4444",fontSize:12,textAlign:"center"}}>{err}</p>}
          <button className="btn btn-blue" onClick={go} style={{width:"100%",padding:"13px 0",fontSize:15}}>{ld?"Iniciando...":"Iniciar sesión"}</button>
        </div>
        <p style={{fontSize:11,color:"#9ca3af",marginTop:16}}>🔒 Acceso exclusivo para administradores</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// BRANDS
// ════════════════════════════════════════════════════
function Brands(){
  const [brands,setBrands]=useState([]);
  useEffect(()=>{ getBrands().then(setBrands); },[]);
  const [form,setForm]=useState({name:""});
  const [editId,setEditId]=useState(null);
  const [toast,setToast]=useState("");
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};
  const reloadBrands = async () => { const b = await getBrands(); setBrands(b); };
  const handleSave= async ()=>{
    if(!form.name.trim()){showToast("⚠️ Escribe el nombre de la marca");return;}
    if(editId){ await updateBrand(editId,{name:form.name}); showToast("✓ Marca actualizada"); }
    else{ await addBrand({name:form.name}); showToast("✓ Marca agregada"); }
    setForm({name:""}); setEditId(null); reloadBrands();
  };
  const handleEdit=b=>{setEditId(b.id);setForm({name:b.name});};
  const handleDelete = async id => { if(window.confirm('¿Eliminar marca?')){ await deleteBrand(id); reloadBrands(); showToast('🗑️ Marca eliminada'); } };
  const handleToggle = async id => { await toggleBrand(id); reloadBrands(); showToast('✓ Estado cambiado'); };
  return(
    <div>
      <Toast msg={toast}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h2 style={{fontSize:18,fontWeight:800}}>Gestión de Marcas</h2><p style={{fontSize:13,color:"#6b7280"}}>Administra las marcas de tus productos</p></div>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>{editId?"✏️ Editar marca":"➕ Agregar nueva marca"}</h3>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <Label t="Nombre de la marca">
              <input className="inp" placeholder="Ej. ASUS, MSI, HP..." value={form.name} onChange={e=>setForm({name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSave()}/>
            </Label>
          </div>
          <button className="btn btn-blue" onClick={handleSave} style={{padding:"10px 20px",whiteSpace:"nowrap"}}>{editId?"💾 Guardar":"➕ Agregar"}</button>
          {editId&&<button className="btn btn-gray" onClick={()=>{setEditId(null);setForm({name:""}); }} style={{padding:"10px 16px"}}>Cancelar</button>}
        </div>
      </div>
      <div className="three-col">
        {brands.map(b=>(
          <div key={b.id} className="card" style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:10,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:900,color:"#5b21b6",fontSize:14}}>
              {b.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</p>
              <span className={b.activo?"bd":"binact"}>{b.activo?"Activa":"Inactiva"}</span>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>handleToggle(b.id)} className="btn btn-sm btn-outline" title={b.activo?"Desactivar":"Activar"}>{b.activo?"⏸":"▶"}</button>
              <button onClick={()=>handleEdit(b)} className="btn btn-sm btn-outline"><IcoEdit/></button>
              <button onClick={()=>handleDelete(b.id)} className="btn btn-sm" style={{background:"#fee2e2"}}><IcoTrash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// COMP CONFIGURATOR
// ════════════════════════════════════════════════════
function CompConfigurator({product,onClose}){
  const types = product.productType==="portatil" ? COMP_TYPES_PORTATIL
              : product.productType==="monitor"  ? COMP_TYPES_MONITOR
              : COMP_TYPES_TORRE;
  if (types.length === 0) return (
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"40px 32px",maxWidth:400,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>🖵</div>
        <h3 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Monitores sin componentes</h3>
        <p style={{fontSize:14,color:"#6b7280",marginBottom:24}}>Los monitores no tienen componentes configurables.</p>
        <button onClick={onClose} className="btn btn-blue" style={{padding:"10px 28px"}}>Cerrar</button>
      </div>
    </div>
  );
  const [comps,setComps]=useState(()=>{
    const init={};
    types.forEach(t=>{ init[t.key]=(DEFAULT_OPTIONS[t.key]||[]).map(o=>({...o})); });
    return init;
  });
  useEffect(()=>{
    getProductComponents(product.id).then(saved=>{
      if(saved && Object.keys(saved).length>0){
        setComps(prev=>{
          const merged={...prev};
          types.forEach(t=>{ if(saved[t.key]) merged[t.key]=saved[t.key]; });
          return merged;
        });
      }
    });
  },[product.id]);
  const [toast,setToast]=useState("");
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2000);};
  const addOption=key=>{setComps(prev=>({...prev,[key]:[...(prev[key]||[]),{label:"Nueva opción",price:0,incluido:false}]}));};
  const updateOption=(key,idx,field,val)=>{
    setComps(prev=>{
      const arr=[...(prev[key]||[])];
      arr[idx]={...arr[idx],[field]:field==="price"?parsePrice(val):val};
      if(field==="incluido"&&val) arr.forEach((o,i)=>{if(i!==idx)arr[i]={...arr[i],incluido:false};});
      return{...prev,[key]:arr};
    });
  };
  const removeOption=(key,idx)=>{setComps(prev=>({...prev,[key]:(prev[key]||[]).filter((_,i)=>i!==idx)}));};
  const moveOption=(key,idx,dir)=>{
    setComps(prev=>{
      const arr=[...(prev[key]||[])]; const ni=idx+dir;
      if(ni<0||ni>=arr.length)return prev;
      [arr[idx],arr[ni]]=[arr[ni],arr[idx]];
      return{...prev,[key]:arr};
    });
  };
  const handleSave= async ()=>{ await saveProductComponents(product.id,comps);showToast("✓ Componentes guardados");setTimeout(onClose,800);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"#00000077",display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"20px 16px"}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:820,boxShadow:"0 20px 60px #0003"}}>
        <Toast msg={toast}/>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e5e7eb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:11,color:"#5b21b6",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>⚙️ Configurador de componentes</p>
            <h3 style={{fontSize:16,fontWeight:800,marginTop:2}}>{product.name}</h3>
            <p style={{fontSize:12,color:"#6b7280"}}>Tipo: {product.productType==="portatil"?"💻 Portátil":product.productType==="monitor"?"🖵 Monitor":"🖥️ Torre / PC Escritorio"}</p>
          </div>
          <button onClick={onClose} style={{background:"#f3f4f6",border:"none",borderRadius:"50%",width:36,height:36,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:20}}>
          {types.map(type=>(
            <div key={type.key}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:3,height:20,background:"#5b21b6",borderRadius:2}}/>
                  <h4 style={{fontSize:14,fontWeight:700}}>{type.label}</h4>
                </div>
                <button onClick={()=>addOption(type.key)} className="btn btn-sm btn-blue" style={{display:"flex",alignItems:"center",gap:4}}><IcoPlus/>Agregar opción</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 130px 90px 70px",gap:8,padding:"6px 0",borderBottom:"1px solid #f0f0f0",marginBottom:6}}>
                <p style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>Descripción</p>
                <p style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>Precio extra</p>
                <p style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>Incluido</p>
                <p style={{fontSize:11,fontWeight:700,color:"#6b7280"}}>Acciones</p>
              </div>
              {(comps[type.key]||[]).map((opt,idx)=>(
                <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 130px 90px 70px",gap:8,marginBottom:6,alignItems:"center"}}>
                  <input className="inp" value={opt.label} onChange={e=>updateOption(type.key,idx,"label",e.target.value)} style={{padding:"7px 10px",fontSize:12}}/>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:"#9ca3af",fontWeight:600}}>+$</span>
                    <input className="inp" type="text" inputMode="numeric" value={opt.incluido?"0":String(opt.price)} onChange={e=>updateOption(type.key,idx,"price",e.target.value)} disabled={opt.incluido} style={{padding:"7px 8px 7px 24px",fontSize:12,background:opt.incluido?"#f9fafb":"#fff"}}/>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="checkbox" checked={opt.incluido} onChange={e=>updateOption(type.key,idx,"incluido",e.target.checked)} style={{width:16,height:16,accentColor:"#5b21b6",cursor:"pointer"}}/>
                    <label style={{fontSize:11,color:"#374151",cursor:"pointer"}} onClick={()=>updateOption(type.key,idx,"incluido",!opt.incluido)}>Base</label>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    <button onClick={()=>moveOption(type.key,idx,-1)} className="btn btn-sm btn-outline" style={{padding:"4px 6px"}} title="Subir">↑</button>
                    <button onClick={()=>moveOption(type.key,idx,1)} className="btn btn-sm btn-outline" style={{padding:"4px 6px"}} title="Bajar">↓</button>
                    <button onClick={()=>removeOption(type.key,idx)} className="btn btn-sm" style={{background:"#fee2e2",padding:"4px 6px"}} title="Eliminar"><IcoTrash/></button>
                  </div>
                </div>
              ))}
              {(comps[type.key]||[]).length===0&&<p style={{fontSize:12,color:"#9ca3af",fontStyle:"italic",padding:"8px 0"}}>Sin opciones. Agrega una opción base incluida.</p>}
            </div>
          ))}
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid #e5e7eb",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} className="btn btn-gray">Cancelar</button>
          <button onClick={handleSave} className="btn btn-blue" style={{padding:"10px 28px"}}>💾 Guardar componentes</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// PRODUCTS — con multi-imagen integrado
// ════════════════════════════════════════════════════
function Products({products,reload}){
  const [tab,setTab]               = useState("new");
  const [form,setForm]             = useState(EMPTY_FORM);
  const [editId,setEditId]         = useState(null);
  const [toast,setToast]           = useState("");
  const [preview,setPreview]       = useState("");
  const [extraImages,setExtraImages] = useState(["","","",""]);
  const [cats,setCats]             = useState([]);
  const [brands,setBrands]         = useState([]);
  const [configProduct,setConfigProduct] = useState(null);

  const fileRef    = useRef();
  const extraRef0  = useRef();
  const extraRef1  = useRef();
  const extraRef2  = useRef();
  const extraRef3  = useRef();
  const extraRefs  = [extraRef0, extraRef1, extraRef2, extraRef3];

  useEffect(()=>{
    getCategories().then(setCats);
    getBrands().then(setBrands);
    const hb = () => getBrands().then(setBrands);
    window.addEventListener("onepc_brands_updated", hb);
    return () => window.removeEventListener("onepc_brands_updated", hb);
  },[]);

  const showToast = msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};
  const setF      = (f,v)=>setForm(p=>({...p,[f]:v}));

  const resetForm = ()=>{
    setTab("new"); setEditId(null);
    setForm(EMPTY_FORM); setPreview("");
    setExtraImages(["","","",""]);
  };

  const handleImg = e=>{
    const file=e.target.files[0]; if(!file)return;
    compressImg(file,c=>{setPreview(c);setForm(p=>({...p,img:c}));});
  };

  const handleExtraImg = (idx,e)=>{
    const file=e.target.files[0]; if(!file)return;
    compressImg(file,c=>{
      setExtraImages(prev=>{ const n=[...prev]; n[idx]=c; return n; });
    });
  };

  const removeExtraImg = idx=>{
    setExtraImages(prev=>{ const n=[...prev]; n[idx]=""; return n; });
  };

  const handleSave = async () => {
    if(!form.name.trim()){showToast("⚠️ Escribe el nombre");return;}
    if(!form.price){showToast("⚠️ Escribe el precio");return;}
    const price=parsePrice(form.price), oldPrice=parsePrice(form.oldPrice)||price;
    const discount=form.discount?+form.discount:(oldPrice>price?Math.round((1-price/oldPrice)*100):0);
    const data={
      ...form, price, oldPrice, discount, stock:+form.stock||0,
      images: extraImages.filter(Boolean),
    };
    if(tab==="new"||!editId){ await addProduct(data); showToast("✓ Producto publicado"); }
    else { await updateProduct(editId,data); showToast("✓ Producto actualizado"); }
    resetForm(); reload();
  };

  const handleEdit = p=>{
    setTab("edit"); setEditId(p.id);
    setForm({name:p.name,brand:p.brand||"",brandId:p.brandId||null,category:p.category,subcategory:p.subcategory||"",productType:p.productType||"torre",price:String(p.price),oldPrice:String(p.oldPrice||""),discount:String(p.discount||""),stock:String(p.stock),description:p.description||"",img:p.img||"",sku:p.sku||""});
    setPreview(p.img||"");
    setExtraImages([p.images?.[0]||"",p.images?.[1]||"",p.images?.[2]||"",p.images?.[3]||""]);
    window.scrollTo(0,0);
  };

  const handleDelete = async id => {
    if(window.confirm("¿Eliminar producto?")){ await deleteProduct(id); await deleteProductComponents(id); reload(); showToast("🗑️ Eliminado"); }
  };

  const subcats      = cats.find(c=>c.name===form.category)?.subcats||[];
  const activeBrands = brands.filter(b=>b.activo);

  return(
    <div>
      {configProduct&&<CompConfigurator product={configProduct} onClose={()=>{setConfigProduct(null);reload();}}/>}
      <Toast msg={toast}/>
      <h2 style={{fontSize:18,fontWeight:800,marginBottom:20}}>Agregar / Editar producto</h2>
      <div className="two-col">

        {/* ── FORMULARIO ── */}
        <div className="card">
          <div style={{display:"flex",borderBottom:"1px solid #e5e7eb",marginBottom:20}}>
            <button className={`tab${tab==="new"?" on":""}`} onClick={resetForm}>➕ Nuevo</button>
            <button className={`tab${tab==="edit"?" on":""}`} onClick={()=>setTab("edit")}>✏️ Editar</button>
          </div>

          {/* ── IMAGEN PRINCIPAL ── */}
          <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Imagen principal *</label>
          <div className="up" onClick={()=>fileRef.current.click()} style={{marginBottom:10}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
            {preview
              ? <div><img src={preview} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:10,marginBottom:8}}/><p style={{fontSize:12,color:"#5b21b6",fontWeight:600}}>📷 Cambiar imagen principal</p></div>
              : <div style={{padding:"10px 0"}}><div style={{fontSize:36,marginBottom:6}}>📷</div><p style={{fontSize:13,color:"#6b7280",fontWeight:600}}>Subir imagen principal</p><p style={{fontSize:11,color:"#9ca3af"}}>JPG, PNG · Máx. 2MB</p></div>
            }
          </div>

          {/* ── IMÁGENES EXTRA ── */}
          <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>
            Imágenes adicionales
            <span style={{fontSize:10,color:"#9ca3af",fontWeight:400,marginLeft:6}}>hasta 4 fotos (galería en tienda)</span>
          </label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {extraImages.map((img,idx)=>(
              <div key={idx}>
                <input ref={extraRefs[idx]} type="file" accept="image/*" onChange={e=>handleExtraImg(idx,e)} style={{display:"none"}}/>
                {img
                  ? <div className="extra-slot-filled">
                      <img src={img} alt="" style={{width:"100%",height:90,objectFit:"cover",display:"block"}}/>
                      <div className="extra-slot-overlay">
                        <button onClick={()=>extraRefs[idx].current.click()} style={{background:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Cambiar</button>
                        <button onClick={()=>removeExtraImg(idx)} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Quitar</button>
                      </div>
                      <span style={{position:"absolute",top:4,left:4,background:"#5b21b6",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10}}>Foto {idx+2}</span>
                    </div>
                  : <div className="extra-slot" onClick={()=>extraRefs[idx].current.click()}>
                      <span style={{fontSize:20}}>＋</span>
                      <p style={{fontSize:10,color:"#9ca3af",fontWeight:600}}>Foto {idx+2}</p>
                    </div>
                }
              </div>
            ))}
          </div>

          {/* ── TIPO ── */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Tipo de producto</label>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button className={`type-btn${form.productType==="torre"?" on":""}`} onClick={()=>setF("productType","torre")}>🖥️ Torre / PC Escritorio</button>
              <button className={`type-btn${form.productType==="portatil"?" on":""}`} onClick={()=>setF("productType","portatil")}>💻 Portátil</button>
              <button className={`type-btn${form.productType==="monitor"?" on":""}`} onClick={()=>setF("productType","monitor")}>🖵 Monitor</button>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Label t="Nombre *"><input className="inp" placeholder="Ej. Torre Gamer Ryzen 7 5700G" value={form.name} onChange={e=>setF("name",e.target.value)}/></Label>
            <Label t="SKU" hint="(opcional)"><input className="inp" placeholder="Ej. TOR-RYZ-5700G" value={form.sku} onChange={e=>setF("sku",e.target.value)}/></Label>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Label t="Marca">
                <select className="inp" value={form.brandId||""} onChange={e=>{const b=activeBrands.find(b=>b.id===+e.target.value);setForm(p=>({...p,brandId:b?.id||null,brand:b?.name||""}));}}>
                  <option value="">Sin marca</option>
                  {activeBrands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Label>
              <Label t="Categoría">
                <select className="inp" value={form.category} onChange={e=>setF("category",e.target.value)}>
                  {cats.map(c=><option key={c.id}>{c.name}</option>)}
                </select>
              </Label>
            </div>

            {subcats.length>0&&<Label t="Subcategoría" hint="(opcional)"><select className="inp" value={form.subcategory} onChange={e=>setF("subcategory",e.target.value)}><option value="">Sin subcategoría</option>{subcats.map(s=><option key={s}>{s}</option>)}</select></Label>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Label t="Precio base *" hint="Ej: 2350000">
                <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#6b7280",fontWeight:600}}>$</span><input className="inp" type="text" inputMode="numeric" placeholder="2350000" value={form.price} onChange={e=>setF("price",e.target.value)} style={{paddingLeft:24}}/></div>
                {form.price&&<p style={{fontSize:11,color:"#5b21b6",fontWeight:600,marginTop:3}}>{fmt(parsePrice(form.price))}</p>}
              </Label>
              <Label t="Precio anterior" hint="(tachado)">
                <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#6b7280",fontWeight:600}}>$</span><input className="inp" type="text" inputMode="numeric" placeholder="3500000" value={form.oldPrice} onChange={e=>setF("oldPrice",e.target.value)} style={{paddingLeft:24}}/></div>
                {form.oldPrice&&<p style={{fontSize:11,color:"#9ca3af",fontWeight:600,marginTop:3,textDecoration:"line-through"}}>{fmt(parsePrice(form.oldPrice))}</p>}
              </Label>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Label t="Descuento (%)" hint="auto si vacío"><input className="inp" type="number" min="0" max="100" placeholder="41" value={form.discount} onChange={e=>setF("discount",e.target.value)}/></Label>
              <Label t="Stock"><input className="inp" type="number" min="0" placeholder="0" value={form.stock} onChange={e=>setF("stock",e.target.value)}/></Label>
            </div>

            <Label t="Descripción / Especificaciones">
              <textarea className="inp" rows={3} placeholder={"Procesador: AMD Ryzen 7\nRAM: 16GB DDR4\nSSD: 512GB NVMe"} value={form.description} onChange={e=>setF("description",e.target.value)} style={{resize:"vertical"}}/>
            </Label>

            <button className="btn btn-blue" onClick={handleSave} style={{width:"100%",padding:"13px 0",fontSize:15,marginTop:4}}>
              {tab==="new"?"🚀 Publicar en tienda":"💾 Guardar cambios"}
            </button>
            {tab==="edit"&&<button className="btn btn-gray" onClick={resetForm} style={{width:"100%",marginTop:8}}>Cancelar</button>}
          </div>
        </div>

        {/* ── LISTA ── */}
        <div className="card" style={{padding:0,overflow:"hidden",alignSelf:"start"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{fontSize:15,fontWeight:700}}>En tienda ({products.length})</h3>
            {products.length>0&&<button className="btn btn-red btn-sm" onClick={async ()=>{ if(window.confirm("¿Eliminar TODO?")){ await saveProducts([]); reload(); } }}>Limpiar</button>}
          </div>
          <div style={{maxHeight:680,overflowY:"auto"}}>
            {products.length===0
              ?<div style={{textAlign:"center",padding:40,color:"#9ca3af"}}><div style={{fontSize:48,marginBottom:12}}>🛍️</div><p style={{fontSize:14,fontWeight:700}}>La tienda está vacía</p></div>
              :products.map((p,i)=>(
                <div key={p.id} style={{padding:"12px 16px",borderBottom:i<products.length-1?"1px solid #f9fafb":"none",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {p.img?<img src={p.img} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:8,flexShrink:0,border:"1px solid #e5e7eb"}}/>:<div style={{width:48,height:48,borderRadius:8,background:"#f3f4f6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📦</div>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <p style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                        <span style={{background:p.productType==="portatil"?"#dbeafe":p.productType==="monitor"?"#f0fdf4":"#f5f3ff",color:p.productType==="portatil"?"#1d4ed8":p.productType==="monitor"?"#16a34a":"#5b21b6",fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:10,flexShrink:0}}>{p.productType==="portatil"?"💻":p.productType==="monitor"?"🖵":"🖥️"}</span>
                        {p.images?.length>0&&<span style={{background:"#f0fdf4",color:"#16a34a",fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:10,flexShrink:0}}>📷 +{p.images.length}</span>}
                      </div>
                      <p style={{fontSize:11,color:"#6b7280"}}>{fmt(p.price)} · {p.brand||p.category}</p>
                      <SBadge s={p.status}/>
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>setConfigProduct(p)} className="btn btn-sm" style={{background:"#eff6ff",color:"#5b21b6",border:"1px solid #c7d2fe"}} title="Configurar componentes">⚙️</button>
                      <button onClick={()=>handleEdit(p)} className="btn btn-sm btn-outline"><IcoEdit/></button>
                      <button onClick={()=>handleDelete(p.id)} className="btn btn-sm" style={{background:"#fee2e2"}}><IcoTrash/></button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// INVENTORY
// ════════════════════════════════════════════════════
function Inventory({products,reload}){
  const [search,setSearch]=useState("");
  const list=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
  const hs = async (id,d) => { await updateStock(id,d); reload(); };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:800}}>Inventario</h2>
        <input className="inp" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:220}}/>
      </div>
      {list.length===0?(<div className="card" style={{textAlign:"center",padding:60,color:"#9ca3af"}}><div style={{fontSize:48,marginBottom:12}}>📦</div><p style={{fontWeight:700}}>Sin productos</p></div>):(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          {list.map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:i<list.length-1?"1px solid #f0f0f0":"none"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              {p.img?<img src={p.img} alt="" style={{width:46,height:46,objectFit:"cover",borderRadius:8,flexShrink:0}}/>:<div style={{width:46,height:46,borderRadius:8,background:"#f3f4f6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📦</div>}
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                <p style={{fontSize:11,color:"#6b7280"}}>{p.category} · {fmt(p.price)}</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <button onClick={()=>hs(p.id,-1)} className="btn btn-sm btn-outline" style={{width:28,height:28,padding:0,fontSize:16}}>−</button>
                <span style={{fontSize:15,fontWeight:700,minWidth:24,textAlign:"center"}}>{p.stock}</span>
                <button onClick={()=>hs(p.id,1)} className="btn btn-sm btn-outline" style={{width:28,height:28,padding:0,fontSize:16}}>+</button>
              </div>
              <SBadge s={p.status}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════
function Dashboard({products,setSection}){
  const stats=[
    {label:"Total",value:products.length,color:"#5b21b6",icon:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8"},
    {label:"Disponibles",value:products.filter(p=>p.stock>0).length,color:"#22c55e",icon:"M9 11l3 3L22 4"},
    {label:"Agotados",value:products.filter(p=>p.stock===0).length,color:"#ef4444",icon:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"},
    {label:"Pocas unid.",value:products.filter(p=>p.stock>0&&p.stock<=5).length,color:"#f59e0b",icon:"M12 9v4M12 17h.01"},
  ];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h2 style={{fontSize:18,fontWeight:800}}>Dashboard</h2><p style={{fontSize:13,color:"#6b7280"}}>Resumen de tu tienda ONE PC</p></div>
        <a href="/" target="_blank" style={{background:"#5b21b6",color:"#fff",padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:700,textDecoration:"none"}}>🛍️ Ver tienda</a>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}>
        {stats.map((s,i)=><div key={i} className="sc"><div style={{width:44,height:44,borderRadius:12,background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico d={s.icon} c={s.color} s={20}/></div><div><p style={{fontSize:12,color:"#6b7280",marginBottom:2}}>{s.label}</p><p style={{fontSize:24,fontWeight:900}}>{s.value}</p></div></div>)}
      </div>
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>Accesos rápidos</h3>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn btn-blue" onClick={()=>setSection("products")}>➕ Agregar producto</button>
          <button className="btn btn-outline" onClick={()=>setSection("inventory")}>📦 Inventario</button>
          <button className="btn btn-outline" onClick={()=>setSection("brands")}>🏷️ Marcas</button>
          <button className="btn btn-outline" onClick={()=>setSection("banners")}>🖼️ Banners</button>
          <button className="btn btn-outline" onClick={()=>setSection("categories")}>📂 Categorías</button>
          <a href="/" target="_blank" className="btn btn-outline" style={{textDecoration:"none"}}>🛍️ Ver tienda</a>
        </div>
      </div>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontSize:15,fontWeight:700}}>Productos recientes</h3>
          <button className="btn btn-outline btn-sm" onClick={()=>setSection("products")}>Ver todos</button>
        </div>
        {products.length===0?(<div style={{textAlign:"center",padding:32,color:"#9ca3af"}}><p style={{fontSize:14,fontWeight:700,marginBottom:8}}>La tienda está vacía</p><button className="btn btn-blue" onClick={()=>setSection("products")}>Agregar producto</button></div>)
        :products.slice(0,5).map((p,i)=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<Math.min(4,products.length-1)?"1px solid #f9fafb":"none"}}>
            {p.img?<img src={p.img} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:8}}/>:<div style={{width:40,height:40,borderRadius:8,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📦</div>}
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p><p style={{fontSize:11,color:"#6b7280"}}>{fmt(p.price)} · {p.category}</p></div>
            <SBadge s={p.status}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════
function Categories(){
  const [cats,setCatsState]=useState([]);
  useEffect(()=>{ getCategories().then(setCatsState); },[]);
  const [newCat,setNewCat]=useState(""); const [newSub,setNewSub]=useState({}); const [toast,setToast]=useState(""); const [editing,setEditing]=useState(null);
  const st=msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};
  const persist = async u => { setCatsState(u); await saveCategories(u); };
  const addCat=()=>{if(!newCat.trim()){st("⚠️ Escribe el nombre");return;}if(cats.find(c=>c.name.toLowerCase()===newCat.trim().toLowerCase())){st("⚠️ Ya existe");return;}persist([...cats,{id:Date.now(),name:newCat.trim(),subcats:[]}]);setNewCat("");st("✓ Categoría agregada");};
  const delCat=id=>{if(!window.confirm("¿Eliminar?"))return;persist(cats.filter(c=>c.id!==id));st("🗑️ Eliminada");};
  const renCat=(id,name)=>{persist(cats.map(c=>c.id===id?{...c,name}:c));setEditing(null);st("✓ Renombrada");};
  const addSub=catId=>{const v=(newSub[catId]||"").trim();if(!v){st("⚠️ Escribe subcategoría");return;}persist(cats.map(c=>c.id===catId?{...c,subcats:[...c.subcats,v]}:c));setNewSub(s=>({...s,[catId]:""}));st("✓ Subcategoría agregada");};
  const delSub=(catId,sub)=>persist(cats.map(c=>c.id===catId?{...c,subcats:c.subcats.filter(s=>s!==sub)}:c));
  return(
    <div>
      <Toast msg={toast}/>
      <div style={{marginBottom:20}}><h2 style={{fontSize:18,fontWeight:800}}>Categorías y Subcategorías</h2></div>
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:12}}>➕ Nueva categoría</h3>
        <div style={{display:"flex",gap:10}}><input className="inp" placeholder="Ej. Laptops..." value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} style={{flex:1}}/><button className="btn btn-blue" onClick={addCat}>Agregar</button></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {cats.map(cat=>(
          <div key={cat.id} className="card">
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:10,borderBottom:"1px solid #f0f0f0"}}>
              <div style={{width:3,height:20,background:"#5b21b6",borderRadius:2,flexShrink:0}}/>
              {editing?.id===cat.id?(<input autoFocus defaultValue={cat.name} className="inp" style={{flex:1,padding:"6px 10px",fontSize:13,fontWeight:700}} onBlur={e=>renCat(cat.id,e.target.value)} onKeyDown={e=>{if(e.key==="Enter")renCat(cat.id,e.target.value);if(e.key==="Escape")setEditing(null);}}/>):(<span style={{flex:1,fontSize:14,fontWeight:800}}>{cat.name}</span>)}
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>setEditing({id:cat.id})} className="btn btn-sm btn-outline">✏️</button>
                <button onClick={()=>delCat(cat.id)} className="btn btn-sm" style={{background:"#fee2e2"}}>🗑️</button>
              </div>
            </div>
            {cat.subcats.length===0?(<p style={{fontSize:12,color:"#9ca3af",fontStyle:"italic",marginBottom:8}}>Sin subcategorías</p>):(<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{cat.subcats.map(sub=>(<div key={sub} style={{display:"flex",alignItems:"center",gap:4,background:"#f5f3ff",border:"1px solid #e9d5ff",borderRadius:20,padding:"3px 10px"}}><span style={{fontSize:12,fontWeight:600,color:"#5b21b6"}}>{sub}</span><button onClick={()=>delSub(cat.id,sub)} style={{background:"none",border:"none",cursor:"pointer",color:"#a78bfa",fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button></div>))}</div>)}
            <div style={{display:"flex",gap:8}}><input className="inp" placeholder="Nueva subcategoría..." value={newSub[cat.id]||""} onChange={e=>setNewSub(s=>({...s,[cat.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSub(cat.id)} style={{flex:1,fontSize:12,padding:"7px 12px"}}/><button className="btn btn-blue btn-sm" onClick={()=>addSub(cat.id)}>+ Sub</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════
// BANNERS — Refactorizado moderno
// ════════════════════════════════════════════════════
// ════════════════════════════════════════════════════
// BANNERS — Refactorizado moderno
// ════════════════════════════════════════════════════
function Banners(){
  const [banners,setBanners] = useState([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ getBanners().then(b=>{ setBanners(b); setLoading(false); }); },[]);
  const [toast,setToast]     = useState("");
  const st  = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const persist = async (updated) => { setBanners(updated); await saveBanners(updated); };
  const hImg = (id,e) => {
    const file = e.target.files[0]; if(!file) return;
    compressImg(file, async c => {
      const u = banners.map(b => b.id===id ? {...b, img:c, imgMobile:c} : b);
      await persist(u); st("✓ Banner actualizado");
    }, 1920, 0.82);
  };
  const tog     = async id     => { const u=banners.map(b=>b.id===id?{...b,activo:!b.activo}:b);   await persist(u); st("✓ Estado cambiado"); };
  const rst     = async id     => { const u=banners.map(b=>b.id===id?{...b,img:"",imgMobile:""}:b); await persist(u); st("🗑️ Imagen eliminada"); };
  const hLink   = (id,v)       => { setBanners(p=>p.map(b=>b.id===id?{...b,link:v}:b)); };
  const hFocusX = async (id,v) => { const u=banners.map(b=>b.id===id?{...b,focusX:v}:b);           await persist(u); st("✓ Foco actualizado"); };
  const hFocusY = async (id,v) => { const u=banners.map(b=>b.id===id?{...b,focusY:v}:b);           await persist(u); st("✓ Foco actualizado"); };
  const save    = async ()     => { await saveBanners(banners); st("✓ Guardado"); };

  const css = `
    .bn-card{background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:16px;transition:box-shadow .2s;}
    .bn-card:hover{box-shadow:0 4px 24px #5b21b60a;}
    .bn-img{width:100%;aspect-ratio:16/5;object-fit:cover;display:block;background:#f3f4f6;}
    .bn-drop{width:100%;aspect-ratio:16/5;border:2px dashed #e5e7eb;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:#fafafa;transition:all .18s;gap:8px;}
    .bn-drop:hover{border-color:#5b21b6;background:#f5f3ff;}
    .bn-overlay{position:absolute;inset:0;background:linear-gradient(to top,#00000077,transparent);opacity:0;transition:opacity .2s;display:flex;align-items:flex-end;justify-content:flex-end;padding:10px;gap:6px;}
    .bn-overlay:hover{opacity:1;}
    .bn-footer{padding:12px 16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid #f0f0f0;}
    .bn-pill{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;cursor:pointer;border:none;transition:all .18s;flex-shrink:0;}
    .bn-pill.on{background:#dcfce7;color:#16a34a;} .bn-pill.off{background:#f3f4f6;color:#9ca3af;}
    .bn-focus-row{padding:0 16px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
    .bn-focus-btn{border:1.5px solid #e5e7eb;border-radius:8px;padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;background:#fff;color:#374151;transition:all .15s;font-family:inherit;}
    .bn-focus-btn.sel{border-color:#5b21b6;background:#eff6ff;color:#5b21b6;}
    .bn-link-row{padding:0 16px 14px;display:flex;align-items:center;gap:8px;}
    .bn-link-row input{flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:7px 12px;font-size:12px;outline:none;font-family:inherit;color:#374151;transition:border-color .18s;}
    .bn-link-row input:focus{border-color:#5b21b6;}
    .bn-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
    @media(max-width:768px){.bn-grid{grid-template-columns:1fr;}}
    .bn-section-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  `;

  const BannerCard = ({b}) => {
    const ref = useRef();
    const pos = `${b.focusX||"center"} ${b.focusY||"center"}`;
    return (
      <div className="bn-card">
        <input ref={ref} type="file" accept="image/*" onChange={e=>hImg(b.id,e)} style={{display:"none"}}/>

        {/* Preview */}
        {b.img
          ? <div style={{position:"relative"}}>
              <img src={b.img} alt={b.label} className="bn-img" style={{objectPosition:pos}}/>
              <div className="bn-overlay">
                <button onClick={()=>ref.current.click()} style={{background:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Cambiar</button>
                <button onClick={()=>rst(b.id)} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Eliminar</button>
              </div>
            </div>
          : <div className="bn-drop" onClick={()=>ref.current.click()}>
              <div style={{width:44,height:44,borderRadius:12,background:"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🖼️</div>
              <p style={{fontSize:13,fontWeight:600,color:"#6b7280"}}>Subir imagen</p>
              <p style={{fontSize:11,color:"#9ca3af"}}>1920×680px recomendado · JPG, PNG, WEBP</p>
            </div>
        }

        {/* Footer: nombre + cambiar + estado */}
        <div className="bn-footer">
          <span style={{fontSize:13,fontWeight:700,color:"#111",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.label}</span>
          {b.img && <button onClick={()=>ref.current.click()} className="btn btn-sm btn-outline">📷 Cambiar</button>}
          <button onClick={()=>tog(b.id)} className={`bn-pill ${b.activo?"on":"off"}`}>
            <span style={{width:6,height:6,borderRadius:"50%",background:b.activo?"#16a34a":"#9ca3af",display:"inline-block"}}/>
            {b.activo?"Activo":"Inactivo"}
          </button>
        </div>

        {/* Foco visual — solo si tiene imagen */}
        {b.img && (
          <div className="bn-focus-row">
            <span style={{fontSize:11,fontWeight:600,color:"#9ca3af",flexShrink:0}}>Foco:</span>
            {FOCUS_X.map(f=>(
              <button key={f.v} className={`bn-focus-btn${(b.focusX||"center")===f.v?" sel":""}`} onClick={()=>hFocusX(b.id,f.v)}>{f.l}</button>
            ))}
            <span style={{fontSize:11,color:"#e5e7eb"}}>|</span>
            {FOCUS_Y.map(f=>(
              <button key={f.v} className={`bn-focus-btn${(b.focusY||"center")===f.v?" sel":""}`} onClick={()=>hFocusY(b.id,f.v)}>{f.l}</button>
            ))}
          </div>
        )}

        {/* Link */}
        <div className="bn-link-row">
          <span style={{fontSize:11,color:"#9ca3af",flexShrink:0}}>🔗</span>
          <input placeholder="Link al hacer clic (opcional)" value={b.link} onChange={e=>hLink(b.id,e.target.value)}/>
          {b.link && <button className="btn btn-sm btn-blue" onClick={save}>Guardar</button>}
        </div>
      </div>
    );
  };

  const heroB  = banners.filter(b=>b.id.startsWith("hero"));
  const promoB = banners.filter(b=>b.id.startsWith("promo"));

  return(
    <div>
      <style>{css}</style>
      <Toast msg={toast}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:800}}>Banners</h2>
          <p style={{fontSize:13,color:"#6b7280",marginTop:2}}>Una imagen · Responsive automático · Control de foco visual</p>
        </div>
        <button className="btn btn-blue" onClick={save}>💾 Guardar todo</button>
      </div>

      <div className="bn-grid">
        <div>
          <div className="bn-section-hd">
            <div style={{width:3,height:18,background:"#5b21b6",borderRadius:2}}/>
            <h3 style={{fontSize:14,fontWeight:700}}>Hero Slider</h3>
            <span style={{fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"2px 8px",borderRadius:10}}>{heroB.length}</span>
          </div>
          {heroB.map(b=><BannerCard key={b.id} b={b}/>)}
        </div>
        <div>
          <div className="bn-section-hd">
            <div style={{width:3,height:18,background:"#f97316",borderRadius:2}}/>
            <h3 style={{fontSize:14,fontWeight:700}}>Promocionales</h3>
            <span style={{fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"2px 8px",borderRadius:10}}>{promoB.length}</span>
          </div>
          {promoB.map(b=><BannerCard key={b.id} b={b}/>)}
          <div style={{background:"#f9fafb",borderRadius:12,padding:"14px 16px",border:"1px solid #e5e7eb",marginTop:8}}>
            <p style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>💡 Sistema inteligente de recorte</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                ["1 sola imagen","Se adapta a desktop, tablet y móvil"],
                ["Foco visual","Define dónde enfocar al recortar en móvil"],
                ["object-fit: cover","Sin deformación, siempre proporcional"],
                ["Resolución óptima","Sube imágenes de mínimo 1920×680px"],
              ].map(([t,d])=>(
                <div key={t} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{color:"#22c55e",fontSize:12,flexShrink:0}}>✓</span>
                  <p style={{fontSize:11,color:"#6b7280",lineHeight:1.5}}><strong style={{color:"#374151"}}>{t}</strong> — {d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// MAIN ADMIN APP
// ════════════════════════════════════════════════════
export default function AdminApp(){
  const [logged,setLogged]=useState(false); const [section,setSection]=useState("dashboard");
  const [products,setProducts]=useState([]); const [menuOpen,setMenuOpen]=useState(false);
  const reload = async () => {
    const prods = await getProducts();
    setProducts(prods);
  };
  useEffect(()=>{
    reload();
    // Re-leer cuando el admin vuelve a estar visible (móvil)
    const hVis = () => { if(document.visibilityState==="visible") reload(); };
    document.addEventListener("visibilitychange", hVis);
    window.addEventListener("onepc_updated", reload);
    return()=>{
      document.removeEventListener("visibilitychange", hVis);
      window.removeEventListener("onepc_updated",reload);
    };
  },[]);
  const navItems=[
    {id:"dashboard", label:"Dashboard",  icon:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"},
    {id:"inventory", label:"Inventario", icon:"M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8"},
    {id:"products",  label:"Productos",  icon:"M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"},
    {id:"brands",    label:"Marcas",     icon:"M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"},
    {id:"categories",label:"Categorías", icon:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"},
    {id:"banners",   label:"Banners",    icon:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"},
  ];
  if(!logged) return <><style>{css}</style><Login onLogin={()=>setLogged(true)}/></>;
  return(<>
    <style>{css}</style>
    <div style={{display:"flex",minHeight:"100vh",background:"#f3f4f6"}}>
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"#00000055",zIndex:49}}/>}
      <aside className={`sidebar${menuOpen?" open":""}`}>
        <div style={{padding:"18px 16px",borderBottom:"1px solid #e5e7eb",display:"flex",alignItems:"center",gap:10}}>
          <Logo/><div><p style={{fontSize:12,fontWeight:700}}>ONE PC</p><p style={{fontSize:10,color:"#6b7280"}}>Panel Admin</p></div>
        </div>
        <nav style={{flex:1,padding:"8px"}}>
          {navItems.map(n=><button key={n.id} className={`si${section===n.id?" on":""}`} onClick={()=>{setSection(n.id);setMenuOpen(false);}}><Ico d={n.icon} c={section===n.id?"#5b21b6":"#6b7280"} s={16}/>{n.label}</button>)}
        </nav>
        <div style={{padding:"12px",borderTop:"1px solid #e5e7eb"}}>
          <a href="/" target="_blank" style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:"#f5f3ff",color:"#5b21b6",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:8}}>🛍️ Ver tienda</a>
          <button onClick={()=>setLogged(false)} className="btn btn-outline" style={{width:"100%",fontSize:12}}>Cerrar sesión</button>
        </div>
      </aside>
      <div style={{flex:1,marginLeft:210,display:"flex",flexDirection:"column"}} className="main-wrap">
        <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setMenuOpen(v=>!v)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center"}}><Ico d="M3 12h18M3 6h18M3 18h18" s={22}/></button>
            <Logo/>
            <span style={{fontSize:13,color:"#9ca3af"}} className="hide-mob">/ {navItems.find(n=>n.id===section)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,color:"#6b7280"}} className="hide-mob">{products.length} productos</span>
            <div style={{width:34,height:34,borderRadius:"50%",background:"#5b21b6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ico d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" c="#fff" s={16}/>
            </div>
          </div>
        </div>
        <div style={{flex:1,padding:"20px"}}>
          {section==="dashboard"  && <Dashboard   products={products} setSection={setSection}/>}
          {section==="inventory"  && <Inventory   products={products} reload={reload}/>}
          {section==="products"   && <Products    products={products} reload={reload}/>}
          {section==="brands"     && <Brands/>}
          {section==="categories" && <Categories/>}
          {section==="banners"    && <Banners/>}
        </div>
      </div>
    </div>
  </>);
}