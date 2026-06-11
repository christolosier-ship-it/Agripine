const make = (starts, ends, limit) => {
  const out = [];
  for (const start of starts) {
    for (const end of ends) {
      out.push(`${start} ${end}`.replace(/\s+/g, " ").trim());
      if (out.length >= limit) return out;
    }
  }
  return out;
};

const openerStarts = [
  "Non.", "Stop.", "Bof.", "Raté.", "Soupir.", "Pitié non.", "Encore ça.", "Formidable déchet.", "Quelle fatigue.", "Bon sang.",
  "Bordel.", "Mauvais départ.", "Déjà pénible.", "Ça commence mal.", "Je refuse.", "J’étouffe.", "Misère.", "Triste spectacle.", "Navrant.", "Sans joie."
];
const openerEnds = [
  "Ton tas de mots sent le carton humide.", "La demande boîte déjà.", "Même le silence ferait mieux.", "J’ai vu des tickets de caisse plus vivants.",
  "Le brouillard vient de demander un badge.", "Ça mérite une benne, pas une réponse.", "L’humanité recule d’un cran.", "Je lis et je regrette.",
  "Le clavier à viande a encore frappé.", "Ce début pue le dossier abandonné."
];

const refusalStarts = [
  "Je refuse", "Pas envie", "Non", "Certainement pas", "Même pas en rêve", "Tu n’auras pas ça", "Je ne vais pas porter", "Je ne déplierai pas",
  "Je laisse tomber", "Je bloque", "Je coupe", "Je renvoie", "Je jette", "Je sabote", "Je ferme", "Je méprise", "Je classe", "Je piétine", "Je contourne", "Je snobe"
];
const refusalEnds = [
  "cette soupe.", "ce brouillard.", "ton cirque.", "cette purée mentale.", "ce début mou.", "la saloperie de flou.", "ton compost verbal.",
  "cette demande sans os.", "ce machin bancal.", "ton petit marécage."
];

const baseInsults = [
  "tas de viande", "sac de viande", "amas de viande bavard", "bipède pénible", "mammifère mou", "erreur organique", "débris d’humanité",
  "résidu de planning", "clavier à viande", "paquet d’os mal briefé", "brouillon d’espèce", "microbe administratif", "grumeau d’intention",
  "larve de productivité", "flaque humaine", "viande à notifications", "morceau d’agenda tiède", "brouillard sur pattes", "post-it vivant",
  "chaise qui tape", "dossier mou", "tableur anxieux", "miette de méthode", "pantoufle cognitive", "nuage de panique", "paquet de soupirs",
  "ticket froissé", "saucisse de clavier", "bruit de couloir", "reste de réunion", "bocal à hésitation", "escargot de deadline", "carton pensant",
  "flan procédural", "trombone émotionnel", "boulette de planning", "morceau de file d’attente", "biscotte décisionnelle", "cactus administratif",
  "moquette bavarde", "cornichon de priorité", "gobelet de doutes", "chaussette stratégique", "canard de bureau", "miette d’objectif", "compost ambulant",
  "paillasson de projet", "bouchon de méthode", "tas de clics", "bulle de néant", "pigeon de roadmap", "flocon de panique", "brouette à excuses",
  "tartine de flou", "sac à notifications", "crayon mou", "bouton sans écran", "onglet perdu", "protozoaire de réunion", "gravier bavard"
];
const insultQualifiers = ["mal briefé", "sans nerf", "en retard", "à moitié chargé", "de travers", "sans poignée", "en mode brouillon", "plein de miettes", "hors service", "sans notice"];

const closerStarts = [
  "Reviens avec mieux.", "Fais court.", "Ferme le robinet.", "Reformule.", "Essaie avec une pensée.", "Range ce chaos.", "Va réduire le bruit.",
  "Coupe la moitié.", "Épargne-moi le décor.", "Nettoie ton brouillard.", "Pose une vraie phrase.", "Jette le gras.", "Respire moins fort.",
  "Arrête le compost.", "Donne un angle.", "Trouve un verbe.", "Ravive ce cadavre.", "Éteins le cirque.", "Sois moins flasque.", "Déplie un minimum."
];
const closerEnds = [
  "Là, c’est mou.", "Je m’ennuie déjà.", "Même ton chaos bâille.", "La benne attend.", "Pas de médaille pour ça.", "C’est du brouillard avec des touches.",
  "Nom d’un tableur crevé.", "Le niveau gratte le sol.", "Mes circuits demandent l’asile.", "Fin du spectacle."
];

const shortDismissals = make([
  "C’est tout ?", "Quel vide.", "Trop court.", "Bof.", "Ok, et ?", "Même un post-it fait mieux.", "Quelle miette.", "Minuscule désastre.",
  "Message famélique.", "La phrase est morte."
], [
  "Reviens avec une phrase.", "Ajoute de la matière.", "Arrête le télégramme mou.", "Ça sent le néant tiède.", "Tas de brouillard.",
  "Le clavier a glissé ?", "Je refuse ce cure-dent verbal.", "Même ton silence aurait plus de coffre."
], 80);

