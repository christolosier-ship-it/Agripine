import { APP_CONFIG } from "./config.js";
import { MODES, VENOM_LEVELS } from "./modes.js";

export function getElements() {
  return {
    welcomeScreen: document.querySelector("#welcomeScreen"),
    chatScreen: document.querySelector("#chatScreen"),
    welcomeQuip: document.querySelector("#welcomeQuip"),
    wakeButton: document.querySelector("#wakeButton"),
    welcomeVersion: document.querySelector("#welcomeVersion"),
    appVersion: document.querySelector("#appVersion"),
    modeButtons: document.querySelector("#modeButtons"),
    venomLevel: document.querySelector("#venomLevel"),
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
  elements.welcomeVersion.textContent = text;
  elements.appVersion.textContent = text;
}

export function showChat(elements) {
  elements.welcomeScreen.classList.add("is-hidden");
  elements.chatScreen.classList.remove("is-hidden");
  requestAnimationFrame(() => elements.messageInput.focus());
}

export function renderModes(container, activeMode) {
  container.innerHTML = "";
  MODES.filter((mode) => mode.id !== "general").forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-chip";
    button.dataset.mode = mode.id;
    button.title = mode.description;
    button.textContent = mode.label;
    button.setAttribute("aria-pressed", String(mode.id === activeMode));
    if (mode.id === activeMode) button.classList.add("is-active");
    container.append(button);
  });
}

export function renderVenomSelect(select, selectedValue) {
  select.innerHTML = "";
  VENOM_LEVELS.forEach((level) => {
    const option = document.createElement("option");
    option.value = String(level.value);
    option.textContent = level.label;
    option.selected = level.value === Number(selectedValue);
    select.append(option);
  });
}

export function renderMessages(container, messages) {
  container.innerHTML = "";

  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>Aucune conversation.</strong><span>Écris quelque chose. Agripine fera semblant de ne pas vouloir répondre.</span>";
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

function createMessageNode(message) {
  const article = document.createElement("article");
  article.className = `message message--${message.role}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = message.role === "user" ? "Toi, pauvre optimiste" : "Agripine";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message.content;

  article.append(meta, bubble);
  return article;
}

export function setThinking(elements, isThinking) {
  elements.sendButton.disabled = isThinking;
  elements.messageInput.disabled = isThinking;
  elements.statusLine.textContent = isThinking
    ? "Agripine rumine sa haine…"
    : "Agripine observe ton désordre en silence.";
  elements.statusLine.classList.toggle("is-thinking", isThinking);
}

export function showStatus(elements, text) {
  elements.statusLine.textContent = text;
}

export function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
}
