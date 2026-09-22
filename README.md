# TurismoAcobamba V4

## Novedades
- Mapa interactivo con Leaflet + OpenStreetMap.
- Ubicación GPS en tiempo real.
- Ruta automática mediante OSRM cuando el servicio está disponible.
- Distancia y tiempo estimado.
- Marcadores de usuario y destino.
- Zona de llegada de 100 metros.
- Barra de progreso del reto.
- Recompensa animada al completar.
- XP acumulativo con Firestore usando `increment()`.
- Un destino no vuelve a entregar XP si ya fue completado.
- Mantiene Google Authentication y Firestore de V3.

## Publicación
Puedes subir los archivos a GitHub Pages como en V3.

## Importante
Las coordenadas de los destinos siguen siendo DEMOSTRATIVAS. Antes de presentar/publicar el proyecto como plataforma turística real, reemplázalas por coordenadas verificadas de los atractivos de Acobamba.

El cálculo de ruta usa el servicio público de OSRM para demostración y OpenStreetMap para el mapa. Si el servicio de ruta no responde, la aplicación muestra la distancia en línea recta como respaldo.

No se usa Firebase Storage.

## V4.1 - Corrección del mapa
Se corrigió la carga de Leaflet eliminando hashes SRI incorrectos que podían bloquear el CSS/JavaScript del mapa en GitHub Pages.
