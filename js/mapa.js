import { auth, db } from "./firebase.js";
import { doc, setDoc, getDoc, collection, getDocs, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const destinos={
 catarata:{id:"catarata",nombre:"Catarata de Acobamba",lat:-12.843,long:-74.568,xp:100,insignia:"Explorador del Agua"},
 mirador:{id:"mirador",nombre:"Mirador del Valle",lat:-12.840,long:-74.570,xp:100,insignia:"Explorador de Alturas"},
 plaza:{id:"plaza",nombre:"Plaza Histórica",lat:-12.840,long:-74.569,xp:100,insignia:"Conocedor de la Historia"},
 laguna:{id:"laguna",nombre:"Laguna Natural",lat:-12.780,long:-74.970,xp:100,insignia:"Aventurero Natural"},
 iglesia:{id:"iglesia",nombre:"Templo Cultural",lat:-12.842,long:-74.569,xp:100,insignia:"Descubridor Cultural"},
 sendero:{id:"sendero",nombre:"Sendero Verde",lat:-12.850,long:-74.560,xp:100,insignia:"Guardián de la Naturaleza"}
};
const id=new URLSearchParams(location.search).get("id")||"catarata";
const d=destinos[id]||destinos.catarata;
const title=document.getElementById("mapTitle"); if(title) title.textContent=d.nombre;
const distanceEl=document.getElementById("distance"),statusEl=document.getElementById("gpsStatus"),msgEl=document.getElementById("routeMessage"),locationBtn=document.getElementById("locationBtn"),simulateBtn=document.getElementById("simulateBtn"),successCard=document.getElementById("successCard");
function haversine(a,b,c,e){const R=6371000,r=x=>x*Math.PI/180,A=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(e-b)/2)**2;return 2*R*Math.asin(Math.sqrt(A));}

async function completeDestination(){
 const u=auth.currentUser;
 if(!u){if(msgEl)msgEl.textContent="Inicia sesión con Google antes de guardar el logro.";return;}
 try{
   const ref=doc(db,"usuarios",u.uid,"logros",d.id);
   const old=await getDoc(ref);
   if(!old.exists()){
     await setDoc(ref,{destinoId:d.id,destino:d.nombre,insignia:d.insignia,xp:d.xp,fecha:serverTimestamp()});
     // Incremento atómico: las visitas anteriores no se sobrescriben.
     await setDoc(doc(db,"usuarios",u.uid),{xpAcumulado:increment(d.xp)}, {merge:true});
   }
   if(successCard)successCard.classList.remove("hidden");
   if(msgEl)msgEl.textContent=old.exists()?"Este destino ya estaba completado. No se sumaron XP otra vez.":"¡Reto completado! Logro, insignia y XP guardados en Firestore.";
   if(locationBtn)locationBtn.disabled=true;
 }catch(e){console.error(e);if(msgEl)msgEl.textContent="Llegaste al destino, pero no se pudo guardar el logro. Revisa Firestore.";}
}
function startGPS(){
 if(!navigator.geolocation){if(statusEl)statusEl.textContent="No disponible";if(msgEl)msgEl.textContent="Tu navegador no permite geolocalización.";return;}
 if(statusEl)statusEl.textContent="Buscando...";
 navigator.geolocation.watchPosition(pos=>{
  const meters=haversine(pos.coords.latitude,pos.coords.longitude,d.lat,d.long);
  if(distanceEl)distanceEl.textContent=meters<1000?`${Math.round(meters)} m`:`${(meters/1000).toFixed(1)} km`;
  if(statusEl)statusEl.textContent="Activo";
  if(msgEl)msgEl.textContent=meters<=100?"🎉 ¡Estás dentro del área del destino!":meters<=300?"🔥 ¡Ya casi llegas!":"🧭 Sigue la ruta hasta el destino.";
  if(meters<=100)completeDestination();
 },()=>{if(statusEl)statusEl.textContent="Permiso pendiente";if(msgEl)msgEl.textContent="Activa el permiso de ubicación del navegador.";},{enableHighAccuracy:true,maximumAge:5000,timeout:10000});
}
locationBtn?.addEventListener("click",startGPS);
simulateBtn?.addEventListener("click",completeDestination);
