export const APP_CONFIG = {
  name: "Agripine",
  displayName: "AGRIPINE",
  version: "V0.2.0",
  storageKey: "agripine.v0.2.state",
  legacyStorageKeys: ["agripine.v0.1.state"],
  historyExportPrefix: "agripine-historique",
  typingDelayMs: 160,
  maxMessageLength: 4000,
  webLLMConfig: {
    required: true,
    autoLoadOnStartup: true,
    provider: "webllm",
    importUrl: "https://esm.run/@mlc-ai/web-llm",
    defaultModel: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    availableModels: [
      {
        id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        label: "Llama 3.2 1B - rapide / recommandé V0.2",
        default: true
      },
      {
        id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        label: "Llama 3.2 3B - plus lourd"
      },
      {
        id: "Phi-3.5-mini-instruct-q4f16_1-MLC-1k",
        label: "Phi 3.5 mini - alternative"
      }
    ],
    selectedModelStorageKey: "agripine:selectedModel",
    lastSuccessfulModelStorageKey: "agripine:lastSuccessfulModel",
    maxHistoryMessagesForModel: 12,
    maxUserMessageLength: 4000,
    maxAssistantTokens: 450,
    topP: 0.9,
    temperatureByVenom: {
      1: 0.55,
      2: 0.65,
      3: 0.75,
      4: 0.85,
      5: 0.95
    },
    useStreaming: true
  }
};

export const DEFAULT_STATE = {
  messages: [],
  venomLevel: 3,
  activeMode: "general",
  selectedModel: APP_CONFIG.webLLMConfig.defaultModel,
  lastSuccessfulModel: null,
  lastModelLoadedAt: null,
  lastUsedAt: null
};
