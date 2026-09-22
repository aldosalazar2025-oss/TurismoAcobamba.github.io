import { db, auth } from "./firebase.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const destinos=[
 {id:"catarata",nombre:"Catarata de Acobamba",ubicacion:"Acobamba",descripcion:"Un destino natural para disfrutar del paisaje y vivir una aventura.",emoji:"💧",categoria:"Naturaleza",xp:100,lat:-12.843,long:-74.568,insignia:"Explorador del Agua",historia:"Un espacio pensado para conectar con el paisaje y disfrutar de una experiencia al aire libre.",dificultad:"Fácil"},
 {id:"mirador",nombre:"Mirador del Valle",ubicacion:"Acobamba",descripcion:"Disfruta de una vista panorámica y completa el reto del explorador.",emoji:"⛰️",categoria:"Aventura",xp:100,lat:-12.840,long:-74.570,insignia:"Explorador de Alturas",historia:"Un punto de observación ideal para contemplar el entorno y capturar fotografías.",dificultad:"Media"},
 {id:"plaza",nombre:"Plaza Histórica",ubicacion:"Centro de Acobamba",descripcion:"Conoce un espacio representativo y descubre parte de la historia local.",emoji:"🏛️",categoria:"Cultura",xp:100,lat:-12.840,long:-74.569,insignia:"Conocedor de la Historia",historia:"Un lugar para recorrer, observar la arquitectura y conocer la identidad local.",dificultad:"Fácil"},
 {id:"laguna",nombre:"Laguna Natural",ubicacion:"Huancavelica",descripcion:"Explora un paisaje natural y desbloquea una insignia especial.",emoji:"🌊",categoria:"Naturaleza",xp:100,lat:-12.780,long:-74.970,insignia:"Aventurero Natural",historia:"Un paisaje natural pensado para una experiencia de exploración y fotografía.",dificultad:"Media"},
 {id:"iglesia",nombre:"Templo Cultural",ubicacion:"Centro histórico",descripcion:"Descubre patrimonio y cultura mientras completas tu colección.",emoji:"⛪",categoria:"Cultura",xp:100,lat:-12.842,long:-74.569,insignia:"Descubridor Cultural",historia:"Un punto de interés para conocer elementos del patrimonio y la cultura local.",dificultad:"Fácil"},
 {id:"sendero",nombre:"Sendero Verde",ubicacion:"Zona natural",descripcion:"Un reto para quienes disfrutan caminar y descubrir nuevos paisajes.",emoji:"🌿",categoria:"Aventura",xp:100,lat:-12.850,long:-74.560,insignia:"Guardián de la Naturaleza",historia:"Un recorrido para caminar, observar el entorno y completar un nuevo reto.",dificultad:"Media"},
 {id:"sabores",nombre:"Sabores de Acobamba",ubicacion:"Acobamba",descripcion:"Descubre la gastronomía local y suma una nueva experiencia a tu colección.",emoji:"🍲",categoria:"Gastronomía",xp:100,lat:-12.841,long:-74.567,insignia:"Explorador Gastronómico",historia:"Una experiencia dedicada a conocer sabores, productos y tradiciones culinarias locales.",dificultad:"Fácil"}
];

let currentCategory="Todos", searchTerm="", onlyFavorites=false, completed=[], currentUser=null;

