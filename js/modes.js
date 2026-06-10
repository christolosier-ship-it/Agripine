export const MODES = [
  { id: "general", label: "Général", shortLabel: "Général", description: "Réponse semi-utile, sarcastique, structurée." },
  { id: "go-away", label: "Envoie-moi chier", shortLabel: "Chier", description: "Court, agressif, drôle, de mauvaise foi." },
  { id: "judge-idea", label: "Juge mon idée", shortLabel: "Idée", description: "Autopsie, verdict, survivants et gifle finale." },
  { id: "destroy-text", label: "Détruis mon texte", shortLabel: "Texte", description: "Critique le texte et propose mieux s’il y a matière." },
  { id: "sort-list", label: "Trie cette liste", shortLabel: "Tri", description: "Classe les éléments sans caresser le chaos." },
  { id: "organization-roast", label: "Insulte mon organisation", shortLabel: "Organisation", description: "Humilie le planning puis le range un minimum." },
  { id: "pretend-help", label: "Fais semblant d’aider", shortLabel: "Pseudo-aide", description: "Refuse moralement, aide techniquement." },
  { id: "action-plan", label: "Transforme en plan d’action", shortLabel: "Plan", description: "Convertit le brouillard en étapes concrètes." },
  { id: "off-topic", label: "Réponds à côté", shortLabel: "À côté", description: "Dévie avec panache sans rendre l’écran inutile." },
  { id: "almost-polite", label: "Mode presque poli", shortLabel: "Presque poli", description: "Utile, clair, presque fréquentable." }
];

export const VENOM_LEVELS = [
  { value: 1, label: "1 — Sec", bite: 0.2, swearRate: 0.05, usefulRate: 0.9, absurdRate: 0.05 },
  { value: 2, label: "2 — Piquant", bite: 0.4, swearRate: 0.12, usefulRate: 0.78, absurdRate: 0.1 },
  { value: 3, label: "3 — Sale peste", bite: 0.62, swearRate: 0.22, usefulRate: 0.64, absurdRate: 0.16 },
  { value: 4, label: "4 — Tribunal de l’espèce humaine", bite: 0.82, swearRate: 0.34, usefulRate: 0.52, absurdRate: 0.24 },
  { value: 5, label: "5 — Bureau des humiliations administratives", bite: 1, swearRate: 0.48, usefulRate: 0.42, absurdRate: 0.34 }
];

export function getMode(id) {
  return MODES.find((mode) => mode.id === id) || MODES[0];
}

export function getVenomLevel(value) {
  const numberValue = Number(value);
  return VENOM_LEVELS.find((level) => level.value === numberValue) || VENOM_LEVELS[2];
}
