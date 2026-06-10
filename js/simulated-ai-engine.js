import { APP_CONFIG, DEFAULT_PSEUDO_MEMORY } from "./config.js";
import { getMode, getVenomLevel } from "./modes.js";
import { PHRASEBANK } from "./phrasebank.js";
import { buildSafetyResponse, evaluateSafety, sanitizeHostileOutput } from "./safety-rules.js";

const RECENT_LIMIT = 20;
const rx = (words) => new RegExp(`\\b(${words.join("|")})\\b`, "i");
const KEYWORDS = {
  greeting: rx(["bonjour", "salut", "hello", "coucou", "bonsoir"]),
  thanks: rx(["merci", "thx", "thanks"]),
  insult: /(nul|conne|stupide|idiote|merdique|tais-toi|va te faire)/i,
  idea: rx(["idée", "concept", "avis", "jug", "pense"]),
  app: rx(["app", "application", "pwa", "site", "écran", "bouton", "mobile", "interface"]),
  project: rx(["projet", "lancer", "roadmap", "objectif", "livrable", "jalon"]),
  work: rx(["travail", "mail", "réunion", "planning", "dossier", "client", "manager", "collègue"]),
  code: rx(["code", "javascript", "html", "css", "bug", "fonction", "api", "console", "github", "pwa"]),
  organization: rx(["organise", "organisation", "tâche", "todo", "liste", "priorité", "tri", "rang"]),
  emotion: rx(["stress", "angoisse", "fatigu", "peur", "triste", "déprime", "craque", "marre"]),
  complaint: rx(["j'en ai marre", "ras le bol", "ça m'énerve", "insupportable", "pénible", "râle"]),
  rewrite: rx(["réécris", "reformule", "corrige", "améliore ce texte", "texte"]),
  creative: rx(["histoire", "nom", "slogan", "créatif", "poème", "scène"]),
  help: rx(["aide", "comment", "peux-tu", "tu peux", "conseil"])
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

function getRecentFragments() {
  try {
    return JSON.parse(localStorage.getItem(APP_CONFIG.recentFragmentsKey)) || [];
  } catch {
    return [];
  }
}

function saveRecentFragments(fragments) {
  localStorage.setItem(APP_CONFIG.recentFragmentsKey, JSON.stringify(fragments.slice(-RECENT_LIMIT)));
}

export function pickUnique(category, recentFragments = getRecentFragments()) {
  const values = PHRASEBANK[category] || PHRASEBANK.openingJabs;
  const pool = values.filter((value) => !recentFragments.includes(value));
  const chosen = (pool.length ? pool : values)[Math.floor(Math.random() * (pool.length ? pool.length : values.length))];
  saveRecentFragments([...recentFragments, chosen]);
  return chosen;
}

function listItems(text) {
  return text
    .split(/\n|;|,|•|- |\d+[.)]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2)
    .slice(0, 6);
}

function extractKeywords(text) {
  return [...new Set(text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ0-9-]{4,}/gi) || [])]
    .filter((word) => !["avec", "pour", "dans", "cette", "faire", "plus", "comme", "mais", "donc", "quoi", "tout"].includes(word))
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
  if (KEYWORDS.emotion.test(text)) return "emotional";
  if (/[!?]{2,}|[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ]{8,}/.test(text)) return "intense";
  if (KEYWORDS.thanks.test(text)) return "grateful";
  return "neutral";
}

export function detectIntent(input = "") {
  const text = String(input).trim();
  if (text.length < 2) return "empty_or_too_short";
  if (KEYWORDS.insult.test(text) && /agripine|toi|ia/i.test(text)) return "insult_agripine";
  if (KEYWORDS.greeting.test(text) && text.length < 40) return "greeting";
  if (KEYWORDS.thanks.test(text) && text.length < 80) return "thanks";
  if (/\n|;|,|•|- |\d+[.)]/.test(text) && KEYWORDS.organization.test(text)) return "todo_list";
  if (KEYWORDS.rewrite.test(text)) return "rewrite_text";
  if (KEYWORDS.app.test(text) && KEYWORDS.idea.test(text)) return "app_idea";
  if (KEYWORDS.idea.test(text)) return "idea_judgement";
  if (KEYWORDS.project.test(text)) return "project";
  if (KEYWORDS.organization.test(text)) return "organization";
  if (KEYWORDS.code.test(text)) return "technical";
  if (KEYWORDS.work.test(text)) return "work_message";
  if (KEYWORDS.complaint.test(text)) return "complaint";
  if (/je suis nul|j'y arriverai jamais|je doute|pas capable/i.test(text)) return "self_doubt";
  if (KEYWORDS.creative.test(text)) return "creative";
  if (text.length > 280 && /!|marre|jamais|toujours/i.test(text)) return "rant";
  if (text.includes("?")) return "question";
  if (KEYWORDS.help.test(text)) return "generic_help";
  if (!/[aeiouyàâéèêëîïôùûü]/i.test(text) || /(.)\1{5,}/.test(text)) return "nonsense";
  return "generic_help";
}

