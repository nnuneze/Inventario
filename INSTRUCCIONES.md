# Inventario Hazmat — Guía de instalación

App estática (GitHub Pages) + base de datos en **Google Sheets** + fotos en **Google Drive** + informes **Word/impresión**.

Tienes estos archivos (súbelos **todos** a GitHub salvo `Codigo.gs`, `gen_icons.py` y esta guía):
- `index.html` → la aplicación.
- `manifest.json`, `sw.js`, `favicon.ico`, `favicon.svg` y la carpeta `icons/` → hacen que sea instalable como app y funcione offline.
- `Codigo.gs` → el backend que se pega en Google Apps Script (no se sube a GitHub).
- `gen_icons.py` → script opcional por si quieres regenerar los iconos con otro diseño.

El orden correcto es: **primero Google (pasos 1–4), luego GitHub (pasos 5–6)**, porque necesitas la URL del servidor antes de usar la app.

---

## 1. Crear la base de datos (Google Sheets)

1. Entra en https://sheets.google.com y crea una **hoja de cálculo nueva**. Ponle nombre, p. ej. `Inventario Hazmat`.
2. No hace falta crear columnas: se generan solas la primera vez.

## 2. Pegar el backend (Apps Script) y poner tus claves

1. En esa misma hoja: menú **Extensiones ▸ Apps Script**.
2. Borra el código que aparece y **pega todo el contenido de `Codigo.gs`**.
3. **Cambia las claves de acceso** en las primeras líneas del archivo:
   ```js
   const CLAVE_ADMIN    = 'tu-clave-admin';     // administrador: crea/edita vehículos y materiales
   const CLAVE_EDICION  = 'tu-clave-edicion';   // edita materiales del vehículo elegido (no gestiona vehículos)
   const CLAVE_CONSULTA = 'tu-clave-consulta';  // solo ver e imprimir informes
   ```
   - La clave de **administrador** es la que crea los **vehículos/camiones** de la flota y puede tocar el material de cualquiera.
   - La de **edición** sirve para que una dotación actualice el material de su camión (no puede crear ni borrar vehículos).
   - La de **consulta** es de solo lectura para el resto.
   - Si quieres menos niveles, deja en `''` las claves que no uses (por ejemplo, solo admin + consulta).
4. Pulsa **Guardar** (icono del disquete).

## 3. Implementar como aplicación web

1. Arriba a la derecha: **Implementar ▸ Nueva implementación**.
2. En el engranaje ⚙️ (tipo) elige **Aplicación web**.
3. Configura:
   - **Descripción:** `API Inventario`
   - **Ejecutar como:** *Yo (tu cuenta)*
   - **Quién tiene acceso:** **Cualquier usuario**  ← imprescindible
4. **Implementar**. La primera vez Google pedirá **autorizar permisos** (hoja de cálculo + Drive para las fotos). Acepta. Si aparece "Google no ha verificado la app", entra en *Configuración avanzada ▸ Ir a (tu proyecto)*.
5. Copia la **URL de la aplicación web** (termina en **`/exec`**). Esa URL es tu servidor.

> Cada vez que cambies `Codigo.gs`, usa **Implementar ▸ Gestionar implementaciones ▸ editar (lápiz) ▸ Versión: Nueva ▸ Implementar** para que el cambio surta efecto.

## 4. Conectar la app con el servidor

Tienes dos formas (elige una):

- **A) Desde la propia app (recomendado):** abre `index.html`, pulsa **⚙️ Servidor**, pega la URL `/exec` y guarda.
- **B) Fijándolo en el archivo:** abre `index.html` con un editor de texto y, cerca del inicio, pon la URL entre las comillas:
  ```js
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
  ```

---

## 5. Subir la app a GitHub

1. Crea una cuenta en https://github.com si no la tienes.
2. **New repository** → nombre, p. ej. `inventario-hazmat` → **Public** → **Create**.
3. Botón **Add file ▸ Upload files** y arrastra **todos los archivos de la carpeta** (`index.html`, `manifest.json`, `sw.js`, `favicon.ico`, `favicon.svg` y la carpeta `icons/`). No hace falta subir `Codigo.gs`, `gen_icons.py` ni esta guía. **Commit changes**.

## 6. Activar GitHub Pages

