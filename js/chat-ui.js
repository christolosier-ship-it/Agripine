import { APP_CONFIG } from "./config.js";
import { MODES, VENOM_LEVELS, getMode, getVenomLevel } from "./modes.js";
import { getModelLabel, getShortModelLabel } from "./model-state.js";

const BOOT_LINES = [
  "Agripine télécharge son cerveau. Évite de cliquer partout comme un rongeur nerveux.",
  "Compilation des regrets numériques…",
  "Chargement du mépris local…",
  "Premier démarrage potentiellement long. Oui, même mon dédain a un poids.",
  "Le modèle arrive. Lentement. Comme toutes les décisions humaines."
];

export function getElements() {
  return {
    bootScreen: document.querySelector("#bootScreen"),
    chatScreen: document.querySelector("#chatScreen"),
    fatalScreen: document.querySelector("#fatalScreen"),
    bootQuip: document.querySelector("#bootQuip"),
    bootVersion: document.querySelector("#bootVersion"),
    bootStatus: document.querySelector("#bootStatus"),
    bootModel: document.querySelector("#bootModel"),
    bootProgress: document.querySelector("#bootProgress"),
    bootProgressText: document.querySelector("#bootProgressText"),
    fatalTitle: document.querySelector("#fatalTitle"),
    fatalText: document.querySelector("#fatalText"),
    fatalModel: document.querySelector("#fatalModel"),
    fatalSelect: document.querySelector("#fatalSelect"),
    fatalDetails: document.querySelector("#fatalDetails"),
    retryModelButton: document.querySelector("#retryModelButton"),
    changeFatalModelButton: document.querySelector("#changeFatalModelButton"),
    clearFatalDataButton: document.querySelector("#clearFatalDataButton"),
    homeFatalButton: document.querySelector("#homeFatalButton"),
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
    modelStatusLabel: document.querySelector("#modelStatusLabel"),
    currentModelLabel: document.querySelector("#currentModelLabel"),
    modelSelect: document.querySelector("#modelSelect"),
    reloadModelButton: document.querySelector("#reloadModelButton"),
    changeModelButton: document.querySelector("#changeModelButton"),
    modelDiagnostic: document.querySelector("#modelDiagnostic"),
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
  elements.modelNote.textContent = "WebLLM est obligatoire : aucune clé API, aucun serveur Agripine, vraie IA locale uniquement.";
}

export function getBootLines() {
  return BOOT_LINES;
}

export function showBoot(elements) {
  elements.bootScreen.classList.remove("is-hidden");
  elements.chatScreen.classList.add("is-hidden");
  elements.fatalScreen.classList.add("is-hidden");
}

export function showChat(elements) {
  elements.bootScreen.classList.add("is-hidden");
  elements.fatalScreen.classList.add("is-hidden");
  elements.chatScreen.classList.remove("is-hidden");
  requestAnimationFrame(() => elements.messageInput.focus());
}

export function showFatal(elements) {
  elements.bootScreen.classList.add("is-hidden");
  elements.chatScreen.classList.add("is-hidden");
  elements.fatalScreen.classList.remove("is-hidden");
}

export function renderBootScreen(elements, modelState) {
  elements.bootStatus.textContent = modelState.progressText || "Vérification WebGPU…";
  elements.bootModel.textContent = `Modèle : ${getModelLabel(modelState.selectedModel)}`;
  const value = Math.round((modelState.progressValue || 0) * 100);
  elements.bootProgress.value = value;
  elements.bootProgressText.textContent = `${value}%`;
}

export function renderFatalModelError(elements, modelState, message) {
  const unsupported = modelState.status === "unsupported";
  elements.fatalTitle.textContent = unsupported ? "WebGPU indisponible" : "Cerveau local en PLS";
  elements.fatalText.textContent = unsupported
    ? "Ton navigateur refuse de porter mon cerveau local. Agripine ne peut pas fonctionner ici en vraie IA."
    : "Le cerveau local s’est vautré pendant le chargement. Probablement un complot de ton navigateur ou de ta RAM. Choisis un modèle plus léger ou réessaie.";
  elements.fatalModel.textContent = `Modèle concerné : ${getModelLabel(modelState.selectedModel)}`;
  elements.fatalDetails.textContent = [
    `Statut : ${modelState.status}`,
    `Message : ${message || modelState.lastError || "Erreur inconnue"}`,
    `WebGPU : ${navigator.gpu ? "présent" : "absent"}`,
    `User agent : ${navigator.userAgent}`
  ].join("\n");
  renderModelSelect(elements.fatalSelect, modelState.selectedModel);
  showFatal(elements);
}

export function renderModes(container, activeMode) {
  container.innerHTML = "";
  MODES.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-chip";
    button.dataset.mode = mode.id;
    button.title = mode.description;
    button.setAttribute("aria-pressed", String(mode.id === activeMode));
    if (mode.id === activeMode) button.classList.add("is-active");

    const short = document.createElement("span");
    short.className = "label-short";
    short.textContent = mode.shortLabel;

    const long = document.createElement("span");
    long.className = "label-long";
    long.textContent = mode.label;

    button.append(short, long);
    container.append(button);
  });
}

