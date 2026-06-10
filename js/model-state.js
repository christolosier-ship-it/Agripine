import { APP_CONFIG } from "./config.js";

const VALID_STATUSES = new Set(["checking", "unsupported", "loading-library", "loading-model", "ready", "error"]);
const config = APP_CONFIG.webLLMConfig;
const listeners = new Set();

let state = {
  status: "checking",
  selectedModel: getStoredSelectedModel(),
  progressText: "Vérification WebGPU…",
  progressValue: 0,
  lastError: null,
  loadedAt: null
};

function isKnownModel(modelId) {
  return config.availableModels.some((model) => model.id === modelId);
}

export function getModelLabel(modelId = state.selectedModel) {
  return config.availableModels.find((model) => model.id === modelId)?.label || modelId || config.defaultModel;
}

export function getShortModelLabel(modelId = state.selectedModel) {
  if (!modelId) return "modèle inconnu";
  if (modelId.includes("Llama-3.2-1B")) return "Llama 3.2 1B";
  if (modelId.includes("Llama-3.2-3B")) return "Llama 3.2 3B";
  if (modelId.includes("Phi-3.5")) return "Phi 3.5 mini";
  return getModelLabel(modelId).split(" - ")[0];
}

export function normalizeModelId(modelId) {
  return isKnownModel(modelId) ? modelId : config.defaultModel;
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Lecture modèle local impossible.", error);
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Sauvegarde modèle local impossible.", error);
  }
}

export function getStoredSelectedModel() {
  return normalizeModelId(readStorage(config.selectedModelStorageKey));
}

export function getLastSuccessfulModel() {
  return normalizeModelId(readStorage(config.lastSuccessfulModelStorageKey));
}

export function saveSelectedModel(modelId) {
  const selectedModel = normalizeModelId(modelId);
  writeStorage(config.selectedModelStorageKey, selectedModel);
  setModelState({ selectedModel });
  return selectedModel;
}

export function saveLastSuccessfulModel(modelId) {
  const successfulModel = normalizeModelId(modelId);
  writeStorage(config.lastSuccessfulModelStorageKey, successfulModel);
  return successfulModel;
}

export function getModelState() {
  return { ...state };
}

export function setModelState(patch = {}) {
  const next = { ...state, ...patch };
  if (!VALID_STATUSES.has(next.status)) next.status = state.status;
  state = next;
  listeners.forEach((listener) => listener(getModelState()));
  return getModelState();
}

export function subscribeModelState(listener) {
  listeners.add(listener);
  listener(getModelState());
  return () => listeners.delete(listener);
}

export function resetModelState(modelId = state.selectedModel) {
  return setModelState({
    status: "checking",
    selectedModel: normalizeModelId(modelId),
    progressText: "Vérification WebGPU…",
    progressValue: 0,
    lastError: null,
    loadedAt: null
  });
}

export function clearModelStorage() {
  try {
    localStorage.removeItem(config.selectedModelStorageKey);
    localStorage.removeItem(config.lastSuccessfulModelStorageKey);
  } catch (error) {
    console.warn("Effacement modèle local impossible.", error);
  }
  resetModelState(config.defaultModel);
}
