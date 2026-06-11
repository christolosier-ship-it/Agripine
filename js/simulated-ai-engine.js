import { APP_CONFIG, DEFAULT_PSEUDO_MEMORY } from "./config.js";
import { getMode } from "./modes.js";
import { PHRASEBANK } from "./phrasebank.js";
import { buildSafetyResponse, evaluateSafety, sanitizeHostileOutput } from "./safety-rules.js";

const RECENT_LIMIT = 30;
const INTERNAL_TRACE_RX = /\b(variante(?: locale)?|template|phrasebank|undefined|null)\b|\bfragment\b/i;
const rx = (words) => new RegExp(`\\b(${words.join("|")})\\b`, "i");
const KEYWORDS = {
  greeting: rx(["bonjour", "salut", "hello", "coucou", "bonsoir", "hey", "yo"]),
  thanks: rx(["merci", "thx", "thanks", "remercie"]),
  insult: /(nul|nulle|conne?|stupide|idiote?|merdique|tais-toi|ta gueule|va te faire voir|va te faire foutre|dégage|pourrie?|débile)/i,
  about: /(qui es[- ]?tu|tu es qui|parle[- ]moi de toi|présente[- ]toi|c.?est quoi agripine|qui est agripine|ton rôle|tu fais quoi)/i,
  sendAway: /(envoie[- ]?moi chier|envoie[- ]?moi bouler|envoie[- ]?moi balader|dis[- ]moi d.?aller me faire|fais[- ]moi dégager)/i,
  idea: rx(["idée", "idee", "concept", "avis", "juge", "juger", "pense", "opinion"]),
  app: rx(["app", "application", "pwa", "site", "écran", "ecran", "bouton", "mobile", "interface", "logiciel"]),
  project: rx(["projet", "lancer", "roadmap", "objectif", "livrable", "jalon", "deadline", "planning"]),
  work: rx(["travail", "mail", "email", "réunion", "reunion", "dossier", "client", "manager", "collègue", "fournisseur"]),
  code: rx(["code", "javascript", "html", "css", "bug", "fonction", "api", "console", "github", "pwa", "erreur"]),
  organization: rx(["organise", "organiser", "organisation", "journée", "journee", "tâche", "tache", "todo", "liste", "priorité", "priorite", "tri", "trie", "ranger", "planning"]),
  complaint: /(j.?en ai marre|ras le bol|ça m.?énerve|ca m.?enerve|insupportable|pénible|penible|je râle|je rale|ça me saoule|ca me saoule)/i,
  rewrite: /(réécris|reecris|reformule|corrige|améliore ce texte|ameliore ce texte|réécriture|reecriture|texte\s*:)/i,
  creative: rx(["histoire", "nom", "slogan", "créatif", "creatif", "poème", "poeme", "scène", "scene"]),
  help: rx(["aide", "aide-moi", "aider", "besoin", "conseil", "peux-tu", "tu peux"])
};

function loadMemory() {
  try {
    return { ...DEFAULT_PSEUDO_MEMORY, ...(JSON.parse(localStorage.getItem(APP_CONFIG.memoryStorageKey)) || {}) };
  } catch {
    return { ...DEFAULT_PSEUDO_MEMORY };
  }
}

function saveMemory(memory) {
  localStorage.setItem(APP_CONFIG.memoryStorageKey, JSON.stringify({ ...memory, updatedAt: new Date().toISOString() }));
}

function getRecentPhrases() {
  try {
    return JSON.parse(localStorage.getItem(APP_CONFIG.recentFragmentsKey)) || [];
  } catch {
    return [];
  }
}

function saveRecentPhrases(phrases) {
  localStorage.setItem(APP_CONFIG.recentFragmentsKey, JSON.stringify(phrases.slice(-RECENT_LIMIT)));
}

export function pickUnique(category, recentPhrases = getRecentPhrases()) {
  const values = PHRASEBANK[category] || PHRASEBANK.directRejections;
  const pool = values.filter((value) => !recentPhrases.includes(value));
  return (pool.length ? pool : values)[Math.floor(Math.random() * (pool.length ? pool.length : values.length))];
}

function listItems(text) {
  const prepared = String(text).replace(/^trie? cette liste\s*:?\s*/i, "");
  return prepared
    .split(/\n|;|,|•|- |\d+[.)]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2)
    .slice(0, 8);
}

