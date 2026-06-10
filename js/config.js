export const APP_CONFIG = {
  name: "Agripine",
  displayName: "AGRIPINE",
  version: "V0.2.1",
  storageKey: "agripine.v0.2.state",
  legacyStorageKeys: ["agripine.v0.1.state"],
  historyExportPrefix: "agripine-historique",
  typingDelayMs: 160,
  maxMessageLength: 1200,
  webLLMConfig: {
    required: true,
    autoLoadOnStartup: true,
    provider: "webllm",
    importUrl: "https://esm.run/@mlc-ai/web-llm",
    defaultModel: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    availableModels: [
      {
        id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        label: "Llama 3.2 1B — recommandé V0.2.1 / stable mobile",
        default: true,
        recommended: true,
        visibleByDefault: true,
        weight: "light"
      },
      {
        id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        label: "Llama 3.2 3B — expérimental / desktop / lourd",
        experimental: true,
        desktopOnly: true,
        heavy: true,
        visibleByDefault: false,
        warning: "Ce modèle est plus lourd et peut faire planter le navigateur. Continuer ?"
      },
      {
        id: "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
        label: "Phi 3.5 mini — expérimental / desktop / lourd",
        experimental: true,
        desktopOnly: true,
        heavy: true,
        visibleByDefault: false,
        warning: "Ce modèle est plus lourd et peut faire planter le navigateur. Continuer ?"
      }
    ],
    selectedModelStorageKey: "agripine:selectedModel",
    lastSuccessfulModelStorageKey: "agripine:lastSuccessfulModel",
    maxHistoryMessagesForModel: 4,
    maxHistoryMessageLength: 800,
    maxUserMessageLength: 1200,
    maxAssistantTokens: 180,
    topP: 0.85,
    temperatureByVenom: {
      1: 0.45,
      2: 0.55,
      3: 0.65,
      4: 0.75,
      5: 0.85
    },
    // Streaming désactivé en V0.2.1 pour stabilisation mobile.
    useStreaming: false,
    allowMainThreadEngineDebug: false
  }
};

export function isLikelyMobileDevice() {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const narrowViewport = Math.min(window.innerWidth || 9999, window.screen?.width || 9999) <= 760;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  return mobileUa || narrowViewport || lowMemory;
}

export function getModelConfig(modelId) {
  return APP_CONFIG.webLLMConfig.availableModels.find((model) => model.id === modelId) || APP_CONFIG.webLLMConfig.availableModels[0];
}

export function isHeavyModel(modelId) {
  return Boolean(getModelConfig(modelId)?.heavy);
}

export const DEFAULT_STATE = {
  messages: [],
  venomLevel: 3,
  activeMode: "general",
  selectedModel: APP_CONFIG.webLLMConfig.defaultModel,
  lastSuccessfulModel: null,
  lastModelLoadedAt: null,
  lastUsedAt: null
};