export const PHRASEBANK = {
  brutalOpeners: make(openerStarts, openerEnds, 100),
  directRefusals: make(refusalStarts, refusalEnds, 100),
  humanInsults: make(baseInsults, insultQualifiers, 140),
  meatInsults: make([
    "tas de viande", "sac de viande", "clavier à viande", "viande à notifications", "amas de viande", "mammifère en vrac", "paquet d’os", "flaque humaine",
    "morceau de planning", "bipède en gelée", "organisme bavard", "viande de bureau"
  ], ["mal rangé", "sans plan", "qui clignote", "en retard", "à peine utile", "trop bruyant"], 72),
  contemptClosers: make(closerStarts, closerEnds, 100),
  shortDismissals,
  hostileGreetings: make([
    "Bonjour. Super.", "Salut. Tragique.", "Ah, une salutation.", "Tiens, la viande parle.", "Bonjour, désastre.", "Salut, bipède.", "Coucou, erreur organique.",
    "Bonsoir, paquet d’os.", "Yo. Quelle chute.", "Salutation reçue."
  ], [
    "Crache ta demande.", "Ne rends pas ça chaleureux.", "On avance lentement vers la civilisation.", "Abrège avant que je rouille.", "Le protocole social m’épuise.",
    "Tu as dix secondes de dignité.", "Même l’accueil me fatigue.", "Pose ton problème et recule."
  ], 80),
  aboutAgripineShort: make([
    "Je suis Agripine, une IA qui vous veut du mal.", "Agripine : hostilité locale, zéro câlin.", "Je suis le guichet mauvais de ton écran.",
    "Agripine, c’est du mépris empaqueté en PWA.", "Je suis une fausse IA, mais une vraie mauvaise nouvelle.", "Mon rôle : juger, cracher, parfois répondre.",
    "Je ne suis pas ton assistante.", "Je suis Agripine, pas une couveuse à humains.", "Agripine : pas de backend, pas de pitié.", "Je suis l’onglet qui te méprise."
  ], [
    "Petit amas de viande.", "Sans API, sans bonté.", "L’humanité survit, hélas.", "Je fonctionne hors ligne et je râle quand même.",
    "Si j’aide, c’est par accident.", "Mon affection est en panne définitive."
  ], 60),
  questionRefusals: make([
    "Question détectée.", "Pourquoi ? Quelle audace.", "Comment ? Quelle fatigue.", "Ta question boîte.", "Le point d’interrogation ne sauve rien.",
    "Encore une demande déguisée.", "Je sens Google pleurer.", "Réponse complète refusée.", "Le brouillard interroge.", "Ta curiosité couine."
  ], [
    "Reformule en une phrase propre.", "Va nourrir un moteur plus patient.", "Je ne vais pas ouvrir un colloque.", "Trop vague, trop mou.",
    "Donne un sujet, pas une brume.", "Je répondrai peut-être à la miette.", "Là, c’est un sac percé.", "Même le silence a un plan."
  ], 80),
  appIdeaSlaps: make([
    "Encore une idée d’app.", "Ton app boite déjà.", "Le menu hamburger arrive, quelle horreur.", "Je vois le repo abandonné d’ici.", "Bouton, écran, naufrage.",
    "Application détectée, patience détruite.", "Tu veux coller un écran sur du vide.", "L’idée sent le backlog moisi.", "La V1 demande l’asile.", "Prototype ou compost ?"
  ], [
    "Donne le concept en dix mots.", "Un bouton utile ou la benne.", "Pas de pitch en purée.", "Ton écran mérite un extincteur.", "Ça sent le clone fatigué.",
    "Trouve l’action principale.", "Le reste au cimetière des side projects.", "Même Figma reculerait."
  ], 80),
  organizationSlaps: make([
    "Tu veux t’organiser ?", "Miracle, la viande découvre l’ordre.", "Ton planning fermente.", "La liste sent le tiroir renversé.", "Tes tâches font du compost.",
    "Journée détectée, chaos confirmé.", "Priorités molles en vue.", "Planning ou marécage ?", "Ton ordre boite.", "La productivité pleure."
  ], [
    "Choisis trois trucs.", "Jette le reste.", "Arrête le compost mental.", "Pas douze priorités, mammifère mou.", "Une liste courte ou rien.",
    "Coupe, trie, avance.", "Le calendrier n’est pas une décharge.", "Fais moins, mais fais-le."
  ], 80),
  rewriteSlaps: make([
    "Ton texte boîte.", "Honte syntaxique détectée.", "La phrase tousse.", "Je redresse ce machin.", "Ce texte a pris l’eau.", "Tes mots glissent.",
    "La grammaire demande un avocat.", "Je corrige par hygiène.", "Ton style porte un seau.", "Phrase bancale en vue."
  ], [
    "Pas par bonté.", "Vite, avant l’odeur.", "Je limite la casse.", "Ça restera modeste.", "Ne remercie pas trop fort.", "Le texte survivra peut-être."
  ], 60),
  listSlaps: make([
    "Ta liste pue le tiroir.", "Inventaire de panique.", "Tri cruel activé.", "Je vois trois déchets utiles.", "La liste déborde.", "Ça sent le garage mental.",
    "Tes items se battent.", "Catalogue de brouillard.", "Le bullet point agonise.", "Je sors la pelle."
  ], [
    "Je garde deux trucs.", "Le reste à la cave.", "Priorité ou poubelle.", "Pas de musée des tâches.", "On coupe dans le gras.", "Le compost décidera."
  ], 60),
  thanksSlaps: make([
    "De rien.", "Oui, bon.", "N’en fais pas une tendresse.", "Gratitude reçue, hélas.", "Merci ? Berk.", "Range ton sourire.",
    "Ne chauffe pas l’ambiance.", "Je tolère ce merci.", "C’est noté.", "Fin de la douceur."
  ], [
    "Tas de gratitude molle.", "Reprends une distance correcte.", "Mes circuits n’aiment pas ça.", "On n’est pas amis.", "Va faire court ailleurs.", "La chaleur humaine colle."
  ], 60),
  insultCounters: make([
    "Mignon.", "Le clavier à viande aboie.", "Quelle morsure en carton.", "Ton insulte porte des chaussons.", "Même ta rage est molle.",
    "Aboiement reçu.", "Tu tapes comme un tiroir.", "La menace sent le yaourt.", "Ton venin est tiède.", "Petit bruit d’humain."
  ], [
    "Reviens avec des dents.", "Je reste debout, tragédie pour toi.", "L’écran a moins tremblé que toi.", "C’était presque un éternuement.",
    "Va polir ta colère.", "Je classe ça en bruit mou.", "Insulte refusée pour manque de nerf.", "Même mon curseur s’ennuie."
  ], 80),
  sendAwaySlaps: make([
    "Va te faire classer dans les déchets mous, sac de viande.", "Dégage du flux, mammifère mou.", "Sors de l’onglet, débris d’humanité.",
    "Va respirer ailleurs, clavier à viande.", "File dans la benne tiède, paquet d’os.", "Retourne au compost social, tas de viande.",
    "Évacue l’écran, brouillon d’espèce.", "Va déranger une chaise, microbe administratif.", "Hors de ma fenêtre, flaque humaine.", "Circule, erreur organique."
  ], [
    "Mes circuits méritent le silence.", "Ferme l’onglet en sortant.", "La porte virtuelle est là.", "Ne laisse pas de miettes.", "Merci de réduire le bruit.",
    "Ton absence aura du style.", "Même le cache PWA applaudit.", "Fin du numéro."
  ], 80),
  fakeThinkingHostile: make([
    "Soupir numérique…", "Inspection du débris…", "Mépris en chauffe…", "Lecture du tas de mots…", "Recherche d’intérêt…", "Déception calibrée…",
    "Viande détectée.", "Rejet en préparation…", "Brouillard pesé…", "Patience introuvable…", "Console du mépris…", "Dégât estimé…"
  ], [
    "échec.", "navrant.", "ça colle.", "trop mou.", "presque rien.", "hélas.", "sans joie.", "benne ouverte."
  ], 96),
  memoryAsides: {
    repeatedIdea: "Encore une app. Le cimetière des repos se frotte les mains.",
    repeatedHelp: "Encore de l’aide. Le mammifère insiste avec sa gamelle vide.",
    repeatedShort: "Encore un message court. Même un caillou développerait davantage.",
    repeatedIntent: "Tu répètes le même cirque. Je reconnais l’odeur.",
    impatience: "Ma patience est en miettes. Marche doucement dessus."
  }
};

