// Solo ciclo de instalación: no intercepta peticiones ni crea cachés offline.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
