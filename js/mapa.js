import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, setDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const destinos = {
  catarata:{id:"catarata",nombre:"Catarata de Acobamba",lat:-12.843,long:-74.568,xp:100,insignia:"Explorador del Agua"},
  mirador:{id:"mirador",nombre:"Mirador del Valle",lat:-12.840,long:-74.570,xp:100,insignia:"Explorador de Alturas"},
  plaza:{id:"plaza",nombre:"Plaza Histórica",lat:-12.840,long:-74.569,xp:100,insignia:"Conocedor de la Historia"},
  laguna:{id:"laguna",nombre:"Laguna Natural",lat:-12.780,long:-74.970,xp:100,insignia:"Aventurero Natural"},
  iglesia:{id:"iglesia",nombre:"Templo Cultural",lat:-12.842,long:-74.569,xp:100,insignia:"Descubridor Cultural"},
  sendero:{id:"sendero",nombre:"Sendero Verde",lat:-12.850,long:-74.560,xp:100,insignia:"Guardián de la Naturaleza"}
};

const id = new URLSearchParams(location.search).get("id") || "catarata";
const d = destinos[id] || destinos.catarata;

const $ = id => document.getElementById(id);
$("mapTitle").textContent = d.nombre;
$("challengeTitle").textContent = `Llega a ${d.nombre} para desbloquear tu recompensa`;

let map, userMarker, destinationMarker, routeLine, accuracyCircle;
let watchId = null, currentPosition = null, initialDistance = null, completed = false;
let currentUser = null;

function formatDistance(m){
  if (!Number.isFinite(m)) return "--";
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
}
function formatTime(seconds){
  if (!Number.isFinite(seconds)) return "--";
  const min = Math.max(1, Math.round(seconds/60));
  if(min < 60) return `${min} min`;
  return `${Math.floor(min/60)} h ${min%60} min`;
}
function distance(a,b,c,e){
  const R=6371000, r=x=>x*Math.PI/180;
  const A=Math.sin(r(c-a)/2)**2 + Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(e-b)/2)**2;
  return 2*R*Math.asin(Math.sqrt(A));
}

function initMap(){
  map = L.map("leafletMap", {zoomControl:false}).setView([d.lat,d.long], 15);
  L.control.zoom({position:"bottomright"}).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:"© OpenStreetMap contributors"
  }).addTo(map);

  destinationMarker = L.marker([d.lat,d.long], {
    icon:L.divIcon({className:"destination-pin", html:"🎯", iconSize:[42,42], iconAnchor:[21,38]})
  }).addTo(map).bindPopup(`<strong>${d.nombre}</strong><br>🎖️ ${d.insignia}`);

  L.circle([d.lat,d.long], {radius:100, className:"arrival-zone", fillOpacity:.12}).addTo(map);
}

async function drawRoute(lat, lon){
  if(!map) return;
  const url = `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${d.long},${d.lat}?overview=full&geometries=geojson`;
  try{
    const res = await fetch(url);
    const data = await res.json();
    if(data.code !== "Ok" || !data.routes?.length) throw new Error("route");
    const route = data.routes[0];
    if(routeLine) map.removeLayer(routeLine);
    routeLine = L.geoJSON(route.geometry,{style:{weight:6,opacity:.85}}).addTo(map);
    $("eta").textContent = formatTime(route.duration);
    $("distance").textContent = formatDistance(route.distance);
    const bounds = routeLine.getBounds();
    if(bounds.isValid()) map.fitBounds(bounds.pad(.18));
    if(initialDistance === null) initialDistance = route.distance;
  }catch(e){
    // Fallback: straight-line distance if routing service is unavailable.
    const m = distance(lat,lon,d.lat,d.long);
    $("distance").textContent = formatDistance(m);
    $("eta").textContent = "Calculando";
    if(initialDistance === null) initialDistance = m;
  }
}

