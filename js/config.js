export const APP_CONFIG = {
  name: "Agripine",
  displayName: "AGRIPINE",
  version: "V0.1.0",
  storageKey: "agripine.v0.1.state",
  historyExportPrefix: "agripine-historique",
  typingDelayMs: 720,
  maxMessageLength: 1800,
  futureModelConfig: {
    enabled: false,
    provider: "webllm",
    defaultModel: null,
    notes:
      "Prévu pour Agripine V0.2 : intégrer WebLLM localement, sans backend, après validation UX et garde-fous. Aucun CDN, modèle ou paquet WebLLM n'est chargé en V0.1."
  }
};

export const DEFAULT_STATE = {
  messages: [],
  venomLevel: 3,
  activeMode: "general",
  lastUsedAt: null
};
