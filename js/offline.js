import { auth, db } from "./firebase.js";
import { doc, getDoc, setDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const QUEUE_KEY = "turismoAcobamba_pendientes";

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
  catch { return []; }
}
function setQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

// Guarda un logro localmente cuando no se pudo escribir en Firestore por falta de señal.
export function queueLogro(entry) {
  const q = getQueue();
  if (!q.some(x => x.destinoId === entry.destinoId)) {
    q.push(entry);
    setQueue(q);
  }
}

export function hasPendingLogro(destinoId) {
  return getQueue().some(x => x.destinoId === destinoId);
}

export function pendingCount() {
  return getQueue().length;
}

// Intenta subir a Firestore todo lo que quedó pendiente por falta de conexión.
export async function flushPendingLogros() {
  if (!navigator.onLine || !auth.currentUser) return;
  const q = getQueue();
  if (!q.length) return;

  const remaining = [];
  for (const entry of q) {
    try {
      const logroRef = doc(db, "usuarios", auth.currentUser.uid, "logros", entry.destinoId);
      const old = await getDoc(logroRef);
      if (!old.exists()) {
        await setDoc(logroRef, {
          destinoId: entry.destinoId, destino: entry.destino,
          insignia: entry.insignia, xp: entry.xp, fecha: serverTimestamp()
        });
        await setDoc(doc(db, "usuarios", auth.currentUser.uid), {
          xpAcumulado: increment(entry.xp), actualizado: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      remaining.push(entry);
    }
  }
  setQueue(remaining);
  if (remaining.length < q.length) {
    document.dispatchEvent(new CustomEvent("turismo:synced", { detail: { restantes: remaining.length } }));
  }
}

// --- Aviso visual de "sin conexión" en cualquier página ---
function ensureBanner() {
  let b = document.getElementById("offlineBanner");
  if (!b) {
    b = document.createElement("div");
    b.id = "offlineBanner";
    b.className = "offline-banner";
    b.textContent = "📡 Sin conexión — viendo datos guardados en tu celular";
    document.body.prepend(b);
  }
  return b;
}

function updateStatus() {
  const b = ensureBanner();
  const offline = !navigator.onLine;
  b.classList.toggle("show", offline);
  if (!offline) flushPendingLogros();
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateStatus);
} else {
  updateStatus();
}
