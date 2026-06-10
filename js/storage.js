import { APP_CONFIG, DEFAULT_STATE } from "./config.js";

function cloneDefaultState() {
  return typeof structuredClone === "function" ? structuredClone(DEFAULT_STATE) : JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export function loadState() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    return { ...cloneDefaultState(), ...parsed, messages: Array.isArray(parsed.messages) ? parsed.messages : [] };
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
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function exportHistory(messages) {
  const payload = {
    app: APP_CONFIG.name,
    version: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),
    messages
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
  const payload = JSON.parse(text);
  const messages = Array.isArray(payload) ? payload : payload.messages;

  if (!Array.isArray(messages)) {
    throw new Error("Le fichier ne contient pas un historique Agripine valide.");
  }

  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .map((message) => ({
      id: message.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt || new Date().toISOString()
    }));
}
