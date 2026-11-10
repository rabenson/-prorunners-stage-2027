import {
  parseData, getActivities, getNextActivity, formatTime, formatDate,
  hasPendingData, LOCATION_ICONS
} from "./core.mjs";

const $ = id => document.getElementById(id);
const panels = ["inicio", "agenda", "habitaciones", "rutas", "lugares"];
const disciplineIcons = {
  "Natación": "swim", "Ciclismo": "bike", "Running": "run", "Triatlón": "group",
  "Comida": "group", "Descanso": "bed", "Organización": "calendar"
};
let data = null;
let serializedData = "";
let loading = false;
let timelineKey = "";
let timelineTimer;
let installPrompt = null;
let installationError = "";

function el(tag, className = "", content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(svg.namespaceURI, "use");
  use.setAttribute("href", `#i-${name}`);
  svg.append(use);
  return svg;
}

function externalLink(label, url, className = "button button-outline", download = false) {
  const a = el("a", className, label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  if (download) a.setAttribute("download", "");
  a.append(el("span", "", " ↗"));
  return a;
}

function badge(provisional, label) {
  return el("span", `badge${provisional ? " badge-provisional" : ""}`,
    label ?? (provisional ? "Provisional" : "Confirmado"));
}

function discipline(value) {
  const node = el("span", "discipline");
  if (value) node.append(icon(disciplineIcons[value]));
  node.append(document.createTextNode(value ?? "Disciplina pendiente"));
  return node;
}

function internalLink(label, tab, className = "button") {
  const a = el("a", className, label);
  a.href = `#${tab}`;
  a.dataset.tab = tab;
  return a;
}

function setPanel(id, scroll = true) {
  if (!panels.includes(id)) id = "inicio";
  for (const panel of panels) {
    $(panel).hidden = panel !== id;
    $(panel).classList.toggle("active", panel === id);
  }
  document.querySelectorAll(".nav [data-tab]").forEach(control => {
    const active = control.dataset.tab === id;
    control.classList.toggle("active", active);
    if (active) control.setAttribute("aria-current", "page");
    else control.removeAttribute("aria-current");
  });
  if (scroll) {
    $("main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (panels.includes(id)) setPanel(id);
});
document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  const dayLink = target?.closest("[data-day]");
  if (dayLink) {
    event.preventDefault();
    const section = $(`day-${dayLink.dataset.day}`);
    if (section) {
      section.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      document.querySelectorAll("[data-day]").forEach(a => a.classList.toggle("active", a === dayLink));
      section.querySelector("h2")?.focus({ preventScroll: true });
    }
  }
  const control = target?.closest("[data-tab]");
  if (control && location.hash === `#${control.dataset.tab}`) setPanel(control.dataset.tab);
  const close = target?.closest("[data-close]");
  if (close) close.closest("dialog").close();
});
setPanel(location.hash.slice(1), false);

