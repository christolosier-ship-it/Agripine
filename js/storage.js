import { APP_CONFIG, DEFAULT_STATE } from "./config.js";
import { getMode, getVenomLevel } from "./modes.js";

function cloneDefaultState() {
  return typeof structuredClone === "function" ? structuredClone(DEFAULT_STATE) : JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeMessages(messages) {
  return Array.isArray(messages)
    ? messages
        .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
        .map((message) => ({
          id: message.id || createId(),
          role: message.role,
          content: message.content,
          createdAt: message.createdAt || new Date().toISOString()
        }))
    : [];
}

function normalizeSettings(settings = {}) {
  const nextSettings = {};
  if (settings.activeMode && getMode(settings.activeMode).id === settings.activeMode) {
    nextSettings.activeMode = settings.activeMode;
  }
  if (settings.venomLevel && getVenomLevel(settings.venomLevel).value === Number(settings.venomLevel)) {
    nextSettings.venomLevel = Number(settings.venomLevel);
  }
  return nextSettings;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    return { ...cloneDefaultState(), ...parsed, messages: normalizeMessages(parsed.messages) };
  } catch (error) {
    console.warn("Agripine n'a pas réussi à lire le stockage local.", error);
    return cloneDefaultState();
  }
}

export function saveState(state) {
  const nextState = { ...state, lastUsedAt: new Date().toISOString() };
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(nextState));
  return nextState;
}

export function clearState() {
  localStorage.removeItem(APP_CONFIG.storageKey);
}

export function createMessage(role, content) {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function exportHistory(state) {
  const payload = {
    app: APP_CONFIG.name,
    version: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),
    settings: {
      venomLevel: state.venomLevel,
      activeMode: state.activeMode
    },
    messages: normalizeMessages(state.messages)
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${APP_CONFIG.historyExportPrefix}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importHistory(file) {
  const text = await file.text();
  return parseImportedState(JSON.parse(text));
}

export function parseImportedState(payload) {
  const messages = Array.isArray(payload) ? payload : payload.messages;

  if (!Array.isArray(messages)) {
    throw new Error("Le fichier ne contient pas un historique Agripine valide.");
  }

  const settings = Array.isArray(payload) ? {} : normalizeSettings(payload.settings || payload);
  return {
    messages: normalizeMessages(messages),
    settings
  };
}