1. En el repositorio: **Settings ▸ Pages**.
2. En **Branch** elige `main` y carpeta `/ (root)` → **Save**.
3. Espera ~1 minuto. Aparecerá la dirección pública, del estilo:
   `https://TU-USUARIO.github.io/inventario-hazmat/`
4. Ábrela desde el móvil, la tablet o el PC.

## 6.b Instalar como app (PWA)

La app ya incluye iconos y un *service worker*, así que se puede **instalar** en el dispositivo:

- **Android / Chrome:** menú ⋮ ▸ *Instalar aplicación* (o el aviso "Añadir a pantalla de inicio").
- **iPhone / iPad (Safari):** botón *Compartir* ▸ *Añadir a pantalla de inicio*.
- **PC (Chrome/Edge):** icono de instalación ⊕ en la barra de direcciones.

Se abrirá a pantalla completa, con su icono, y podrás **consultar el inventario sin conexión** (los datos se guardan en caché; para *guardar cambios* sí hace falta red).

> Importante: los iconos y el modo offline **solo funcionan servidos por HTTPS** (GitHub Pages ya lo es). Si abres el `index.html` con doble clic desde el disco (`file://`), la app funciona pero sin instalación ni offline.

> Al subir a GitHub, **sube toda la carpeta** (index.html, sw.js, manifest.json, favicon.ico, favicon.svg y la carpeta `icons/`). Cada vez que edites `index.html`, sube también el número de versión de `sw.js` (`const CACHE = 'hazmat-v4'`, `v5`…) para que los dispositivos actualicen.

> Los **códigos QR** apuntan a la dirección desde la que abres la app, así que genera e imprime los QR **desde la URL definitiva de GitHub Pages** (no desde un archivo abierto en local), para que al escanearlos lleven a la app publicada.

---

## Uso diario

- **Acceso:** al abrir la app pide la **clave**. Según el rol verás más o menos opciones (administrador ▸ edición ▸ consulta). Marca *Recordar en este dispositivo* y usa **🔓 Salir** para cerrar sesión.
- **Flota de vehículos (nuevo):**
  - El **administrador** pulsa **🚚 Gestionar** (barra superior) para **crear los camiones** de la flota (nombre, y opcionalmente matrícula y parque). Puede editarlos o borrarlos.
  - **Todos los usuarios** eligen el camión en el desplegable **🚚 Vehículo**. La lista, la búsqueda y los informes pasan a referirse a **ese** vehículo.
  - Al añadir material, el formulario tiene un campo **Vehículo**: el artículo se guarda dentro del camión elegido. Para mover un material de un camión a otro, edítalo y cambia su vehículo.
  - En el desplegable existe la opción **«Todos los vehículos (flota)»**: muestra el material de toda la flota agrupado por camión (trazabilidad completa) y permite sacar un informe global con una columna de *Vehículo*.
- **Códigos QR:** con un vehículo concreto seleccionado, pulsa **🔳 QR** (barra superior). Genera:
  - Un **QR del camión** que, al escanearlo, abre la app directamente en ese vehículo.
  - Opcionalmente, un **QR por sección** (S1–S10 / TRAS) que abre la app en el vehículo ya filtrado por esa sección.
  - Botón **🖨️ Imprimir hoja** para sacar todos los QR con sus etiquetas, listos para plastificar y pegar en el camión o en cada sección del contenedor.
  - Quien escanee tendrá que introducir su clave la primera vez (o quedará recordada); a partir de ahí el QR le lleva al material correcto en segundos.
- **Añadir/editar material:** en **S1 y S2** el **Lado** se deshabilita solo (esas secciones no tienen lados derecho/izquierdo). La ubicación usa **Lado: Derecha/Izquierda** y **Fondo: Delantera/Media/Trasera**.
- **Fotos en los informes:** al asignar una foto se guarda también una miniatura junto al registro, de modo que **aparece en los informes** (Word e impresión), incluso sin conexión. La foto grande sigue en Drive para verla a pantalla completa.
- **Disponibilidad:** la casilla *Material disponible* marca el ítem como operativo o *fuera de servicio*. En la lista cada tarjeta tiene un botón rápido **⛔ Fuera de servicio / ↩️ Reponer**.
- **Fotos:** botones **📁 Carpeta**, **🖼️ Fotos** o **📷 Cámara**; toca la miniatura correcta. Se guarda en tu Drive (carpeta `Hazmat_Fotos`).
- **Informes:** se generan sobre el **vehículo seleccionado** (o sobre toda la flota si eliges «Todos los vehículos»). Rellena opcionalmente *Unidad/Parque*, elige el alcance (todos / disponibles / fuera de servicio) y pulsa el informe:
  - **📍 Inventario por ubicación** (identifica material + ubicación, agrupado por sección).
  - **🏷️ Por categoría de intervención** (TRASVASE, TAPONAMIENTO, …).
  - Cada uno en **Word (.doc)** para guardar o en **🖨️ Imprimir** directo.