function renderAgenda() {
  const activities = getActivities(data);
  const root = $("agenda-list");
  root.replaceChildren();
  [...data.days].sort((a, b) => a.date.localeCompare(b.date)).forEach((day, index) => {
    const section = el("section", "agenda-day");
    section.id = `day-${day.date}`;
    const heading = el("div", "day-heading");
    const title = el("h2", "", day.label);
    title.tabIndex = -1;
    heading.append(el("span", "day-index", `0${index + 1}`), title);
    section.append(heading);
    const dayActivities = activities.filter(activity => activity.date === day.date);
    if (!dayActivities.length) section.append(el("p", "muted", "Todavía no hay actividades publicadas para este día."));
    for (const activity of dayActivities) {
      const row = el("article", "activity");
      row.id = `activity-${activity.id}`;
      row.dataset.activity = activity.id;
      const time = el("div", `activity-time${activity.start === null ? " pending-time" : ""}`);
      if (activity.start) {
        const timeNode = el("time", "", formatTime(activity.start));
        timeNode.dateTime = activity.start;
        time.append(timeNode);
      } else time.append(document.createTextNode("Hora pendiente"));
      time.append(el("small", "", "Hora de Barcelona"));
      const body = el("div", "activity-body");
      const tags = el("div", "activity-tags");
      tags.append(discipline(activity.discipline), badge(activity.provisional));
      const state = el("span", "badge");
      state.dataset.activityState = activity.id;
      state.hidden = true;
      tags.append(state);
      body.append(tags, el("h3", "", activity.title), el("p", "", activity.description));
      const location = data.locations.find(place => place.id === activity.locationId);
      const placeLine = el("div", "activity-location");
      placeLine.append(icon("pin"), el("span", "", location?.name ?? "Ubicación pendiente de confirmar"));
      if (location?.mapUrl) placeLine.append(externalLink("Google Maps", location.mapUrl, "text-link"));
      body.append(placeLine);
      row.append(time, body);
      section.append(row);
    }
    root.append(section);
  });
  const provisional = activities.some(activity => activity.provisional || activity.start === null);
  $("agenda-notice").hidden = !provisional;
  if (!document.querySelector(".day-nav .active")) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: data.event.timezone }).format(Date.now());
    const day = document.querySelector(`[data-day="${today}"]`) ?? document.querySelector("[data-day]");
    day?.classList.add("active");
  }
}

function renderRooms() {
  const root = $("rooms-list");
  root.replaceChildren();
  if (!data.rooms.length) {
    const empty = el("div", "empty-state");
    empty.append(icon("bed"), el("h2", "", "Distribución de habitaciones pendiente"),
      el("p", "", "Todavía no tenemos la lista de habitaciones, camas y ocupantes. La organización la completará cuando esté confirmada."),
      badge(true, "Sin asignaciones publicadas"));
    const house = data.locations.find(place => place.id === "casa");
    if (house?.mapUrl) {
      const action = el("p");
      action.append(externalLink("Ver casa del stage", house.mapUrl));
      empty.append(action);
    }
    root.append(empty);
    return;
  }
  const grid = el("div", "rooms-grid");
  for (const room of data.rooms) {
    const card = el("article", "card");
    const head = el("div", "card-top");
    head.append(icon("bed"), badge(room.provisional));
    card.append(head, el("h2", "", room.name));
    card.append(el("p", "", room.capacity === null ? "Número de plazas pendiente." :
      `${room.occupants.length} / ${room.capacity} plazas asignadas`));
    if (room.notes) card.append(el("p", "", room.notes));
    if (room.occupants.length) {
      const list = el("ul", "occupants");
      list.setAttribute("aria-label", "Alias de ocupantes");
      room.occupants.forEach(alias => list.append(el("li", "", alias)));
      card.append(list);
    } else card.append(el("p", "", "Ocupantes pendientes de asignar."));
    grid.append(card);
  }
  root.append(grid);
}

function renderRoutes() {
  const root = $("routes-list");
  root.replaceChildren();
  if (!data.routes.length) {
    root.append(el("p", "muted", "No hay rutas publicadas todavía."));
    return;
  }
  data.routes.forEach((route, index) => {
    const card = el("article", "card");
    const head = el("div", "card-top");
    head.append(el("span", "route-number", String(index + 1).padStart(2, "0")), badge(route.provisional));
    card.append(head, el("h2", "", route.name), discipline(route.discipline), el("p", "", route.description));
    const metrics = el("div", "metrics");
    const distance = el("div");
    distance.append(el("strong", "", route.distanceKm === null ? "Pendiente" :
      `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(route.distanceKm)} km`), el("small", "", "Distancia"));
    const elevation = el("div");
    elevation.append(el("strong", "", route.elevationM === null ? "Pendiente" :
      `${new Intl.NumberFormat("es-ES").format(route.elevationM)} m`), el("small", "", "Desnivel positivo"));
    metrics.append(distance, elevation);
    card.append(metrics);
    if (route.trackUrl) card.append(externalLink("Descargar / abrir track GPX", route.trackUrl, "button button-outline", true));
    else card.append(el("p", "", "Track GPX pendiente de recibir."));
    if (route.mapUrl) card.append(externalLink("Abrir recorrido", route.mapUrl, "text-link"));
    root.append(card);
  });
}

