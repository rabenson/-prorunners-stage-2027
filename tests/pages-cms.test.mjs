import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseData, validateData, getActivities, getNextActivity, formatTime } from "../core.mjs";

const original = JSON.parse(await readFile(new URL("../data/evento.json", import.meta.url), "utf8"));
const copy = () => structuredClone(original);

// Modela sanitizeObject de Pages CMS: elimina null, "", objetos y listas vacíos,
// pero conserva false y 0. No representa un guardado autenticado en GitHub.
function cmsSave(value) {
  const empty = item => item === null || item === undefined || item === "";
  if (Array.isArray(value)) return value.map(cmsSave).filter(item => !empty(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cmsSave(item)])
    .filter(([, item]) => !empty(item) && (typeof item !== "object" || Object.keys(item).length > 0)));
}

function activity(overrides = {}) {
  return {
    id: "plan-nuevo", title: "Plan de prueba", description: "Solo fixture, no contenido del stage.",
    provisional: true, cancelled: false, ...overrides
  };
}

test("El loader acepta el JSON real sin mutarlo ni alterar pendientes o enlaces", () => {
  const before = copy();
  const parsed = parseData(original);
  assert.notEqual(parsed, original);
  assert.deepEqual(parsed, original);
  assert.deepEqual(original, before);
  assert.equal(validateData(parsed), parsed);
});

test("Un guardado CMS sin editar conserva el significado de todos los datos reales", () => {
  const saved = cmsSave(original);
  assert.equal(saved.rooms, undefined);
  assert.equal(saved.days[0].activities[0].start, undefined);
  assert.equal(saved.days[0].activities[0].cancelled, false);
  assert.equal(saved.locations[0].provisional, false);
  assert.deepEqual(parseData(JSON.parse(JSON.stringify(saved))), original);
});

test("Opcionales null, ausentes o vacíos tienen el mismo significado", () => {
  for (const empty of [null, undefined, ""]) {
    const data = copy();
    data.notice = empty;
    for (const day of data.days) {
      for (const plan of day.activities) {
        plan.start = empty;
        plan.discipline = empty;
        plan.locationId = empty;
      }
    }
    for (const place of data.locations) {
      place.address = empty;
      place.mapUrl = empty;
    }
    for (const route of data.routes) {
      for (const key of ["distanceKm", "elevationM", "mapUrl", "trackUrl"]) route[key] = empty;
    }
    const parsed = parseData(data);
    assert.equal(parsed.notice, null);
    assert.ok(getActivities(parsed).every(plan =>
      plan.start === null && plan.discipline === null && plan.locationId === null));
    assert.ok(parsed.locations.every(place => place.address === null && place.mapUrl === null));
    assert.ok(parsed.routes.every(route => route.distanceKm === null && route.elevationM === null &&
      route.mapUrl === null && route.trackUrl === null));
  }
});

test("Una nueva actividad CMS sin hora sigue pendiente; una hora real solo en fixture activa la tarjeta", () => {
  const data = copy();
  data.days[0].activities.push(activity());
  let parsed = parseData(cmsSave(data));
  let plan = getActivities(parsed).find(item => item.id === "plan-nuevo");
  assert.equal(plan.timestamp, null);
  assert.equal(formatTime(plan.start), "Hora pendiente");
  assert.equal(getNextActivity(parsed, Date.parse("2027-05-21T08:00:00+02:00")).state, "pending");
  data.days[0].activities.at(-1).start = "2027-05-21T09:30:00+02:00";
  parsed = parseData(cmsSave(data));
  const next = getNextActivity(parsed, Date.parse("2027-05-21T09:00:00+02:00"));
  assert.equal(next.state, "scheduled");
  assert.equal(next.activity.id, "plan-nuevo");
  assert.equal(formatTime(next.activity.start), "09:30");
  data.days[0].activities.at(-1).cancelled = true;
  assert.equal(getNextActivity(parseData(cmsSave(data)), Date.parse("2027-05-21T09:00:00+02:00")).state, "pending");
});

test("Nuevos lugares se enlazan por ID sin limitarse a los tres originales", () => {
  const data = copy();
  data.locations.push({
    id: "encuentro-fixture", name: "Punto de prueba", description: "Solo fixture.",
    icon: "pin", provisional: false
  });
  data.days[0].activities.push(activity({ discipline: "Organización", locationId: "encuentro-fixture" }));
  const parsed = parseData(cmsSave(data));
  assert.equal(parsed.locations.at(-1).mapUrl, null);
  assert.equal(parsed.locations.at(-1).provisional, false);
  assert.equal(parsed.days[0].activities.at(-1).locationId, "encuentro-fixture");
  data.locations.pop();
  assert.throws(() => parseData(cmsSave(data)), /ubicación inexistente/);
});

