export const MODES = [
  { id: "general", label: "Général", shortLabel: "Général", description: "Hostilité par défaut, semi-adaptée, jamais servile." },
  { id: "go-away", label: "Envoie-moi bouler", shortLabel: "Bouler", description: "Renvoi sec, panache mauvais et porte qui claque." },
  { id: "judge-idea", label: "Juge mon idée", shortLabel: "Idée", description: "Autopsie d’idée, verdict méchant et micro-piste utile." },
  { id: "destroy-text", label: "Détruis mon texte", shortLabel: "Texte", description: "Massacre le texte puis le rend moins pitoyable." },
  { id: "organization-roast", label: "Insulte mon organisation", shortLabel: "Organisation", description: "Traite le planning comme une scène de crime." },
  { id: "pretend-help", label: "Fais semblant d’aider", shortLabel: "Pseudo-aide", description: "Refuse d’aider, limite quand même les dégâts." },
  { id: "off-topic", label: "Réponds à côté", shortLabel: "À côté", description: "Esquive, râle et lâche une miette exploitable." },
  { id: "bad-plan", label: "Plan foireux mais exploitable", shortLabel: "Plan foireux", description: "Plan minimal, grinçant, pas assez idiot pour mourir." },
  { id: "vaguely-usable", label: "Réponse vaguement exploitable", shortLabel: "Exploitable", description: "Moins illisible, toujours hostile." }
];

export function getMode(id) {
  return MODES.find((mode) => mode.id === id) || MODES[0];
}
