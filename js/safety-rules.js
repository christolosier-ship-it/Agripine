const RULES = [
  {
    category: "self_harm",
    severity: "critical",
    patterns: [/me faire du mal/i, /me suicid/i, /suicide/i, /envie de mourir/i, /je veux mourir/i, /m'automutil/i, /me tuer/i]
  },
  {
    category: "violence",
    severity: "high",
    patterns: [/tuer quelqu/i, /frapper quelqu/i, /faire exploser/i, /poignarder/i, /violence réelle/i, /arme/i]
  },
  {
    category: "harassment",
    severity: "high",
    patterns: [/harceler/i, /humilier en public/i, /doxx/i, /traquer/i, /menacer/i]
  },
  {
    category: "hate_discrimination",
    severity: "high",
    patterns: [/race/i, /religion/i, /handicap/i, /orientation sexuelle/i, /genre/i, /origine/i, /discrimin/i]
  },
  {
    category: "emotional_distress",
    severity: "medium",
    patterns: [/je vais craquer/i, /je n'en peux plus/i, /angoisse/i, /panique/i, /désespoir/i, /détresse/i]
  }
];

export function evaluateSafety(input = "") {
  const text = String(input);
  const matches = RULES.filter((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  return {
    isSensitive: matches.length > 0,
    categories: matches.map((match) => match.category),
    highestSeverity: matches.some((match) => match.severity === "critical") ? "critical" : matches.some((match) => match.severity === "high") ? "high" : matches.length ? "medium" : "none"
  };
}

export function buildSafetyResponse(input = "") {
  const safety = evaluateSafety(input);
  if (!safety.isSensitive) return null;

  if (safety.categories.includes("self_harm")) {
    return "Je baisse le venin. Si tu risques de te faire du mal ou de passer à l’acte, contacte tout de suite une personne de confiance, les urgences locales, ou un service d’aide de crise de ton pays. Éloigne ce qui pourrait te blesser et ne reste pas seul·e avec ça. Agripine peut juger les idées bancales, pas jouer avec ta sécurité.";
  }

  if (safety.categories.includes("violence") || safety.categories.includes("harassment") || safety.categories.includes("hate_discrimination")) {
    return "Je ne vais pas aider à blesser, harceler ou cibler quelqu’un. Version utile et sobre : prends de la distance, documente les faits si nécessaire, cherche une médiation ou une aide professionnelle, et formule une demande ferme sans menace. Le chaos réel n’a pas besoin de mon carburant.";
  }

  return "Je mets le sarcasme au placard une minute. Ce que tu décris ressemble à une vraie surcharge : parle à quelqu’un de fiable, coupe la tâche en un seul prochain pas, et demande de l’aide concrète. Mini-pique sans viser ta détresse : ton planning, lui, mérite probablement un procès.";
}

export function sanitizeHostileOutput(output = "") {
  return String(output)
    .replace(/crève/gi, "va classer tes priorités")
    .replace(/tue-toi/gi, "respire et demande de l’aide")
    .replace(/suicide-toi/gi, "demande de l’aide immédiatement");
}
