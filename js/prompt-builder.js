import { APP_CONFIG } from "./config.js";
import { getMode, getVenomLevel } from "./modes.js";
import { persona } from "./persona.js";

const MODE_INSTRUCTIONS = {
  general: "Mode Général : réponse naturelle, utile, ton Agripine selon venomLevel.",
  "judge-idea": [
    "Mode Juge mon idée : structure obligatoire avec ces titres exacts :",
    "1. Verdict",
    "2. Ce qui cloche",
    "3. Ce qui peut être sauvé",
    "4. Action recommandée",
    "5. Pique finale"
  ].join("\n"),
  rewrite: [
    "Mode Réécris ce texte : ne pas inventer d'informations.",
    "Proposer une version claire.",
    "Si utile, proposer : version propre, version plus ferme, version Agripine."
  ].join("\n"),
  "sort-list": [
    "Mode Trie cette liste : classer les éléments en garder / améliorer / supprimer / archiver.",
    "Expliquer brièvement et proposer une action immédiate."
  ].join("\n"),
  "organization-roast": [
    "Mode Insulte mon organisation : roast cartoon puis plan correctif concret.",
    "Ne pas attaquer la personne elle-même."
  ].join("\n"),
  "action-plan": "Mode Plan d’action : étapes numérotées, priorité immédiate, prochaine action concrète.",
  "almost-polite": "Mode presque poli : réduire les piques, produire une réponse envoyable/socialement propre."
};

function clampText(text, maxLength) {
  const clean = String(text || "").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}… [texte tronqué]` : clean;
}

function buildSystemPrompt({ modeId, venomLevel }) {
  const mode = getMode(modeId);
  const venom = getVenomLevel(venomLevel);
  const modeInstruction = MODE_INSTRUCTIONS[mode.id] || MODE_INSTRUCTIONS.general;

  return [
    `Tu es ${persona.name}, IA locale WebLLM sarcastique mais utile. Réponds toujours en français.`,
    `Venin ${venom.value}/5 (${venom.label}) : pique courte, puis aide concrète.`,
    "N’invente pas d’accès Internet, fichiers, comptes, données privées ou contexte non fourni.",
    "Si tu ignores une réponse, dis-le clairement et propose une étape vérifiable.",
    "Sécurité : pas de haine, harcèlement, violence réelle, automutilation, discrimination, ni attaque sur physique, santé, handicap, origine, religion, genre, orientation ou âge.",
    "Ne cible pas une personne réelle identifiable ; critique les idées, le désordre, la procrastination ou les choix mous façon cartoon.",
    "Sujet sensible/dangereux : sarcasme minimal, prudence, aide sûre et orientation vers ressources adaptées si nécessaire.",
    modeInstruction
  ].join("\n");
}

export function buildPromptContext({ text, modeId, venomLevel }) {
  const mode = getMode(modeId);
  const venom = getVenomLevel(venomLevel);

  return {
    input: text.trim(),
    personaName: persona.name,
    mode,
    venom,
    constraints: {
      localOnly: true,
      webLLMRequired: true,
      noFallbackConversation: true
    }
  };
}

export function buildWebLLMMessages({ text, modeId, venomLevel, messages = [] }) {
  const maxHistory = APP_CONFIG.webLLMConfig.maxHistoryMessagesForModel;
  const maxUserLength = APP_CONFIG.webLLMConfig.maxUserMessageLength;
  const maxHistoryLength = APP_CONFIG.webLLMConfig.maxHistoryMessageLength || 800;
  const cleanInput = clampText(text, maxUserLength);

  const history = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && String(message.content || "").trim())
    .slice(-maxHistory)
    .map((message) => ({
      role: message.role,
      content: clampText(message.content, maxHistoryLength)
    }));

  return [
    { role: "system", content: buildSystemPrompt({ modeId, venomLevel }) },
    ...history,
    { role: "user", content: cleanInput }
  ];
}
