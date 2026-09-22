# TurismoAcobamba V6.1

V6 agrega un catálogo turístico interactivo y pensado para celular.

## Corrección V6.1
- Corregido el tamaño gigante de la etiqueta de dificultad en las tarjetas (Fácil/Media).
- La etiqueta ya no es afectada por la animación del emoji.

## Novedades
- Buscador de destinos.
- Filtros por Naturaleza, Cultura, Aventura y Gastronomía.
- Contador de resultados.
- Favoritos guardados localmente en el dispositivo.
- Tarjetas con dificultad, categoría, XP y estado de completado.
- Detalle de destino con información ampliada y recompensa.
- Botón para guardar favorito desde el detalle.
- Mantiene Google Authentication + Firestore.
- Mantiene mapa, GPS, ruta, logros e XP de V5.

## Importante
Los datos y coordenadas de los destinos son todavía demostrativos. Para una versión real, sustituye las coordenadas y textos por información verificada de los atractivos turísticos de Acobamba.

Los favoritos se guardan en localStorage para no requerir cambios en las reglas de Firestore.


## V6.2
- Corregido el botón “Guardar favorito” del detalle: ya no hereda el tamaño gigante del emoji.
- Sistema de niveles actualizado: cada 100 XP aumenta 1 nivel.
- Ejemplo: 0 XP = Nivel 1, 100 XP = Nivel 2, 200 XP = Nivel 3, 400 XP = Nivel 5.
- La barra de progreso ahora representa el avance hacia el siguiente nivel (100 XP).
