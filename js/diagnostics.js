import { APP_CONFIG } from "./config.js";

const GENERATION_WATCHDOG_KEY = "agripine:generationWatchdog";
const CRASH_HINT_KEY = "agripine:lastCrashHint";
const DEBUG_LOG_KEY = "agripine:debugLog";
const MAX_DEBUG_EVENTS = 80;
const SESSION_STARTED_AT = Date.now();

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function readLocal(key, fallback = null) {
  try {
    return safeParse(localStorage.getItem(key), fallback);
  } catch (_error) {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Diagnostic localStorage indisponible.", error);
  }
}

function normalizeErrorPayload(payload) {
  if (payload instanceof Error) {
    return { name: payload.name, message: payload.message, stack: payload.stack };
  }
  if (payload?.reason instanceof Error) return normalizeErrorPayload(payload.reason);
  if (payload?.error instanceof Error) return normalizeErrorPayload(payload.error);
  return payload;
}

export function appendDebugLog(event, payload = {}) {
  const current = readLocal(DEBUG_LOG_KEY, []);
  const entry = {
    event,
    payload: normalizeErrorPayload(payload),
    timestamp: nowIso()
  };
  const next = [...(Array.isArray(current) ? current : []), entry].slice(-MAX_DEBUG_EVENTS);
  writeLocal(DEBUG_LOG_KEY, next);
  return entry;
}

export function getDebugLog() {
  return readLocal(DEBUG_LOG_KEY, []);
}

export function getLastDebugEvent() {
  const log = getDebugLog();
  return Array.isArray(log) && log.length ? log[log.length - 1] : null;
}

export function markGenerationStarted(metadata = {}) {
  const record = {
    phase: "generating",
    startedAt: nowIso(),
    ...metadata,
    userAgent: navigator.userAgent
  };
  writeLocal(GENERATION_WATCHDOG_KEY, record);
  appendDebugLog("generation_started", record);
  return record;
}

export function markGenerationFinished(extra = {}) {
  const previous = readLocal(GENERATION_WATCHDOG_KEY, {});
  const record = {
    ...previous,
    ...extra,
    phase: "idle",
    finishedAt: nowIso()
  };
  writeLocal(GENERATION_WATCHDOG_KEY, record);
  appendDebugLog("generation_finished", record);
  return record;
}

export function getPreviousCrashHint() {
  const savedHint = readLocal(CRASH_HINT_KEY, null);
  if (savedHint) return savedHint;

  const watchdog = readLocal(GENERATION_WATCHDOG_KEY, null);
  if (!watchdog || watchdog.phase !== "generating") return null;

  const finishedAt = watchdog.finishedAt ? Date.parse(watchdog.finishedAt) : 0;
  const startedAt = watchdog.startedAt ? Date.parse(watchdog.startedAt) : 0;
  const finishedRecently = finishedAt && Date.now() - finishedAt < 15000;
  const startedRecently = startedAt && Date.now() - startedAt < 2000;
  const startedInThisSession = startedAt && startedAt >= SESSION_STARTED_AT - 1000;
  if (finishedRecently || startedRecently || startedInThisSession) return null;

  const hint = {
    detectedAt: nowIso(),
    message: "Agripine a redémarré pendant une génération. Probable crash WebGPU/mémoire.",
    watchdog
  };
  writeLocal(CRASH_HINT_KEY, hint);
  appendDebugLog("generation_crash_hint_detected", hint);
  return hint;
}

export function clearCrashHint() {
  try {
    localStorage.removeItem(CRASH_HINT_KEY);
  } catch (error) {
    console.warn("Effacement diagnostic crash impossible.", error);
  }
  appendDebugLog("generation_crash_hint_cleared");
}

export function exportDebugLog({ modelState = {}, crashHint = getPreviousCrashHint() } = {}) {
  return {
    app: APP_CONFIG.name,
    version: APP_CONFIG.version,
    timestamp: nowIso(),
    webLLMConfig: {
      provider: APP_CONFIG.webLLMConfig.provider,
      defaultModel: APP_CONFIG.webLLMConfig.defaultModel,
      useStreaming: APP_CONFIG.webLLMConfig.useStreaming,
      maxAssistantTokens: APP_CONFIG.webLLMConfig.maxAssistantTokens,
      maxHistoryMessagesForModel: APP_CONFIG.webLLMConfig.maxHistoryMessagesForModel,
      maxHistoryMessageLength: APP_CONFIG.webLLMConfig.maxHistoryMessageLength,
      maxUserMessageLength: APP_CONFIG.webLLMConfig.maxUserMessageLength,
      topP: APP_CONFIG.webLLMConfig.topP
    },
    modelState,
    crashHint,
    debugLog: getDebugLog(),
    userAgent: navigator.userAgent
  };
}

export function downloadDiagnostics(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `agripine-diagnostic-${APP_CONFIG.version.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function installGlobalErrorHandlers(onError) {
  window.addEventListener("error", (event) => {
    const entry = appendDebugLog("window_error", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error
    });
    onError?.("Erreur globale capturée. Agripine reste vivante, par pur esprit de contradiction.", entry);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const entry = appendDebugLog("unhandled_rejection", { reason: event.reason });
    onError?.("Promesse rejetée capturée. Pas de reload, juste du diagnostic.", entry);
  });
}
