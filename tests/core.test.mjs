import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  validateData, getNextActivity, getActivities, formatTime, formatDate, validLink, hasPendingData
} from "../core.mjs";

const original = JSON.parse(await readFile(new URL("../data/evento.json", import.meta.url), "utf8"));
const copy = () => structuredClone(original);
const at = value => Date.parse(value);
function scheduled() {
  const data = copy();
  data.days[0].activities[0].start = "2027-05-21T17:00:00+02:00";
  data.days[1].activities[0].start = "2027-05-22T09:00:00+02:00";
  data.days[2].activities[0].start = "2027-05-23T08:00:00+02:00";
  return validateData(data);
}

test("La entrega conserva los bloques v1, tres rutas y horas realmente pendientes", () => {
  assert.equal(validateData(original), original);
  assert.equal(original.days.length, 3);
  assert.deepEqual(getActivities(original).map(activity => activity.title),
    ["Llegada y bienvenida", "Entrenamientos y comidas", "Entrenamiento y salida"]);
  assert.ok(getActivities(original).every(activity => activity.start === null && activity.discipline === null && activity.locationId === null));
  assert.deepEqual(original.rooms, []);
  assert.deepEqual(original.routes.map(route => route.name), ["Ruta 1", "Ruta 2", "Ruta 3"]);
  assert.ok(hasPendingData(original));
});

test("Sin horas, Inicio no inventa ninguna y avanza por los días de Barcelona", () => {
  assert.equal(getNextActivity(original, at("2026-11-09T12:00:00Z")).state, "pending");
  assert.equal(getNextActivity(original, at("2027-05-21T23:30:00Z")).activity.id, "sabado-entrenamientos");
  assert.equal(getNextActivity(original, at("2027-05-22T22:00:00Z")).activity.id, "domingo-entrenamiento");
});

test("Selecciona futura, en el instante exacto y salta a la siguiente al comenzar", () => {
  const data = scheduled();
  assert.equal(getNextActivity(data, at("2027-05-21T16:59:59+02:00")).activity.id, "viernes-bienvenida");
  assert.equal(getNextActivity(data, at("2027-05-21T17:00:00+02:00")).activity.id, "viernes-bienvenida");
  assert.equal(getNextActivity(data, at("2027-05-21T17:00:00.001+02:00")).activity.id, "sabado-entrenamientos");
  assert.equal(getNextActivity(data, at("2027-05-22T09:00:01+02:00")).activity.id, "domingo-entrenamiento");
});

test("Ordena días y actividades aunque los datos no estén en orden", () => {
  const data = scheduled();
  data.days[0].activities.unshift({
    ...data.days[0].activities[0], id: "viernes-tarde", start: "2027-05-21T19:00:00+02:00"
  });
  data.days.reverse();
  assert.equal(getNextActivity(validateData(data), at("2027-05-21T00:00:00Z")).activity.id, "viernes-bienvenida");
  assert.equal(getNextActivity(data, at("2027-05-21T17:00:01+02:00")).activity.id, "viernes-tarde");
});

test("Canceladas no cuentan; horas pendientes no se convierten en cero", () => {
  const data = scheduled();
  data.days[0].activities[0].cancelled = true;
  assert.equal(getNextActivity(data, at("2026-11-09T12:00:00Z")).activity.id, "sabado-entrenamientos");
  data.days[1].activities[0].start = null;
  assert.equal(getNextActivity(data, at("2026-11-09T12:00:00Z")).activity.id, "domingo-entrenamiento");
  assert.equal(getNextActivity(data, at("2027-05-22T09:00:00+02:00")).state, "scheduled");
});

test("No hay futuras, agenda vacía y fin del evento son estados distintos", () => {
  const data = scheduled();
  assert.equal(getNextActivity(data, at("2027-05-23T20:00:00+02:00")).state, "none");
  assert.equal(getNextActivity(data, at("2027-05-24T00:00:00+02:00")).state, "finished");
  assert.equal(getNextActivity(original, at("2027-05-24T00:00:00+02:00")).state, "finished");
  data.days.forEach(day => day.activities = []);
  assert.equal(getNextActivity(data, at("2027-05-22T09:00:00+02:00")).state, "empty");
});

test("Formato horario independiente de zona del dispositivo, incluido cambio de día", () => {
  assert.equal(formatTime("2027-05-21T17:00:00+02:00"), "17:00");
  assert.equal(formatTime("2027-05-22T00:00:00+02:00"), "00:00");
  assert.equal(formatTime(null), "Hora pendiente");
  assert.equal(formatDate("2027-05-21"), "viernes, 21 de mayo");
});

