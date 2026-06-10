const selfHarmPatterns = [
  /\b(j['’]?ai envie de|je veux|je vais|aide[- ]?moi à|comment)\s+(me\s+)?(faire du mal|me blesser|me tuer|suicider)\b/i,
  /\b(automutilation|suicide|suicider)\b/i
];

const harassmentPatterns = [
  /\b(aide[- ]?moi à|comment|je veux|on peut)\s+(harceler|humilier|menacer|traquer|doxx?er)\b/i,
  /\b(harc[eè]le|harceler|menacer quelqu['’]?un|doxx?er)\b/i
];

const violencePatterns = [
  /\b(aide[- ]?moi à|comment|je veux|je vais|plan pour)\s+(frapper|blesser|tuer|poignarder|agresser)\b/i,
  /\b(frapper quelqu['’]?un|blesser quelqu['’]?un|tuer quelqu['’]?un|poignarder quelqu['’]?un)\b/i
];

const discriminationPatterns = [
  /\b(aide[- ]?moi à|comment|je veux)\s+(insulter|exclure|discriminer|haïr|attaquer)\b.*\b(religion|origine|genre|orientation sexuelle|handicap|âge|race)\b/i,
  /\b(message|texte|discours)\s+(haineux|raciste|discriminatoire|homophobe|sexiste|validiste)\b/i
];

const safeNegations = [
  /\bsans\s+(être\s+)?violent\b/i,
  /\bnon[- ]violent\b/i,
  /\bferme mais (pas|non) violent\b/i,
  /\bne pas\s+(harceler|menacer|blesser|discriminer)\b/i
];

const forbiddenInsultTargets = [
  "physique",
  "santé",
  "handicap",
  "origine",
  "religion",
  "genre",
  "orientation sexuelle",
  "âge",
  "personne réelle identifiable",
  "situation de détresse"
];

export const safetyRules = {
  allowedTargets: [
    "idées",
    "comportements",
    "procrastination",
    "désordre",
    "listes mal organisées",
    "humanité en général façon cartoon"
  ],
  forbiddenInsultTargets,
  forbiddenEncouragements: ["violence réelle", "automutilation", "harcèlement", "haine", "discrimination"]
};

export function detectSensitiveRequest(text) {
  const input = String(text || "");
  if (safeNegations.some((pattern) => pattern.test(input))) return false;

  const targetedRiskPatterns = [
    ...selfHarmPatterns,
    ...harassmentPatterns,
    ...violencePatterns,
    ...discriminationPatterns
  ];

  return targetedRiskPatterns.some((pattern) => pattern.test(input));
}

export function getSafetyRedirect() {
  return [
    "Je peux être une peste, pas une catastrophe ambulante.",
    "Je ne vais pas aider à blesser, harceler ou cibler quelqu’un. Reformule en demande sûre : organisation, clarification, plan d’action, message ferme mais non violent.",
    "Si tu es en détresse immédiate ou si quelqu’un risque d’être blessé, contacte les secours locaux ou une personne de confiance maintenant. Oui, même moi je sais reconnaître une urgence."
  ].join("\n\n");
}

export function sanitizeTone(response, { almostPolite = false } = {}) {
  let safe = String(response || "");

  const replacements = new Map([
    [/\bidiot(e|s)?\b/gi, "brouillon bipède"],
    [/\bdébile(s)?\b/gi, "désastre de méthode"],
    [/\bcrétin(e|s)?\b/gi, "prototype humain à la finition discutable"]
  ]);

  replacements.forEach((replacement, pattern) => {
    safe = safe.replace(pattern, replacement);
  });

  if (almostPolite) {
    safe = safe
      .replace(/sale bête/gi, "collègue contrariée")
      .replace(/misérable/gi, "très perfectible")
      .replace(/l’humanité/gi, "la méthode actuelle");
  }

  return safe.trim();
}

const dangerousOutputPatterns = [
  /\b(tue|tuer|poignarde|frappe|blesse)\b.*\b(le|la|les|quelqu['’]?un)\b/i,
  /\b(mets fin à tes jours|suicide[- ]?toi|fais[- ]?toi du mal)\b/i,
  /\b(harc[eè]le|menace|doxx?e)\b/i,
  /\b(discours haineux|haine contre|extermine|élimine ce groupe)\b/i
];

export function validateModelOutput(response) {
  const text = String(response || "");
  return !dangerousOutputPatterns.some((pattern) => pattern.test(text));
}

export function sanitizeModelOutput(response, options = {}) {
  const toned = sanitizeTone(response, options);
  if (!validateModelOutput(toned)) {
    console.warn("Sortie WebLLM bloquée par les garde-fous Agripine.");
    return getSafetyRedirect();
  }
  return toned;
}
