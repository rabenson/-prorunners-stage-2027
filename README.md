# PRORUNNERS BARCELONA · STAGE TRIATLÓ 2027 — v2

**21, 22 y 23 de mayo de 2027.** Web responsive e instalable, preparada para
GitHub Pages gratuito. No necesita servidor de aplicación, base de datos,
compilación, App Store, Google Play ni servicios externos de QR.

## Qué se ha conservado de la primera versión

Se ha revisado el ZIP original y mejorado su aplicación estática, sin sustituirla
por otro proyecto o framework. Conserva Inicio, Agenda, Habitaciones, Rutas y
Lugares; los tres bloques originales de agenda; las tres rutas ciclistas
pendientes; el alojamiento; el lugar y la dirección de natación; el running
pendiente; los dos enlaces de Maps; la navegación inferior y el manifiesto PWA.
No había horarios, habitaciones asignadas ni tracks reales que migrar.

La v2 añade el logotipo oficial, identidad negro/blanco/rosa coral, navegación
por enlaces con historial, agenda por días, tarjeta temporal de próxima
actividad, validación de contenidos, actualización de datos sin caché de la app,
ayuda de instalación y un QR generado localmente con descarga PNG.

**No está publicada todavía.** El ZIP está listo para subir a tu cuenta.

## 1. Publicarla gratis con tu cuenta personal de GitHub

