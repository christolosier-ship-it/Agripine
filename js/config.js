export const APP_CONFIG = {
  name: "Agripine",
  displayName: "AGRIPINE",
  version: "V0.3.2",
  storageKey: "agripine.v0.3.state",
  legacyStorageKeys: ["agripine.v0.2.state", "agripine.v0.1.state"],
  memoryStorageKey: "agripine.v0.3.pseudoMemory",
  recentFragmentsKey: "agripine.v0.3.recentFragments",
  historyExportPrefix: "agripine-historique",
  maxMessageLength: 1600,
  fakeThinking: {
    quickMinMs: 250,
    quickMaxMs: 500,
    theatricalMinMs: 500,
    theatricalMaxMs: 900
  }
};

export const DEFAULT_PSEUDO_MEMORY = {
  messageCount: 0,
  recentTopics: [],
  recentIntents: [],
  intentCounts: {},
  patienceLevel: 100,
  greetingCount: 0,
  thanksCount: 0,
  shortMessageCount: 0,
  helpRequestCount: 0,
  appIdeaCount: 0,
  currentMood: "mépris actif",
  lastStructure: null,
  updatedAt: null
};

export const DEFAULT_STATE = {
  messages: [],
  activeMode: "general",
  pseudoMemory: DEFAULT_PSEUDO_MEMORY,
  lastUsedAt: null,
  createdAt: null
};