function extractRewriteText(text) {
  return String(text).replace(/^(réécris|reecris|reformule|corrige|améliore ce texte|ameliore ce texte)\s*(ce texte)?\s*:?\s*/i, "").trim();
}

function extractKeywords(text) {
  return [...new Set(String(text).toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ0-9-]{4,}/gi) || [])]
    .filter((word) => !["avec", "pour", "dans", "cette", "faire", "plus", "comme", "mais", "donc", "quoi", "tout", "aide", "bonjour"].includes(word))
    .slice(0, 10);
}

export function detectTopics(input = "") {
  const text = String(input).toLowerCase();
  const topics = [];
  if (/plante|jardin|chlorophylle|potager|semis/.test(text)) topics.push("plantes");
  if (KEYWORDS.app.test(text)) topics.push("application");
  if (KEYWORDS.work.test(text)) topics.push("travail");
  if (KEYWORDS.code.test(text)) topics.push("code");
  if (KEYWORDS.organization.test(text)) topics.push("organisation");
  if (KEYWORDS.project.test(text)) topics.push("projet");
  if (KEYWORDS.creative.test(text)) topics.push("créatif");
  return [...new Set(topics)].slice(0, 5);
}

export function detectTone(input = "") {
  const text = String(input);
  if (evaluateSafety(text).isSensitive) return "sensitive";
  if (KEYWORDS.insult.test(text)) return "aggressive";
  if (/[!?]{2,}|[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ]{8,}/.test(text)) return "intense";
  if (KEYWORDS.thanks.test(text)) return "grateful";
  return "neutral";
}

export function detectIntent(input = "") {
  const text = String(input).trim();
  const safety = evaluateSafety(text);
  if (safety.isSensitive) return "sensitive_request";
  if (!text) return "empty";
  if (KEYWORDS.greeting.test(text) && text.length < 45) return "greeting";
  if (KEYWORDS.thanks.test(text) && text.length < 80) return "thanks";
  if (KEYWORDS.sendAway.test(text)) return "send_me_away";
  if (KEYWORDS.insult.test(text) && (/agripine|toi|ia|tu\s/i.test(text) || text.length < 80)) return "insult_agripine";
  if (KEYWORDS.about.test(text)) return "about_agripine";
  if (KEYWORDS.rewrite.test(text)) return "rewrite_text";
  if ((/\n|;|,|•|- |\d+[.)]/.test(text) && listItems(text).length >= 2) || /^trie? cette liste/i.test(text)) return "list_or_todo";
  if (KEYWORDS.app.test(text) && (KEYWORDS.idea.test(text) || /\b(créer|creer|faire|lancer|veux|voudrais)\b/i.test(text))) return "app_idea";
  if (KEYWORDS.idea.test(text)) return "idea_judgement";
  if (KEYWORDS.organization.test(text)) return "organization";
  if (KEYWORDS.project.test(text)) return "project";
  if (KEYWORDS.code.test(text)) return "technical";
  if (KEYWORDS.work.test(text)) return "work_message";
  if (KEYWORDS.complaint.test(text)) return "complaint";
  if (KEYWORDS.creative.test(text)) return "creative";
  if (text.includes("?") || /^(pourquoi|comment|quoi|qui|où|ou|quand)\b/i.test(text)) return "question";
  if (KEYWORDS.help.test(text)) return "generic_help";
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 3 || text.length < 18) return "short_input";
  if (!/[aeiouyàâéèêëîïôùûü]/i.test(text) || /(.)\1{5,}/.test(text)) return "nonsense";
  return "generic_help";
}