function updatePosition(pos){
  const lat=pos.coords.latitude, lon=pos.coords.longitude, acc=pos.coords.accuracy || 0;
  currentPosition={lat,lon,acc};
  const m=distance(lat,lon,d.lat,d.long);

  if(!userMarker){
    userMarker=L.marker([lat,lon],{
      icon:L.divIcon({className:"user-pin",html:"📍",iconSize:[38,38],iconAnchor:[19,36]})
    }).addTo(map).bindPopup("<strong>Tu ubicación</strong>");
    accuracyCircle=L.circle([lat,lon],{radius:Math.min(acc,120),className:"accuracy-zone",fillOpacity:.08}).addTo(map);
    initialDistance=Math.max(m,1);
    drawRoute(lat,lon);
  }else{
    userMarker.setLatLng([lat,lon]);
    accuracyCircle.setLatLng([lat,lon]).setRadius(Math.min(acc,120));
  }

  $("gpsStatus").textContent="Activo";
  $("mapLiveBadge").textContent="● GPS activo";
  $("mapLiveBadge").classList.add("active");
  $("distance").textContent=formatDistance(m);
  $("destinationStatus").textContent=m<=100 ? "¡Llegaste!" : "En ruta";

  const progress=Math.min(99,Math.max(0,Math.round((1-(m/initialDistance))*100)));
  $("routeProgress").textContent=`${progress}%`;
  $("routeProgressBar").style.width=`${progress}%`;

  if(m<=100 && !completed) completeDestination();
}

async function completeDestination(){
  if(completed) return;
  completed=true;
  if(watchId!==null){ navigator.geolocation.clearWatch(watchId); watchId=null; }

  $("routeProgress").textContent="100%";
  $("routeProgressBar").style.width="100%";
  $("destinationStatus").textContent="Completado";
  $("routeMessage").textContent="🎉 ¡Llegaste! Guardando tu recompensa...";

  if(!currentUser){
    $("routeMessage").textContent="🎉 ¡Llegaste! Inicia sesión para guardar el logro.";
    showSuccess(false);
    return;
  }

  try{
    const logroRef=doc(db,"usuarios",currentUser.uid,"logros",d.id);
    const old=await getDoc(logroRef);
    if(!old.exists()){
      await setDoc(logroRef,{
        destinoId:d.id,destino:d.nombre,insignia:d.insignia,xp:d.xp,fecha:serverTimestamp()
      });
      await setDoc(doc(db,"usuarios",currentUser.uid),{
        xpAcumulado:increment(d.xp), actualizado:serverTimestamp()
      },{merge:true});
      showSuccess(true);
    }else{
      showSuccess(false);
    }
  }catch(e){
    console.error(e);
    completed=false;
    $("routeMessage").textContent="Llegaste al destino, pero no se pudo guardar el logro. Revisa Firestore.";
  }
}

function showSuccess(isNew){
  $("successCard").classList.remove("hidden");
  $("rewardText").textContent=isNew ? `⭐ +${d.xp} XP` : "🏆 Destino ya completado";
  $("successTitle").textContent=isNew ? "¡Destino descubierto!" : "¡Destino visitado!";
  $("successText").textContent=isNew
    ? `Desbloqueaste la insignia “${d.insignia}”. Tu aventura continúa.`
    : "Este destino ya estaba en tu colección, así que no recibes XP nuevamente.";
}

function startGPS(){
  if(!navigator.geolocation){
    $("gpsStatus").textContent="No disponible";
    $("routeMessage").textContent="Tu navegador no permite geolocalización.";
    return;
  }
  if(watchId!==null) return;
  $("gpsStatus").textContent="Buscando...";
  $("routeMessage").textContent="Permite la ubicación y empieza a desplazarte hacia el destino.";
  watchId=navigator.geolocation.watchPosition(updatePosition,(err)=>{
    $("gpsStatus").textContent="No disponible";
    const msg = err.code === 1
      ? "Permiso de ubicación denegado. En Chrome: candado de la barra → Ubicación → Permitir, y vuelve a cargar."
      : err.code === 2
      ? "No se pudo obtener tu ubicación. Comprueba el GPS y la señal."
      : "La ubicación tardó demasiado. Comprueba el GPS e inténtalo otra vez.";
    $("routeMessage").textContent=msg;
  },{enableHighAccuracy:true,maximumAge:3000,timeout:20000});
}

$("locationBtn").addEventListener("click",startGPS);
$("centerBtn").addEventListener("click",()=>{
  if(currentPosition) map.setView([currentPosition.lat,currentPosition.lon],17);
  else startGPS();
});
$("simulateBtn").addEventListener("click",completeDestination);

onAuthStateChanged(auth,u=>{
  currentUser=u;
});

initMap();
