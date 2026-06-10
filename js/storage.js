import { APP_CONFIG, DEFAULT_STATE, DEFAULT_PSEUDO_MEMORY } from "./config.js";
import { getMode, getVenomLevel } from "./modes.js";

function cloneDefaultState() {
  const clone = typeof structuredClone === "function" ? structuredClone(DEFAULT_STATE) : JSON.parse(JSON.stringify(DEFAULT_STATE));
  clone.createdAt = new Date().toISOString();
  return clone;
}

function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeMessages(messages) {
  return Array.isArray(messages)
    ? messages
        .filter((message) => message && ["user", "assistant", "system"].includes(message.role) && typeof message.content === "string")
        .map((message) => ({ id: message.id || createId(), role: message.role, content: message.content, createdAt: message.createdAt || new Date().toISOString() }))
    : [];
}

function normalizePseudoMemory(memory = {}) {
  return { ...DEFAULT_PSEUDO_MEMORY, ...memory };
}

function normalizeSettings(settings = {}) {
  const nextSettings = {};
  const modeAliases = { rewrite: "destroy-text", "send-away": "go-away", "fake-help": "pretend-help", "plan-action": "action-plan" };
  const activeMode = modeAliases[settings.activeMode] || settings.activeMode;
  if (activeMode && getMode(activeMode).id === activeMode) nextSettings.activeMode = activeMode;
  if (settings.venomLevel && getVenomLevel(settings.venomLevel).value === Number(settings.venomLevel)) nextSettings.venomLevel = Number(settings.venomLevel);
  if (settings.pseudoMemory) nextSettings.pseudoMemory = normalizePseudoMemory(settings.pseudoMemory);
  return nextSettings;
}

function readStateFromStorage() {
  const keys = [APP_CONFIG.storageKey, ...(APP_CONFIG.legacyStorageKeys || [])];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  }
  return null;
}

export function loadState() {
  try {
    const parsed = readStateFromStorage();
    if (!parsed) return cloneDefaultState();
    const settings = normalizeSettings(parsed.settings || parsed);
    return { ...cloneDefaultState(), ...parsed, ...settings, messages: normalizeMessages(parsed.messages), pseudoMemory: normalizePseudoMemory(parsed.pseudoMemory || settings.pseudoMemory) };
  } catch (error) {
    console.warn("Agripine n'a pas réussi à lire le stockage local.", error);
    return cloneDefaultState();
  }
}

export function saveState(state) {
  const nextState = {
    messages: normalizeMessages(state.messages),
    venomLevel: Number(state.venomLevel) || DEFAULT_STATE.venomLevel,
    activeMode: getMode(state.activeMode).id,
    pseudoMemory: normalizePseudoMemory(state.pseudoMemory),
    createdAt: state.createdAt || new Date().toISOString(),
    lastUsedAt: new Date().toISOString()
  };
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(nextState));
  localStorage.setItem(APP_CONFIG.memoryStorageKey, JSON.stringify(nextState.pseudoMemory));
  return nextState;
}

export function clearState() {
  localStorage.removeItem(APP_CONFIG.storageKey);
  localStorage.removeItem(APP_CONFIG.memoryStorageKey);
  localStorage.removeItem(APP_CONFIG.recentFragmentsKey);
  (APP_CONFIG.legacyStorageKeys || []).forEach((key) => localStorage.removeItem(key));
}

export function createMessage(role, content) {
  return { id: createId(), role, content, createdAt: new Date().toISOString() };
}

export function exportHistory(state) {
  const payload = {
    app: APP_CONFIG.name,
    version: APP_CONFIG.version,
    createdAt: state.createdAt || new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    venomLevel: state.venomLevel,
    activeMode: state.activeMode,
    settings: { venomLevel: state.venomLevel, activeMode: state.activeMode },
    pseudoMemory: normalizePseudoMemory(state.pseudoMemory),
    messages: normalizeMessages(state.messages).filter((message) => ["user", "assistant"].includes(message.role))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${APP_CONFIG.historyExportPrefix}-${APP_CONFIG.version.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importHistory(file) {
  const text = await file.text();
  return parseImportedState(JSON.parse(text));
}

export function parseImportedState(payload) {
  const messages = Array.isArray(payload) ? payload : payload.messages;
  if (!Array.isArray(messages)) throw new Error("Le fichier ne contient pas un historique Agripine valide.");
  const rawSettings = Array.isArray(payload) ? {} : { ...(payload.settings || {}), activeMode: payload.activeMode || payload.settings?.activeMode, venomLevel: payload.venomLevel || payload.settings?.venomLevel, pseudoMemory: payload.pseudoMemory };
  delete rawSettings.useWebLLM;
  delete rawSettings.provider;
  delete rawSettings.fallbackEnabled;
  delete rawSettings.selectedModel;
  delete rawSettings.lastSuccessfulModel;
  return { messages: normalizeMessages(messages).filter((message) => ["user", "assistant"].includes(message.role)), settings: normalizeSettings(rawSettings) };
}
