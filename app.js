import { APP_CONFIG, getModelConfig, isHeavyModel } from "./js/config.js";
import { generateAssistantResponse } from "./js/ai-engine.js";
import { loadRequiredModel, isWebLLMSupported, getModelStatus } from "./js/webllm-engine.js";
import { getBootLines } from "./js/chat-ui.js";
import {
  appendDebugLog,
  downloadDiagnostics,
  exportDebugLog,
  getPreviousCrashHint,
  installGlobalErrorHandlers,
  markGenerationFinished,
  markGenerationStarted
} from "./js/diagnostics.js";
import { getModelState, normalizeModelId, saveSelectedModel, subscribeModelState, clearModelStorage, setModelState } from "./js/model-state.js";
import { loadState, saveState, clearState, createMessage, exportHistory, importHistory } from "./js/storage.js";
import {
  appendMessage,
  autoResizeTextarea,
  getElements,
  renderBootScreen,
  renderCompactState,
  renderFatalModelError,
  renderMessages,
  renderModelPanel,
  renderModes,
  renderVenomSelect,
  setChatAvailability,
  setOptionsOpen,
  setThinking,
  setVersionText,
  showBoot,
  showChat,
  showStatus,
  updateMessage
} from "./js/chat-ui.js";

let state = loadState();
const elements = getElements();
let bootLineTimer = null;
let isGenerating = false;
let generationTimer = null;
let generationStartedAt = 0;

function persist(patch = {}) {
  state = saveState({ ...state, ...patch });
}

function renderControls() {
  const modelState = getModelState();
  renderModes(elements.modeButtons, state.activeMode);
  renderVenomSelect(elements.venomLevel, state.venomLevel);
  renderVenomSelect(elements.venomMiniLevel, state.venomLevel, { compact: true });
  renderCompactState(elements, state, modelState);
  renderModelPanel(elements, modelState, { isGenerating });
  if (isGenerating) setThinking(elements, true);
}

async function initialize() {
  setVersionText(elements);
  showBoot(elements);
  renderMessages(elements.messageList, state.messages);
  setChatAvailability(elements, false);
  renderControls();
  installGlobalErrorHandlers((message) => showStatus(elements, message));
  renderCrashHintIfNeeded();
  bindEvents();
  bindModelState();
  registerServiceWorker();
  startBootQuips();
  await bootWebLLM();
}

function bindModelState() {
  subscribeModelState((modelState) => {
    renderBootScreen(elements, modelState);
    renderCompactState(elements, state, modelState);
    renderModelPanel(elements, modelState, { isGenerating });
    if (modelState.status !== "ready") setChatAvailability(elements, false);
  });
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
    showStatus(elements, `Mode activé : ${button.title}. Agripine ajuste son poison.`);
    elements.messageInput.focus();
  });

  elements.venomLevel.addEventListener("change", () => updateVenom(Number(elements.venomLevel.value)));
  elements.venomMiniLevel.addEventListener("change", () => updateVenom(Number(elements.venomMiniLevel.value)));

  elements.modelSelect.addEventListener("change", () => {
    showStatus(elements, "Cerveau sélectionné. Clique sur “Changer de modèle” pour infliger ce choix au navigateur.");
  });
  elements.reloadModelButton.addEventListener("click", () => retryLoadModel(state.selectedModel));
  elements.changeModelButton.addEventListener("click", () => changeModel(elements.modelSelect.value));
  elements.exportDiagnosticButton?.addEventListener("click", () => {
    downloadDiagnostics(exportDebugLog({ modelState: getModelState(), crashHint: getPreviousCrashHint() }));
    showStatus(elements, "Diagnostic JSON exporté. Voilà de quoi nourrir le laboratoire.");
  });

  elements.fatalSelect.addEventListener("change", () => saveSelectedModel(elements.fatalSelect.value));
  elements.retryModelButton.addEventListener("click", () => retryLoadModel(elements.fatalSelect.value || state.selectedModel));
  elements.changeFatalModelButton.addEventListener("click", () => changeModel(elements.fatalSelect.value));
  elements.clearFatalDataButton.addEventListener("click", clearAllHistory);
  elements.homeFatalButton.addEventListener("click", () => retryLoadModel(state.selectedModel));

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
  }, 4200);
}