async function seedDestinos(){
 try{for(const d of destinos) await setDoc(doc(db,"destinos",d.id),d,{merge:true});}
 catch(e){console.warn("Sincronización de destinos:",e.message);}
}
async function getCompleted(){
 if(!auth.currentUser)return [];
 try{const snap=await getDocs(collection(db,"usuarios",auth.currentUser.uid,"logros"));return snap.docs.map(x=>x.id);}
 catch(e){return []}
}
function favorites(){try{return JSON.parse(localStorage.getItem("turismoAcobamba_favoritos")||"[]")}catch{return[]}}
function toggleFavorite(id){let f=favorites();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];localStorage.setItem("turismoAcobamba_favoritos",JSON.stringify(f));renderCatalog();}
function safe(t){return String(t).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function renderCatalog(){
 const grid=document.getElementById("destinosGrid"); if(!grid)return;
 const fav=favorites();
 let list=destinos.filter(d=>currentCategory==="Todos"||d.categoria===currentCategory)
   .filter(d=>(d.nombre+" "+d.ubicacion+" "+d.descripcion).toLowerCase().includes(searchTerm.toLowerCase()))
   .filter(d=>!onlyFavorites||fav.includes(d.id));
 document.getElementById("resultsCount").textContent=`${list.length} ${list.length===1?"destino":"destinos"}`;
 document.getElementById("emptyState").classList.toggle("hidden",list.length>0);
 grid.innerHTML=list.map(d=>{
   const done=completed.includes(d.id), liked=fav.includes(d.id);
   return `<article class="destination-card v6-card">
    <div class="destination-img"><span>${d.emoji}</span><button class="favorite-btn ${liked?"liked":""}" data-fav="${d.id}" aria-label="Favorito">${liked?"♥":"♡"}</button>
      <span class="difficulty">${d.dificultad}</span></div>
    <div class="destination-body"><div class="meta"><span class="tag">${d.categoria}</span><span class="tag">${done?"🏆 Completado":"⭐ "+d.xp+" XP"}</span></div>
      <h3>${safe(d.nombre)}</h3><p>📍 ${safe(d.ubicacion)}<br>${safe(d.descripcion)}</p>
      <a class="btn primary full" href="destino.html?id=${d.id}">${done?"Ver destino":"Explorar destino"} →</a>
    </div></article>`;
 }).join("");
 grid.querySelectorAll("[data-fav]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();toggleFavorite(b.dataset.fav);}));
}
function renderDetail(){
 const box=document.getElementById("destinationDetail"); if(!box)return;
 const id=new URLSearchParams(location.search).get("id")||"catarata";
 const d=destinos.find(x=>x.id===id)||destinos[0], liked=favorites().includes(d.id), done=completed.includes(d.id);
 box.innerHTML=`<article class="detail-card v6-detail">
  <div class="detail-cover"><span>${d.emoji}</span><button id="detailFav" class="detail-favorite ${liked?"liked":""}">${liked?"♥ Guardado":"♡ Guardar favorito"}</button></div>
  <div class="detail-content"><div class="meta"><span class="tag">${d.categoria}</span><span class="tag">⭐ ${d.xp} XP</span><span class="tag">🥾 ${d.dificultad}</span></div>
  <h1>${safe(d.nombre)}</h1><p class="location-line">📍 ${safe(d.ubicacion)}</p>
  <p>${safe(d.descripcion)}</p>
  <div class="info-grid"><div><strong>📖 Sobre el lugar</strong><p>${safe(d.historia)}</p></div><div><strong>🎖️ Recompensa</strong><p>${safe(d.insignia)} · +${d.xp} XP</p></div></div>
  <div class="reward-box">${done?"🏆 <strong>Destino completado</strong><br>Ya forma parte de tu colección.":"🎯 <strong>Reto disponible</strong><br>Llega al destino para desbloquear la insignia."}</div>
  <a class="btn primary full" href="mapa.html?id=${d.id}">🗺️ ${done?"Ver ruta":"Iniciar ruta"}</a></div></article>`;
 document.getElementById("detailFav").addEventListener("click",()=>{toggleFavorite(d.id);renderDetail();});
}
function bindFilters(){
 document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
   document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
   currentCategory=btn.dataset.category;renderCatalog();
 }));
 const s=document.getElementById("searchInput");if(s)s.addEventListener("input",()=>{searchTerm=s.value.trim();renderCatalog();});
 const f=document.getElementById("favoritesToggle");if(f)f.addEventListener("click",()=>{onlyFavorites=!onlyFavorites;f.classList.toggle("active",onlyFavorites);f.textContent=onlyFavorites?"♥ Mis favoritos":"♡ Mis favoritos";renderCatalog();});
}
onAuthStateChanged(auth,async u=>{currentUser=u;completed=await getCompleted();renderCatalog();renderDetail();});
window.destinos=destinos;
bindFilters();seedDestinos().finally(async()=>{completed=await getCompleted();renderCatalog();renderDetail();});