export function analyzeInput(input = "") {
  const cleanedText = String(input).trim().replace(/\s+/g, " ");
  const words = cleanedText ? cleanedText.split(/\s+/) : [];
  const detectedIntent = detectIntent(cleanedText);
  const detectedTopics = detectTopics(cleanedText);
  const detectedKeywords = extractKeywords(cleanedText);
  const items = listItems(String(input));
  return {
    cleanedText,
    wordCount: words.length,
    charCount: cleanedText.length,
    sentenceCount: cleanedText ? Math.max(1, cleanedText.split(/[.!?]+/).filter(Boolean).length) : 0,
    hasQuestion: cleanedText.includes("?"),
    hasList: items.length >= 2,
    hasGreeting: detectedIntent === "greeting",
    hasInsult: KEYWORDS.insult.test(cleanedText),
    hasThanks: detectedIntent === "thanks",
    hasIdea: KEYWORDS.idea.test(cleanedText),
    hasProject: KEYWORDS.project.test(cleanedText),
    hasWork: KEYWORDS.work.test(cleanedText),
    hasApp: KEYWORDS.app.test(cleanedText),
    hasCode: KEYWORDS.code.test(cleanedText),
    hasOrganization: KEYWORDS.organization.test(cleanedText),
    hasShortInput: detectedIntent === "short_input",
    hasLongInput: words.length > 70 || cleanedText.length > 420,
    detectedKeywords,
    detectedTopics,
    detectedIntent,
    detectedTone: detectTone(cleanedText),
    confidenceScore: Math.min(0.95, 0.35 + [detectedTopics.length, detectedKeywords.length, cleanedText.includes("?"), items.length].reduce((a, b) => a + Number(Boolean(b)), 0) * 0.13 + Math.min(words.length, 30) / 100),
    listItems: items,
    rewriteText: extractRewriteText(cleanedText),
    safety: evaluateSafety(cleanedText)
  };
}

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function chance(probability) {
  return Math.random() < probability;
}

function oneExpression(analysis) {
  const keyword = analysis.detectedKeywords?.[0];
  return keyword ? `“${keyword}”` : "ce brouillard";
}

function subjectNod(analysis) {
  const text = analysis.cleanedText.toLowerCase();
  if (analysis.hasApp || /app|application/.test(text)) return choose(["ton app", "ce bouton imaginaire", "ton écran", "ce menu hamburger", "ton repo à venir"]);
  if (analysis.hasOrganization || /journée|tâche|organisation/.test(text)) return choose(["ton planning", "ta liste", "tes trois trucs", "ce compost de tâches"]);
  if (analysis.detectedIntent === "rewrite_text" || /texte|réécris|reecris/.test(text)) return choose(["ton texte", "cette phrase", "ta honte syntaxique"]);
  if (analysis.hasCode || /code|bug/.test(text)) return choose(["ta console", "ce bug", "ton JavaScript", "cette erreur"]);
  if (analysis.hasQuestion) return "ta question";
  return oneExpression(analysis);
}

function usefulCrumb(analysis) {
  const items = analysis.listItems || [];
  if (analysis.detectedIntent === "rewrite_text") {
    const text = analysis.rewriteText || analysis.cleanedText;
    const improved = (text || "Bonjour, je ne pourrai pas venir demain")
      .replace(/bonjour\s*/i, "Bonjour, ")
      .replace(/je ne pourrais pas/i, "je ne pourrai pas")
      .replace(/\s+/g, " ")
      .replace(/,+/g, ",")
      .trim()
      .replace(/\.$/, "");
    return `Version moins honteuse : ${improved}.`;
  }
  if (analysis.detectedIntent === "list_or_todo") {
    const kept = items.slice(0, 2).join(" ; ") || "le seul truc qui bloque";
    return `Garde ${kept}. Le reste part dans la cave mentale.`;
  }
  if (analysis.hasApp) return "Une personne, un écran, un bouton. Le reste pue le repo abandonné.";
  if (analysis.hasOrganization) return "Choisis trois trucs, coupe le reste, et appelle ça un planning au lieu d’un marécage.";
  if (analysis.hasCode) return "Ouvre la console, reproduis le bug, lis l’erreur JavaScript avant de geindre.";
  if (analysis.hasWork || analysis.hasProject) return "Un résultat, une date, une prochaine action. Pas une cathédrale de brouillard.";
  if (analysis.detectedIntent === "about_agripine") return "Je fonctionne en local, sans vraie IA générative, et je méprise quand même très correctement.";
  if (analysis.hasQuestion) return `Reformule ${subjectNod(analysis)} en une phrase propre.`;
  return "Nomme le problème en une phrase, puis enlève la moitié du bruit.";
}

export function shouldGiveUsefulCrumb(analysis) {
  const odds = {
    greeting: 0,
    thanks: 0,
    insult_agripine: 0,
    send_me_away: 0,
    short_input: 0,
    about_agripine: 1,
    app_idea: 0.4,
    question: 0.3,
    organization: 0.45,
    rewrite_text: 0.6,
    list_or_todo: 0.6,
    technical: 0.5,
    generic_help: 0.25,
    complaint: 0.25
  };
  return chance(odds[analysis.detectedIntent] ?? 0.25);
}

