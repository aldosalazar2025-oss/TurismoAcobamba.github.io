import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

onAuthStateChanged(auth,async u=>{
 if(!u){
   if(!location.pathname.endsWith("login.html")&&!location.pathname.endsWith("index.html")) location.href="login.html";
   return;
 }
 const snap=await getDoc(doc(db,"usuarios",u.uid));
 const data=snap.exists()?snap.data():{};
 const xp=Number(data.xpAcumulado||0);
 let count=0;try{count=(await getDocs(collection(db,"usuarios",u.uid,"logros"))).size}catch{}
 const name=u.displayName||data.nombre||"Explorador";
 document.querySelectorAll("#userName,#profileName").forEach(e=>e.textContent=name);
 const hello=document.getElementById("helloName");if(hello)hello.textContent=name.split(" ")[0].toUpperCase();
 const photo=document.getElementById("userPhoto");if(photo)photo.src=u.photoURL||"https://placehold.co/80x80?text=🌎";
 const pphoto=document.getElementById("profilePhoto");if(pphoto)pphoto.src=u.photoURL||"https://placehold.co/160x160?text=🌎";
 const email=document.getElementById("profileEmail");if(email)email.textContent=u.email||"";
 [["xpValue",xp],["destinoCount",count],["badgeCount",count],["pDestinos",count],["pBadges",count],["pXp",xp],["profileXp",xp],["levelValue",Math.floor(xp/500)+1]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});
 const progress=document.getElementById("levelProgress");if(progress)progress.style.width=`${Math.min(100,(xp%500)/500*100)}%`;
});