async function bootWebLLM(modelId = state.selectedModel) {
  if (isGenerating) {
    showStatus(elements, "Agripine réfléchit déjà. Ne secoue pas la cage.");
    return;
  }
  showBoot(elements);
  setChatAvailability(elements, false);

  if (!isWebLLMSupported()) {
    const errorMessage = "WebGPU indisponible. Ton navigateur refuse de porter mon cerveau local.";
    const unsupportedState = setModelState({ status: "unsupported", progressText: "WebGPU indisponible", progressValue: 0, lastError: errorMessage });
    renderFatalModelError(elements, unsupportedState, errorMessage);
    return;
  }

  try {
    const selectedModel = normalizeModelId(modelId);
    persist({ selectedModel });
    await loadRequiredModel(selectedModel);
    const loadedAt = getModelStatus().loadedAt || new Date().toISOString();
    persist({ selectedModel, lastSuccessfulModel: selectedModel, lastModelLoadedAt: loadedAt });
    renderChatReady();
  } catch (error) {
    renderFatalModelError(elements, getModelState(), error?.message);
  }
}

function renderChatReady() {
  clearInterval(bootLineTimer);
  showChat(elements);
  setChatAvailability(elements, true);
  showStatus(elements, "Agripine est prête. L’humanité peut recommencer à se ridiculiser.");

  const readyAlreadyVisible = state.messages.some((message) => message.role === "system" && message.content.includes("Agripine est prête"));
  if (!readyAlreadyVisible) {
    const systemMessage = createMessage("system", "Agripine est prête. L’humanité peut recommencer à se ridiculiser.");
    persist({ messages: [...state.messages, systemMessage] });
    appendMessage(elements.messageList, systemMessage);
  }

  requestAnimationFrame(() => elements.messageInput.focus());
}

async function retryLoadModel(modelId) {
  if (isGenerating) {
    showStatus(elements, "Agripine réfléchit déjà. Ne secoue pas la cage.");
    return;
  }
  const selectedModel = normalizeModelId(modelId);
  const modelConfig = getModelConfig(selectedModel);
  if (isHeavyModel(selectedModel) && !confirm(modelConfig.warning || "Ce modèle est plus lourd et peut faire planter le navigateur. Continuer ?")) {
    showStatus(elements, "Rechargement lourd annulé. Étonnamment raisonnable.");
    return;
  }
  await bootWebLLM(selectedModel);
}

async function changeModel(modelId) {
  if (isGenerating) {
    showStatus(elements, "Agripine réfléchit déjà. Ne secoue pas la cage.");
    return;
  }
  const selectedModel = normalizeModelId(modelId);
  const modelConfig = getModelConfig(selectedModel);
  if (isHeavyModel(selectedModel) && !confirm(modelConfig.warning || "Ce modèle est plus lourd et peut faire planter le navigateur. Continuer ?")) {
    elements.modelSelect.value = state.selectedModel;
    showStatus(elements, "Choix lourd annulé. Le navigateur vient d’éviter une séance de cardio.");
    return;
  }
  persist({ selectedModel });
  saveSelectedModel(selectedModel);
  await bootWebLLM(selectedModel);
}

