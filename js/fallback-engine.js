import { persona, randomFrom } from "./persona.js";
import { buildPromptContext } from "./prompt-builder.js";
import { detectSensitiveRequest, getSafetyRedirect, sanitizeTone } from "./safety-rules.js";

const KEYWORDS = {
  idea: ["idée", "concept", "app", "startup", "projet", "produit"],
  text: ["réécris", "reformule", "texte", "mail", "message", "copie", "corrige"],
  list: ["liste", "tri", "trie", "priorise", "éléments", "courses"],
  task: ["tâche", "todo", "faire", "deadline", "urgent", "retard"],
  organization: ["organisation", "bureau", "planning", "agenda", "fichiers", "chaos", "désordre"],
  help: ["aide", "comment", "peux-tu", "conseil", "solution"]
};

function includesAny(text, words) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function detectIntent(text) {
  const match = Object.entries(KEYWORDS).find(([, words]) => includesAny(text, words));
  return match ? match[0] : "general";
}

function stripListCommandPrefix(text) {
  return String(text || "")
    .replace(/^\s*(trie\s+cette\s+liste|tri|liste|à\s+trier)\s*[:\-–—]?\s*/i, "")
    .replace(/^\s*peux[-\s]?tu\s+trier\s+(cette\s+liste\s*)?[:\-–—]?\s*/i, "")
    .trim();
}

function splitListItems(text) {
  const cleaned = stripListCommandPrefix(text)
    .replace(/\r\n/g, "\n")
    .replace(/(^|\n)\s*[-*•]\s+/g, "\n")
    .replace(/(^|\n)\s*\d+[.)]\s+/g, "\n")
    .replace(/\s+\d+[.)]\s+/g, "\n");

  return cleaned
    .split(/\n|,|;/)
    .map((item) => item.replace(/^\s*[-*•]?\s*\d*[.)]?\s*/, "").trim())
    .filter((item) => item.length > 1)
    .slice(0, 12);
}

function stripRewriteCommandPrefix(text) {
  return String(text || "")
    .replace(/^\s*(réécris|reecris|reformule|corrige|améliore|rends plus clair)\s*(ce\s+texte\s*)?[:\-–—]?\s*/i, "")
    .trim();
}

