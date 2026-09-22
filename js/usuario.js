import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, getDocs, collection, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

function rankFor(count){
 if(count>=10)return {name:"Maestro Explorador",icon:"🌎",next:"¡Has alcanzado el rango máximo de esta versión!"};
 if(count>=5)return {name:"Explorador Avanzado",icon:"🏆",next:`Descubre ${10-count} destinos para alcanzar Maestro Explorador.`};
 if(count>=3)return {name:"Explorador Local",icon:"🧭",next:`Descubre ${5-count} destinos para alcanzar Explorador Avanzado.`};
 if(count>=1)return {name:"Explorador",icon:"🥾",next:`Descubre ${3-count} destinos para alcanzar Explorador Local.`};
 return {name:"Explorador Novato",icon:"🌱",next:"Descubre tu primer destino para comenzar la aventura."};
}

onAuthStateChanged(auth,async u=>{
 if(!u){if(!location.pathname.endsWith("login.html")&&!location.pathname.endsWith("index.html"))location.href="login.html";return;}
 try{
  const userRef=doc(db,"usuarios",u.uid);
  const snap=await getDoc(userRef);
  const data=snap.exists()?snap.data():{};
  const logrosSnap=await getDocs(collection(db,"usuarios",u.uid,"logros"));
  const count=logrosSnap.size;
  // Calculamos el XP desde los logros para corregir perfiles creados con la V2.
  const xp=logrosSnap.docs.reduce((total,x)=>total+Number(x.data().xp||100),0);
  if((data.xpAcumulado||0)!==xp) await setDoc(userRef,{xpAcumulado:xp}, {merge:true});
  const rank=rankFor(count);
  // Cada 100 XP aumenta un nivel. El Nivel 1 comienza en 0 XP.
  const level=Math.floor(xp/100)+1;
  const current=xp%100;
  const currentDisplay=(xp>0 && current===0)?100:current;
  const name=u.displayName||data.nombre||"Explorador";
  document.querySelectorAll("#userName,#profileName").forEach(e=>e.textContent=name);
  const hello=document.getElementById("helloName");if(hello)hello.textContent=name.split(" ")[0];
  const photo=document.getElementById("userPhoto");if(photo)photo.src=u.photoURL||"https://placehold.co/80x80?text=🌎";
  const pphoto=document.getElementById("profilePhoto");if(pphoto)pphoto.src=u.photoURL||"https://placehold.co/160x160?text=🌎";
  const email=document.getElementById("profileEmail");if(email)email.textContent=u.email||"";
  const rankEls=document.querySelectorAll("#userRank,#profileRank");rankEls.forEach(e=>e.textContent=`${rank.icon} ${rank.name}`);
  const next=document.getElementById("nextGoal");if(next)next.textContent=rank.next;
  [["xpValue",xp],["destinoCount",count],["badgeCount",count],["pDestinos",count],["pBadges",count],["pXp",xp],["profileXp",xp],["levelValue",level]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});
  const progress=document.getElementById("levelProgress");if(progress)progress.style.width=`${Math.min(100,currentDisplay)}%`;
  const levelText=document.getElementById("levelXpText");if(levelText)levelText.textContent=`${currentDisplay} / 100 XP`;
 }catch(e){console.error("Error cargando perfil:",e);}
});