export function renderVenomSelect(select, selectedValue, { compact = false } = {}) {
  select.innerHTML = "";
  VENOM_LEVELS.forEach((level) => {
    const option = document.createElement("option");
    option.value = String(level.value);
    option.textContent = compact ? String(level.value) : level.label;
    option.selected = level.value === Number(selectedValue);
    select.append(option);
  });
}

export function renderModelSelect(select, selectedModel) {
  select.innerHTML = "";
  APP_CONFIG.webLLMConfig.availableModels.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.label;
    option.selected = model.id === selectedModel;
    select.append(option);
  });
}

function humanModelStatus(status) {
  return {
    checking: "vérification WebGPU",
    unsupported: "WebGPU indisponible",
    "loading-library": "chargement WebLLM",
    "loading-model": "chargement modèle",
    ready: "prêt",
    error: "erreur"
  }[status] || status;
}

export function renderCompactState(elements, state, modelState) {
  const mode = getMode(state.activeMode);
  const venom = getVenomLevel(state.venomLevel);
  elements.activeModeBadge.textContent = `Mode : ${mode.shortLabel}`;
  elements.activeModeBadge.title = mode.label;
  elements.venomCompactLabel.textContent = `Venin ${venom.value}`;
  if (modelState.status === "ready") elements.brainBadge.textContent = `Cerveau : ${getShortModelLabel(modelState.selectedModel)}`;
  else if (modelState.status === "error" || modelState.status === "unsupported") elements.brainBadge.textContent = "Cerveau : erreur";
  else elements.brainBadge.textContent = "Cerveau : chargement…";
}

export function renderModelPanel(elements, modelState) {
  elements.modelStatusLabel.textContent = humanModelStatus(modelState.status);
  elements.currentModelLabel.textContent = getModelLabel(modelState.selectedModel);
  renderModelSelect(elements.modelSelect, modelState.selectedModel);
  elements.changeModelButton.disabled = modelState.status === "loading-library" || modelState.status === "loading-model";
  elements.reloadModelButton.disabled = modelState.status === "loading-library" || modelState.status === "loading-model";
  elements.modelDiagnostic.textContent = [
    `Statut : ${modelState.status}`,
    `Progression : ${Math.round((modelState.progressValue || 0) * 100)}%`,
    `Progression texte : ${modelState.progressText || "n/a"}`,
    `Modèle : ${modelState.selectedModel}`,
    `Chargé le : ${modelState.loadedAt || "jamais"}`,
    `Erreur : ${modelState.lastError || "aucune"}`,
    `WebGPU : ${navigator.gpu ? "présent" : "absent"}`
  ].join("\n");
}

export function setOptionsOpen(elements, isOpen) {
  if (isOpen) elements.optionsPanel.hidden = false;
  elements.optionsPanel.classList.toggle("is-collapsed", !isOpen);
  elements.optionsToggle.setAttribute("aria-expanded", String(isOpen));
  elements.optionsToggle.textContent = isOpen ? "Fermer" : "Options";

  if (!isOpen) elements.optionsPanel.hidden = true;
}

export function renderMessages(container, messages) {
  container.innerHTML = "";

  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>Aucune conversation.</strong><span>Le cerveau local est prêt. Écris quelque chose, le désastre mérite une réponse réelle.</span>";
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
  if (message.role === "user") meta.textContent = "Toi, pauvre optimiste";
  else if (message.role === "system") meta.textContent = "Système Agripine";
  else meta.textContent = "Agripine";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message.content;

  article.append(meta, bubble);
  return article;
}

export function setChatAvailability(elements, isReady) {
  elements.sendButton.disabled = !isReady;
  elements.messageInput.disabled = !isReady;
  elements.messageInput.placeholder = isReady
    ? "Dépose ta demande ici. Elle sera jugée, puis traitée."
    : "Agripine n’a pas encore fini de charger son mépris.";
}

export function setThinking(elements, isThinking) {
  elements.sendButton.disabled = isThinking;
  elements.messageInput.disabled = isThinking;
  elements.statusLine.textContent = isThinking
    ? "Agripine rumine avec son vrai cerveau local…"
    : "Agripine observe ton désordre en silence.";
  elements.statusLine.classList.toggle("is-thinking", isThinking);
}

export function showStatus(elements, text) {
  elements.statusLine.textContent = text;
}

export function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
}