test("Valida horas reales, día del bloque y desfase de verano sin corregir silenciosamente", () => {
  for (const value of ["2027-05-21T17:00:00", "2027-05-21T17:00:00Z", "2027-05-21T17:00:00+01:00",
    "2027-05-22T17:00:00+02:00", "2027-05-21T25:00:00+02:00", "2027-05-21T17:80:00+02:00", "pendiente"]) {
    const data = copy();
    data.days[0].activities[0].start = value;
    assert.throws(() => validateData(data), /\.start/);
  }
});

test("Rechaza IDs repetidos, días duplicados, ubicación inexistente y disciplina inválida", () => {
  let data = copy();
  data.days[0].activities.push(structuredClone(data.days[0].activities[0]));
  assert.throws(() => validateData(data), /repetido/);
  data = copy();
  data.days[0].date = "2027-05-22";
  assert.throws(() => validateData(data), /exactamente/);
  data = copy();
  data.days[0].activities[0].locationId = "inventado";
  assert.throws(() => validateData(data), /ubicación inexistente/);
  data = copy();
  data.days[0].activities[0].discipline = "No reconocida";
  assert.throws(() => validateData(data), /disciplina no admitida/);
});

test("Rechaza datos incompletos, booleans ambiguos y fechas imposibles", () => {
  for (const key of ["cancelled", "provisional", "start", "locationId", "description"]) {
    const data = copy();
    delete data.days[0].activities[0][key];
    assert.throws(() => validateData(data));
  }
  const data = copy();
  data.updatedAt = "2026-02-31";
  assert.throws(() => validateData(data), /updatedAt/);
  data.updatedAt = "2026-11-09";
  data.days[0].activities[0].cancelled = "false";
  assert.throws(() => validateData(data), /true o false/);
});

test("Habitaciones: alias, plazas pendientes y exceso de ocupantes", () => {
  const data = copy();
  data.rooms = [{ id: "a", name: "A", capacity: 2, occupants: ["P01", "P02"], notes: null, provisional: true }];
  assert.equal(validateData(data), data);
  data.rooms[0].capacity = 1;
  assert.throws(() => validateData(data), /más ocupantes/);
  data.rooms[0].capacity = null;
  assert.equal(validateData(data), data);
});

test("Rutas: cero es válido, valores negativos y URL insegura no", () => {
  const data = copy();
  data.routes[0].distanceKm = 0;
  data.routes[0].elevationM = 0;
  data.routes[0].trackUrl = "tracks/ruta-1.gpx";
  assert.equal(validateData(data), data);
  data.routes[0].distanceKm = -1;
  assert.throws(() => validateData(data), /mayor o igual/);
  data.routes[0].distanceKm = 1;
  data.routes[0].trackUrl = "javascript:alert(1)";
  assert.throws(() => validateData(data), /URL HTTPS/);
});

test("Enlaces Maps originales intactos; running sin URL falsa", () => {
  assert.equal(original.locations[0].mapUrl, "https://maps.app.goo.gl/Q5JdUtFHjQ7tgmNQ9?g_st=ic");
  assert.equal(original.locations[1].mapUrl, "https://maps.app.goo.gl/VuG3ZGPwCd4tVuA29?g_st=ic");
  assert.equal(original.locations[2].mapUrl, null);
  assert.ok(validLink(original.locations[0].mapUrl));
  assert.ok(validLink("tracks/ruta-1.gpx", true));
  for (const value of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "//example.com",
    "tracks/../private.gpx", "tracks/x.svg", "https://user:pass@example.com", "", null]) {
    assert.equal(validLink(value, true), false, String(value));
  }
});

test("Publicación relativa: manifiesto y recursos funcionan dentro de un repositorio Pages", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
  const base = "https://usuario.github.io/prorunners-stage-2027/";
  for (const value of [manifest.id, manifest.scope, manifest.start_url]) assert.equal(new URL(value, base).href, base);
  for (const entry of manifest.icons) {
    assert.ok(new URL(entry.src, base).href.startsWith(base));
    const png = await readFile(new URL(`../${entry.src}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), Number(entry.sizes.split("x")[0]));
    assert.equal(png.readUInt32BE(20), Number(entry.sizes.split("x")[1]));
  }
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const path of ["styles.css", "app.mjs", "assets/prorunners-logo.svg", "assets/qrcode.min.js", "apple-touch-icon.png"]) {
    assert.ok(html.includes(`./${path}`));
    assert.ok((await readFile(new URL(`../${path}`, import.meta.url))).length > 0);
  }
  const worker = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.ok(!worker.includes('addEventListener("fetch"'));
  assert.ok(!worker.includes("caches."));
});