export function analyzeInput(input = "") {
  const cleanedText = String(input).trim().replace(/\s+/g, " ");
  const words = cleanedText ? cleanedText.split(/\s+/) : [];
  const detectedTopics = detectTopics(cleanedText);
  const detectedIntent = detectIntent(cleanedText);
  const detectedKeywords = extractKeywords(cleanedText);
  const hasList = /\n|;|•|- |\d+[.)]/.test(String(input)) || listItems(cleanedText).length >= 3;
  const signals = [detectedTopics.length, detectedKeywords.length, cleanedText.includes("?"), hasList].reduce((a, b) => a + Number(Boolean(b)), 0);
  return {
    cleanedText,
    wordCount: words.length,
    charCount: cleanedText.length,
    sentenceCount: cleanedText ? Math.max(1, cleanedText.split(/[.!?]+/).filter(Boolean).length) : 0,
    hasQuestion: cleanedText.includes("?"),
    hasList,
    hasGreeting: KEYWORDS.greeting.test(cleanedText),
    hasInsult: KEYWORDS.insult.test(cleanedText),
    hasThanks: KEYWORDS.thanks.test(cleanedText),
    hasIdea: KEYWORDS.idea.test(cleanedText),
    hasProject: KEYWORDS.project.test(cleanedText),
    hasWork: KEYWORDS.work.test(cleanedText),
    hasApp: KEYWORDS.app.test(cleanedText),
    hasCode: KEYWORDS.code.test(cleanedText),
    hasOrganization: KEYWORDS.organization.test(cleanedText),
    hasEmotionalTone: KEYWORDS.emotion.test(cleanedText),
    hasShortInput: words.length <= 3 || cleanedText.length < 18,
    hasLongInput: words.length > 70 || cleanedText.length > 420,
    detectedKeywords,
    detectedTopics,
    detectedIntent,
    detectedTone: detectTone(cleanedText),
    confidenceScore: Math.min(0.95, 0.35 + signals * 0.13 + Math.min(words.length, 30) / 100),
    listItems: listItems(String(input)),
    safety: evaluateSafety(cleanedText)
  };
}

function topicHint(analysis) {
  if (analysis.detectedTopics.includes("plantes")) return "Je vois passer des plantes : chlorophylle, patience et terreau, ce trio plus stable que l’espèce humaine.";
  if (analysis.detectedTopics.includes("application")) return "Côté application : pense écran, bouton, PWA, liste courte, et surtout pas labyrinthe à options.";
  if (analysis.detectedTopics.includes("travail")) return "Côté travail : réunion, mail, planning, dossier — le quadrilatère maudit du mammifère salarié.";
  if (analysis.detectedTopics.includes("code")) return "Côté code : entrée, état, sortie, erreur console. Le reste peut attendre dans sa flaque.";
  if (analysis.listItems.length) return `J’ai repéré notamment : ${analysis.listItems.slice(0, 3).join(", ")}. Le chaos a donc des prénoms.`;
  return analysis.detectedKeywords.length ? `Je retiens surtout “${analysis.detectedKeywords.slice(0, 3).join("”, “")}”. Ce n’est pas glorieux, mais c’est exploitable.` : "Je détecte une demande humaine standard : floue, pleine d’espoir et légèrement collante.";
}

function usefulAdvice(analysis) {
  if (analysis.hasList) return "Action utile : sépare en trois piles — à faire maintenant, à clarifier, à jeter sans cérémonie.";
  if (analysis.hasApp) return "Action utile : définis l’utilisateur, l’action principale en moins de dix secondes, puis supprime deux boutons par principe d’hygiène.";
  if (analysis.hasCode) return "Action utile : reproduis le bug, isole la fonction, vérifie l’état, puis seulement accuse le navigateur.";
  if (analysis.hasWork) return "Action utile : écris le résultat attendu, le prochain message à envoyer, et la limite de temps. Oui, une limite, ce concept sauvage.";
  if (analysis.hasProject) return "Action utile : transforme le projet en premier livrable minuscule, daté, vérifiable.";
  return "Action utile : formule le résultat voulu en une phrase, puis choisis le prochain geste physique. Le brouillard n’est pas un plan.";
}

