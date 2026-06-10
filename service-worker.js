const CACHE_NAME = "agripine-v0.2.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./js/config.js",
  "./js/storage.js",
  "./js/persona.js",
  "./js/prompt-builder.js",
  "./js/ai-engine.js",
  "./js/webllm-engine.js",
  "./js/model-state.js",
  "./js/chat-ui.js",
  "./js/modes.js",
  "./js/safety-rules.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isAppShellRequest(request) {
  const requestUrl = new URL(request.url);
  return APP_SHELL.some((entry) => new URL(entry, self.location.href).pathname === requestUrl.pathname);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (!isSameOrigin(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (!isAppShellRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