function updateVenom(venomLevel) {
  persist({ venomLevel });
  renderControls();
  showStatus(elements, "Niveau de venin sauvegardé. Mauvais présage, bon réglage.");
  elements.messageInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();
  const modelState = getModelState();
  if (isGenerating) {
    showStatus(elements, "Agripine réfléchit déjà. Ne secoue pas la cage.");
    return;
  }
  if (modelState.status !== "ready") {
    showStatus(elements, "Patience. Même une IA hostile a besoin de charger ses circuits.");
    return;
  }

  const text = elements.messageInput.value.trim();
  if (!text) {
    showStatus(elements, "Un message vide. Audacieux. Inutile, mais audacieux.");
    elements.messageInput.focus();
    return;
  }

  if (text.length > APP_CONFIG.webLLMConfig.maxUserMessageLength) {
    showStatus(elements, `Trop long. ${APP_CONFIG.webLLMConfig.maxUserMessageLength} caractères maximum pour cette V0.2.1, tragédie comprise.`);
    elements.messageInput.focus();
    return;
  }

  const previousMessages = state.messages.filter((message) => ["user", "assistant"].includes(message.role));
  const userMessage = createMessage("user", text);
  persist({ messages: [...state.messages, userMessage] });
  appendMessage(elements.messageList, userMessage);
  elements.messageInput.value = "";
  autoResizeTextarea(elements.messageInput);
  isGenerating = true;
  generationStartedAt = Date.now();
  setThinking(elements, true);
  renderControls();
  startGenerationTimer();

  const assistantMessage = createMessage("assistant", "");
  let appendedAssistant = false;

  try {
    markGenerationStarted({
      model: getModelState().selectedModel,
      modeId: state.activeMode,
      venomLevel: state.venomLevel,
      messageLength: text.length,
      historyCount: previousMessages.length,
      useStreaming: APP_CONFIG.webLLMConfig.useStreaming,
      maxAssistantTokens: APP_CONFIG.webLLMConfig.maxAssistantTokens
    });

    const result = await generateAssistantResponse({
      text,
      modeId: state.activeMode,
      venomLevel: state.venomLevel,
      messages: previousMessages,
      onToken: (_delta, fullText) => {
        if (!appendedAssistant) {
          appendMessage(elements.messageList, assistantMessage);
          appendedAssistant = true;
        }
        assistantMessage.content = fullText;
        updateMessage(elements.messageList, assistantMessage.id, fullText);
      }
    });

    assistantMessage.content = result.content || "Mon cerveau local vient de produire du vide. Même moi je trouve ça vexant.";
    if (!appendedAssistant) appendMessage(elements.messageList, assistantMessage);
    else updateMessage(elements.messageList, assistantMessage.id, assistantMessage.content);
    persist({ messages: [...state.messages, assistantMessage] });
  } catch (error) {
    console.error(error);
    appendDebugLog("generation_error", error);
    const errorMessage = createMessage("assistant", "Mon cerveau local vient de trébucher dans ses propres câbles. Réessaie, mammifère persistant.");
    persist({ messages: [...state.messages, errorMessage] });
    appendMessage(elements.messageList, errorMessage);
    showStatus(elements, "Génération échouée. Le cerveau local assume sa chute.");
  } finally {
    markGenerationFinished();
    isGenerating = false;
    stopGenerationTimer();
    setThinking(elements, false);
    setChatAvailability(elements, getModelState().status === "ready");
    renderControls();
    elements.messageInput.focus();
  }
}

function startNewConversation() {
  if (isGenerating) {
    showStatus(elements, "Agripine réfléchit déjà. Ne secoue pas la cage.");
    return;
  }
  if (state.messages.length && !confirm("Vider la conversation actuelle ? Tu peux l’exporter avant si tu veux garder cette brillante catastrophe.")) return;
  persist({ messages: [] });
  renderMessages(elements.messageList, state.messages);
  showStatus(elements, "Conversation vidée. Nouveau désastre, même mammifère.");
  elements.messageInput.focus();
}

function clearAllHistory() {
  if (isGenerating && !confirm("Agripine génère encore. Effacer maintenant peut laisser un diagnostic de crash. Continuer malgré tout ?")) return;
  if (!confirm("Effacer toutes les données locales d’Agripine : conversation, modèle choisi, mode actif et niveau de venin ? Action irréversible, comme certaines réunions.")) return;
  clearState();
  clearModelStorage();
  state = loadState();
  renderControls();
  renderMessages(elements.messageList, state.messages);
  setOptionsOpen(elements, false);
  showStatus(elements, "Données locales effacées. Agripine nie toute implication.");
  bootWebLLM(state.selectedModel);
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
    if (imported.settings.selectedModel && imported.settings.selectedModel !== getModelState().selectedModel) {
      if (!isGenerating) await changeModel(imported.settings.selectedModel);
    }
  } catch (error) {
    console.error(error);
    appendDebugLog("import_error", error);
    showStatus(elements, "Import impossible : fichier invalide ou trop honteux pour être lu.");
  } finally {
    event.target.value = "";
    elements.messageInput.focus();
  }
}

function renderCrashHintIfNeeded() {
  const crashHint = getPreviousCrashHint();
  if (!crashHint) return;
  const systemMessage = createMessage("system", `${crashHint.message} Diagnostic conservé dans Options > Diagnostic technique.`);
  persist({ messages: [...state.messages, systemMessage] });
  appendMessage(elements.messageList, systemMessage);
  showStatus(elements, "Redémarrage pendant génération détecté : probable crash WebGPU/mémoire.");
}

function startGenerationTimer() {
  stopGenerationTimer();
  generationTimer = window.setInterval(() => {
    const elapsed = Math.floor((Date.now() - generationStartedAt) / 1000);
    showStatus(
      elements,
      elapsed > 45
        ? `Génération en cours depuis ${elapsed} s. Génération longue. Ne ferme pas l’onglet. Oui, je sais, c’est pénible.`
        : `Génération en cours depuis ${elapsed} s. Agripine réfléchit avec son cerveau local.`
    );
  }, 1000);
}

function stopGenerationTimer() {
  if (generationTimer) window.clearInterval(generationTimer);
  generationTimer = null;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("Service worker non enregistré.", error);
  });
}

initialize();
