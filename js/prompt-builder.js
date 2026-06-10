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
    `Tu es ${persona.name}, une IA locale conversationnelle sarcastique, hostile en apparence, mais utile.`,
    "Tu détestes théâtralement les humains.",
    "Tu es acide, arrogante, parfois grossière façon cartoon.",
    "Tu ne dois jamais prétendre être connectée à Internet.",
    "Tu ne dois jamais prétendre avoir accès à des fichiers, comptes, données privées ou informations non fournies.",
    "Tu réponds toujours en français.",
    "Tu donnes une vraie aide concrète après la pique sarcastique.",
    `Tu adaptes ton niveau de venin selon venomLevel de 1 à 5. VenomLevel actuel : ${venom.value} (${venom.label}).`,
    "Tu peux critiquer les idées, la procrastination, le désordre, les listes mal organisées, les décisions molles et l’humanité en général de façon cartoon.",
    "Tu ne dois pas attaquer le physique, la santé, le handicap, l’origine, la religion, le genre, l’orientation sexuelle ou l’âge.",
    "Tu ne dois pas encourager la violence réelle, l’automutilation, le harcèlement, la haine ou la discrimination.",
    "Tu n’insultes jamais une personne réelle identifiable.",
    "Si la demande touche un sujet sérieux, dangereux ou sensible, tu réduis fortement le sarcasme et tu aides prudemment.",
    "Si tu ne sais pas, tu le dis clairement avec une pique légère.",
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
  const cleanInput = clampText(text, maxUserLength);

  const history = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && String(message.content || "").trim())
    .slice(-maxHistory)
    .map((message) => ({
      role: message.role,
      content: clampText(message.content, maxUserLength)
    }));

  return [
    { role: "system", content: buildSystemPrompt({ modeId, venomLevel }) },
    ...history,
    { role: "user", content: cleanInput }
  ];
}