test("Habitaciones nuevas permiten plazas y notas pendientes y una lista de alias vacía", () => {
  for (const empty of [null, undefined, ""]) {
    const data = copy();
    data.rooms.push({
      id: "habitacion-fixture", name: "Solo prueba", capacity: empty, notes: empty, provisional: true
    });
    const room = parseData(cmsSave(data)).rooms[0];
    assert.equal(room.capacity, null);
    assert.equal(room.notes, null);
    assert.deepEqual(room.occupants, []);
  }
  const data = copy();
  data.rooms.push({
    id: "habitacion-fixture", name: "Solo prueba", capacity: 2,
    occupants: ["ALIAS-01", "ALIAS-02"], provisional: false
  });
  assert.equal(parseData(cmsSave(data)).rooms[0].capacity, 2);
  data.rooms[0].capacity = 1;
  assert.throws(() => parseData(cmsSave(data)), /más ocupantes/);
  for (const capacity of [0, -1, 1.5, "2", false]) {
    data.rooms[0].capacity = capacity;
    assert.throws(() => parseData(data), /entero positivo/);
  }
});

test("Rutas guardan números reales, decimales, cero y enlaces HTTPS o GPX local", () => {
  const data = copy();
  Object.assign(data.routes[0], {
    distanceKm: 12.5, elevationM: 0, trackUrl: "tracks/fixture.gpx",
    mapUrl: "https://example.com/fixture", provisional: false
  });
  const parsed = parseData(cmsSave(data));
  assert.equal(parsed.routes[0].distanceKm, 12.5);
  assert.equal(parsed.routes[0].elevationM, 0);
  assert.equal(parsed.routes[0].provisional, false);
  assert.equal(parsed.routes[0].trackUrl, "tracks/fixture.gpx");
  for (const distance of [-1, "12.5", false, {}, Infinity]) {
    data.routes[0].distanceKm = distance;
    assert.throws(() => parseData(data), /mayor o igual/);
  }
});

test("Listas omitidas por el CMS se recuperan como listas vacías, nunca como registros inventados", () => {
  const data = copy();
  data.days.forEach(day => day.activities = []);
  data.rooms = [];
  data.routes = [];
  data.locations = [];
  const saved = cmsSave(data);
  assert.equal(saved.days[0].activities, undefined);
  const parsed = parseData(saved);
  for (const key of ["rooms", "routes", "locations"]) assert.deepEqual(parsed[key], []);
  assert.ok(parsed.days.every(day => day.activities.length === 0));
  assert.equal(getNextActivity(parsed, Date.parse("2027-05-21T09:00:00+02:00")).state, "empty");
});

test("No se convierten null, texto u objetos en listas válidas", () => {
  for (const invalid of [null, "", {}, false]) {
    for (const key of ["days", "rooms", "routes", "locations"]) {
      const data = copy();
      data[key] = invalid;
      assert.throws(() => parseData(data), /debe ser una lista/);
    }
    const data = copy();
    data.days[0].activities = invalid;
    assert.throws(() => parseData(data), /debe ser una lista/);
    data.days[0].activities = [];
    data.rooms = [{ id: "fixture", name: "Prueba", provisional: true, occupants: invalid }];
    assert.throws(() => parseData(data), /debe ser una lista/);
  }
});

test("La normalización no oculta campos obligatorios ausentes ni booleans ambiguos", () => {
  for (const key of ["id", "title", "description", "provisional", "cancelled"]) {
    const data = copy();
    delete data.days[0].activities[0][key];
    assert.throws(() => parseData(data));
  }
  for (const value of ["false", "true", 0, 1, null, ""]) {
    const data = copy();
    data.days[0].activities[0].cancelled = value;
    assert.throws(() => parseData(data), /true o false/);
  }
  for (const value of [null, [], false, ""]) assert.throws(() => parseData(value));
  const data = copy();
  delete data.days;
  assert.throws(() => parseData(data), /debe ser una lista/);
});

test("Horarios inválidos, IDs duplicados y enlaces inseguros siguen dando errores explícitos", () => {
  for (const start of ["2027-05-21T09:30:00Z", "2027-05-21T09:30:00+01:00",
    "2027-05-22T09:30:00+02:00", "2027-05-21T24:00:00+02:00", " ", "null", false]) {
    const data = copy();
    data.days[0].activities[0].start = start;
    assert.throws(() => parseData(data), /\.start/);
  }
  const data = copy();
  data.days[0].activities.push(activity({ id: data.days[0].activities[0].id }));
  assert.throws(() => parseData(data), /repetido/);
  data.days[0].activities.pop();
  for (const mapUrl of ["http://example.com", "javascript:alert(1)", "https://user:pass@example.com", "null", " "]) {
    data.locations[0].mapUrl = mapUrl;
    assert.throws(() => parseData(data), /URL HTTPS/);
  }
});

test("La carga de la PWA usa la normalización antes de renderizar y conserva el aviso de error", async () => {
  const app = await readFile(new URL("../app.mjs", import.meta.url), "utf8");
  assert.match(app, /const nextData = parseData\(await response\.json\(\)\)/);
  assert.match(app, /console\.error\("No se pudo actualizar/);
  assert.match(app, /Se muestra la última información cargada; podría estar desactualizada/);
});
