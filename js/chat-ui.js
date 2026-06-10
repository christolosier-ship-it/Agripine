import { APP_CONFIG } from "./config.js";
import { MODES, VENOM_LEVELS, getMode, getVenomLevel } from "./modes.js";

const BOOT_LINES = [
  "Noyau de contrariété actif.",
  "Analyse comportementale approximative prête.",
  "Tri des excuses recyclables en arrière-plan.",
  "IA hostile prête, sans serveur et sans abonnement, miracle agaçant.",
  "Agripine aiguise ses réponses locales. Rien ne sort d’ici. Dommage pour les témoins."
];

export function getElements() {
  return {
    bootScreen: document.querySelector("#bootScreen"),
    chatScreen: document.querySelector("#chatScreen"),
    bootQuip: document.querySelector("#bootQuip"),
    bootVersion: document.querySelector("#bootVersion"),
    bootStatus: document.querySelector("#bootStatus"),
    bootModel: document.querySelector("#bootModel"),
    bootProgress: document.querySelector("#bootProgress"),
    bootProgressText: document.querySelector("#bootProgressText"),
    appVersion: document.querySelector("#appVersion"),
    modelNote: document.querySelector("#modelNote"),
    activeModeBadge: document.querySelector("#activeModeBadge"),
    brainBadge: document.querySelector("#brainBadge"),
    venomCompactLabel: document.querySelector("#venomCompactLabel"),
    venomMiniLevel: document.querySelector("#venomMiniLevel"),
    optionsToggle: document.querySelector("#optionsToggle"),
    optionsPanel: document.querySelector("#optionsPanel"),
    modeButtons: document.querySelector("#modeButtons"),
    venomLevel: document.querySelector("#venomLevel"),
    memoryDiagnostic: document.querySelector("#memoryDiagnostic"),
    resetMoodButton: document.querySelector("#resetMoodButton"),
    messageList: document.querySelector("#messageList"),
    messageForm: document.querySelector("#messageForm"),
    messageInput: document.querySelector("#messageInput"),
    sendButton: document.querySelector("#sendButton"),
    statusLine: document.querySelector("#statusLine"),
    newChatButton: document.querySelector("#newChatButton"),
    clearHistoryButton: document.querySelector("#clearHistoryButton"),
    exportButton: document.querySelector("#exportButton"),
    importInput: document.querySelector("#importInput")
  };
}

export function setVersionText(elements) {
  const text = `Version : Agripine ${APP_CONFIG.version}`;
  elements.bootVersion.textContent = text;
  elements.appVersion.textContent = text;
  elements.modelNote.textContent = "Agripine est une IA parodique hostile. En V0.3.0, elle utilise un moteur conversationnel local simulé : aucune API, aucun serveur, aucun modèle génératif. Elle ne comprend pas vraiment le monde. Elle le juge quand même.";
}

export function getBootLines() {
  return BOOT_LINES;
}

export function showBoot(elements) {
  elements.bootScreen.classList.remove("is-hidden");
  elements.chatScreen.classList.add("is-hidden");
}

export function showChat(elements) {
  elements.bootScreen.classList.add("is-hidden");
  elements.chatScreen.classList.remove("is-hidden");
  requestAnimationFrame(() => elements.messageInput.focus());
}

export function renderBootScreen(elements) {
  elements.bootStatus.textContent = "Noyau de contrariété actif";
  elements.bootModel.textContent = "Hostilité locale : prête";
  elements.bootProgress.value = 100;
  elements.bootProgressText.textContent = "100%";
}

export function renderCompactState(elements, state) {
  const mode = getMode(state.activeMode);
  const venom = getVenomLevel(state.venomLevel);
  elements.activeModeBadge.textContent = `Mode : ${mode.shortLabel}`;
  elements.activeModeBadge.title = mode.label;
  elements.venomCompactLabel.textContent = `Venin ${venom.value}`;
  elements.brainBadge.textContent = "Noyau : hostilité locale";
  if (elements.memoryDiagnostic) {
    const memory = state.pseudoMemory || {};
    elements.memoryDiagnostic.textContent = [
      `Messages : ${memory.messageCount || 0}`,
      `Humeur : ${memory.currentMood || "contrariée"}`,
      `Patience : ${memory.patienceLevel ?? 100}/100`,
      `Intentions récentes : ${(memory.recentIntents || []).join(", ") || "aucune"}`,
      `Sujets récents : ${(memory.recentTopics || []).join(", ") || "aucun"}`
    ].join("\n");
  }
}

export function setOptionsOpen(elements, isOpen) {
  if (isOpen) elements.optionsPanel.hidden = false;
  elements.optionsPanel.classList.toggle("is-collapsed", !isOpen);
  elements.optionsToggle.setAttribute("aria-expanded", String(isOpen));
  elements.optionsToggle.textContent = isOpen ? "Fermer" : "Options";
  if (!isOpen) elements.optionsPanel.hidden = true;
}

export function renderModes(container, activeMode) {
  container.innerHTML = "";
  MODES.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mode-button${mode.id === activeMode ? " is-active" : ""}`;
    button.dataset.mode = mode.id;
    button.title = mode.description;
    button.textContent = mode.label;
    container.append(button);
  });
}

export function renderVenomSelect(select, currentValue, { compact = false } = {}) {
  select.innerHTML = "";
  VENOM_LEVELS.forEach((level) => {
    const option = document.createElement("option");
    option.value = String(level.value);
    option.textContent = compact ? String(level.value) : level.label;
    option.selected = level.value === Number(currentValue);
    select.append(option);
  });
}

export function renderMessages(container, messages) {
  container.innerHTML = "";
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>Aucune conversation.</strong><span>IA hostile prête. Écris quelque chose : le désastre mérite une réponse.</span>";
    container.append(empty);
    return;
  }
  messages.forEach((message) => container.append(createMessageNode(message)));
  container.scrollTop = container.scrollHeight;
}

export function appendMessage(container, message) {
  const empty = container.querySelector(".empty-state");
  if (empty) empty.remove();
  container.append(createMessageNode(message));
  container.scrollTop = container.scrollHeight;
}

export function updateMessage(container, messageId, content) {
  const node = Array.from(container.querySelectorAll(".message")).find((message) => message.dataset.messageId === messageId);
  const bubble = node?.querySelector(".message-bubble");
  if (bubble) {
    bubble.textContent = content;
    container.scrollTop = container.scrollHeight;
  }
}

function createMessageNode(message) {
  const article = document.createElement("article");
  article.className = `message message--${message.role}`;
  article.dataset.messageId = message.id;
  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = message.role === "user" ? "Toi, pauvre optimiste" : message.role === "system" ? "Système Agripine" : "Agripine";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message.content;
  article.append(meta, bubble);
  return article;
}

export function setChatAvailability(elements, isReady) {
  elements.sendButton.disabled = !isReady;
  elements.messageInput.disabled = !isReady;
  elements.messageInput.placeholder = isReady ? "Dépose ta demande ici. Elle sera jugée, puis traitée." : "Agripine prépare son hostilité locale.";
}

export function setThinking(elements, isThinking) {
  elements.sendButton.disabled = isThinking;
  elements.messageInput.disabled = isThinking;
  elements.venomLevel.disabled = isThinking;
  elements.venomMiniLevel.disabled = isThinking;
  elements.modeButtons.querySelectorAll("button").forEach((button) => { button.disabled = isThinking; });
  elements.statusLine.classList.toggle("is-thinking", isThinking);
}

export function showStatus(elements, text) {
  elements.statusLine.textContent = text;
}

export function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
}
