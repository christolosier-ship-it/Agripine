import { APP_CONFIG } from "./config.js";
import { appendDebugLog } from "./diagnostics.js";
import {
  getModelState,
  normalizeModelId,
  saveLastSuccessfulModel,
  saveSelectedModel,
  setModelState
} from "./model-state.js";

let webllmModule = null;
let engine = null;
let engineWorker = null;
let loadedModelId = null;
let loadingPromise = null;
let generationInProgress = false;

function simplifyError(error) {
  const message = error?.message || String(error || "Erreur inconnue");
  if (/worker/i.test(message)) return `Worker WebLLM impossible : ${message}`;
  if (/webgpu|gpu/i.test(message)) return "WebGPU indisponible ou refusé par le navigateur.";
  if (/memory|allocation|out of memory|oom/i.test(message)) return "Mémoire insuffisante : ce modèle est probablement trop lourd pour cet appareil.";
  if (/network|fetch|import|load|cdn/i.test(message)) return "Chargement impossible : réseau, CDN ou cache navigateur capricieux.";
  return message;
}

export function isWebLLMSupported() {
  return typeof navigator !== "undefined" && Boolean(navigator.gpu);
}

export function isModelGenerating() {
  return generationInProgress;
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

function createEngineWorker() {
  if (engineWorker) return engineWorker;
  if (typeof Worker === "undefined") {
    throw new Error("Web Worker indisponible dans ce navigateur.");
  }
  try {
    engineWorker = new Worker(new URL("../workers/webllm-worker.js", import.meta.url), { type: "module" });
    engineWorker.addEventListener("error", (event) => {
      appendDebugLog("webllm_worker_error", { message: event.message, filename: event.filename, line: event.lineno });
    });
    engineWorker.addEventListener("messageerror", (event) => {
      appendDebugLog("webllm_worker_message_error", { data: String(event.data || "") });
    });
    return engineWorker;
  } catch (error) {
    appendDebugLog("webllm_worker_create_failed", error);
    throw new Error(`Worker WebLLM impossible à créer. WebLLM reste obligatoire : ${error?.message || error}`);
  }
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

async function releaseCurrentEngine() {
  const previousEngine = engine;
  engine = null;
  loadedModelId = null;

  try {
    if (previousEngine?.unload) await previousEngine.unload();
    else if (previousEngine?.dispose) await previousEngine.dispose();
    else if (previousEngine?.terminate) await previousEngine.terminate();
    else appendDebugLog("webllm_engine_no_dispose_method", { message: "Aucune méthode unload/dispose/terminate détectée." });
  } catch (error) {
    appendDebugLog("webllm_engine_release_failed", error);
  }

  if (engineWorker) {
    try {
      engineWorker.terminate();
    } catch (error) {
      appendDebugLog("webllm_worker_terminate_failed", error);
    }
    engineWorker = null;
  }
}

export async function loadRequiredModel(modelId = getModelState().selectedModel) {
  const selectedModel = normalizeModelId(modelId);
  saveSelectedModel(selectedModel);

  if (generationInProgress) {
    throw new Error("Changement ou rechargement refusé : Agripine réfléchit déjà. Ne secoue pas la cage.");
  }

  if (!isWebLLMSupported()) {
    const error = new Error("WebGPU indisponible. Ton navigateur refuse de porter mon cerveau local.");
    setModelState({ status: "unsupported", selectedModel, progressText: "WebGPU indisponible", progressValue: 0, lastError: error.message });
    throw error;
  }

  if (engine && loadedModelId === selectedModel && getModelState().status === "ready") {
    return engine;
  }

  if (loadingPromise) {
    if (getModelState().selectedModel === selectedModel) return loadingPromise;
    throw new Error("Un chargement WebLLM est déjà en cours. Attends la fin avant de changer de cerveau.");
  }

  loadingPromise = (async () => {
    try {
      setModelState({ status: "loading-library", selectedModel, progressText: "WebGPU OK. Téléchargement du sarcasme moteur…", progressValue: 0.02, lastError: null });
      const webllm = await loadWebLLMLibrary();
      if (!webllm.CreateWebWorkerMLCEngine) {
        if (!APP_CONFIG.webLLMConfig.allowMainThreadEngineDebug) {
          throw new Error("CreateWebWorkerMLCEngine indisponible dans WebLLM. Mode main-thread désactivé en V0.2.1.");
        }
        appendDebugLog("webllm_main_thread_debug_enabled", { selectedModel });
      }

      if (engine && loadedModelId !== selectedModel) await releaseCurrentEngine();

      setModelState({ status: "loading-model", selectedModel, progressText: `Chargement du modèle : ${selectedModel}`, progressValue: 0.08, lastError: null });

      const worker = createEngineWorker();
      engine = webllm.CreateWebWorkerMLCEngine
        ? await webllm.CreateWebWorkerMLCEngine(worker, selectedModel, { initProgressCallback: handleProgress })
        : await webllm.CreateMLCEngine(selectedModel, { initProgressCallback: handleProgress });

      loadedModelId = selectedModel;
      const loadedAt = new Date().toISOString();
      saveLastSuccessfulModel(selectedModel);
      appendDebugLog("webllm_model_ready", { selectedModel, worker: Boolean(webllm.CreateWebWorkerMLCEngine) });
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
      await releaseCurrentEngine();
      const simplified = simplifyError(error);
      appendDebugLog("webllm_load_failed", { selectedModel, error: simplified });
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
  if (generationInProgress) {
    throw new Error("Agripine réfléchit déjà. Ne secoue pas la cage.");
  }

  generationInProgress = true;
  const request = {
    messages,
    temperature: APP_CONFIG.webLLMConfig.temperatureByVenom[Number(venomLevel)] || APP_CONFIG.webLLMConfig.temperatureByVenom[3],
    top_p: APP_CONFIG.webLLMConfig.topP,
    max_tokens: APP_CONFIG.webLLMConfig.maxAssistantTokens,
    stream: false
  };

  try {
    // Chemin principal V0.2.1 : génération non-streaming pour limiter les crashs WebGPU/mobiles.
    if (!APP_CONFIG.webLLMConfig.useStreaming || !stream) {
      appendDebugLog("webllm_generation_request", {
        model: loadedModelId,
        messageCount: messages.length,
        maxTokens: request.max_tokens,
        stream: false
      });
      const completion = await engine.chat.completions.create(request);
      return (completion?.choices?.[0]?.message?.content || "").trim();
    }

    // Streaming désactivé en V0.2.1 pour stabilisation mobile.
    // Quand il reviendra, il devra être throttlé (80–120 ms), sans sanitize ni validation à chaque chunk.
    throw new Error("Streaming WebLLM désactivé en V0.2.1.");
  } finally {
    generationInProgress = false;
  }
}

export async function resetModelChat() {
  if (generationInProgress) throw new Error("Reset refusé : génération en cours.");
  if (engine?.resetChat) await engine.resetChat();
}