function renderPlaces() {
  const root = $("places-list");
  root.replaceChildren();
  for (const place of data.locations) {
    const card = el("article", "card");
    const head = el("div", "card-top");
    head.append(icon(LOCATION_ICONS.includes(place.icon) ? place.icon : "pin"),
      badge(place.provisional, place.provisional ? "Pendiente" : "Ubicación facilitada"));
    card.append(head, el("h2", "", place.name), el("p", "", place.description));
    card.append(el("div", "place-detail", place.address ?? (place.mapUrl ? "Consulta la ubicación exacta en el mapa." : "Ubicación por confirmar.")));
    if (place.mapUrl) card.append(externalLink("Abrir en Google Maps", place.mapUrl));
    else card.append(el("p", "", "El botón de Maps aparecerá cuando se confirme la ubicación."));
    root.append(card);
  }
}

function renderNext(now) {
  const { state, activity } = getNextActivity(data, now);
  const root = $("next-activity");
  root.replaceChildren();
  const stateBadge = $("next-badge");
  stateBadge.className = `badge${activity?.provisional ? " badge-provisional" : ""}`;
  stateBadge.textContent = state === "pending" ? "Horario pendiente" :
    state === "scheduled" ? (activity.provisional ? "Provisional" : "Programada") :
      state === "finished" ? "Stage finalizado" : "Agenda";
  if (activity) {
    root.append(el("p", "next-date", `${formatDate(activity.date)} · ${formatTime(activity.start)}`),
      el("h2", "", activity.title), el("p", "", activity.description));
    const place = data.locations.find(location => location.id === activity.locationId);
    const meta = el("div", "next-meta");
    meta.append(icon("pin"), el("span", "", place?.name ?? "Ubicación pendiente de confirmar"));
    root.append(meta, discipline(activity.discipline));
    if (state === "pending") {
      root.append(el("p", "", "Este bloque aún no tiene hora: no podemos determinar la próxima actividad por horario. Se actualizará automáticamente cuando la organización lo programe."));
    } else if (getActivities(data).some(item => !item.cancelled && item.timestamp === null &&
      item.date >= new Intl.DateTimeFormat("en-CA", { timeZone: data.event.timezone }).format(now))) {
      root.append(el("p", "", "Es la siguiente actividad con horario publicado. Hay otros bloques aún sin hora."));
    }
    const actions = el("div", "next-actions");
    actions.append(internalLink("Ver agenda →", "agenda", "text-link"));
    if (place?.mapUrl) actions.append(externalLink("Abrir en Google Maps", place.mapUrl, "text-link"));
    root.append(actions);
  } else {
    const titles = {
      finished: "Gracias por compartir el stage.",
      none: "No hay más actividades con horario.",
      empty: "La agenda está por llegar."
    };
    const descriptions = {
      finished: "El fin de semana del stage ha terminado. Puedes seguir consultando su agenda, rutas y lugares.",
      none: "Las actividades publicadas ya han comenzado. Consulta la agenda por si hay cambios o nuevos bloques.",
      empty: "La organización publicará aquí el programa de los tres días."
    };
    root.append(el("h2", "", titles[state]), el("p", "", descriptions[state]),
      internalLink("Consultar agenda →", "agenda", "text-link"));
  }
}

