import { APP_CONFIG } from "./config.js";
import {
  getModelState,
  normalizeModelId,
  saveLastSuccessfulModel,
  saveSelectedModel,
  setModelState
} from "./model-state.js";

let webllmModule = null;
let engine = null;
let loadedModelId = null;
let loadingPromise = null;

function simplifyError(error) {
  const message = error?.message || String(error || "Erreur inconnue");
  if (/webgpu|gpu/i.test(message)) return "WebGPU indisponible ou refusé par le navigateur.";
  if (/memory|allocation|out of memory|oom/i.test(message)) return "Mémoire insuffisante : ce modèle est probablement trop lourd pour cet appareil.";
  if (/network|fetch|import|load/i.test(message)) return "Chargement impossible : réseau, CDN ou cache navigateur capricieux.";
  return message;
}

export function isWebLLMSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.gpu);
}

export function getModelStatus() {
  return getModelState();
}

export function getLoadProgress() {
  const { progressText, progressValue } = getModelState();
  return { progressText, progressValue };
}

async function loadWebLLMLibrary() {
  if (webllmModule) return webllmModule;
  setModelState({ status: "loading-library", progressText: "Chargement de WebLLM…", progressValue: 0.04, lastError: null });
  webllmModule = await import(APP_CONFIG.webLLMConfig.importUrl);
  return webllmModule;
}

function handleProgress(progress) {
  const rawText = progress?.text || progress?.progressText || "Chargement du modèle…";
  const progressValue = typeof progress?.progress === "number" ? Math.max(0.05, Math.min(1, progress.progress)) : undefined;
  setModelState({
    status: "loading-model",
    progressText: `Chargement du modèle : ${rawText}`,
    ...(progressValue === undefined ? {} : { progressValue })
  });
}

export async function loadRequiredModel(modelId = getModelState().selectedModel) {
  const selectedModel = normalizeModelId(modelId);
  saveSelectedModel(selectedModel);

  if (!isWebLLMSupported()) {
    const error = new Error("WebGPU indisponible. Ton navigateur refuse de porter mon cerveau local.");
    setModelState({ status: "unsupported", selectedModel, progressText: "WebGPU indisponible", progressValue: 0, lastError: error.message });
    throw error;
  }

  if (engine && loadedModelId === selectedModel && getModelState().status === "ready") {
    return engine;
  }

  if (loadingPromise && getModelState().selectedModel === selectedModel) return loadingPromise;

  loadingPromise = (async () => {
    try {
      setModelState({ status: "loading-library", selectedModel, progressText: "WebGPU OK. Téléchargement du sarcasme moteur…", progressValue: 0.02, lastError: null });
      const webllm = await loadWebLLMLibrary();
      setModelState({ status: "loading-model", selectedModel, progressText: `Chargement du modèle : ${selectedModel}`, progressValue: 0.08, lastError: null });

      engine = await webllm.CreateMLCEngine(selectedModel, {
        initProgressCallback: handleProgress
      });
      loadedModelId = selectedModel;
      const loadedAt = new Date().toISOString();
      saveLastSuccessfulModel(selectedModel);
      setModelState({
        status: "ready",
        selectedModel,
        progressText: "Modèle prêt. Le mépris local est opérationnel.",
        progressValue: 1,
        lastError: null,
        loadedAt
      });
      return engine;
    } catch (error) {
      engine = null;
      loadedModelId = null;
      const simplified = simplifyError(error);
      setModelState({ status: "error", selectedModel, progressText: "Erreur de chargement WebLLM", progressValue: 0, lastError: simplified });
      throw new Error(simplified);
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export async function generateWithModel({ messages, venomLevel, stream = APP_CONFIG.webLLMConfig.useStreaming, onToken }) {
  if (!engine || getModelState().status !== "ready") {
    throw new Error("Modèle WebLLM indisponible : Agripine refuse de simuler une fausse IA.");
  }

  const request = {
    messages,
    temperature: APP_CONFIG.webLLMConfig.temperatureByVenom[Number(venomLevel)] || APP_CONFIG.webLLMConfig.temperatureByVenom[3],
    top_p: APP_CONFIG.webLLMConfig.topP,
    max_tokens: APP_CONFIG.webLLMConfig.maxAssistantTokens,
    stream
  };

  if (stream) {
    let fullText = "";
    try {
      const chunks = await engine.chat.completions.create(request);
      for await (const chunk of chunks) {
        const delta = chunk?.choices?.[0]?.delta?.content || "";
        if (!delta) continue;
        fullText += delta;
        onToken?.(delta, fullText);
      }
      return fullText.trim();
    } catch (streamError) {
      console.warn("Streaming WebLLM échoué, tentative non-streaming.", streamError);
    }
  }

  const completion = await engine.chat.completions.create({ ...request, stream: false });
  return (completion?.choices?.[0]?.message?.content || "").trim();
}

export async function resetModelChat() {
  if (engine?.resetChat) await engine.resetChat();
}
