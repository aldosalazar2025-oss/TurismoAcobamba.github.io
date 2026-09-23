import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { destinos } from "./destinos-data.js";

async function render(u){
  const grid=document.getElementById("badgesGrid");
  if(!grid)return;

  let completed=[];
  if(u){
    try{
      const s=await getDocs(collection(db,"usuarios",u.uid,"logros"));
      completed=s.docs.map(x=>x.id);
    }catch(e){console.error(e);}
  }

  grid.innerHTML=destinos.map(d=>{
    const ok=completed.includes(d.id);
    return `<article class="badge-card ${ok?"unlocked":"locked"}">
      <div class="badge-icon">${ok?d.emoji:"🔒"}</div>
      <h3>${ok?d.insignia:"Insignia bloqueada"}</h3>
      <p>${ok?`Completaste ${d.nombre}.`:"Llega físicamente al destino para desbloquearla."}</p>
      ${ok?'<span class="tag">✓ Obtenida</span>':""}
    </article>`;
  }).join("");
}
onAuthStateChanged(auth,render);
