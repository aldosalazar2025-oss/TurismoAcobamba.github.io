import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, getDocs, collection, setDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

function rankFor(count){
  if(count>=7)return {name:"Maestro Explorador",icon:"🌎",next:"¡Has alcanzado el rango máximo de esta versión!"};
  if(count>=5)return {name:"Explorador Avanzado",icon:"🏆",next:`Descubre ${7-count} destinos para alcanzar Maestro Explorador.`};
  if(count>=3)return {name:"Explorador Local",icon:"🧭",next:`Descubre ${5-count} destinos para alcanzar Explorador Avanzado.`};
  if(count>=1)return {name:"Explorador",icon:"🥾",next:`Descubre ${3-count} destinos para alcanzar Explorador Local.`};
  return {name:"Explorador Novato",icon:"🌱",next:"Descubre tu primer destino para comenzar la aventura."};
}

onAuthStateChanged(auth,async u=>{
  if(!u){
    if(!location.pathname.endsWith("login.html")&&!location.pathname.endsWith("index.html"))location.href="login.html";
    return;
  }
  try{
    const userRef=doc(db,"usuarios",u.uid);
    const snap=await getDoc(userRef);
    const data=snap.exists()?snap.data():{};
    const logrosSnap=await getDocs(collection(db,"usuarios",u.uid,"logros"));
    const count=logrosSnap.size;

    const xp=logrosSnap.docs.reduce((total,x)=>total+Number(x.data().xp||100),0);
    if((data.xpAcumulado||0)!==xp)await setDoc(userRef,{xpAcumulado:xp},{merge:true});

    const rank=rankFor(count);
    const level=Math.floor(xp/100)+1;
    const current=xp%100;

    document.querySelectorAll("#userName,#profileName").forEach(e=>e.textContent=u.displayName||data.nombre||"Explorador");
    const hello=document.getElementById("helloName");
    if(hello)hello.textContent=(u.displayName||data.nombre||"Explorador").split(" ")[0];

    const photo=document.getElementById("userPhoto");
    if(photo)photo.src=u.photoURL||"https://placehold.co/80x80?text=🌎";
    const pphoto=document.getElementById("profilePhoto");
    if(pphoto)pphoto.src=u.photoURL||"https://placehold.co/160x160?text=🌎";

    const email=document.getElementById("profileEmail");
    if(email)email.textContent=u.email||"";

    document.querySelectorAll("#userRank,#profileRank").forEach(e=>e.textContent=`${rank.icon} ${rank.name}`);
    const next=document.getElementById("nextGoal");
    if(next)next.textContent=rank.next;

    [["xpValue",xp],["destinoCount",count],["badgeCount",count],["pDestinos",count],["pBadges",count],["pXp",xp],["profileXp",xp],["levelValue",level]]
      .forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});

    const progress=document.getElementById("levelProgress");
    if(progress)progress.style.width=`${current}%`;

    const levelText=document.getElementById("levelXpText");
    if(levelText)levelText.textContent=`${current} / 100 XP`;
  }catch(e){console.error("Error cargando perfil:",e);}
});
