import { db, auth } from "./firebase.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { destinos } from "./destinos-data.js";

let currentCategory="Todos", searchTerm="", onlyFavorites=false, completed=[];

async function seedDestinos(){
  try{
    for(const d of destinos){
      await setDoc(doc(db,"destinos",d.id),d,{merge:true});
    }
  }catch(e){ console.warn("Sincronización de destinos:",e.message); }
}

async function getCompleted(){
  if(!auth.currentUser) return [];
  try{
    const snap=await getDocs(collection(db,"usuarios",auth.currentUser.uid,"logros"));
    return snap.docs.map(x=>x.id);
  }catch(e){ return []; }
}

function favorites(){
  try{return JSON.parse(localStorage.getItem("turismoAcobamba_favoritos")||"[]")}
  catch{return[]}
}

function toggleFavorite(id){
  let f=favorites();
  f=f.includes(id)?f.filter(x=>x!==id):[...f,id];
  localStorage.setItem("turismoAcobamba_favoritos",JSON.stringify(f));
  renderCatalog();
}

function safe(t){
  return String(t).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function renderCatalog(){
  const grid=document.getElementById("destinosGrid");
  if(!grid)return;
  const fav=favorites();
  let list=destinos
    .filter(d=>currentCategory==="Todos"||d.categoria===currentCategory)
    .filter(d=>(d.nombre+" "+d.ubicacion+" "+d.descripcion).toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(d=>!onlyFavorites||fav.includes(d.id));

  const results=document.getElementById("resultsCount");
  if(results) results.textContent=`${list.length} ${list.length===1?"destino":"destinos"}`;
  const empty=document.getElementById("emptyState");
  if(empty) empty.classList.toggle("hidden",list.length>0);

  grid.innerHTML=list.map(d=>{
    const done=completed.includes(d.id), liked=fav.includes(d.id);
    const cover=d.fotos?.[0];
    return `<article class="destination-card v6-card">
      <div class="destination-img">
        ${cover?`<img src="${cover}" alt="${safe(d.nombre)}" loading="lazy">`:`<span>${d.emoji}</span>`}
        <button class="favorite-btn ${liked?"liked":""}" data-fav="${d.id}" aria-label="Favorito">${liked?"♥":"♡"}</button>
      </div>
      <div class="destination-body">
        <div class="meta"><span class="tag">${safe(d.categoria)}</span><span class="tag">${done?"🏆 Completado":"⭐ "+d.xp+" XP"}</span></div>
        <h3>${safe(d.nombre)}</h3>
        <p>📍 ${safe(d.ubicacion)}<br>${safe(d.descripcion)}</p>
        <a class="btn primary full" href="destino.html?id=${encodeURIComponent(d.id)}">${done?"Ver destino":"Explorar destino"} →</a>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll("[data-fav]").forEach(b=>b.addEventListener("click",e=>{
    e.preventDefault(); e.stopPropagation(); toggleFavorite(b.dataset.fav);
  }));
}

function renderDetail(){
  const box=document.getElementById("destinationDetail");
  if(!box)return;
  const id=new URLSearchParams(location.search).get("id")||destinos[0].id;
  const d=destinos.find(x=>x.id===id)||destinos[0];
  const liked=favorites().includes(d.id), done=completed.includes(d.id);
  const fotos=d.fotos||[];

  box.innerHTML=`<article class="detail-card v6-detail">
    <div class="detail-cover">
      ${fotos.length?`<img id="coverImg" src="${fotos[0]}" alt="${safe(d.nombre)}">`:`<span>${d.emoji}</span>`}
      <button id="detailFav" class="detail-favorite ${liked?"liked":""}">${liked?"♥ Guardado":"♡ Guardar favorito"}</button>
    </div>
    ${fotos.length>1?`<div class="photo-thumbs">${fotos.map((f,i)=>`<button class="thumb-btn ${i===0?"active":""}" data-src="${f}"><img src="${f}" alt="Foto ${i+1} de ${safe(d.nombre)}" loading="lazy"></button>`).join("")}</div>`:""}
    <div class="detail-content">
      <div class="meta"><span class="tag">${safe(d.categoria)}</span><span class="tag">⭐ ${d.xp} XP</span><span class="tag">🥾 ${safe(d.dificultad)}</span></div>
      <h1>${safe(d.nombre)}</h1>
      <p class="location-line">📍 ${safe(d.ubicacion)}</p>
      <p>${safe(d.descripcion)}</p>
      <div class="info-grid">
        <div><strong>📖 Sobre el lugar</strong><p>${safe(d.historia)}</p></div>
        <div><strong>🎖️ Recompensa</strong><p>${safe(d.insignia)} · +${d.xp} XP</p></div>
      </div>
      <div class="reward-box">${done?"🏆 <strong>Destino completado</strong><br>Ya forma parte de tu colección.":"🎯 <strong>Reto disponible</strong><br>Llega físicamente a la zona del destino para desbloquear la insignia."}</div>
      <a class="btn primary full" href="mapa.html?id=${encodeURIComponent(d.id)}">🗺️ ${done?"Ver ruta":"Iniciar ruta"}</a>
    </div>
  </article>`;

  document.getElementById("detailFav")?.addEventListener("click",()=>{
    toggleFavorite(d.id);
    renderDetail();
  });

  box.querySelectorAll(".thumb-btn").forEach(btn=>btn.addEventListener("click",()=>{
    const cover=document.getElementById("coverImg");
    if(cover)cover.src=btn.dataset.src;
    box.querySelectorAll(".thumb-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  }));
}

function bindFilters(){
  document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentCategory=btn.dataset.category;
    renderCatalog();
  }));
  const s=document.getElementById("searchInput");
  if(s)s.addEventListener("input",()=>{searchTerm=s.value.trim();renderCatalog();});
  const f=document.getElementById("favoritesToggle");
  if(f)f.addEventListener("click",()=>{
    onlyFavorites=!onlyFavorites;
    f.classList.toggle("active",onlyFavorites);
    f.textContent=onlyFavorites?"♥ Mis favoritos":"♡ Mis favoritos";
    renderCatalog();
  });
}

onAuthStateChanged(auth,async()=>{
  completed=await getCompleted();
  renderCatalog();
  renderDetail();
});

window.destinos=destinos;
bindFilters();
seedDestinos().finally(async()=>{
  completed=await getCompleted();
  renderCatalog();
  renderDetail();
});
