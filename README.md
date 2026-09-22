# TurismoAcobamba V2 — Firebase conectado

## Ya conectado
- Firebase Authentication
- Google Login
- Firestore
- Perfil del usuario
- Catálogo
- Destinos
- Logros por usuario
- XP
- Insignias
- Validación GPS
- Modo de simulación de llegada

## Configuración de Firestore
Copia el contenido de `firestore.rules` en:
Firebase Console > Firestore Database > Rules
y pulsa Publish.

## Authentication
Firebase Console > Authentication > Sign-in method > Google > Enable.

Si pruebas en `localhost`, agrega el dominio en Authentication > Settings > Authorized domains si Firebase te lo solicita.

## Importante
No se utiliza Firebase Storage en esta versión.

Las coordenadas de los destinos son de demostración. Antes de publicar el proyecto debes reemplazarlas por las coordenadas reales de cada atractivo turístico.

## Ejecución
No abras los HTML con doble clic si el navegador bloquea módulos.
Usa VS Code + Live Server o cualquier servidor HTTP local.