function rewriteSample(analysis) {
  if (analysis.wordCount < 6) return "Version améliorée impossible : ton matériau tient dans une cuillère à café fissurée.";
  return `Version moins molle : “${analysis.cleanedText.slice(0, 140)}${analysis.cleanedText.length > 140 ? "…" : ""}” — mais avec un objectif clair, une demande explicite et deux adjectifs sacrifiés au compost.`;
}

function memoryAside(memory, analysis) {
  if (!memory.messageCount) return "";
  if (memory.recentIntents.filter((intent) => intent === analysis.detectedIntent).length >= 2) return "Ça recommence avec le même parfum de désordre. Je note la récidive.";
  if (memory.helpRequestCount >= 3) return "Troisième demande d’aide ou plus. L’autonomie est donc officiellement en arrêt maladie.";
  if (memory.shortMessageCount >= 3 && analysis.hasShortInput) return "Encore un message microscopique. Tu nourris l’IA avec des miettes et tu réclames un banquet.";
  return memory.patienceLevel < 55 ? "Ma patience locale descend, ce qui est remarquable pour un logiciel sans âme." : "";
}

function blocksForMode(analysis, context, memory) {
  const mode = getMode(context.activeMode || context.modeId);
  const venom = getVenomLevel(context.venomLevel);
  const recent = getRecentFragments();
  const opening = mode.id === "almost-polite" ? "Je vais rester presque correcte, effort surhumain." : pickUnique("openingJabs", recent);
  const verdictCategory = venom.absurdRate > Math.random() ? "absurdVerdicts" : analysis.confidenceScore > 0.7 ? "positiveVerdicts" : analysis.confidenceScore > 0.52 ? "mediumVerdicts" : "negativeVerdicts";
  const verdict = pickUnique(verdictCategory);
  const swear = venom.swearRate > Math.random() ? `${pickUnique("swearMarks")} ` : "";
  const aside = memoryAside(memory, analysis);
  const hint = topicHint(analysis);
  const conclusion = pickUnique(venom.value >= 5 ? "bureaucracyHell" : "sarcasticConclusions");

  if (analysis.hasShortInput || analysis.detectedIntent === "empty_or_too_short") return [pickUnique("tooShort"), hint, conclusion];
  if (analysis.detectedIntent === "greeting") return [pickUnique("greetingReplies"), "Noyau de contrariété actif. Donne-moi une demande, pas juste une poignée de main numérique."];
  if (analysis.detectedIntent === "thanks") return [pickUnique("thanksReplies"), aside || "Va faire quelque chose d’utile avant que cette gratitude ne se transforme en réunion."];
  if (analysis.detectedIntent === "insult_agripine") return [pickUnique("insultReplies"), usefulAdvice(analysis), conclusion];

  switch (mode.id) {
    case "go-away":
      return [`${swear}Non. Enfin si : ${hint}`, usefulAdvice(analysis), "Maintenant avance. Et ferme la porte du chaos en sortant."];
    case "judge-idea":
      return ["Fausse analyse : " + pickUnique("fakeScience"), "Verdict : " + verdict, "Ce qui est médiocre : " + pickUnique("mediocrityAnalysis"), "Ce qui peut survivre : le noyau utile, si tu coupes le gras et les décorations.", "Recommandation : " + usefulAdvice(analysis), pickUnique("sarcasticConclusions")];
    case "destroy-text":
      return [opening, pickUnique("rewriteText"), rewriteSample(analysis), conclusion];
    case "sort-list":
      return [opening, hint, `Tri proposé : 1) vital : ${analysis.listItems[0] || "clarifier le but"}; 2) utile : ${analysis.listItems[1] || "réduire la liste"}; 3) suspect : ${analysis.listItems[2] || "tout le reste qui fait du bruit"}.`, conclusion];
    case "organization-roast":
      return [pickUnique("bureaucracyHell"), pickUnique("organizationTasks"), usefulAdvice(analysis), pickUnique("humanityDecay")];
    case "pretend-help":
      return [pickUnique("refuseButAnswer"), usefulAdvice(analysis), "Deuxième conseil : enlève une option, une réunion ou une excuse. Troisième conseil : date le prochain pas.", conclusion];
    case "action-plan":
      return [opening, `Plan d’action :\n1. Résultat attendu : ${analysis.detectedKeywords[0] || "clarifier le bazar"}.\n2. Premier geste : écrire une version en une phrase.\n3. Test : vérifier en moins de dix minutes.\n4. Coupe-feu : supprimer ce qui ne sert pas le résultat.`, conclusion];
    case "off-topic":
      return ["Je vais répondre à côté avec dignité, parce que la ligne droite est surestimée.", `Ton sujet me rappelle une étagère IKEA montée par un comité : ${hint}`, "Conclusion oblique : bois de l’eau, nomme le problème, puis accuse sobrement le calendrier."];
    case "almost-polite":
      return ["Analyse presque polie :", hint, verdict, usefulAdvice(analysis), "Voilà. C’était presque aimable, ne gâche pas ce moment rare."];
    default:
      return [opening, aside, hint, verdict, usefulAdvice(analysis), venom.value >= 4 ? pickUnique("humanityDecay") : conclusion].filter(Boolean);
  }
}

