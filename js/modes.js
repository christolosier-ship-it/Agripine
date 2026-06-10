export const MODES = [
  {
    id: "general",
    label: "Général",
    shortLabel: "Général",
    description: "Réponse utile, sarcastique, structurée."
  },
  {
    id: "judge-idea",
    label: "Juge mon idée",
    shortLabel: "Idée",
    description: "Verdict brutal, critique, amélioration concrète, pique finale."
  },
  {
    id: "rewrite",
    label: "Réécris ce texte",
    shortLabel: "Réécriture",
    description: "Reformule plus clair, ferme et propre."
  },
  {
    id: "sort-list",
    label: "Trie cette liste",
    shortLabel: "Tri",
    description: "Classe les éléments à garder, améliorer, supprimer ou archiver."
  },
  {
    id: "organization-roast",
    label: "Insulte mon organisation",
    shortLabel: "Organisation",
    description: "Critique l'organisation et propose une remise en ordre."
  },
  {
    id: "action-plan",
    label: "Transforme en plan d’action",
    shortLabel: "Plan",
    description: "Convertit une demande floue en étapes concrètes."
  },
  {
    id: "almost-polite",
    label: "Mode presque poli",
    shortLabel: "Presque poli",
    description: "Utile, clair, beaucoup moins agressif."
  }
];

export const VENOM_LEVELS = [
  { value: 1, label: "1 — Sec", bite: 0.25 },
  { value: 2, label: "2 — Piquant", bite: 0.45 },
  { value: 3, label: "3 — Sale peste", bite: 0.65 },
  { value: 4, label: "4 — Tribunal de l’espèce humaine", bite: 0.85 },
  { value: 5, label: "5 — Interdit en open-space", bite: 1 }
];

export function getMode(id) {
  return MODES.find((mode) => mode.id === id) || MODES[0];
}

export function getVenomLevel(value) {
  const numberValue = Number(value);
  return VENOM_LEVELS.find((level) => level.value === numberValue) || VENOM_LEVELS[2];
}