function composeShort(parts, options = {}) {
  const maxParagraphs = options.maxParagraphs ?? 2;
  const separator = options.inline ? " " : "\n\n";
  const text = parts
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .slice(0, maxParagraphs)
    .join(separator)
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
  return text;
}

function hostileRefusal(analysis, memory, category = "directRefusals") {
  const insult = pickUnique("humanInsults");
  const nod = subjectNod(analysis);
  const memoryLine = memoryAside(memory, analysis);
  const formats = [
    () => composeShort([`Non. ${insult}. ${pickUnique("shortDismissals")}`], { inline: true }),
    () => composeShort([`${pickUnique("brutalOpeners")} ${nod} me fatigue. ${pickUnique("contemptClosers")}`], { inline: true }),
    () => composeShort([`Diagnostic : ${pickUnique(category)} Traitement : ${pickUnique("shortDismissals")}`], { inline: true }),
    () => composeShort([`${pickUnique("directRefusals")} ${pickUnique("contemptClosers")}`], { inline: true }),
    () => composeShort([`${memoryLine || pickUnique("brutalOpeners")} ${pickUnique("contemptClosers")}`], { inline: true })
  ];
  return choose(formats)();
}

function cap(text) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}

function hostileCrumb(analysis, memory, category = "brutalOpeners") {
  const formats = [
    () => composeShort([`${cap(pickUnique("humanInsults"))}. Voilà la miette utile : ${usefulCrumb(analysis)} Maintenant dégage.`], { inline: true }),
    () => composeShort([`${pickUnique(category)} ${usefulCrumb(analysis)}`], { inline: true }),
    () => composeShort([`Diagnostic : ${subjectNod(analysis)} boîte. Traitement : ${usefulCrumb(analysis)}`], { inline: true }),
    () => composeShort([`${memoryAside(memory, analysis) || pickUnique("brutalOpeners")} ${usefulCrumb(analysis)}`], { inline: true })
  ];
  return choose(formats)();
}

function respondWithGate(analysis, memory, category) {
  return shouldGiveUsefulCrumb(analysis) ? hostileCrumb(analysis, memory, category) : hostileRefusal(analysis, memory, category);
}

function memoryAside(memory, analysis) {
  const recentIntents = memory.recentIntents || [];
  if ((memory.appIdeaCount || 0) >= 1 && analysis.detectedIntent === "app_idea") return PHRASEBANK.memoryAsides.repeatedIdea;
  if ((memory.helpRequestCount || 0) >= 2 && ["generic_help", "question", "technical"].includes(analysis.detectedIntent)) return PHRASEBANK.memoryAsides.repeatedHelp;
  if ((memory.shortMessageCount || 0) >= 2 && analysis.detectedIntent === "short_input") return PHRASEBANK.memoryAsides.repeatedShort;
  if (recentIntents.filter((intent) => intent === analysis.detectedIntent).length >= 2) return PHRASEBANK.memoryAsides.repeatedIntent;
  if ((memory.patienceLevel || 100) < 55) return PHRASEBANK.memoryAsides.impatience;
  return "";
}

export function buildGreetingResponse(analysis, memory) {
  return composeShort([pickUnique("hostileGreetings"), "Maintenant crache ta demande avant que ma patience imaginaire parte en décharge."], { inline: true });
}

export function buildThanksResponse(analysis, memory) {
  return composeShort([pickUnique("thanksSlaps"), memoryAside(memory, analysis)], { inline: true });
}

export function buildInsultAgripineResponse(analysis, memory) {
  return composeShort([pickUnique("insultCounters"), memoryAside(memory, analysis)], { inline: true });
}

export function buildAboutAgripineResponse(analysis, memory) {
  return composeShort([pickUnique("aboutAgripineShort"), usefulCrumb(analysis)], { maxParagraphs: 2 });
}

export function buildSendMeAwayResponse(analysis, memory) {
  return composeShort([pickUnique("sendAwaySlaps"), memoryAside(memory, analysis)], { inline: true });
}

export function buildQuestionResponse(analysis, memory) {
  if (analysis.hasOrganization) return buildOrganizationResponse(analysis, memory);
  return respondWithGate(analysis, memory, "questionRefusals");
}

export function buildAppIdeaResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "appIdeaSlaps");
}

export function buildIdeaJudgementResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "appIdeaSlaps");
}

