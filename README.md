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

La integración de Pages CMS está preparada para el repositorio existente
`rabenson/-prorunners-stage-2027`. No requiere reconstruir la v2 ni cambiar
la estructura de sus datos. La autorización del CMS y la publicación se
realizan desde tu cuenta; no se han probado con tu sesión personal.

## 1. Subir la actualización y publicar gratis con GitHub Pages

1. Inicia sesión en [github.com](https://github.com) y abre el repositorio
   **existente** [rabenson/-prorunners-stage-2027](https://github.com/rabenson/-prorunners-stage-2027).
   Selecciona la rama **main**. No crees otro repositorio.
2. Descomprime el ZIP de actualización. Contiene **solo los archivos cambiados**,
   con sus rutas relativas. No borres el contenido del repositorio ni sustituyas
   `data/evento.json` por una copia antigua: esta actualización no cambia ese archivo.
   Comprueba antes que nadie haya modificado los archivos que vas a reemplazar.
3. En la raíz del repositorio pulsa **Add file → Upload files** y arrastra
   el contenido descomprimido, no el ZIP ni una carpeta exterior. Conserva
   `tests/` como carpeta. Sube juntos `app.mjs` y `core.mjs`: el loader de la
   app necesita la nueva normalización para los guardados del CMS.
4. **No omitas `.pages.yml`.** Debe estar exactamente en la raíz, junto a
   `index.html`, no en `data/`, `tests/` ni dentro de una carpeta del ZIP.
   En macOS, Finder lo oculta: pulsa **Cmd+Shift+.** para mostrarlo y
   seleccionarlo. Si no puedes subirlo, en la raíz de GitHub pulsa
   **Add file → Create new file**, escribe exactamente **`.pages.yml`** como
   nombre y pega el contenido del archivo entregado. No uses `.pages.yml.txt`,
   `pages.yml` ni un editor con formato enriquecido. Este archivo **no es
   opcional**: sin él Pages CMS muestra «Configuration not found».
5. Revisa las rutas y pulsa **Commit changes** en **main**. Si has creado
   `.pages.yml` por separado, guarda también ese cambio. No elimines archivos
   preexistentes que no estén en el ZIP.
6. Si Pages aún no está configurado, ve a **Settings → Pages → Build and deployment**.
   En **Source**, elige **Deploy from a branch**. En **Branch**, elige
   **main** y **/(root)**; pulsa **Save**.
7. Espera a que termine el despliegue (normalmente unos minutos). En **Actions**
   puedes ver el proceso `pages build and deployment`.
8. Vuelve a **Settings → Pages** y abre la URL que indique GitHub. Tendrá esta
   forma: `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.
   Esa es una plantilla; usa la URL real que indique GitHub, no una supuesta.
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

### Con Pages CMS: formularios en español

1. Después de subir `.pages.yml`, abre
   [Pages CMS alojado](https://app.pagescms.org). Inicia sesión y autoriza
   su GitHub App para el repositorio si te lo solicita. No necesitas instalar
   un CMS en tu servidor ni poner tokens o contraseñas en esta web.
2. Selecciona **rabenson / -prorunners-stage-2027 / main** y recarga el CMS.
   La configuración se lee por repositorio **y por rama**. Si sigue apareciendo
   «Configuration not found», comprueba en GitHub que **main** contiene
   `.pages.yml` en la raíz con ese nombre exacto; revisa también los permisos
   de la GitHub App y vuelve a abrir el repositorio en el CMS.
3. Abre **Programa, habitaciones, rutas y lugares**. Verás campos y listas
   desplegables, no un editor JSON bruto. Expande las jornadas para añadir o
   editar actividades, comidas u otros planes. Las tres fechas, la zona
   horaria y el fin del evento se conservan protegidos.
4. Gestiona **Habitaciones**, **Rutas** y **Lugares y puntos de encuentro**
   dentro del mismo formulario. Usa IDs únicos en minúsculas, números y guiones;
   los IDs de actividad deben ser únicos entre las tres jornadas.
   Para enlazar un lugar nuevo, créalo y escribe su ID en la actividad.
   No se usa un desplegable fijo de ubicaciones que dejaría fuera los lugares nuevos.
5. Una actividad nueva tiene la hora **vacía**, es provisional y no está
   cancelada. Introduce fecha y hora solo cuando sean reales, en **hora de
   Barcelona**, y con la misma fecha que la jornada. Aunque edites desde otro
   país, el formulario guarda el desfase literal `+02:00` válido para estas
   fechas de mayo; no calcula el desfase a partir de tu equipo. Esta
   configuración está acotada al stage de mayo de 2027, no a eventos de invierno.
6. Los campos opcionales se dejan **vacíos**, sin escribir `null`, «pendiente»
   ni `0` como sustituto. La disciplina de actividad puede quedar sin selección;
   para retirar una selección, elige **Pendiente de confirmar**. En las rutas
   sí debes seleccionar un deporte. Las plazas son enteros positivos;
   distancia y desnivel admiten decimales (usa el separador que acepte tu navegador)
   y cero real. Desactiva **Información provisional** solo al confirmar;
   **Actividad cancelada** es un interruptor independiente.
7. Actualiza **Fecha de revisión**, revisa el formulario completo y pulsa
   **Save / Guardar**. El CMS guarda un commit en la rama seleccionada; no
   actualiza directamente la web. Espera al despliegue de GitHub Pages en
   **Actions** y comprueba la web pública. Para una hora todavía futura,
   Inicio mostrará la siguiente actividad no cancelada con horario publicado.

Pages CMS puede omitir del JSON los escalares vacíos (`null` o `""`) y las
listas vacías. El loader los normaliza **en memoria**, antes de la validación:
los opcionales omitidos pasan a `null`, y las listas omitidas a `[]`. No
reescribe el archivo ni genera horarios, participantes, rutas o ubicaciones.
Los booleanos `false` y los números `0` conservan su significado. Los campos
obligatorios, booleanos ambiguos, URLs inseguras, IDs repetidos, referencias
a lugares inexistentes, exceso de ocupantes y horarios inválidos siguen
produciendo errores explícitos.

El CMS aplica reglas por campo, pero **no ejecuta `core.mjs`**: las reglas
entre campos (fecha de actividad dentro de su jornada, IDs únicos, lugar
existente, plazas suficientes) se comprueban en la app y en las pruebas,
no todas antes de guardar en el CMS. Revisa esos vínculos antes de guardar;
un commit con datos inválidos puede publicarse y provocar el aviso de error.
Si ocurre, corrige el formulario y guarda otra vez; no rellenes con datos inventados.
Para un GPX local, súbelo primero a `tracks/` en GitHub y luego escribe su ruta
en el formulario; no se configura un almacén de subidas adicional.

**Cuatro o cinco editores:** cada persona debe tener acceso de edición al
repositorio o una invitación de colaborador en Pages CMS, según cómo el
propietario gestione los permisos. Solo los editores usan el CMS; los asistentes
siguen viendo la PWA sin cuenta. Autenticar a los editores **no hace privados**
los contenidos públicos. Usa únicamente alias/códigos autorizados en habitaciones.
Esto no es un sistema de reservas ni garantiza plazas de forma transaccional.

Todos editan el **mismo archivo**. Coordina turnos, también si se trabaja en
secciones distintas; recarga antes de editar y evita dejar formularios abiertos
mientras otro guarda. Si hay un conflicto, no fuerces el guardado: recarga la
versión nueva y reaplica solo tus cambios. `settings.content.merge: true`
conserva claves no gestionadas cuando el CMS puede combinarlas, pero **no es
un bloqueo ni una fusión colaborativa**: las listas se reemplazan completas.
Conserva una copia o consulta el historial de GitHub antes de cambios grandes.
No se han separado registros ni migrado los datos a otro almacenamiento.

**Comprobación manual pendiente en tu cuenta:** cargar los formularios,
guardar una revisión real, confirmar en GitHub los cambios previstos y
comprobar la publicación en Pages. El inicio de sesión, los permisos, el
guardado autenticado y el despliegue remoto no se han verificado desde aquí.
No añadas horarios o habitaciones de prueba al JSON público para comprobarlos;
los casos simulados están aislados en las pruebas locales.

### Alternativa: editar el JSON directamente en GitHub

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
y rutas relativas de publicación. También modelan la eliminación de opcionales
del guardado CMS, nuevas actividades con/sin hora, ubicaciones, habitaciones,
rutas, booleanos y ceros. Las fechas horarias que contienen son fixtures
aisladas; no se cargan en la app. Puedes repetirlas con
`TZ=America/Los_Angeles node --test tests/*.test.mjs` para cambiar la zona del proceso.

Para comprobar además la sintaxis YAML, la estructura usada del formulario
y su cobertura del JSON real, con Ruby y su biblioteca YAML estándar:

```sh
ruby tests/pages-cms-config.test.rb
```

No hay dependencias de ejecución nuevas ni instalaciones necesarias para estas
comprobaciones. Esta prueba local no sustituye la carga y el guardado en el
CMS alojado ni pretende validar todas las variantes posibles de su esquema.

Configuración basada en la documentación oficial de Pages CMS consultada el
9 de noviembre de 2026:
[configuración](https://pagescms.org/docs/configuration/),
[archivos y colecciones](https://pagescms.org/docs/configuration/content/),
[campos](https://pagescms.org/docs/configuration/content/fields/),
[listas](https://pagescms.org/docs/configuration/content/list/),
[fechas](https://pagescms.org/docs/configuration/fields/date/),
[selects](https://pagescms.org/docs/configuration/fields/select/) y
[guardado y merge](https://pagescms.org/docs/configuration/settings/).
Se contrastó la inicialización, la limpieza de valores vacíos, la conversión
de números, el formato de fecha y el soporte de `step` numérico con el
[código público del CMS](https://github.com/hunvreus/pagescms/tree/6f4e860a35d934406580287e7042e5e111e207a1).
Además se ejecutaron localmente su esquema y funciones de apertura/guardado
con el JSON real y fixtures, en las zonas Madrid, Los Ángeles y Tokio.
Para esa comprobación adicional se usaron `date-fns` y `zod` aislados fuera
del repositorio; no se incorporan a la PWA ni al paquete de actualización.
La versión desplegada del servicio puede diferir; valida el primer guardado
con tu cuenta antes de coordinar a los demás editores.

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
