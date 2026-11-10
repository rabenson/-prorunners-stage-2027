export const EVENT_DATES = ["2027-05-21", "2027-05-22", "2027-05-23"];
export const DISCIPLINES = ["Natación", "Ciclismo", "Running", "Triatlón", "Comida", "Descanso", "Organización"];
export const LOCATION_ICONS = ["bed", "swim", "run", "pin", "bike"];
const BARCELONA_OFFSET = "+02:00";

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function text(value, path, nullable = false) {
  if (nullable && value === null) return;
  check(typeof value === "string" && value.trim().length > 0, `${path}: debe ser un texto no vacío.`);
}

function flag(value, path) {
  check(typeof value === "boolean", `${path}: debe ser true o false.`);
}

function positiveNumber(value, path) {
  check(value === null || (Number.isFinite(value) && value >= 0), `${path}: debe ser null o un número mayor o igual que cero.`);
}

function unique(items, path) {
  const ids = new Set();
  for (const item of items) {
    check(item && typeof item === "object", `${path}: cada elemento debe ser un objeto.`);
    text(item.id, `${path}.id`);
    check(/^[a-z0-9-]+$/.test(item.id), `${path}.id: usa letras minúsculas, números y guiones.`);
    check(!ids.has(item.id), `${path}: id repetido "${item.id}".`);
    ids.add(item.id);
  }
  return ids;
}