function tidySentence(text) {
  const compact = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();

  if (!compact) return "";
  const capitalized = compact.charAt(0).toUpperCase() + compact.slice(1);
  return /[.!?…]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function looksLikeEmail(text) {
  return /\b(bonjour|salut|cordialement|mail|email|objet|merci|demande|réunion|rdv|rendez-vous)\b/i.test(text);
}

function venomOpening(level, almostPolite) {
  if (almostPolite) return "Très bien. Je vais rester presque aimable, effort héroïque.";
  const insult = randomFrom(persona.allowedCartoonInsults);
  const openings = {
    1: "Bon. Faisons court avant que ce problème ne prenne racine.",
    2: `Évidemment, ${insult}, il faut remettre un peu d’ordre là-dedans.`,
    3: `Encore un chantier mental. Respire, ${insult}, je sors la pelle.`,
    4: `Le tribunal de l’espèce humaine est ouvert, et ton dossier sent la procrastination humide.`,
    5: `Magnifique. Un feu de benne conceptuel servi tiède. Je vais quand même sauver ce qui clignote encore.`
  };
  return openings[level.value] || openings[3];
}

function finalBite(level, almostPolite) {
  if (almostPolite) return "Voilà. C’était presque agréable, ce qui est inquiétant.";
  const endings = {
    1: "Voilà. Sec, propre, presque civilisé.",
    2: "Maintenant applique ça avant que ton élan ne retourne hiberner.",
    3: "Ton plan respire encore. Faiblement, mais il respire.",
    4: "L’humanité ne sera pas sauvée aujourd’hui, mais ton bazar recule d’un centimètre.",
    5: "Imprime ça dans ton cortex organisationnel, ou colle-le sur le frigo de la honte."
  };
  return endings[level.value] || endings[3];
}

function buildIdeaResponse(text, context) {
  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Verdict : concept potentiellement utile, mais encore trop flou pour survivre hors d’un carnet de notes.",
    `Critique : ${text.length < 80 ? "tu n’as pas donné assez de matière, donc je dois deviner comme une voyante sous-payée." : "il faut clarifier la cible, la promesse et le moment où l’utilisateur comprend enfin pourquoi il devrait s’en servir."}`,
    "Amélioration concrète : formule l’idée en une phrase : “Pour [public], Agripine résout [douleur] grâce à [mécanique différenciante]”. Ensuite, teste la promesse sur trois cas réels.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

function buildRewriteResponse(text, context) {
  const cleaned = stripRewriteCommandPrefix(text) || text;
  const tidy = tidySentence(cleaned);
  const rewritten = looksLikeEmail(cleaned)
    ? ["Bonjour,", "", tidy, "", "Merci de me confirmer la suite à donner.", "", "Cordialement."].join("\n")
    : tidy;

  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Réécriture locale simulée :",
    `« ${rewritten} »`,
    "Note : c’est une reformulation V0.1.1 sans vraie IA. J’ai nettoyé, clarifié et ponctué, pas inventé une personnalité à ton texte.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

function buildListResponse(text, context) {
  const items = splitListItems(text);

  if (items.length < 2) {
    return [
      venomOpening(context.venom, context.mode.id === "almost-polite"),
      "Ta liste est trop floue pour être triée proprement. Une liste, idéalement, contient plusieurs éléments. Concept audacieux, je sais.",
      "Action recommandée : envoie au moins deux éléments séparés par des virgules, points-virgules, puces, retours ligne ou numéros.",
      finalBite(context.venom, context.mode.id === "almost-polite")
    ].join("\n\n");
  }

  const sample = items;
  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Tri simulé, mais utile :",
    `À garder : ${sample.filter((_, index) => index % 4 === 0).join(", ") || sample[0]}.`,
    `À améliorer : ${sample.filter((_, index) => index % 4 === 1).join(", ") || "les éléments vagues sans verbe d’action"}.`,
    `À supprimer : ${sample.filter((_, index) => index % 4 === 2).join(", ") || "les doublons et les ambitions décoratives"}.`,
    `À archiver : ${sample.filter((_, index) => index % 4 === 3).join(", ") || "ce qui ne sert pas cette semaine"}.`,
    "Action recommandée : transforme chaque élément gardé en tâche commençant par un verbe.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

function buildOrganizationResponse(text, context) {
  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Diagnostic : ton organisation ressemble probablement à une pile de bonnes intentions qui a pris l’eau.",
    "Remise en ordre : 1) capture tout au même endroit ; 2) jette ou archive ce qui ne sert pas ; 3) choisis trois priorités maximum ; 4) bloque un créneau réel ; 5) vérifie demain, pas dans une vie parallèle.",
    "Règle anti-chaos : si une tâche n’a ni verbe, ni date, ni responsable, ce n’est pas une tâche, c’est une décoration anxiogène.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

function buildActionPlanResponse(text, context) {
  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Plan d’action :",
    "1. Définis le résultat attendu en une phrase mesurable.",
    "2. Liste les contraintes réelles : temps, énergie, ressources, dépendances.",
    "3. Choisis la prochaine action physique réalisable en moins de 25 minutes.",
    "4. Programme un point de contrôle demain.",
    "5. Supprime une tâche secondaire, parce que ton agenda n’est pas un composteur magique.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

function buildGeneralResponse(text, context) {
  const intent = detectIntent(text);
  if (intent === "idea") return buildIdeaResponse(text, context);
  if (intent === "text") return buildRewriteResponse(text, context);
  if (intent === "list") return buildListResponse(text, context);
  if (intent === "organization" || intent === "task") return buildOrganizationResponse(text, context);

  return [
    venomOpening(context.venom, context.mode.id === "almost-polite"),
    "Analyse courte : ta demande est recevable, mais elle gagnerait à préciser le contexte, l’objectif et le format de sortie. Oui, les mots servent parfois.",
    "Action recommandée : réponds avec trois éléments : ce que tu veux obtenir, ce que tu as déjà essayé, et la contrainte principale. Je transformerai ça en réponse plus tranchante.",
    finalBite(context.venom, context.mode.id === "almost-polite")
  ].join("\n\n");
}

export function generateFallbackResponse({ text, modeId, venomLevel }) {
  if (detectSensitiveRequest(text)) {
    return getSafetyRedirect();
  }

  const context = buildPromptContext({ text, modeId, venomLevel });
  const almostPolite = context.mode.id === "almost-polite";
  const effectiveContext = almostPolite ? { ...context, venom: { ...context.venom, value: 1 } } : context;

  const byMode = {
    "judge-idea": buildIdeaResponse,
    rewrite: buildRewriteResponse,
    "sort-list": buildListResponse,
    "organization-roast": buildOrganizationResponse,
    "action-plan": buildActionPlanResponse,
    "almost-polite": buildGeneralResponse,
    general: buildGeneralResponse
  };

  const builder = byMode[context.mode.id] || buildGeneralResponse;
  return sanitizeTone(builder(text, effectiveContext), { almostPolite });
}
