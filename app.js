import { APP_CONFIG } from "./js/config.js";
import { analyzeInput, generateAgripineResponse, getFakeThinkingSequence, resetPseudoMemory } from "./js/simulated-ai-engine.js";
import { loadState, saveState, clearState, createMessage, exportHistory, importHistory } from "./js/storage.js";
import {
  appendMessage,
  autoResizeTextarea,
  getBootLines,
  getElements,
  renderBootScreen,
  renderCompactState,
  renderMessages,
  renderModes,
  setChatAvailability,
  setOptionsOpen,
  setThinking,
  setVersionText,
  showBoot,
  showChat,
  showStatus
} from "./js/chat-ui.js";

let state = loadState();
const elements = getElements();
let bootLineTimer = null;
let isGenerating = false;

function persist(patch = {}) {
  state = saveState({ ...state, ...patch });
}

function renderControls() {
  renderModes(elements.modeButtons, state.activeMode);
  renderCompactState(elements, state);
  if (isGenerating) setThinking(elements, true);
}

async function initialize() {
  setVersionText(elements);
  showBoot(elements);
  renderBootScreen(elements);
  renderMessages(elements.messageList, state.messages);
  setChatAvailability(elements, false);
  renderControls();
  bindEvents();
  registerServiceWorker();
  startBootQuips();
  await bootLocalHostility();
}

function bindEvents() {
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
    showStatus(elements, `Mode activé : ${button.textContent}. Agripine ajuste son poison.`);
    elements.messageInput.focus();
  });

  elements.resetMoodButton.addEventListener("click", resetMood);
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

function startBootQuips() {
  const lines = getBootLines();
  let index = 0;
  elements.bootQuip.textContent = lines[index];
  clearInterval(bootLineTimer);
  bootLineTimer = window.setInterval(() => {
    index = (index + 1) % lines.length;
    elements.bootQuip.textContent = lines[index];
  }, 950);
}

async function bootLocalHostility() {
  showBoot(elements);
  renderBootScreen(elements);
  await sleep(420);
  clearInterval(bootLineTimer);
  showChat(elements);
  setChatAvailability(elements, true);
  showStatus(elements, "IA hostile prête. Mépris actif.");
  const readyAlreadyVisible = state.messages.some((message) => message.role === "system" && (message.content.includes("Agripine est réveillée") || message.content.includes("IA hostile prête")));
  if (!readyAlreadyVisible) {
    const systemMessage = createMessage("system", "Agripine est réveillée. Mauvaise nouvelle pour l’humanité.");
    persist({ messages: [...state.messages, systemMessage] });
    appendMessage(elements.messageList, systemMessage);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isGenerating) {
    showStatus(elements, "Agripine analyse déjà. Ne secoue pas la cage.");
    return;
  }

  const text = elements.messageInput.value.trim();
  if (!text) {
    showStatus(elements, "Un message vide. Audacieux. Inutile, mais audacieux.");
    elements.messageInput.focus();
    return;
  }

  if (text.length > APP_CONFIG.maxMessageLength) {
    showStatus(elements, `Trop long. ${APP_CONFIG.maxMessageLength} caractères maximum pour cette ${APP_CONFIG.version}, tragédie comprise.`);
    elements.messageInput.focus();
    return;
  }

  const userMessage = createMessage("user", text);
  persist({ messages: [...state.messages, userMessage] });
  appendMessage(elements.messageList, userMessage);
  elements.messageInput.value = "";
  autoResizeTextarea(elements.messageInput);
  isGenerating = true;
  setThinking(elements, true);
  renderControls();

  try {
    const analysis = analyzeInput(text);
    await playThinkingSequence(getFakeThinkingSequence(analysis), analysis.safety.isSensitive);
    const result = await generateAgripineResponse(text, { activeMode: state.activeMode, pseudoMemory: state.pseudoMemory });
    const assistantMessage = createMessage("assistant", result.content || "Vide local. Même mon mépris n’a rien trouvé.");
    persist({ messages: [...state.messages, assistantMessage], pseudoMemory: result.pseudoMemory });
    appendMessage(elements.messageList, assistantMessage);
    showStatus(elements, "Réponse lâchée. Ramasse les morceaux.");
  } catch (error) {
    console.error(error);
    const errorMessage = createMessage("assistant", "Mon moteur local simulé a trébuché. C’est rare, vexant, et probablement lié à ton aura de tableur.");
    persist({ messages: [...state.messages, errorMessage] });
    appendMessage(elements.messageList, errorMessage);
    showStatus(elements, "Génération locale échouée. Agripine boude, mais reste hors ligne.");
  } finally {
    isGenerating = false;
    setThinking(elements, false);
    setChatAvailability(elements, true);
    renderControls();
    elements.messageInput.focus();
  }
}

async function playThinkingSequence(sequence, sober = false) {
  const min = sober ? APP_CONFIG.fakeThinking.quickMinMs : APP_CONFIG.fakeThinking.quickMinMs;
  const max = sober ? APP_CONFIG.fakeThinking.quickMaxMs : APP_CONFIG.fakeThinking.theatricalMaxMs;
  const total = min + Math.random() * (max - min);
  const stepDelay = total / Math.max(sequence.length, 1);
  for (const line of sequence) {
    showStatus(elements, sober ? "Lecture prudente…" : line);
    await sleep(stepDelay);
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function startNewConversation() {
  if (isGenerating) {
    showStatus(elements, "Agripine analyse déjà. Ne secoue pas la cage.");
    return;
  }
  if (state.messages.length && !confirm("Vider la conversation actuelle ? Tu peux l’exporter avant si tu veux garder cette brillante catastrophe.")) return;
  persist({ messages: [] });
  renderMessages(elements.messageList, state.messages);
  showStatus(elements, "Conversation vidée. Nouveau désastre, même mammifère.");
  elements.messageInput.focus();
}

function clearAllHistory() {
  if (isGenerating && !confirm("Agripine génère encore. Effacer maintenant ?")) return;
  if (!confirm("Effacer toutes les données locales d’Agripine : conversation, humeur et mode actif ?")) return;
  clearState();
  state = loadState();
  renderControls();
  renderMessages(elements.messageList, state.messages);
  setOptionsOpen(elements, false);
  showStatus(elements, "Données locales effacées. Agripine nie toute implication.");
}

function resetMood() {
  const pseudoMemory = resetPseudoMemory();
  persist({ pseudoMemory });
  renderControls();
  showStatus(elements, "Humeur réinitialisée. Agripine fait semblant de repartir sans rancune.");
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
