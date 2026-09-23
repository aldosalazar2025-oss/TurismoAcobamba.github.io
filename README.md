# TurismoAcobamba V9

## Cambios en esta versión
- Se agregó el destino **Laguna de Choclococha** (categoría Naturaleza), en el Centro Poblado de Choclococha, distrito de Pomacocha, con 3 fotos propias optimizadas a WebP.
- El filtro "🌿 Naturaleza" del catálogo ya existía en la interfaz y ahora tiene su primer destino real.

## Cambios de la V8

# TurismoAcobamba V8

## Cambios en esta versión
- Se eliminó el destino **Complejo Arqueológico de Allpas** del catálogo (ya no aparece en `js/destinos-data.js`, ni en el catálogo, mapa o insignias). Si el proyecto ya tenía usuarios con logros guardados para ese destino en Firestore (colección `usuarios/{uid}/logros`) o un documento en `destinos/complejo-arqueologico-allpas`, esos registros quedan huérfanos y conviene borrarlos manualmente desde la consola de Firebase; no rompen la app pero ya no se muestran en ningún lado.
- Se agregaron fotos reales para los 6 destinos restantes (`img/<id>/1.webp`, `2.webp`, ...), optimizadas a máx. 1000px de ancho y calidad ~74 en WebP (de ~8.8 MB originales a ~1.9 MB en total, pensado para conexiones móviles).
- El catálogo (`app.html`) ahora muestra la foto de portada de cada destino en vez del emoji.
- El detalle (`destino.html`) muestra la foto principal y una galería de miniaturas debajo de la portada; al tocar una miniatura cambia la foto grande. El emoji queda como respaldo si algún destino no tiene fotos, y se sigue usando como ícono en insignias/mapa.

## Cambios de la V7

## Cambios principales
- Se reemplazaron los destinos demostrativos por 7 lugares turísticos reales de Acobamba.
- Se incorporaron las coordenadas proporcionadas para Allpas, Mirador Qapari y Alameda de la Identidad Acobambina.
- Se incorporaron coordenadas consultadas para Iglesia San Juan Bautista, Manantial Willka Puquio y Pinturas Rupestres de Quillamachay.
- Se eliminó el botón **Simular llegada (demo)**.
- Un destino solo se completa cuando el GPS detecta al usuario dentro de un radio de **80 metros** del punto del destino.
- La llegada guarda el logro y suma 100 XP en Firestore.
- El nivel avanza cada 100 XP: 0 XP = Nivel 1, 100 XP = Nivel 2, 200 XP = Nivel 3, etc.
- Se mantienen Google Authentication, Firestore, favoritos, perfil, logros, mapa Leaflet y rutas.
- Las fotos todavía usan emojis como marcador visual temporal. En la siguiente versión se pueden sustituir por las fotografías reales proporcionadas por el usuario.

## Destinos
1. Iglesia San Juan Bautista
2. Manantial Willka Puquio
3. Pinturas Rupestres de Quillamachay
4. Tumbas Pre-Incas de Allpas
5. Mirador Qapari
6. Alameda de la Identidad Acobambina
7. Laguna de Choclococha
