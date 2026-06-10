import { APP_CONFIG, DEFAULT_STATE } from "./config.js";
import { getMode, getVenomLevel } from "./modes.js";
import { normalizeModelId, saveLastSuccessfulModel, saveSelectedModel } from "./model-state.js";

function cloneDefaultState() {
  return typeof structuredClone === "function" ? structuredClone(DEFAULT_STATE) : JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function createId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeMessages(messages) {
  return Array.isArray(messages)
    ? messages
        .filter((message) => message && ["user", "assistant", "system"].includes(message.role) && typeof message.content === "string")
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
  if (settings.selectedModel) {
    nextSettings.selectedModel = normalizeModelId(settings.selectedModel);
  }
  if (settings.lastSuccessfulModel) {
    nextSettings.lastSuccessfulModel = normalizeModelId(settings.lastSuccessfulModel);
  }
  if (settings.lastModelLoadedAt) {
    nextSettings.lastModelLoadedAt = settings.lastModelLoadedAt;
  }
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
    return {
      ...cloneDefaultState(),
      ...parsed,
      ...settings,
      messages: normalizeMessages(parsed.messages),
      selectedModel: settings.selectedModel || normalizeModelId(parsed.selectedModel)
    };
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
    selectedModel: normalizeModelId(state.selectedModel),
    lastSuccessfulModel: state.lastSuccessfulModel ? normalizeModelId(state.lastSuccessfulModel) : null,
    lastModelLoadedAt: state.lastModelLoadedAt || null,
    lastUsedAt: new Date().toISOString()
  };
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(nextState));
  saveSelectedModel(nextState.selectedModel);
  if (nextState.lastSuccessfulModel) saveLastSuccessfulModel(nextState.lastSuccessfulModel);
  return nextState;
}

export function clearState() {
  localStorage.removeItem(APP_CONFIG.storageKey);
  (APP_CONFIG.legacyStorageKeys || []).forEach((key) => localStorage.removeItem(key));
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
      activeMode: state.activeMode,
      selectedModel: normalizeModelId(state.selectedModel)
    },
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

  if (!Array.isArray(messages)) {
    throw new Error("Le fichier ne contient pas un historique Agripine valide.");
  }

  const settings = Array.isArray(payload) ? {} : normalizeSettings(payload.settings || payload);
  delete settings.useWebLLM;
  delete settings.provider;
  delete settings.fallbackEnabled;

  return {
    messages: normalizeMessages(messages).filter((message) => ["user", "assistant"].includes(message.role)),
    settings
  };
}