function refreshTimeline(force = false) {
  clearTimeout(timelineTimer);
  if (!data) return;
  const now = Date.now();
  const next = getNextActivity(data, now);
  const activities = getActivities(data);
  const key = `${next.state}|${next.activity?.id}|${activities.filter(activity =>
    activity.timestamp !== null && activity.timestamp < now).map(activity => activity.id).join(",")}`;
  if (force || key !== timelineKey) {
    timelineKey = key;
    renderNext(now);
    for (const activity of activities) {
      const row = $(`activity-${activity.id}`);
      const state = row?.querySelector("[data-activity-state]");
      const isNext = next.state === "scheduled" && next.activity.id === activity.id;
      const past = activity.timestamp !== null && activity.timestamp < now;
      row?.classList.toggle("activity-next", isNext);
      row?.classList.toggle("activity-past", past && !activity.cancelled);
      if (state) {
        state.hidden = !activity.cancelled && !isNext && !past;
        state.textContent = activity.cancelled ? "Cancelada" : isNext ? "Próxima" : "Ya iniciada";
      }
    }
  }
  const nextStart = activities.find(activity => !activity.cancelled && activity.timestamp !== null && activity.timestamp >= now)?.timestamp;
  const wait = nextStart === undefined ? 15000 : Math.min(15000, Math.max(50, nextStart - now + 25));
  timelineTimer = setTimeout(() => refreshTimeline(), wait);
}

function renderData() {
  renderAgenda();
  renderRooms();
  renderRoutes();
  renderPlaces();
  $("home-notice").hidden = data.notice === null;
  if (data.notice !== null) $("home-notice").lastElementChild.textContent = data.notice;
  $("home-status").textContent = hasPendingData(data) ? "Hay información pendiente de confirmar" : "Información publicada";
  $("data-version").textContent = `Versión ${data.version} · Datos revisados: ${new Intl.DateTimeFormat("es-ES", {
    timeZone: data.event.timezone, day: "numeric", month: "long", year: "numeric"
  }).format(new Date(`${data.updatedAt}T12:00:00+02:00`))}`;
  refreshTimeline(true);
}

async function loadData() {
  if (loading) return;
  loading = true;
  $("retry-data").disabled = true;
  try {
    const response = await fetch(new URL("./data/evento.json", import.meta.url), {
      cache: "no-store", signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`No se pudo leer data/evento.json (HTTP ${response.status}).`);
    const nextData = parseData(await response.json());
    const json = JSON.stringify(nextData);
    if (serializedData !== json) {
      data = nextData;
      serializedData = json;
      renderData();
    }
    $("data-error").hidden = true;
  } catch (error) {
    console.error("No se pudo actualizar la información del stage:", error);
    const detail = error instanceof Error ? error.message : String(error);
    $("data-error-text").textContent = `${data ? "No se pudo actualizar. Se muestra la última información cargada; podría estar desactualizada." :
      "No se ha podido cargar la información. Comprueba internet o el archivo data/evento.json."} ${detail}`;
    $("data-error").hidden = false;
    if (!data) {
      $("next-badge").textContent = "Error de carga";
      $("next-activity").replaceChildren(el("h2", "", "Información no disponible"),
        el("p", "", "Pulsa Reintentar para volver a consultar la agenda."));
      for (const id of ["agenda-list", "rooms-list", "routes-list", "places-list"]) {
        $(id).replaceChildren(el("p", "muted", "No se pudo cargar esta sección. Usa Reintentar en el aviso superior."));
      }
    }
  } finally {
    loading = false;
    $("retry-data").disabled = false;
  }
}

function updateConnection() {
  $("connection-banner").hidden = navigator.onLine;
}
window.addEventListener("offline", updateConnection);
window.addEventListener("online", () => { updateConnection(); loadData(); });
window.addEventListener("focus", () => { refreshTimeline(); loadData(); });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { refreshTimeline(); loadData(); }
});
$("retry-data").addEventListener("click", loadData);
updateConnection();
loadData();
setInterval(() => { if (!document.hidden) loadData(); }, 60000);

function getShareUrl() {
  const url = new URL("./", location.href);
  url.hash = "";
  url.search = "";
  return url.href;
}

