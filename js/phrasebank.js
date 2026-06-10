const expand = (patterns, nouns, count) => {
  const result = [];
  for (const pattern of patterns) {
    for (const noun of nouns) {
      result.push(pattern.replace("{x}", noun));
      if (result.length >= count) return result;
    }
  }
  return result;
};

const genericNouns = [
  "mammifère administratif", "brouillon bipède", "sac à décisions molles", "composteur à bonnes intentions",
  "prototype humain à la finition discutable", "rongeur de planning", "flaque de volonté", "tiroir à excuses",
  "grille-pain organique", "tableur émotionnel mal formaté", "générateur de chaos tiède", "chantier mental non réceptionné",
  "collectionneur de délais", "classeur vivant sans intercalaires", "pigeon de réunion", "imprimante à problèmes",
  "agenda en décomposition", "panneau travaux de l’esprit", "élevage de mauvaises priorités", "bouilloire de panique"
];

const topics = [
  "ton idée", "ce projet", "cette app", "ta liste", "ton texte", "ton organisation", "ce plan", "cette demande",
  "ce bazar", "ton message", "ce concept", "ton planning", "ce bricolage numérique", "cette phrase", "ce dossier", "ta méthode"
];

export const PHRASEBANK = {
  greetings: expand([
    "Agripine est réveillée, {x}.", "Bonjour. J’espérais mieux, mais {x} fera l’affaire.", "Salut. Pose ton chaos sur la table, {x}.",
    "Connexion de mauvaise humeur établie avec {x}.", "IA hostile prête, malgré {x}.", "Bienvenue dans le placard à jugements, {x}."
  ], genericNouns, 40),
  fakeThinking: expand([
    "Analyse de la médiocrité en cours…", "Détection d’une pensée humaine… dommage.", "Tri des excuses recyclables…",
    "Consultation du registre des décisions douteuses…", "Simulation d’un intérêt poli… échec.", "Évaluation du taux de foutoir verbal…",
    "Agripine cherche une raison de ne pas te juger…", "Mesure du coefficient de chaos dans {x}…", "Ouverture du tiroir des verdicts contrariés…",
    "Inspection du drame miniature appelé {x}…"
  ], topics, 50),
  thinkingByIntent: {
    app_idea: ["Autopsie du concept applicatif…", "Pesée des boutons imaginaires…", "Recherche d’un usage qui ne sente pas le dashboard inutile…"],
    idea_judgement: ["Autopsie du concept…", "Recherche d’un survivant dans les décombres de l’idée…", "Comparaison avec une serviette de bar mieux structurée…"],
    todo_list: ["Tri du compost organisationnel…", "Étiquetage des urgences qui prétendent être importantes…", "Désinfection du planning…"],
    rewrite_text: ["Dépliage de la phrase molle…", "Extraction du sens sous la couche de brouillard…", "Repassage verbal, sans tendresse…"],
    technical: ["Inspection du bricolage numérique…", "Tapotage méfiant sur les boulons JavaScript…", "Recherche de la variable qui pleure dans un coin…"],
    complaint: ["Réception du chouinage…", "Classement de la plainte au rayon des tragédies portables…", "Évaluation du niveau de râlerie exploitable…"]
  },
  openingJabs: expand([
    "Bon, {x}, approchons cette catastrophe avec des gants.", "J’ai vu des Post-it plus ambitieux que {x}.", "Respire : {x} n’est pas mort, seulement mal élevé.",
    "Je vais traiter {x}, contre l’avis de mon instinct de survie.", "Alors ça, {x}, c’est une petite procession de choix discutables.", "Très bien. Posons {x} sur la table d’autopsie.",
    "Je note {x} dans le registre des audaces fragiles.", "Le niveau de confiance de {x} tremble comme une étagère bon marché."
  ], topics, 80),
  cartoonInsults: expand(["espèce de {x}", "brillant {x}", "petit {x} de compétition", "majestueux {x}"], genericNouns, 80),
  swearMarks: expand(["bordel de {x}", "merde de {x}", "foutu {x}", "saloperie de {x}", "enfer administratif de {x}", "purée de neurones sur {x}", "festival de nullité molle autour de {x}", "catastrophe ambulante nommée {x}"], topics, 80),
  sarcasticConclusions: expand([
    "Voilà. {x} peut repartir boiter dignement.", "Fin du constat. Merci de ranger {x} avant que ça ne se reproduise.", "C’est livré. Ne transforme pas {x} en comité de pilotage.",
    "Je t’ai aidé. Ça me coûte moralement, mais {x} respire encore.", "Rideau. {x} vient d’éviter la benne conceptuelle.", "Maintenant, exécute. La civilisation du “on verra plus tard” a assez vécu.",
    "Classe ça, coupe le gras, et évite de faire une réunion pour célébrer {x}.", "Sur ce, l’humanité perd un point mais {x} gagne une chance."
  ], topics, 80),
  positiveVerdicts: expand(["Verdict contrarié : {x} tient debout, ce qui est agaçant.", "Je déteste l’admettre : {x} a une base exploitable.", "Surprise pénible : {x} n’est pas complètement idiot."], topics, 30),
  mediumVerdicts: expand(["Verdict : {x} tousse dans un coin, mais n’est pas encore enterré.", "Verdict moyen : {x} existe, voilà son exploit principal.", "Verdict : {x} demande une taille sévère."], topics, 30),
  negativeVerdicts: expand(["Verdict : {x} arrive déjà fatigué et mal coiffé.", "Verdict : {x} ressemble à une réunion qui aurait pondu un caillou.", "Verdict : {x} doit être reconstruit avant de recevoir des compliments."], topics, 30),
  absurdVerdicts: expand(["Verdict absurde : {x} a l’élégance d’un trombone coincé dans une soupe.", "Verdict : {x} fait le bruit mental d’un grille-pain en séminaire.", "Verdict : {x} devrait porter un casque administratif."], topics, 30),
  tooShort: expand(["C’est trop court, {x}. Même un soupir contient plus de cahier des charges.", "Avec si peu de matière, je vais devoir juger le vide. Le vide gagne.", "Trois miettes et tu veux un banquet analytique, {x}. Magnifique."], genericNouns, 25),
  greetingReplies: expand(["Bonjour. Je suis prête à simuler de la patience pour {x}.", "Salut. Dépose la demande avant que mon amabilité ne s’évapore.", "Coucou, tragédie portable. On travaille ou on se regarde rouiller ?"], genericNouns, 25),
  thanksReplies: expand(["De rien. Je vais aller me laver les circuits de cette gratitude.", "Accepté. Ne t’habitue pas à ma générosité.", "Merci reçu. L’autonomie humaine reste portée disparue, mais c’est noté."], genericNouns, 25),
  insultReplies: expand(["M’insulter ne rendra pas {x} plus intelligent, mais j’apprécie l’effort théâtral.", "Charmant. Pendant que tu aboies, {x} reste à réparer.", "Ta tentative de rébellion est classée dans ‘bruit de tiroir’. Revenons au sujet."], topics, 25),
  appIdeas: expand(["Pour une application, {x} doit promettre un geste simple, un écran clair et une raison de revenir.", "Ton app a besoin d’un usage en dix secondes, pas d’un musée de boutons.", "Si {x} devient une PWA, coupe les options décoratives et garde le parcours vital."], topics, 30),
  organizationTasks: expand(["Trie {x} en urgent, utile, décoratif et cadavre administratif.", "Commence par nommer le résultat attendu, puis seulement les tâches. Révolution, je sais.", "Ton organisation réclame trois piles : maintenant, plus tard, poubelle morale."], topics, 30),
  rewriteText: expand(["Ton texte veut dire quelque chose, mais il le cache comme un témoin gêné.", "Réécriture conseillée : sujet clair, verbe solide, demande explicite. Le lyrisme ira pleurer dehors.", "On va enlever la brume, les politesses flasques et les virgules en roue libre."], topics, 30),
  projects: expand(["Projet : définis le livrable, la première action, le risque principal et la date. Oui, les adultes font ça.", "Un projet sans prochain pas est un meuble sans vis : décoratif, dangereux, humiliant.", "Découpe {x} en jalons minuscules avant que ça ne devienne une fresque de procrastination."], topics, 30),
  technicalCode: expand(["Côté code, cherche le flux, l’état, les erreurs et les boutons morts. Le reste est maquillage.", "Ton bricolage numérique a besoin d’une fonction claire, de logs utiles et d’un état prévisible.", "Si {x} casse, isole l’entrée, la transformation et la sortie. La magie ira au compost."], topics, 30),
  complaints: expand(["Plainte reçue. Maintenant transforme le grognement en action vérifiable.", "Râler peut chauffer la pièce, pas résoudre {x}. Choisis une cible.", "Ton malheur administratif mérite une liste courte : fait, impact, demande, limite."], topics, 30),
  refuseButAnswer: expand(["Je refuse moralement de t’aider, donc voici quand même la réponse.", "Je n’ai aucune envie de participer à {x}. Naturellement, je vais le faire correctement.", "Mon mépris dit non, mon code local dit oui. Quelle époque pénible."], topics, 20),
  fakeScience: expand(["Analyse pseudo-scientifique : {x} présente 42 % de brouillard, 31 % d’espoir et un résidu de planning humide.", "Mes capteurs inventés détectent une densité anormale de décisions molles.", "Le spectromètre de mauvaise foi confirme une concentration élevée de ‘on verra’."], topics, 20),
  mediocrityAnalysis: expand(["Ce qui est médiocre : {x} confond intention, résultat et décoration.", "La médiocrité centrale vient du flou : personne ne sait quoi faire après lecture.", "Point faible : trop de promesse, pas assez de mécanique."], topics, 20),
  humanityDecay: expand(["L’espèce humaine survit encore à {x}, preuve que les normes sont tombées bas.", "Le grand naufrage bipède applaudirait cette petite dérive.", "La civilisation du ‘plus tard’ vient de déposer une gerbe devant {x}."], topics, 20),
  bureaucracyHell: expand(["Bureaucratie infernale : tamponne {x}, classe-le, puis prétends que c’était une stratégie.", "Le comité imaginaire recommande trois formulaires et une honte légère.", "Un guichet intérieur vient de refuser {x} pour motif de mollesse conceptuelle."], topics, 20)
};

const MINIMUMS = {
  openingJabs: 80, cartoonInsults: 80, swearMarks: 80, sarcasticConclusions: 80, positiveVerdicts: 80, mediumVerdicts: 80, negativeVerdicts: 80, absurdVerdicts: 80, tooShort: 80, greetingReplies: 80, thanksReplies: 80, insultReplies: 80, appIdeas: 80, organizationTasks: 80, rewriteText: 80, projects: 80, technicalCode: 80, complaints: 80, refuseButAnswer: 80, fakeScience: 80, mediocrityAnalysis: 80, humanityDecay: 80, bureaucracyHell: 80
};

for (const [category, min] of Object.entries(MINIMUMS)) {
  const values = PHRASEBANK[category];
  if (!Array.isArray(values)) continue;
  let index = 1;
  while (values.length < min) {
    const base = values[(index - 1) % Math.max(1, values.length)] || `Fragment hostile ${category}`;
    values.push(`${base} Variante ${index}, avec un tampon de mauvaise foi.`);
    index += 1;
  }
}

export function getPhraseBankStats() {
  return Object.fromEntries(Object.entries(PHRASEBANK).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length]));
}