export function buildResponse(analysis, context = {}) {
  const safetyResponse = buildSafetyResponse(analysis.cleanedText);
  if (safetyResponse) return safetyResponse;
  const memory = context.pseudoMemory || loadMemory();
  const blocks = blocksForMode(analysis, context, memory).filter(Boolean);
  const response = blocks.join("\n\n");
  return avoidRepetition(sanitizeHostileOutput(response));
}

export function getFakeThinkingSequence(analysis) {
  const intentLines = PHRASEBANK.thinkingByIntent[analysis.detectedIntent] || [];
  const base = [...intentLines, ...PHRASEBANK.fakeThinking];
  const count = 2 + Math.floor(Math.random() * 3);
  const sequence = [];
  while (sequence.length < count) {
    const line = base[Math.floor(Math.random() * base.length)];
    if (!sequence.includes(line)) sequence.push(line);
  }
  return sequence;
}

export function updatePseudoMemory(input, response) {
  const analysis = analyzeInput(input);
  const memory = loadMemory();
  const next = {
    ...memory,
    messageCount: memory.messageCount + 1,
    recentTopics: [...analysis.detectedTopics, ...(memory.recentTopics || [])].slice(0, 8),
    recentIntents: [analysis.detectedIntent, ...(memory.recentIntents || [])].slice(0, 8),
    patienceLevel: Math.max(5, (memory.patienceLevel || 100) - 4 - (analysis.hasShortInput ? 3 : 0)),
    thanksCount: (memory.thanksCount || 0) + (analysis.hasThanks ? 1 : 0),
    shortMessageCount: (memory.shortMessageCount || 0) + (analysis.hasShortInput ? 1 : 0),
    helpRequestCount: (memory.helpRequestCount || 0) + (["generic_help", "question", "technical"].includes(analysis.detectedIntent) ? 1 : 0),
    currentMood: analysis.safety.isSensitive ? "sobre" : (memory.patienceLevel || 100) < 45 ? "exaspérée" : "contrariée",
    lastStructure: response.split("\n\n").length
  };
  saveMemory(next);
  return next;
}

export function avoidRepetition(response) {
  const recent = getRecentFragments();
  const paragraphs = String(response).split("\n\n");
  const adjusted = paragraphs.map((paragraph) => {
    if (!recent.includes(paragraph)) return paragraph;
    return `${paragraph} (variante locale, parce que la répétition est une maladie de tableur.)`;
  });
  saveRecentFragments([...recent, ...adjusted].slice(-RECENT_LIMIT));
  return adjusted.join("\n\n");
}

export function resetPseudoMemory() {
  saveMemory({ ...DEFAULT_PSEUDO_MEMORY });
  saveRecentFragments([]);
  return loadMemory();
}

export function getPseudoMemory() {
  return loadMemory();
}

export async function generateAgripineResponse(input, context = {}) {
  const analysis = analyzeInput(input);
  const response = buildResponse(analysis, { ...context, pseudoMemory: context.pseudoMemory || loadMemory() });
  const pseudoMemory = updatePseudoMemory(input, response);
  return { content: response, analysis, thinking: getFakeThinkingSequence(analysis), pseudoMemory };
}
