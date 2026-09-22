import { db, auth } from "./firebase.js";
import { collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const destinos=[
 {id:"catarata",nombre:"Catarata de Acobamba",ubicacion:"Acobamba",descripcion:"Un destino natural para disfrutar del paisaje y vivir una aventura.",emoji:"💧",categoria:"Naturaleza",xp:100,lat:-12.843,long:-74.568,insignia:"Explorador del Agua"},
 {id:"mirador",nombre:"Mirador del Valle",ubicacion:"Acobamba",descripcion:"Disfruta de una vista panorámica y completa el reto del explorador.",emoji:"⛰️",categoria:"Aventura",xp:100,lat:-12.840,long:-74.570,insignia:"Explorador de Alturas"},
 {id:"plaza",nombre:"Plaza Histórica",ubicacion:"Centro de Acobamba",descripcion:"Conoce un espacio representativo y descubre parte de la historia local.",emoji:"🏛️",categoria:"Cultura",xp:100,lat:-12.840,long:-74.569,insignia:"Conocedor de la Historia"},
 {id:"laguna",nombre:"Laguna Natural",ubicacion:"Huancavelica",descripcion:"Explora un paisaje natural y desbloquea una insignia especial.",emoji:"🌊",categoria:"Naturaleza",xp:100,lat:-12.780,long:-74.970,insignia:"Aventurero Natural"},
 {id:"iglesia",nombre:"Templo Cultural",ubicacion:"Centro histórico",descripcion:"Descubre patrimonio y cultura mientras completas tu colección.",emoji:"⛪",categoria:"Cultura",xp:100,lat:-12.842,long:-74.569,insignia:"Descubridor Cultural"},
 {id:"sendero",nombre:"Sendero Verde",ubicacion:"Zona natural",descripcion:"Un reto para quienes disfrutan caminar y descubrir nuevos paisajes.",emoji:"🌿",categoria:"Aventura",xp:100,lat:-12.850,long:-74.560,insignia:"Guardián de la Naturaleza"}
];

async function seedDestinos(){
  // Crea destinos en Firestore una sola vez. Si no hay permisos de escritura,
  // la app sigue usando el catálogo local.
  try{
    for(const d of destinos){
      await setDoc(doc(db,"destinos",d.id),d,{merge:true});
    }
  }catch(e){ console.warn("No se pudo sincronizar destinos:",e.message); }
}

async function getCompleted(){
  const u=auth.currentUser;
  if(!u) return [];
  try{
    const snap=await getDocs(collection(db,"usuarios",u.uid,"logros"));
    return snap.docs.map(x=>x.id);
  }catch(e){return []}
}

async function renderCatalog(){
  const grid=document.getElementById("destinosGrid"); if(!grid)return;
  const completed=await getCompleted();
  grid.innerHTML=destinos.map(d=>`
    <article class="destination-card">
      <div class="destination-img">${d.emoji}</div>
      <div class="destination-body">
        <div class="meta"><span class="tag">${d.categoria}</span><span class="tag">${completed.includes(d.id)?"🏆 Completado":"🔓 Disponible"}</span></div>
        <h3>${d.nombre}</h3>
        <p>📍 ${d.ubicacion}<br>${d.descripcion}</p>
        <a class="btn primary full" href="destino.html?id=${d.id}">Explorar destino</a>
      </div>
    </article>`).join("");
}

function renderDetail(){
  const box=document.getElementById("destinationDetail"); if(!box)return;
  const id=new URLSearchParams(location.search).get("id")||"catarata";
  const d=destinos.find(x=>x.id===id)||destinos[0];
  box.innerHTML=`<article class="detail-card">
    <div class="detail-cover">${d.emoji}</div>
    <div class="detail-content">
      <div class="meta"><span class="tag">${d.categoria}</span><span class="tag">⭐ ${d.xp} XP</span></div>
      <h1>${d.nombre}</h1><p>📍 ${d.ubicacion}</p><p>${d.descripcion}</p>
      <div class="reward-box"><strong>🎖️ Recompensa</strong><br>${d.insignia} · +${d.xp} XP</div>
      <a class="btn primary full" href="mapa.html?id=${d.id}">🗺️ Iniciar ruta</a>
    </div></article>`;
}

window.destinos=destinos;
seedDestinos().finally(()=>{renderCatalog();renderDetail();});