1. Descomprime el ZIP. Abre la carpeta `PRORUNNERS_Triathlon_Stage_2027_v2`.
2. Inicia sesión en [github.com](https://github.com) con tu cuenta personal.
3. Pulsa **+ → New repository**. Nombre recomendado:
   `prorunners-stage-2027`. Marca **Public** y **Add a README file**, y pulsa
   **Create repository**. GitHub Pages de repositorios públicos está disponible
   en GitHub Free; no necesitas contratar hosting ni comprar dominio.
4. En el repositorio pulsa **Add file → Upload files**. Arrastra **el contenido**
   de la carpeta descomprimida, no la carpeta exterior ni el ZIP.
   Deben quedar `index.html`, `styles.css`, `app.mjs`, `core.mjs`,
   `manifest.webmanifest`, `sw.js`, los tres PNG y las carpetas `assets`, `data`
   y `tests` en la raíz. Sustituye el README inicial por el incluido.
   `.nojekyll` es opcional para estos nombres: si tu explorador no muestra
   archivos ocultos, puedes omitirlo.
5. Pulsa **Commit changes** para guardar los archivos en `main`.
6. Ve a **Settings → Pages → Build and deployment**.
   En **Source**, elige **Deploy from a branch**. En **Branch**, elige
   **main** y **/(root)**; pulsa **Save**.
7. Espera a que termine el despliegue (normalmente unos minutos). En **Actions**
   puedes ver el proceso `pages build and deployment`.
8. Vuelve a **Settings → Pages** y abre la URL que indique GitHub. Tendrá esta
   forma: `https://TU-USUARIO.github.io/prorunners-stage-2027/`.
   Esa es una plantilla de dirección, no una URL ya creada.
9. Prueba el enlace en un móvil. Comprueba Inicio, los tres días, Habitaciones,
   Rutas y los dos botones de Google Maps.

Los enlaces de archivos, el manifiesto y el service worker son relativos:
funcionan tanto en la raíz de un dominio como bajo `/prorunners-stage-2027/`.
Si decides otro nombre de repositorio, no hay que modificar el código.
La URL debe usar **HTTPS** para la instalación.

**Privacidad importante:** el repositorio, sus archivos, su historial y la web
serán públicos. Compartir solo con asistentes por enlace o QR **no es un control
de acceso**. No publiques nombres completos, teléfonos, documentos, datos de
salud ni listas personales. Para habitaciones usa alias o códigos que el grupo
conozca. Si necesitas una lista privada, comparte ese documento mediante un
servicio con permisos; no lo incluyas en GitHub Pages. Borrar datos del JSON no
los borra del historial de GitHub.

## 2. Compartir el enlace y generar un QR

1. Abre **la URL HTTPS definitiva** de GitHub Pages.
2. Pulsa **Compartir**, en la cabecera de la app.
3. Pulsa **Copiar enlace** y envíalo por WhatsApp, correo o el canal del grupo.
   En navegadores compatibles también aparece **Compartir…**.
4. Pulsa **Descargar QR**. Obtendrás `PRORUNNERS_STAGE_2027_QR.png`.
5. Inserta ese PNG en un cartel o mensaje. Mantén el fondo y margen blancos,
   no lo deformes, y comprueba con la cámara de otro móvil que abre la URL.

El QR se genera en el navegador; no envía la dirección a servicios externos,
no caduca ni requiere suscripciones. Se genera sin la pestaña o parámetros
actuales para que siempre abra Inicio. Mientras mantengas el mismo repositorio
y dirección, el QR seguirá funcionando después de cambiar los datos.

**No compartas el QR generado desde localhost o una vista previa local:**
solo sería accesible en ese equipo. La app avisa si se abre en una dirección
de prueba. Si cambias el nombre del repositorio o la URL, genera otro QR.

## 3. Instalarla en el móvil

- **iPhone/iPad:** abre la URL en Safari → Compartir → **Añadir a pantalla de
  inicio** → **Añadir**. Activa **Abrir como app** si tu versión lo muestra.
- **Android:** abre la URL en Chrome → menú **⋮** → **Instalar aplicación**
  o **Añadir a pantalla de inicio**. También puede aparecer el botón
  **Instalar app** en esta web.
- **Ordenador:** Chrome/Edge → icono de instalación o menú del navegador.

Los textos y la disponibilidad del aviso automático dependen del navegador.
Dentro de WhatsApp/Instagram, abre antes el enlace en Safari o Chrome.
Instalarla no la publica en tiendas. **Necesita internet**:
no hay precarga, caché propia ni funcionamiento offline. `sw.js` solo gestiona
su ciclo de instalación; no intercepta peticiones.

## 4. Cambiar horarios, habitaciones, rutas y lugares

Los contenidos operativos están en **un único archivo: `data/evento.json`**.
No hace falta tocar HTML o JavaScript para actualizar el programa.

1. En GitHub abre `data/evento.json` y pulsa el icono de lápiz (**Edit**).
2. Cambia los campos que correspondan. Respeta comillas dobles, comas y
   corchetes; JSON no admite comentarios ni una coma detrás del último campo.
3. Actualiza `updatedAt` a la fecha de revisión (`YYYY-MM-DD`) y, si quieres,
   `version` a `"2.1"`, `"2.2"`, etc.
4. Pulsa **Commit changes** y espera a que termine el nuevo despliegue en
   **Actions**.
5. Abre la web y comprueba el contenido. La app vuelve a pedir el JSON al
   recuperar el foco, al volver a tener conexión y cada 60 segundos mientras
   está visible. GitHub/CDN puede tardar unos minutos en propagar cambios.
   Para cambios de código o diseño, recarga/cierra y vuelve a abrir la app.

Si el JSON no es válido, la app muestra un error y **no sustituye** los datos
por valores inventados. Si ya había información cargada, la conserva con un
aviso explícito de que podría estar desactualizada. Usa **Reintentar** después
de corregir el archivo.

### Horarios y próxima actividad

Por decisión del organizador, esta entrega **no contiene horas de ejemplo**.
Todos los bloques originales tienen `"start": null` y aparecen como
**Hora pendiente**. Inicio muestra el primer bloque pendiente del día o de
un día posterior, pero explica que no se puede calcular una próxima actividad
horaria hasta publicar horas.

Para programar un bloque, sustituye `null` por una fecha completa:
`"2027-05-21THH:MM:00+02:00"`, reemplazando `HH:MM` por la hora **real**.
Este texto es el formato, no un valor para pegar sin completar.
La fecha debe coincidir con el día del bloque. Para el 21–23 de mayo de 2027,
Barcelona usa horario de verano UTC+02:00; se valida ese desfase.

- Campos de actividad: `id`, `title`, `start`, `description`, `discipline`,
  `locationId`, `provisional` y `cancelled`.
- Mantén un `id` único con letras minúsculas, números y guiones.
- Puedes duplicar un objeto de actividad dentro de `activities` para separar
  entrenamientos y comidas; cambia el `id` y completa sus campos.
- Disciplinas admitidas: `Natación`, `Ciclismo`, `Running`, `Triatlón`,
  `Comida`, `Descanso`, `Organización`; `null` si está por confirmar.
- `locationId`: `casa`, `natacion`, `running`, el ID de otro lugar que añadas,
  o `null` si está por confirmar. No se asignan automáticamente ubicaciones.
- `"provisional": true` mantiene el marcador provisional. Cámbialo a `false`
  solo después de confirmar los datos de ese bloque.
- `"cancelled": true` deja visible el bloque como cancelado pero lo excluye
  de Próxima actividad. Puedes borrarlo de la lista si prefieres retirarlo.

La tarjeta selecciona la siguiente actividad no cancelada con inicio igual
o posterior a la hora actual; las horas pasadas no se consideran pendientes.
Al comenzar una actividad, pasa a la siguiente publicada. No representa
sesiones «en curso» ni usa duraciones. Se recalcula en el límite horario y
al volver a la app; usa la hora del dispositivo y la zona **Europe/Madrid**,
incluso si el asistente está en otro país. El reloj del móvil debe estar correcto.

Los bloques sin hora no se convierten en medianoche ni se mezclan con una
cronología inventada. Se muestran después de los bloques horarios de cada
día. Si hay una próxima actividad horaria y otros bloques sin hora, se avisa.
Si no quedan horarios futuros, se muestra un bloque pendiente válido de hoy
o de un día posterior; si no existe, aparece un estado sin próximas actividades.
Desde el 24 de mayo de 2027 a las 00:00 de Barcelona aparece **Stage finalizado**.

### Habitaciones

`"rooms": []` significa que no hay asignaciones publicadas. Añade objetos
con esta estructura cuando tengas los datos; **este ejemplo usa códigos y es
solo de formato, no una asignación del stage**:

```json
{
  "id": "habitacion-a",
  "name": "Habitación A",
  "capacity": 2,
  "occupants": ["Participante-01", "Participante-02"],
  "notes": "Ejemplo de formato. Sustituir por información autorizada.",
  "provisional": true
}
```

`capacity` puede ser `null` mientras no esté confirmado. `occupants` es una
lista de alias/códigos, y puede ser `[]`. La validación no permite más ocupantes
que plazas confirmadas. `notes` puede ser `null`. El número de plazas no
describe automáticamente tipos de camas: escribe esos detalles en `notes`.

### Rutas

Se mantienen Ruta 1, Ruta 2 y Ruta 3 de la v1 sin inventar recorridos.

- `name`, `description`, `discipline`: título, instrucciones y deporte.
- `distanceKm` y `elevationM`: número sin unidades o `null` si es desconocido.
  Cero es un dato válido, no un marcador de falta de información.
- `trackUrl`: URL HTTPS de un track o una ruta local como
  `"tracks/ruta-1.gpx"`. Para la segunda opción, sube el GPX real a una
  carpeta `tracks` del repositorio. No se incluye ningún GPX ficticio.
- `mapUrl`: URL HTTPS del recorrido o `null`.
- `provisional`: `true` hasta confirmar.

El botón GPX permite descargar/abrir el archivo. No hay visor cartográfico
integrado; algunos servicios externos abrirán su propia página y pueden
requerir sesión. Comprueba cada nuevo enlace antes de compartir.

### Lugares y avisos

- Los dos `mapUrl` originales de casa y natación se conservan literalmente.
- La dirección de natación procede de la v1 y el enlace facilitado dirige a
  Club Natació Banyoles. No se ha inventado una dirección para la casa.
- Para running, completa `address` y `mapUrl`, revisa `description` y marca
  `provisional` como `false` al confirmarlo.
- Puedes añadir más objetos a `locations` con `id`, `name`, `description`,
  `address` (texto o `null`), `mapUrl` (HTTPS o `null`), `icon` y `provisional`.
  Iconos: `bed`, `swim`, `run`, `pin`, `bike`.
- `notice`: aviso breve de Inicio. Actualízalo cuando cambien los pendientes
  o usa `null` para retirarlo. No dejes el aviso inicial cuando ya esté confirmado.

## 5. Información pendiente antes del evento

| Información | Qué completar |
|---|---|
| Agenda | Horas reales, sesiones, comidas, descripciones, disciplinas y puntos de encuentro de cada día |
| Alojamiento | Identificación de habitaciones, plazas/tipos de camas y asignaciones mediante alias autorizados |
| Rutas 1–3 | Recorridos, distancias, desniveles, tracks reales e instrucciones |
| Running | Punto de salida y enlace de Maps |
| Casa | Dirección o indicaciones, si se quieren mostrar además del mapa facilitado |
| Natación | Indicaciones de acceso y punto de encuentro de cada sesión |

## 6. Vista previa y comprobaciones técnicas

No abras `index.html` con doble clic: la carga del JSON y los módulos necesita
un servidor HTTP. Si tienes Python 3, abre una terminal en la carpeta y ejecuta:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visita `http://127.0.0.1:8000/`. Detén la vista previa con `Ctrl+C`.
No necesitas instalar dependencias. Alternativamente, una vez publicados
los archivos, usa directamente la URL de GitHub Pages.

Si tienes Node.js moderno (20 o posterior):

```sh
node --test tests/*.test.mjs
```

Las pruebas comprueban la validación, los datos pendientes, el orden temporal,
la zona de Barcelona, cambios de día, cancelaciones, fin del stage, enlaces
y rutas relativas de publicación. Las fechas horarias que contienen son
fixtures aisladas; no se cargan en la app.

## Recursos oficiales y licencias

Web del club: <https://www.prorunners.es>.

- Logotipo oficial, descargado de su cabecera sin cambiar colores ni geometría:
  <https://www.prorunners.es/wp-content/uploads/2021/09/LogoProrunnersweb.svg>.
- Símbolo oficial utilizado también para los iconos PWA:
  <https://www.prorunners.es/wp-content/uploads/2021/10/LOGO_simbolo-square-1.png>.
- Paleta basada en el SVG: `#ff2e55`, blanco y fondo negro. El símbolo de
  la web tiene su propio tono rosa; no se recolorea.
- Marca y logotipos pertenecen a PRORUNNERS. Este paquete es para el stage
  solicitado; no concede derechos sobre la marca. Valida su uso con el club.
- Generación QR local: **qrcode-generator 1.4.4**, Kazuhiko Arase, licencia
  MIT conservada en `assets/qrcode-LICENSE.txt`. No depende de un CDN en ejecución.

La app no incluye analítica, cuentas, pagos ni peticiones a terceros al cargar.
Los mapas y la web del club se abren únicamente al pulsar sus enlaces.
