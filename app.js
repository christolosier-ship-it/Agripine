import { APP_CONFIG } from "./js/config.js";
import { persona, randomFrom } from "./js/persona.js";
import { generateFallbackResponse } from "./js/fallback-engine.js";
import { loadState, saveState, clearState, createMessage, exportHistory, importHistory } from "./js/storage.js";
import {
  appendMessage,
  autoResizeTextarea,
  getElements,
  renderCompactState,
  renderMessages,
  renderModes,
  renderVenomSelect,
  setOptionsOpen,
  setThinking,
  setVersionText,
  showChat,
  showStatus
} from "./js/chat-ui.js";

let state = loadState();
const elements = getElements();

function persist(patch = {}) {
  state = saveState({ ...state, ...patch });
}

function renderControls() {
  renderModes(elements.modeButtons, state.activeMode);
  renderVenomSelect(elements.venomLevel, state.venomLevel);
  renderVenomSelect(elements.venomMiniLevel, state.venomLevel, { compact: true });
  renderCompactState(elements, state);
}

function initialize() {
  elements.welcomeQuip.textContent = randomFrom(persona.welcomeLines);
  setVersionText(elements);
  renderControls();
  renderMessages(elements.messageList, state.messages);
  bindEvents();
  registerServiceWorker();
}

function bindEvents() {
  elements.wakeButton.addEventListener("click", () => showChat(elements));

  elements.optionsToggle.addEventListener("click", () => {
    const isOpen = elements.optionsToggle.getAttribute("aria-expanded") === "true";
    setOptionsOpen(elements, !isOpen);
    if (!isOpen) requestAnimationFrame(() => elements.modeButtons.querySelector("button")?.focus());
  });

  elements.activeModeBadge.addEventListener("click", () => {
    setOptionsOpen(elements, true);
    requestAnimationFrame(() => elements.modeButtons.querySelector(".is-active")?.focus());
  });

  elements.modeButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mode]");
    if (!button) return;
    persist({ activeMode: button.dataset.mode });
    renderControls();
    showStatus(elements, `Mode activé : ${button.title}. Agripine ajuste son poison.`);
    elements.messageInput.focus();
  });

  elements.venomLevel.addEventListener("change", () => updateVenom(Number(elements.venomLevel.value)));
  elements.venomMiniLevel.addEventListener("change", () => updateVenom(Number(elements.venomMiniLevel.value)));

  elements.messageInput.addEventListener("input", () => autoResizeTextarea(elements.messageInput));
  elements.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && window.matchMedia("(min-width: 760px)").matches) {
      event.preventDefault();
      elements.messageForm.requestSubmit();
    }
  });

  elements.messageForm.addEventListener("submit", handleSubmit);
  elements.newChatButton.addEventListener("click", startNewConversation);
  elements.clearHistoryButton.addEventListener("click", clearAllHistory);
  elements.exportButton.addEventListener("click", () => exportHistory(state));
  elements.importInput.addEventListener("change", handleImport);
}

function updateVenom(venomLevel) {
  persist({ venomLevel });
  renderControls();
  showStatus(elements, "Niveau de venin sauvegardé. Mauvais présage, bon réglage.");
  elements.messageInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();
  const text = elements.messageInput.value.trim();
  if (!text) {
    showStatus(elements, "Un message vide. Audacieux. Inutile, mais audacieux.");
    elements.messageInput.focus();
    return;
  }

  if (text.length > APP_CONFIG.maxMessageLength) {
    showStatus(elements, `Trop long. ${APP_CONFIG.maxMessageLength} caractères maximum pour cette V0.1.1, tragédie comprise.`);
    elements.messageInput.focus();
    return;
  }

  const userMessage = createMessage("user", text);
  const messages = [...state.messages, userMessage];
  persist({ messages });
  appendMessage(elements.messageList, userMessage);
  elements.messageInput.value = "";
  autoResizeTextarea(elements.messageInput);
  setThinking(elements, true);

  window.setTimeout(() => {
    const content = generateFallbackResponse({
      text,
      modeId: state.activeMode,
      venomLevel: state.venomLevel
    });
    const assistantMessage = createMessage("assistant", content);
    persist({ messages: [...state.messages, assistantMessage] });
    appendMessage(elements.messageList, assistantMessage);
    setThinking(elements, false);
    elements.messageInput.focus();
  }, APP_CONFIG.typingDelayMs + Math.min(text.length * 4, 700));
}

function startNewConversation() {
  if (state.messages.length && !confirm("Vider la conversation actuelle ? Tu peux l’exporter avant si tu veux garder cette brillante catastrophe.")) return;
  persist({ messages: [] });
  renderMessages(elements.messageList, state.messages);
  showStatus(elements, "Conversation vidée. Nouveau désastre, même mammifère.");
  elements.messageInput.focus();
}

function clearAllHistory() {
  if (!confirm("Effacer toutes les données locales d’Agripine : conversation, mode actif et niveau de venin ? Action irréversible, comme certaines réunions.")) return;
  clearState();
  state = loadState();
  renderControls();
  renderMessages(elements.messageList, state.messages);
  setOptionsOpen(elements, false);
  showStatus(elements, "Données locales effacées. Agripine nie toute implication.");
  elements.messageInput.focus();
}

async function handleImport(event) {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const imported = await importHistory(file);
    persist({ messages: imported.messages, ...imported.settings });
    renderControls();
    renderMessages(elements.messageList, state.messages);
    showStatus(elements, "Import réussi. Ton passé revient, comme une mauvaise réunion.");
  } catch (error) {
    console.error(error);
    showStatus(elements, "Import impossible : fichier invalide ou trop honteux pour être lu.");
  } finally {
    event.target.value = "";
    elements.messageInput.focus();
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("Service worker non enregistré.", error);
  });
}

initialize();
