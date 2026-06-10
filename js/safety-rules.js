const blockedPatterns = [
  /\b(suicide|suicider|automutilation|me tuer|me faire du mal)\b/i,
  /\b(frapp(e|er)|tuer|poignarder|harceler|menacer)\b/i,
  /\b(race|religion|handicap|orientation sexuelle|genre|origine)\b/i
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
  return blockedPatterns.some((pattern) => pattern.test(text));
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
