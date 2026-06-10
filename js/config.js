export const APP_CONFIG = {
  name: "Agripine",
  displayName: "AGRIPINE",
  version: "V0.3.0",
  storageKey: "agripine.v0.3.state",
  legacyStorageKeys: ["agripine.v0.2.state", "agripine.v0.1.state"],
  memoryStorageKey: "agripine.v0.3.pseudoMemory",
  recentFragmentsKey: "agripine.v0.3.recentFragments",
  historyExportPrefix: "agripine-historique",
  maxMessageLength: 1600,
  fakeThinking: {
    quickMinMs: 600,
    quickMaxMs: 900,
    theatricalMinMs: 1200,
    theatricalMaxMs: 2200
  }
};

export const DEFAULT_PSEUDO_MEMORY = {
  messageCount: 0,
  recentTopics: [],
  recentIntents: [],
  patienceLevel: 100,
  thanksCount: 0,
  shortMessageCount: 0,
  helpRequestCount: 0,
  currentMood: "contrariée",
  lastStructure: null,
  updatedAt: null
};

export const DEFAULT_STATE = {
  messages: [],
  venomLevel: 3,
  activeMode: "general",
  pseudoMemory: DEFAULT_PSEUDO_MEMORY,
  lastUsedAt: null,
  createdAt: null
};
