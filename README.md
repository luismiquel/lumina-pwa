# LUMINA LOCAL

**Aplicación web progresiva (PWA) 100% local, offline y sin IA.**  
Sin cuentas, sin servidores, sin APIs de pago, sin rastreo.

---

## ✨ Qué es Lumina Local

**Lumina Local** es una aplicación diseñada para organizar información personal
de forma **privada y sencilla**, funcionando **completamente en el dispositivo del usuario**.

No utiliza inteligencia artificial artificial, no envía datos a la nube y no depende
de servicios externos.

👉 Tus datos son **tuyos**, y solo tuyos.

---

## 🔐 Principios clave

- ✅ **Offline-first**: funciona sin conexión a Internet
- ✅ **Sin IA**: decisiones transparentes, sin “cajas negras”
- ✅ **Sin APIs de pago**: sin costes ocultos
- ✅ **Privacidad real**: datos almacenados localmente (IndexedDB)
- ✅ **Sin cuentas ni registros**
- ✅ **Modo accesible (senior) opcional**
- ✅ **Instalable como PWA**

---

## 🧩 Funcionalidades principales

- 📝 **Notas**
  - Plantillas (salud, citas, medicación)
  - Exportación CSV

- 📅 **Citas médicas**
  - Crear, editar y borrar
  - Exportar / importar calendario (ICS)

- 🛒 **Lista de la compra**
  - Marcar como completado
  - Exportar / importar CSV

- 🎙️ **Dictado**
  - Voz a texto (cuando el navegador lo permite)

- 📍 **GPS de emergencia**
  - Compartir ubicación manualmente

- 💾 **Copias de seguridad**
  - Backup local
  - Backup cifrado con contraseña
  - Restauración desde archivo

- 🛠️ **Reparación de la app**
  - Limpieza de datos en caso de errores

---

## ♿ Accesibilidad

Lumina Local **no es solo para personas mayores**,  
pero incluye un **modo senior opcional** con:

- Botones grandes
- Menos ruido visual
- Flujo simplificado

---

## ⚠️ Importante sobre los datos

Los datos se guardan **exclusivamente en este dispositivo**.

Si borras:
- datos del navegador
- caché
- o reinstalas la app

👉 **puedes perder la información**.

📌 Recomendación:  
**haz copias de seguridad periódicas** desde Ajustes.

---

## 🧱 Tecnología

- React
- TypeScript
- Vite
- IndexedDB (Dexie)
- PWA (instalable)

⚠️ No se utiliza:
- Backend
- Bases de datos remotas
- Servicios externos
- Inteligencia artificial

---

## 🚀 Desarrollo local

```bash
npm install
npm run dev
