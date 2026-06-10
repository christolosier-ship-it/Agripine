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
  if (KEYWORDS.app.test(text) && KEYWORDS.idea.test(text)) return "app_idea";
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

function sentenceFromInput(analysis) {
  if (!analysis.detectedKeywords.length) return "ta demande flotte sans poignée";
  return `je vois surtout “${analysis.detectedKeywords.slice(0, 3).join("”, “")}”`;
}

function microAdvice(analysis) {
  if (analysis.hasList) return "Micro-consigne : garde trois piles — urgent, utile, à jeter sans cérémonie.";
  if (analysis.hasApp) return "Micro-consigne : un utilisateur, une action principale, un écran vital. Le reste au compost.";
  if (analysis.hasCode) return "Micro-consigne : reproduis le bug, isole le fichier, lis l’erreur console avant d’accuser la lune.";
  if (analysis.hasWork) return "Micro-consigne : fait, demande, échéance. Trois briques. Pas une cathédrale de politesse.";
  if (analysis.hasProject) return "Micro-consigne : prochain livrable minuscule, daté, vérifiable. Pas un poster de vision.";
  return "Micro-consigne : écris le résultat voulu en une phrase, puis le prochain geste en dix minutes maximum.";
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

function compose(paragraphs, max = 4) {
  return paragraphs.filter(Boolean).slice(0, max).join("\n\n");
}

export function buildGreetingResponse(analysis, memory) {
  return compose([pickUnique("hostileGreetings"), memoryAside(memory, analysis) || pickUnique("greetingReplies"), "Maintenant abrège : qu’est-ce que tu viens déposer dans ma benne mentale ?"], 3);
}

export function buildThanksResponse(analysis, memory) {
  return compose([pickUnique("thanksReplies"), memoryAside(memory, analysis), pickUnique("closingJabs")], 3);
}

export function buildInsultAgripineResponse(analysis, memory) {
  return compose([pickUnique("insultReplies"), memoryAside(memory, analysis) || "Tu peux grogner autant que tu veux : je reste l’IA hostile, toi tu restes la personne qui tape sur son propre guichet.", pickUnique("closingJabs")], 3);
}

export function buildAboutAgripineResponse(analysis, memory) {
  return compose(["Tu veux que je parle de moi ? Enfin un sujet moins décevant que ton flux de pensées.", pickUnique("aboutAgripine"), memoryAside(memory, analysis) || "Je ne suis pas là pour être gentille. Je suis là pour soupirer, juger, repousser, et parfois répondre juste assez pour que tu reviennes te faire malmener.", "Voilà. Tu sais maintenant à qui tu parles. Pauvre décision."], 4);
}

export function buildSendMeAwayResponse(analysis, memory) {
  return compose([pickUnique("sendMeAway"), memoryAside(memory, analysis), pickUnique("closingJabs")], 3);
}

export function buildQuestionResponse(analysis, memory) {
  const orgDay = /organiser? ma journ[ée]e|organiser? la journ[ée]e/i.test(analysis.cleanedText);
  return compose([
    orgDay ? "Tu veux organiser ta journée ? Miracle, le mammifère découvre le calendrier." : pickUnique("questionReplies"),
    memoryAside(memory, analysis) || `${sentenceFromInput(analysis)}. Je vais éviter la conférence docile, ça donnerait de mauvaises habitudes.`,
    orgDay ? "Version minimale : choisis trois tâches. Pas douze. Trois : la plus urgente, la plus utile, et celle que tu repousses comme un lâche administratif." : microAdvice(analysis),
    pickUnique("closingJabs")
  ], 4);
}

export function buildAppIdeaResponse(analysis, memory) {
  return compose([pickUnique("appIdeas"), memoryAside(memory, analysis) || "Vas-y, crache le concept. Je dirai s’il mérite une V1 ou directement un dossier GitHub abandonné.", "Conseil minimal, parce que je suis faible : si la mécanique n’est pas claire en dix secondes, c’est probablement une liste avec du parfum.", pickUnique("closingJabs")], 4);
}

export function buildIdeaJudgementResponse(analysis, memory) {
  return compose([pickUnique("ideaJudgement"), memoryAside(memory, analysis) || `${sentenceFromInput(analysis)} ; ce n’est pas glorieux, mais c’est une prise.`, "Si tu veux un jugement utile, donne la cible, le problème et la preuve que quelqu’un s’en soucie.", pickUnique("closingJabs")], 4);
}

export function buildOrganizationResponse(analysis, memory) {
  return compose([pickUnique("organizationTasks"), memoryAside(memory, analysis), microAdvice(analysis), pickUnique("closingJabs")], 4);
}

export function buildRewriteResponse(analysis, memory) {
  const text = analysis.rewriteText || analysis.cleanedText;
  const improved = text
    ? text.replace(/bonjour\s*/i, "Bonjour, ").replace(/je ne pourrais pas/i, "je ne pourrai pas").replace(/\s+/g, " ").trim()
    : "Je ne pourrai pas venir demain.";
  return compose([pickUnique("rewriteText"), memoryAside(memory, analysis), `Version moins molle : “${improved}.”`, "Voilà. C’est plus propre. Ne prends pas ça pour un câlin."], 4);
}

export function buildListResponse(analysis, memory) {
  const items = analysis.listItems.length ? analysis.listItems : ["clarifier le but", "couper le bruit", "agir dix minutes"];
  return compose([pickUnique("listReplies"), memoryAside(memory, analysis), `Tri cruel : 1) bloquant — ${items[0]}; 2) utile — ${items[1] || "la prochaine action"}; 3) cave à plus tard — ${items.slice(2).join(", ") || "le décoratif"}.`, pickUnique("closingJabs")], 4);
}

export function buildProjectResponse(analysis, memory) {
  return compose([pickUnique("projectReplies"), memoryAside(memory, analysis), microAdvice(analysis), pickUnique("closingJabs")], 4);
}

export function buildTechnicalResponse(analysis, memory) {
  return compose([pickUnique("technicalReplies"), memoryAside(memory, analysis), microAdvice(analysis), pickUnique("closingJabs")], 4);
}

export function buildComplaintResponse(analysis, memory) {
  return compose([pickUnique("complaintReplies"), memoryAside(memory, analysis), "Garde le fait, l’impact, la demande. Le reste peut aller hurler dans une armoire.", pickUnique("closingJabs")], 4);
}

export function buildGenericHelpResponse(analysis, memory) {
  return compose([pickUnique("helpReplies"), memoryAside(memory, analysis), microAdvice(analysis), pickUnique("closingJabs")], 4);
}

export function buildShortInputResponse(analysis, memory) {
  return compose([pickUnique("shortReplies"), memoryAside(memory, analysis) || "Je peux juger le vide, bien sûr. Mais si tu veux une réponse moins approximative, ajoute de la matière.", pickUnique("closingJabs")], 3);
}

export function buildNonsenseResponse(analysis, memory) {
  return compose([pickUnique("nonsenseReplies"), memoryAside(memory, analysis), "Reviens avec une phrase qui a fini sa croissance."], 3);
}

function buildWorkResponse(analysis, memory) {
  return compose([pickUnique("workReplies"), memoryAside(memory, analysis), microAdvice(analysis), pickUnique("closingJabs")], 4);
}

function buildCreativeResponse(analysis, memory) {
  return compose([pickUnique("creativeReplies"), memoryAside(memory, analysis), "Donne-moi une contrainte et j’arrêterai peut-être de regarder ton imagination glisser sur le carrelage.", pickUnique("closingJabs")], 4);
}

function buildModeOverride(analysis, memory, activeMode) {
  const mode = getMode(activeMode);
  if (analysis.detectedIntent === "sensitive_request") return null;
  if (mode.id === "go-away") return buildSendMeAwayResponse(analysis, memory);
  if (mode.id === "judge-idea") return buildIdeaJudgementResponse(analysis, memory);
  if (mode.id === "destroy-text") return buildRewriteResponse(analysis, memory);
  if (mode.id === "organization-roast") return buildOrganizationResponse(analysis, memory);
  if (mode.id === "pretend-help") return buildGenericHelpResponse(analysis, memory);
  if (mode.id === "off-topic") return compose(["Je vais répondre à côté, parce que la ligne droite te ferait croire que tu pilotes.", `Ton sujet me rappelle une étagère montée par un comité : ${sentenceFromInput(analysis)}.`, microAdvice(analysis), pickUnique("closingJabs")], 4);
  if (mode.id === "bad-plan") return compose([pickUnique("directRejections"), `Plan foireux mais exploitable : 1) nomme le résultat ; 2) fais la plus petite action ; 3) supprime une excuse ; 4) recommence demain si rien n’a brûlé.`, pickUnique("closingJabs")], 3);
  if (mode.id === "vaguely-usable") return compose([pickUnique("directRejections"), microAdvice(analysis), "C’est vaguement exploitable. Ne gâche pas cette rareté."], 3);
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
  const finalParagraphs = adjusted.length ? adjusted : [pickUnique("directRejections"), pickUnique("closingJabs")];
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
  const count = 2 + Math.floor(Math.random() * 3);
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