export function buildOrganizationResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "organizationSlaps");
}

export function buildRewriteResponse(analysis, memory) {
  return shouldGiveUsefulCrumb(analysis)
    ? composeShort([`${pickUnique("rewriteSlaps")} ${usefulCrumb(analysis)}`], { inline: true })
    : hostileRefusal(analysis, memory, "rewriteSlaps");
}

export function buildListResponse(analysis, memory) {
  return shouldGiveUsefulCrumb(analysis)
    ? composeShort([`${pickUnique("listSlaps")} ${usefulCrumb(analysis)}`], { inline: true })
    : hostileRefusal(analysis, memory, "listSlaps");
}

export function buildProjectResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "organizationSlaps");
}

export function buildTechnicalResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "directRefusals");
}

export function buildComplaintResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "directRefusals");
}

export function buildGenericHelpResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "directRefusals");
}

export function buildShortInputResponse(analysis, memory) {
  return composeShort([pickUnique("shortDismissals"), memoryAside(memory, analysis) || "Reviens avec une phrase, tas de brouillard."], { inline: true });
}

export function buildNonsenseResponse(analysis, memory) {
  return composeShort([pickUnique("shortDismissals"), "Même ton chaos manque de nerf."], { inline: true });
}

function buildWorkResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "organizationSlaps");
}

function buildCreativeResponse(analysis, memory) {
  return respondWithGate(analysis, memory, "directRefusals");
}

function buildModeOverride(analysis, memory, activeMode) {
  const mode = getMode(activeMode);
  if (analysis.detectedIntent === "sensitive_request") return null;
  if (mode.id === "go-away") return buildSendMeAwayResponse(analysis, memory);
  if (mode.id === "judge-idea") return buildIdeaJudgementResponse(analysis, memory);
  if (mode.id === "destroy-text") return buildRewriteResponse(analysis, memory);
  if (mode.id === "organization-roast") return buildOrganizationResponse(analysis, memory);
  if (mode.id === "pretend-help") return buildGenericHelpResponse(analysis, memory);
  if (mode.id === "off-topic") return composeShort([`${pickUnique("directRefusals")} Ta question mérite surtout le silence. Une étagère bancale vient de tousser.`], { inline: true });
  if (mode.id === "bad-plan") return composeShort([`${pickUnique("organizationSlaps")} Trois trucs, pas douze. Le reste au compost.`], { inline: true });
  if (mode.id === "vaguely-usable") return hostileCrumb(analysis, memory, "directRefusals");
  return null;
}

export function qualityGateResponse(response, fallbackBuilder) {
  const clean = sanitizeHostileOutput(String(response || "").replace(/[ \t]+\n/g, "\n").trim());
  if (clean && !INTERNAL_TRACE_RX.test(clean)) return clean;
  const fallback = typeof fallbackBuilder === "function" ? fallbackBuilder() : "Je refuse de produire cette sortie bancale. Reformule proprement et fais semblant d’avoir une méthode.";
  return sanitizeHostileOutput(String(fallback).replace(INTERNAL_TRACE_RX, "sortie douteuse").trim());
}

export function avoidRepetition(response) {
  const recent = getRecentPhrases();
  const paragraphs = String(response).split("\n\n").filter(Boolean);
  const adjusted = paragraphs.filter((paragraph) => !recent.includes(paragraph));
  const finalParagraphs = adjusted.length ? adjusted : [pickUnique("directRefusals"), pickUnique("contemptClosers")];
  saveRecentPhrases([...recent, ...finalParagraphs].slice(-RECENT_LIMIT));
  return finalParagraphs.join("\n\n");
}