export function validLink(value, allowTrack = false) {
  if (typeof value !== "string" || !value || value.trim() !== value || /[\u0000-\u0020\\]/.test(value)) return false;
  if (allowTrack && /^tracks\/[a-zA-Z0-9_-]+\.gpx$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function link(value, path, allowTrack = false) {
  check(value === null || validLink(value, allowTrack), `${path}: usa una URL HTTPS válida${allowTrack ? " o tracks/nombre.gpx" : ""}.`);
}

export function validateData(data) {
  check(data && typeof data === "object" && !Array.isArray(data), "El archivo de datos debe ser un objeto JSON.");
  text(data.version, "version");
  check(typeof data.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt) &&
    !Number.isNaN(Date.parse(data.updatedAt)) && new Date(data.updatedAt).toISOString().slice(0, 10) === data.updatedAt,
  "updatedAt: usa una fecha válida YYYY-MM-DD.");
  text(data.notice, "notice", true);
  check(data.event && typeof data.event === "object", "Falta event.");
  text(data.event.name, "event.name");
  text(data.event.club, "event.club");
  check(validLink(data.event.website), "event.website: usa una URL HTTPS válida.");
  check(data.event.timezone === "Europe/Madrid", "event.timezone: debe ser Europe/Madrid.");
  check(data.event.end === `2027-05-24T00:00:00${BARCELONA_OFFSET}`, "event.end: debe ser 2027-05-24T00:00:00+02:00.");
  for (const key of ["days", "rooms", "routes", "locations"]) check(Array.isArray(data[key]), `${key}: debe ser una lista.`);
  const locations = unique(data.locations, "locations");
  for (const location of data.locations) {
    text(location.name, `locations.${location.id}.name`);
    text(location.description, `locations.${location.id}.description`);
    text(location.address, `locations.${location.id}.address`, true);
    link(location.mapUrl, `locations.${location.id}.mapUrl`);
    flag(location.provisional, `locations.${location.id}.provisional`);
    check(LOCATION_ICONS.includes(location.icon), `locations.${location.id}.icon: icono no admitido.`);
  }
  check(data.days.length === 3 && EVENT_DATES.every(date => data.days.some(day => day?.date === date)),
    "days: debe contener exactamente el 21, 22 y 23 de mayo de 2027.");
  const activities = [];
  for (const day of data.days) {
    text(day.label, `days.${day.date}.label`);
    check(Array.isArray(day.activities), `days.${day.date}.activities: debe ser una lista.`);
    for (const activity of day.activities) {
      check(activity && typeof activity === "object", `days.${day.date}: actividad no válida.`);
      text(activity.title, `days.${day.date}.title`);
      text(activity.description, `days.${day.date}.description`);
      flag(activity.provisional, `${activity.id}.provisional`);
      flag(activity.cancelled, `${activity.id}.cancelled`);
      check(activity.discipline === null || DISCIPLINES.includes(activity.discipline), `${activity.id}.discipline: disciplina no admitida.`);
      check(activity.locationId === null || locations.has(activity.locationId), `${activity.id}.locationId: ubicación inexistente.`);
      if (activity.start !== null) {
        check(typeof activity.start === "string" &&
          /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:00\+02:00$/.test(activity.start) &&
          activity.start.startsWith(`${day.date}T`) && Number.isFinite(Date.parse(activity.start)),
        `${activity.id}.start: usa ${day.date}THH:MM:00+02:00 o null.`);
      }
      activities.push(activity);
    }
  }
  unique(activities, "activities");
  unique(data.rooms, "rooms");
  for (const room of data.rooms) {
    text(room.name, `${room.id}.name`);
    text(room.notes, `${room.id}.notes`, true);
    check(room.capacity === null || (Number.isInteger(room.capacity) && room.capacity > 0), `${room.id}.capacity: usa null o un entero positivo.`);
    check(Array.isArray(room.occupants), `${room.id}.occupants: debe ser una lista de alias.`);
    room.occupants.forEach(alias => text(alias, `${room.id}.occupants`));
    check(room.capacity === null || room.occupants.length <= room.capacity, `${room.id}: hay más ocupantes que plazas.`);
    flag(room.provisional, `${room.id}.provisional`);
  }
  unique(data.routes, "routes");
  for (const route of data.routes) {
    text(route.name, `${route.id}.name`);
    text(route.description, `${route.id}.description`);
    check(DISCIPLINES.includes(route.discipline), `${route.id}.discipline: disciplina no admitida.`);
    positiveNumber(route.distanceKm, `${route.id}.distanceKm`);
    positiveNumber(route.elevationM, `${route.id}.elevationM`);
    link(route.trackUrl, `${route.id}.trackUrl`, true);
    link(route.mapUrl, `${route.id}.mapUrl`);
    flag(route.provisional, `${route.id}.provisional`);
  }
  return data;
}

export function parseData(input) {
  const data = structuredClone(input);
  // Pages CMS omite escalares vacíos y listas vacías al guardar JSON.
  function normalize(object, nullable = [], lists = []) {
    if (!object || typeof object !== "object" || Array.isArray(object)) return;
    for (const key of nullable) {
      if (object[key] === undefined || object[key] === "") object[key] = null;
    }
    for (const key of lists) {
      if (object[key] === undefined) object[key] = [];
    }
  }
  normalize(data, ["notice"], ["rooms", "routes", "locations"]);
  if (Array.isArray(data?.locations)) {
    for (const location of data.locations) normalize(location, ["address", "mapUrl"]);
  }
  if (Array.isArray(data?.days)) {
    for (const day of data.days) {
      normalize(day, [], ["activities"]);
      if (Array.isArray(day?.activities)) {
        for (const activity of day.activities) normalize(activity, ["start", "discipline", "locationId"]);
      }
    }
  }
  if (Array.isArray(data?.rooms)) {
    for (const room of data.rooms) normalize(room, ["capacity", "notes"], ["occupants"]);
  }
  if (Array.isArray(data?.routes)) {
    for (const route of data.routes) normalize(route, ["distanceKm", "elevationM", "trackUrl", "mapUrl"]);
  }
  return validateData(data);
}

export function getActivities(data) {
  return data.days.flatMap(day => day.activities.map(activity => ({
    ...activity,
    date: day.date,
    dayLabel: day.label,
    timestamp: activity.start === null ? null : Date.parse(activity.start)
  }))).sort((a, b) => a.date.localeCompare(b.date) ||
    (a.timestamp ?? Infinity) - (b.timestamp ?? Infinity) || a.id.localeCompare(b.id));
}

export function getNextActivity(data, now = Date.now()) {
  const activities = getActivities(data).filter(activity => !activity.cancelled);
  const next = activities.find(activity => activity.timestamp !== null && activity.timestamp >= now);
  if (next) return { state: "scheduled", activity: next };
  if (now >= Date.parse(data.event.end)) return { state: "finished", activity: null };
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: data.event.timezone, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(now);
  const unscheduled = activities.find(activity => activity.timestamp === null && activity.date >= today);
  if (unscheduled) return { state: "pending", activity: unscheduled };
  return { state: activities.length ? "none" : "empty", activity: null };
}

export function formatTime(start) {
  return start === null ? "Hora pendiente" : new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).format(new Date(start));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", day: "numeric", month: "long", weekday: "long"
  }).format(new Date(`${date}T12:00:00${BARCELONA_OFFSET}`));
}

export function hasPendingData(data) {
  return data.days.some(day => day.activities.some(activity => !activity.cancelled &&
    (activity.provisional || activity.start === null || activity.discipline === null || activity.locationId === null))) ||
    !data.rooms.length || data.rooms.some(room => room.provisional) ||
    !data.routes.length || data.routes.some(route => route.provisional || route.trackUrl === null) ||
    data.locations.some(location => location.provisional || location.mapUrl === null);
}