function drawQR(url) {
  if (typeof window.qrcode !== "function") throw new Error("No se ha cargado el generador QR local. Revisa assets/qrcode.min.js.");
  const qr = window.qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const canvas = $("share-qr");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Este navegador no permite dibujar el QR.");
  const quietZone = 4;
  const modules = qr.getModuleCount() + quietZone * 2;
  const cell = Math.max(4, Math.floor(328 / modules));
  canvas.width = canvas.height = modules * cell;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111114";
  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      if (qr.isDark(row, col)) context.fillRect((col + quietZone) * cell, (row + quietZone) * cell, cell, cell);
    }
  }
}

$("share-button").addEventListener("click", () => {
  const url = getShareUrl();
  $("share-url").value = url;
  $("share-message").textContent = "";
  $("native-share").hidden = typeof navigator.share !== "function";
  $("share-warning").hidden = location.protocol === "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  $("share-qr").hidden = false;
  $("download-qr").disabled = false;
  try {
    drawQR(url);
  } catch (error) {
    console.error("No se pudo generar el QR:", error);
    $("share-qr").hidden = true;
    $("download-qr").disabled = true;
    $("share-message").textContent = error instanceof Error ? error.message : String(error);
  }
  $("share-dialog").showModal();
});

$("copy-link").addEventListener("click", async () => {
  try {
    if (!navigator.clipboard) throw new Error("El portapapeles no está disponible en este navegador.");
    await navigator.clipboard.writeText($("share-url").value);
    $("share-message").textContent = "Enlace copiado. Puedes enviarlo al grupo.";
  } catch (error) {
    console.error("No se pudo copiar el enlace:", error);
    $("share-url").focus();
    $("share-url").select();
    $("share-message").textContent = "No se pudo copiar automáticamente. El enlace está seleccionado: cópialo manualmente.";
  }
});

$("download-qr").addEventListener("click", () => {
  try {
    const a = el("a");
    a.href = $("share-qr").toDataURL("image/png");
    a.download = "PRORUNNERS_STAGE_2027_QR.png";
    document.body.append(a);
    a.click();
    a.remove();
    $("share-message").textContent = "QR preparado para descargar. Usa el PNG en tu cartel o mensaje.";
  } catch (error) {
    console.error("No se pudo descargar el QR:", error);
    $("share-message").textContent = "No se pudo descargar el QR. Puedes compartir el enlace.";
  }
});

$("native-share").addEventListener("click", async () => {
  try {
    await navigator.share({ title: data?.event.name ?? document.title, text: "Toda la información del stage.", url: $("share-url").value });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return;
    console.error("No se pudo compartir el enlace:", error);
    $("share-message").textContent = "No se pudo abrir el menú de compartir. Usa Copiar enlace.";
  }
});

$("install-button").addEventListener("click", () => {
  $("install-message").textContent = matchMedia("(display-mode: standalone)").matches || navigator.standalone ?
    "La aplicación ya está abierta en modo instalado." : installationError;
  $("install-now").hidden = installPrompt === null;
  $("install-dialog").showModal();
});
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  $("install-button").textContent = "Instalar app +";
  $("install-now").hidden = false;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  $("install-now").hidden = true;
  $("install-message").textContent = "Aplicación instalada.";
  $("install-button").textContent = "App instalada";
});
$("install-now").addEventListener("click", async () => {
  if (!installPrompt) {
    $("install-message").textContent = "La instalación automática no está disponible. Sigue las instrucciones de tu navegador.";
    return;
  }
  try {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    $("install-message").textContent = choice.outcome === "accepted" ? "Instalación solicitada al navegador." :
      "Instalación cancelada. Puedes seguir usando la web.";
  } catch (error) {
    console.error("No se pudo instalar la app:", error);
    $("install-message").textContent = "No se pudo iniciar la instalación. Usa el menú del navegador.";
  } finally {
    installPrompt = null;
    $("install-now").hidden = true;
  }
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url), { updateViaCache: "none" }).catch(error => {
    console.error("No se pudo registrar el service worker:", error);
    installationError = "No se pudo registrar el componente PWA. La web sigue disponible; revisa que sw.js esté publicado por HTTPS.";
    $("install-message").textContent = installationError;
  });
}