export function buildResponse(analysis, context = {}) {
  const safetyResponse = buildSafetyResponse(analysis.cleanedText);
  if (safetyResponse) return safetyResponse;
  const memory = context.pseudoMemory || loadMemory();
  const modeOverride = buildModeOverride(analysis, memory, context.activeMode || context.modeId);
  const response = modeOverride || {
    empty: () => buildShortInputResponse(analysis, memory),
    greeting: () => buildGreetingResponse(analysis, memory),
    thanks: () => buildThanksResponse(analysis, memory),
    insult_agripine: () => buildInsultAgripineResponse(analysis, memory),
    about_agripine: () => buildAboutAgripineResponse(analysis, memory),
    send_me_away: () => buildSendMeAwayResponse(analysis, memory),
    rewrite_text: () => buildRewriteResponse(analysis, memory),
    list_or_todo: () => buildListResponse(analysis, memory),
    idea_judgement: () => buildIdeaJudgementResponse(analysis, memory),
    app_idea: () => buildAppIdeaResponse(analysis, memory),
    organization: () => buildOrganizationResponse(analysis, memory),
    project: () => buildProjectResponse(analysis, memory),
    technical: () => buildTechnicalResponse(analysis, memory),
    work_message: () => buildWorkResponse(analysis, memory),
    complaint: () => buildComplaintResponse(analysis, memory),
    creative: () => buildCreativeResponse(analysis, memory),
    question: () => buildQuestionResponse(analysis, memory),
    generic_help: () => buildGenericHelpResponse(analysis, memory),
    short_input: () => buildShortInputResponse(analysis, memory),
    nonsense: () => buildNonsenseResponse(analysis, memory)
  }[analysis.detectedIntent]?.();

  const gated = qualityGateResponse(response, () => buildGenericHelpResponse(analysis, memory));
  return avoidRepetition(gated);
}

export function getFakeThinkingSequence(analysis) {
  if (analysis.safety.isSensitive) return ["Lecture prudente du message…", "Réduction du théâtre verbal…"];
  const intentLines = PHRASEBANK.thinkingByIntent[analysis.detectedIntent] || [];
  const base = [...intentLines, ...PHRASEBANK.fakeThinking];
  const count = 1 + Math.floor(Math.random() * 2);
  const sequence = [];
  while (sequence.length < count && sequence.length < base.length) {
    const line = base[Math.floor(Math.random() * base.length)];
    if (!sequence.includes(line)) sequence.push(line);
  }
  return sequence;
}

export function updatePseudoMemory(input, response, previousMemory = loadMemory()) {
  const analysis = analyzeInput(input);
  const next = {
    ...DEFAULT_PSEUDO_MEMORY,
    ...previousMemory,
    messageCount: (previousMemory.messageCount || 0) + 1,
    recentTopics: [...analysis.detectedTopics, ...(previousMemory.recentTopics || [])].slice(0, 10),
    recentIntents: [analysis.detectedIntent, ...(previousMemory.recentIntents || [])].slice(0, 10),
    intentCounts: { ...(previousMemory.intentCounts || {}), [analysis.detectedIntent]: ((previousMemory.intentCounts || {})[analysis.detectedIntent] || 0) + 1 },
    greetingCount: (previousMemory.greetingCount || 0) + (analysis.detectedIntent === "greeting" ? 1 : 0),
    thanksCount: (previousMemory.thanksCount || 0) + (analysis.detectedIntent === "thanks" ? 1 : 0),
    shortMessageCount: (previousMemory.shortMessageCount || 0) + (analysis.detectedIntent === "short_input" ? 1 : 0),
    helpRequestCount: (previousMemory.helpRequestCount || 0) + (["generic_help", "question", "technical"].includes(analysis.detectedIntent) ? 1 : 0),
    appIdeaCount: (previousMemory.appIdeaCount || 0) + (analysis.detectedIntent === "app_idea" ? 1 : 0),
    patienceLevel: Math.max(0, (previousMemory.patienceLevel ?? 100) - 4 - (analysis.detectedIntent === "short_input" ? 3 : 0) - (analysis.detectedIntent === "generic_help" ? 2 : 0)),
    currentMood: analysis.safety.isSensitive ? "sobre" : (previousMemory.patienceLevel || 100) < 45 ? "exaspérée" : "mépris actif",
    lastStructure: String(response).split("\n\n").length,
    updatedAt: new Date().toISOString()
  };
  saveMemory(next);
  return next;
}

export function resetPseudoMemory() {
  saveMemory({ ...DEFAULT_PSEUDO_MEMORY, currentMood: "mépris actif" });
  saveRecentPhrases([]);
  return loadMemory();
}

export function getPseudoMemory() {
  return loadMemory();
}

export async function generateAgripineResponse(input, context = {}) {
  const analysis = analyzeInput(input);
  const memory = context.pseudoMemory || loadMemory();
  const response = buildResponse(analysis, { ...context, pseudoMemory: memory });
  const pseudoMemory = updatePseudoMemory(input, response, memory);
  return { content: response, analysis, thinking: getFakeThinkingSequence(analysis), pseudoMemory };
}
