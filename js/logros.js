import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const badges=[
{id:"catarata",icon:"💧",name:"Explorador del Agua",desc:"Descubre una catarata o destino relacionado con el agua."},
{id:"mirador",icon:"⛰️",name:"Explorador de Alturas",desc:"Completa el reto de un mirador."},
{id:"plaza",icon:"🏛️",name:"Conocedor de la Historia",desc:"Descubre un lugar histórico."},
{id:"laguna",icon:"🌊",name:"Aventurero Natural",desc:"Explora un paisaje natural."},
{id:"iglesia",icon:"⛪",name:"Descubridor Cultural",desc:"Conoce un lugar cultural."},
{id:"sendero",icon:"🌿",name:"Guardián de la Naturaleza",desc:"Completa un sendero natural."}
];

async function render(u){
 const grid=document.getElementById("badgesGrid"); if(!grid)return;
 let completed=[];
 if(u){try{const s=await getDocs(collection(db,"usuarios",u.uid,"logros"));completed=s.docs.map(x=>x.id);}catch(e){console.error(e);}}
 grid.innerHTML=badges.map(b=>{const ok=completed.includes(b.id);return `<article class="badge-card ${ok?"unlocked":"locked"}"><div class="badge-icon">${ok?b.icon:"🔒"}</div><h3>${ok?b.name:"Insignia bloqueada"}</h3><p>${ok?b.desc:"Completa el destino correspondiente para desbloquearla."}</p>${ok?'<span class="tag">✓ Obtenida</span>':""}</article>`}).join("");
}
onAuthStateChanged(auth, render);
