const SHELL_CACHE = "acobamba-shell-v3";
const RUNTIME_CACHE = "acobamba-runtime-v3";

const SHELL_ASSETS = [
  "index.html", "login.html", "app.html", "destino.html", "logros.html", "mapa.html", "perfil.html",
  "manifest.json",
  "css/style.css", "css/responsive.css", "css/dark.css",
  "js/firebase.js", "js/auth.js", "js/destinos.js", "js/destinos-data.js",
  "js/logros.js", "js/mapa.js", "js/usuario.js", "js/pwa.js", "js/offline.js", "js/haptics.js",
  "img/brand/logo.png", "img/brand/favicon-32.png", "img/brand/favicon-180.png", "img/brand/favicon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn("SW install cache error:", err))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== location.origin) return; // deja pasar mapas, firebase, fuentes, etc.

  // Navegacion entre paginas: intenta red primero, si falla usa la copia guardada
  // (y si tampoco hay copia, cae al login como pantalla minima offline).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match("login.html")))
    );
    return;
  }

  // Fotos de destinos: cache-first (una vez vistas, quedan disponibles sin senal)
  if (url.pathname.includes("/img/")) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // CSS/JS propios: stale-while-revalidate (responde rapido con lo guardado
  // y actualiza la copia en segundo plano si hay senal).
  e.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