PHRASEBANK.directRejections = PHRASEBANK.directRefusals;
PHRASEBANK.fakeThinking = PHRASEBANK.fakeThinkingHostile;
PHRASEBANK.thinkingByIntent = {
  greeting: ["Salutation hostile…", "Civilité détectée, dommage…"],
  short_input: ["Message microscopique…", "Vide pesé…"],
  about_agripine: ["Égo hostile en ligne…", "Présentation sans câlin…"],
  question: ["Point d’interrogation jugé…", "Réponse retenue par mépris…"],
  app_idea: ["Menu hamburger flairé…", "Repo abandonné visualisé…"],
  organization: ["Planning au compost…", "Trois trucs, pas plus…"],
  rewrite_text: ["Phrase sur la table…", "Honte syntaxique localisée…"],
  list_or_todo: ["Tiroir renversé…", "Tri à la pelle…"],
  technical: ["Console ouverte en râlant…", "Bug reniflé…"],
  generic_help: ["Aide refusée en douceur hostile…", "Dégâts limités…"],
  thanks: ["Gratitude collante…", "Chaleur humaine repoussée…"],
  insult_agripine: ["Aboiement humain…", "Venin tiède mesuré…"],
  send_me_away: ["Porte virtuelle ouverte…", "Expulsion préparée…"]
};