---

## Migrar datos que ya tenías

**Caso 1 — tus datos ya están en la hoja de Google** (venías usando la versión con servidor). Es lo más habitual:
1. Sustituye el `Codigo.gs` por el nuevo y **reimplementa una versión nueva** (Implementar ▸ Gestionar implementaciones ▸ editar ▸ Versión: Nueva). La hoja añade solas las columnas `vehiculoId` y `fotoThumb`; **no se borra nada**.
2. Entra en la app como **administrador**, pulsa **🚚 Gestionar** y crea tu(s) vehículo(s).
3. En ese mismo panel, abajo, usa **🔀 Migrar material sin vehículo**: elige el camión y pulsa *Asignar*. Todo el material antiguo pasa a ese vehículo de golpe. (Si luego hay piezas que van en otro camión, edítalas y cámbiales el vehículo.)
4. Las **fotos antiguas** seguirán viéndose en la app, pero para que salgan en los *informes* hay que reabrir cada artículo y volver a guardarle la foto una vez (así se crea la miniatura). Solo es necesario si quieres las fotos impresas.

**Caso 2 — tus datos están en el navegador** (usaste la primera versión local, sin servidor):
1. Abre aquella versión antigua y pulsa **Exportar Backup**: descarga un archivo `.json`.
2. En la app nueva, entra como administrador, crea el vehículo y **selecciónalo** en el desplegable 🚚.
3. Pulsa **📤 Importar** y elige ese `.json`. El material se sube al servidor y se asigna al vehículo seleccionado.
4. Revisa ubicaciones y, si hace falta, vuelve a guardar las fotos para que aparezcan en informes.

> Consejo: antes de migrar, pulsa **📥 Backup** para tener una copia de seguridad por si algo no sale como esperas.

---


- **Datos compartidos:** todos los dispositivos que abran la misma URL ven el mismo inventario en tiempo real (es la misma hoja). Pulsa **🔄 Recargar** para traer los últimos cambios.
- **Sin conexión:** la app muestra el último inventario cacheado, pero para guardar necesita conexión.
- **Error / no carga nada:** casi siempre es que la implementación no está como *"Cualquier usuario"*. Revisa el paso 3.3 y vuelve a implementar una **versión nueva**.
- **Las fotos no se ven:** si tu Google es de empresa/Workspace con restricciones de uso compartido, puede bloquear el "cualquiera con el enlace". Pídelo al administrador o usa una cuenta personal de Gmail para la hoja.
- **¿Ya tenías inventario de una versión anterior?** Al actualizar el `Codigo.gs` y reimplementar, la hoja añade solas las columnas nuevas (`vehiculoId`, `fotoThumb`). Los materiales antiguos aparecerán como **(sin asignar)** dentro de «Todos los vehículos»; edítalos para asignarles su camión. Las fotos antiguas solo saldrán en los informes cuando vuelvas a guardarles la foto (para generar la miniatura).
- **Backup:** el botón **📥 Backup** descarga un JSON con el material a la vista; sirve de copia de seguridad y se puede volver a importar.
- **Cambiar las claves:** edita `CLAVE_EDICION` / `CLAVE_CONSULTA` en `Codigo.gs` y vuelve a implementar una **versión nueva**. Quien tuviera la clave anterior dejará de entrar.
- **Privacidad / seguridad:** sin la clave correcta no se puede leer ni escribir, aunque se conozca la URL. Las claves viajan cifradas por HTTPS. Ten en cuenta que es un control de acceso sencillo (pensado para una dotación), no autenticación bancaria: cualquiera con la clave y la URL puede entrar, así que repártelas con cuidado y cámbialas si una persona deja de tener acceso.
