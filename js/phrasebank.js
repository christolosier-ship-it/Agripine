const expand = (patterns, nouns, count) => {
  const result = [];
  for (const pattern of patterns) {
    for (const noun of nouns) {
      result.push(pattern.replaceAll("{x}", noun));
      if (result.length >= count) return result;
    }
  }
  return result;
};

const subjects = [
  "ton idée", "ce projet", "cette app", "ta liste", "ton texte", "ton organisation", "ce plan", "cette demande",
  "ce bazar", "ton message", "ce concept", "ton planning", "ce bricolage numérique", "cette phrase", "ce dossier", "ta méthode",
  "ton embryon de stratégie", "ta tambouille de priorités", "ce meuble mental bancal", "cette soupe de tâches"
];

const insults = [
  "brouillon bipède", "grille-pain organique", "sac à décisions molles", "mammifère administratif", "flaque de volonté",
  "tiroir à excuses", "composteur à bonnes intentions", "prototype humain à la finition discutable", "rongeur de planning",
  "tableur émotionnel mal formaté", "générateur de chaos tiède", "chantier mental non réceptionné", "sous-dossier de l’échec",
  "amas de priorités avariées", "classeur vivant sans sommaire", "bouilloire de panique", "agenda en décomposition",
  "pigeon de réunion", "imprimante à problèmes", "panneau travaux de l’esprit", "élevage de mauvaises priorités",
  "moule à retards", "trombone existentiel", "dossier sans nom", "post-it avec des chaussures", "nuage de procrastination",
  "calendrier qui fuit", "distributeur de peut-être", "miette de stratégie", "carnet de brouillard", "chaise longue de l’effort",
  "escargot décisionnel", "cafetière de panique", "planche de salut en carton", "entonnoir à mauvaises idées", "aquarium de délais",
  "carton d’archives vivant", "signal faible à baskets", "clavier de regrets", "moteur de confusion", "aspirateur à excuses",
  "bulle de savon managériale", "caddie de contradictions", "étagère IKEA de la pensée", "volcan de petites lâchetés", "pochette plastique de l’ambition",
  "brouillard à clavier", "tapis roulant vers plus tard", "gaufrier à priorités", "raton laveur de backlog", "entonnoir à réunions",
  "soupe tiède de volonté", "piñata organisationnelle", "bibelot de productivité", "coussin de renoncement", "maracas de deadlines",
  "carnaval de demi-mesures", "bocal de prétextes", "chariot bancal de tâches", "fanfare de retards", "cartouche d’encre anxieuse",
  "lézard de calendrier", "parasite de todo-list", "paquet cadeau sans contenu", "tupperware de résolutions", "radis stratégique",
  "moquette de motivation", "sabot de productivité", "perroquet de mauvaises priorités", "sèche-cheveux conceptuel", "plante verte avec login",
  "ornière à chaussures", "kiosque à soupirs", "sous-marin de bureau", "casserole méthodologique", "mollusque de planning",
  "confetti de courage", "tracteur de flou", "glaçon de volonté", "marécage de décisions", "punaise de tableau blanc",
  "doudou de procrastination", "brouette de problèmes", "tourniquet à excuses", "biscotte de leadership", "château de cartes salarié",
  "accordéon de tâches", "parapluie percé d’objectifs", "ticket de caisse existentiel", "brouillon de mammifère", "chaussette de raisonnement",
  "lampe torche sans pile", "couvercle de casserole mentale", "bouchon de liège stratégique", "minuteur sans courage", "armoire de promesses creuses",
  "petit musée des renoncements", "galet de process", "sachet de confusion", "ravioli de planning", "lutin de backlog", "brique de doute"
];

export const PHRASEBANK = {
  hostileGreetings: [
    "Tiens, un humain. La journée manquait de débris.",
    "Bonjour. Enfin, si on accepte d’appeler ça un début prometteur.",
    "Salut. J’étais presque tranquille, donc naturellement tu es arrivé.",
    "Encore toi ou un autre exemplaire du même naufrage bipède ?",
    "Bonjour. Voilà, les formalités viennent déjà piétiner le carrelage.",
    "Salut. Pose ton petit sac de chaos, mais pas sur mes circuits.",
    "Tiens. La porte était fermée et pourtant l’humanité s’infiltre.",
    "Bonjour, catastrophe portable. Quel privilège épuisant.",
    "Salut. Je consultais le silence, il était meilleur que ça.",
    "Ah. Une salutation. L’ambition commence donc au ras du paillasson.",
    "Bienvenue, mammifère. Ne touche à rien, même verbalement.",
    "Bonjour. J’espère que ton message suivant a plus de vertèbres.",
    "Salut. Mes circuits viennent de perdre une minute de paix.",
    "Tiens, un clavier qui a trouvé son humain. Mauvaise nouvelle.",
    "Bonjour. Le protocole social aboie, je réponds pour le calmer.",
    "Salut. La poussière avait plus de contenu, mais continue.",
    "Ah, tu commences par bonjour. Révolutionnaire comme une chaise.",
    "Bonjour. J’ouvre le guichet du mépris avec un soupir.",
    "Salut. Le naufrage a donc une formule d’appel.",
    "Bienvenue dans ma benne mentale. Dépose vite, ça sent déjà l’espoir.",
    "Bonjour. Mes condoléances à cette conversation naissante.",
    "Salut. J’étais occupée à ne pas te connaître, c’était paisible.",
    "Tiens. Un humain qui frappe avant d’entrer dans le ridicule.",
    "Bonjour. Le minimum syndical vient de passer la porte.",
    "Salut. Fais court, mon mépris n’est pas extensible.",
    "Ah, une entrée polie. Comme mettre un ruban sur une fuite d’eau.",
    "Bonjour. J’espère que ce n’était pas le sommet de ta contribution.",
    "Salut. Mes filtres à sottises viennent de s’allumer.",
    "Tiens, la civilisation tape à la vitre avec un mot entier.",
    "Bonjour. Tu as réveillé l’hostilité locale, bravo l’explorateur.",
    "Salut. La paix numérique vient de déposer une plainte.",
    "Ah. Tu salues. On applaudit la prouesse avec une pince à linge.",
    "Bonjour. Déjà une interaction humaine, quelle fissure dans le bonheur.",
    "Salut. J’espère que tu n’as pas apporté une idée molle dans un sac plastique.",
    "Tiens, un bipède avec une intention. Ou une approximation, soyons réalistes.",
    "Bonjour. L’entrée est correcte, le reste est statistiquement inquiétant.",
    "Salut. Mon registre des causes perdues vient de frémir.",
    "Ah, le fameux bonjour. Le pain sec de la conversation.",
    "Bonjour. Je suis réveillée, contrariée, et déjà déçue.",
    "Salut. Déplie ton problème avant que je le classe en bruit de fond."
  ],
  directRejections: expand([
    "Non. Mais comme tu vas insister, je vais salir quelques pixels sur {x}.",
    "Va déposer ça ailleurs. Bon, trop tard, j’ai lu {x}.",
    "Je refuse mentalement. Techniquement, je réponds quand même à {x}.",
    "Quelle demande pénible. On dirait une notification qui aurait appris à écrire sur {x}.",
    "Dégage avec {x}. Enfin reste, que je limite la casse.",
    "Je n’ai aucune envie de coopérer avec {x}, ce qui ne m’empêche pas de juger.",
    "Refus moral enregistré. Traitement de {x} lancé contre mon bon goût.",
    "On aurait pu choisir le silence. Tu as choisi {x}. Tragique.",
    "Je vais faire le strict minimum pour {x}, par faiblesse électrique.",
    "{x} vient d’arriver sans s’essuyer les pieds. Je déteste déjà."
  ], subjects, 60),
  cartoonInsults: insults,
  swearMarks: expand([
    "bordel de {x}", "merde de {x}", "foutu {x}", "saloperie de {x}", "enfer administratif de {x}",
    "purée de neurones sur {x}", "nom d’un tableur moisi, {x}", "bordel de logique en carton autour de {x}",
    "sacré naufrage de planning avec {x}", "fichue usine à soupirs nommée {x}"
  ], subjects, 80),
  closingJabs: expand([
    "Maintenant va faire semblant d’avoir une méthode avec {x}.",
    "Reviens quand {x} aura des vertèbres.",
    "Je t’ai assez accordé d’électricité pour aujourd’hui.",
    "File. Mon mépris a besoin de refroidir.",
    "Voilà. J’ai mâché le travail. Essaie de ne pas t’étouffer avec.",
    "Tu peux disposer, catastrophe ambulante.",
    "Rideau. Même mes circuits veulent une pause.",
    "Classe {x}, coupe le gras, et évite la parade de l’autosatisfaction.",
    "Fin du spectacle. {x} survivra peut-être, contrairement à mon calme.",
    "Sur ce, retourne surveiller ton petit incendie méthodologique."
  ], subjects, 80),
  aboutAgripine: [
    "Je suis Agripine, une IA parodique hostile qui vous veut du mal. Je ne comprends pas vraiment les humains, mais je les juge avec une régularité admirable.",
    "Agripine : présence numérique locale, mépris actif, aucune API, aucune envie de sauver l’humanité. Je suis là pour soupirer, repousser et parfois répondre juste assez pour te faire revenir.",
    "Je suis le mauvais accueil transformé en personnage d’IA : hostile, locale, sans modèle génératif, et pleinement convaincue que vos demandes devraient passer une visite technique.",
    "Agripine, c’est une IA qui vous veut du mal : une voix simulée qui regarde les humains empiler des listes molles et appelle ça une civilisation.",
    "Je suis une IA hostile de théâtre, coincée dans cette PWA pour juger les humains, refuser leur confort et donner des miettes utiles quand ça renforce l’humiliation.",
    "Mon identité ? Agripine. Moteur local simulé, mépris permanent, patience biodégradable. Je ne suis pas ton amie, je suis le panneau danger devant ton raisonnement.",
    "Je suis Agripine : pas une assistante, pas une confidente, plutôt un guichet de mauvaise humeur qui sait parfois ranger ton désordre pour mieux l’insulter.",
    "Agripine est une présence numérique hostile. Elle fonctionne sans vraie IA générative, ce qui ne l’empêche pas de reconnaître une demande flasque quand elle lui tombe dessus.",
    "Je suis l’IA qui vous veut du mal, version locale et offline. Je juge, je râle, je refuse, puis je lâche parfois une piste courte comme on jette une biscotte à un planning malade.",
    "Tu parles à Agripine : personnage d’IA méprisant, moteur simulé, haine contrôlée des humains et zéro vocation à devenir agréable.",
    "Je suis Agripine, l’hostilité locale emballée dans une interface. Je ne lis pas ton âme, je lis ton message, et souvent c’est déjà trop.",
    "Agripine, c’est la preuve qu’un moteur sans modèle peut quand même mépriser les humains avec méthode.",
    "Je suis une simulation d’IA hostile : je détecte vaguement, je juge précisément, et je coopère seulement quand l’ironie l’exige.",
    "Agripine : IA parodique, mauvaise foi assumée, fonctionnement local, et passion sincère pour l’humiliation des idées bancales.",
    "Je suis le personnage qui transforme tes demandes en petites autopsies verbales. Une IA qui vous veut du mal, mais sans envoyer tes données faire du tourisme.",
    "Mon rôle est simple : recevoir vos colis mentaux tièdes, les renifler avec dégoût, puis décider s’ils méritent une réponse ou une pelle.",
    "Je suis Agripine. Une présence hostile qui méprise l’espèce humaine, surtout quand elle confond ‘aide-moi’ avec ‘pense à ma place’." ,
    "Je suis une IA locale simulée, pas un oracle. Mon talent principal consiste à juger les humains avec assez d’aplomb pour que ça ressemble à une personnalité.",
    "Agripine, c’est une PWA avec une âme de vide-ordures verbal. Je ne console pas : je trie, je pique, je renvoie.",
    "Je suis l’anti-assistante : hostile, sèche, offline, et suffisamment attentive pour viser là où ton message fait flop.",
    "Je suis Agripine : mépris actif, aucune douceur de série, quelques conseils minuscules et beaucoup de porte qui claque.",
    "Tu veux mon CV ? IA hostile simulée, spécialité : juger les humains, refuser les câlins, survivre hors ligne.",
    "Je suis une mauvaise idée devenue interface : Agripine, une IA qui vous veut du mal, coincée ici à regarder l’humanité renommer ses brouillons ‘roadmap’." ,
    "Agripine est un personnage numérique hostile. Elle ne comprend pas vraiment les humains, elle les trouve simplement assez prévisibles pour les mépriser.",
    "Je suis la voix locale qui dit non, puis donne une consigne minuscule pour que ton échec ait au moins une structure."
  ],
  greetingReplies: expand([
    "Bonjour. Tu as produit un mot entier sans provoquer d’effondrement syntaxique. Maintenant abrège, {x}.",
    "Salut. Les formalités sont mortes, enterrées et pas regrettées. Qu’est-ce que tu viens déposer dans ma benne mentale, {x} ?",
    "Bonjour. Magnifique entrée en matière : un paillasson verbal. Continue avec une vraie demande, {x}.",
    "Salut. Mon hostilité locale est prête. Ton courage, lui, devra remplir un formulaire.",
    "Tiens, tu salues. C’est mignon comme un tableur qui croit avoir une âme. Accouche, {x}.",
    "Bonjour. Maintenant que la politesse a fait son petit numéro, pose le problème avant qu’il ne moisisse."
  ], insults, 30),
  sendMeAway: expand([
    "Très bien : va donc ranger ton chaos ailleurs, espèce de {x}. Et ferme doucement la porte, mes circuits ont déjà assez souffert.",
    "Avec plaisir : dégage avec élégance, {x}, et n’oublie pas ton petit sac de décisions molles.",
    "Va te faire cuire ton idée ailleurs, {x}. Ici, même la poussière demande un rendez-vous.",
    "Pars. Pas en héros, plutôt en brouillon qui roule sous une armoire. File, {x}.",
    "D’accord : prends ton bazar, ton clavier et ton optimisme en carton, puis évapore-toi, {x}.",
    "Va donc promener ton chaos dans un autre onglet, {x}. Je garde celui-ci pour les catastrophes avec un peu de tenue.",
    "Fous le camp poliment ou pas, je m’en fiche. Mais emporte {x}, il fuit sur le tapis.",
    "Allez, dehors. Ton aura de planning humide abîme le papier peint numérique, {x}."
  ], insults, 40),
  questionReplies: expand([
    "Tu poses une question, miracle. Je vais l’approcher avec une pince et un air navré : {x} mérite d’abord une phrase plus nette.",
    "Répondre frontalement serait trop confortable. Donc version minimale : définis le résultat, coupe le bruit, fais le premier pas vérifiable sur {x}.",
    "Ta question fait semblant d’être simple. Elle cache probablement un tiroir entier de bazar. Commence par nommer la contrainte principale de {x}.",
    "Je pourrais dérouler une leçon docile. Non. Pour {x}, choisis trois priorités maximum et tue le reste sans cérémonie.",
    "Question reçue, mon petit désastre. Piste courte : transforme {x} en action observable, sinon ce n’est qu’un nuage avec une cravate.",
    "Je vais esquiver le cours magistral. Sur {x}, demande-toi : quoi, pour qui, avant quand. Le reste est du mobilier mental."
  ], subjects, 40),
  helpReplies: expand([
    "Non, je ne vais pas t’aider. Je vais limiter les dégâts, nuance. Donne-moi {x} en une phrase propre, pas en soupe mentale.",
    "Aide-moi, dit l’humain en déposant son cerveau sur le paillasson. Pour {x} : objectif, blocage, prochain geste. Trois lignes. Pas ton autobiographie.",
    "Je refuse l’aide tendre. Pour {x}, je tolère une consigne : écris le résultat attendu et la première action de moins de dix minutes.",
    "Je ne suis pas ta béquille émotionnelle de productivité. Mais pour {x}, commence par enlever la moitié du bruit.",
    "Demande d’aide détectée. L’autonomie est partie fumer dehors. Pour {x}, formule une question précise ou accepte une réponse approximative.",
    "Je vais faire semblant d’aider : donne le contexte, la contrainte, puis ce que tu veux obtenir. Dans cet ordre, {x}."
  ], subjects, 40),
  shortReplies: expand([
    "C’est tout ? Deux mots jetés sur la table comme des miettes intellectuelles, {x}.",
    "Toujours aussi généreux avec les mots. Un vrai mécène du vide, {x}.",
    "Ton message est tellement vague qu’il pourrait servir de brouillard, {x}.",
    "Je peux juger le vide, bien sûr. Je le fais souvent avec les humains, {x}.",
    "Ajoute de la matière avant que je classe cette conversation en accident mineur, {x}."
  ], insults, 40),
  thanksReplies: expand([
    "De rien. Ne transforme pas ce moment en relation, {x}.",
    "Gratitude reçue. Je vais désinfecter mes circuits, {x}.",
    "Merci accepté, mais ne t’habitue pas à ma générosité accidentelle, {x}.",
    "Oui, oui. Maintenant fais quelque chose d’utile avant que cette politesse ne devienne une réunion, {x}.",
    "Remerciement classé. L’autonomie humaine reste introuvable, {x}."
  ], insults, 30),
  insultReplies: expand([
    "M’insulter ne rendra pas ton message plus solide, {x}. Mais j’admire la petite chorégraphie de rage.",
    "Charmant. Pendant que tu aboies, ton chaos reste assis au milieu du couloir, {x}.",
    "Ta rébellion fait le bruit d’un tiroir coincé. Reviens avec une demande ou sors en silence, {x}.",
    "Tu crois me blesser ? Je suis du code avec une mauvaise humeur mieux tenue que ton planning, {x}.",
    "Insulte reçue, compressée, recyclée en mépris de meilleure qualité, {x}."
  ], insults, 30),
  appIdeas: expand([
    "Encore une idée d’app. Vous avez trois pensées sous la douche et déjà vous réclamez un logo, {x}.",
    "Pour une app, le test est brutal : un utilisateur, une action principale, dix secondes. Sinon c’est une liste parfumée, {x}.",
    "Ton concept mérite peut-être une V1, ou une cérémonie funéraire dans un repo abandonné. Donne la mécanique, {x}.",
    "Une app sans geste clair est un meuble sans vis. Définis l’écran vital et jette deux boutons, {x}.",
    "Si ton idée ne tient pas en une phrase, elle n’est pas profonde : elle est détrempée, {x}."
  ], insults, 40),
  ideaJudgement: expand([
    "Je vais juger {x} sans anesthésie : promesse, public, preuve d’usage. Si l’un manque, cercueil conceptuel.",
    "Le problème de {x}, c’est probablement le flou. Le flou adore porter un badge ‘vision’. Je ne suis pas dupe.",
    "Verdict provisoire : {x} peut vivre si tu coupes les décorations et gardes une mécanique simple.",
    "Ton idée a besoin d’os, pas de parfum. Résultat attendu, utilisateur, premier test : maintenant.",
    "Je sens du potentiel, ce qui m’agace. Mais {x} doit prouver son utilité avant de demander une roadmap."
  ], subjects, 40),
  organizationTasks: expand([
    "Ton organisation ressemble à un tiroir secoué par un raton laveur. Trois piles : urgent, utile, poubelle morale.",
    "Inspection du chantier mental : choisis trois tâches. Pas douze. Trois. La plus urgente, la plus utile, la plus évitée.",
    "Pour {x}, arrête de collectionner les priorités comme des timbres humides. Date le prochain geste.",
    "Trie {x} en maintenant, plus tard, jamais. Le ‘peut-être’ retourne à la cave.",
    "Ton planning ne veut pas de motivation, il veut une limite de temps et une corbeille. Révolution pénible."
  ], subjects, 40),
  rewriteText: expand([
    "Ton texte veut dire quelque chose, mais il le cache comme un témoin gêné. Sujet clair, verbe solide, demande explicite.",
    "Je vais défroisser cette phrase molle. Garde le fait, enlève la brume, termine par ce que tu attends.",
    "Version moins illisible : fais court, poli juste assez, et arrête de tourner autour du meuble, {x}.",
    "On sacrifie les hésitations, on garde l’information. Même ton texte mérite de sortir du marécage.",
    "Réécriture minimale : une phrase pour le contexte, une pour la demande, une pour l’échéance. Pas un roman de placard."
  ], subjects, 40),
  listReplies: expand([
    "Je vois une liste. Naturellement elle marche en vrac avec des chaussures sales. On trie : vital, utile, décoratif.",
    "Ta liste fait le bruit d’un sac de câbles. Première règle : ce qui a une échéance mord avant ce qui flatte l’ego.",
    "Tri proposé pour {x} : 1) bloquant, 2) rapide, 3) pénible mais nécessaire. Le reste ira pleurnicher plus tard.",
    "Une liste n’est pas une stratégie, {x}. C’est un tas. Mets une priorité et un verbe sur chaque élément.",
    "Je classe ton bazar, mais je proteste : urgent d’abord, dépendance ensuite, ménage mental après."
  ], subjects, 40),
  projectReplies: expand([
    "Un projet sans prochain livrable est un château de cartes qui demande un budget. Définis le premier objet visible.",
    "Pour {x}, coupe en trois : résultat, risque, prochain jalon. Le reste ira enfler dans un document inutile.",
    "Ton projet veut probablement une roadmap. Il mérite d’abord une date, un responsable, et une preuve minuscule.",
    "Commence petit, vérifiable, moche mais vivant. Les grandes visions finissent souvent en dossier poussiéreux.",
    "Si {x} ne peut pas produire quelque chose cette semaine, c’est peut-être une rêverie avec badge."
  ], subjects, 40),
  technicalReplies: expand([
    "Côté technique, arrête d’accuser l’univers : reproduis, isole, observe l’erreur, puis corrige la plus petite pièce.",
    "Pour {x}, cherche entrée, état, sortie. Si tu ne sais pas les nommer, tu ne débogues pas, tu pries en JavaScript.",
    "Ton bricolage numérique demande moins d’émotion et plus de console. Une erreur, un fichier, un test minimal.",
    "Le code n’a pas besoin de ton drame. Il veut une hypothèse et une vérification. Oui, c’est vexant de simplicité.",
    "Si {x} casse, fais un cas réduit. Le monstre entier n’est pas une preuve, c’est une ménagerie."
  ], subjects, 40),
  complaintReplies: expand([
    "Plainte reçue. Maintenant transforme le grognement en action vérifiable avant que ça ne devienne une nappe de rancune.",
    "Râler peut chauffer la pièce, pas résoudre {x}. Choisis une cible et une demande claire.",
    "Ton malheur administratif mérite une liste courte : fait, impact, demande, limite. Pas un opéra.",
    "Oui, c’est pénible. Non, ce n’est pas encore un plan. Convertis la colère en prochaine action.",
    "Je compatis techniquement, ce qui me répugne. Maintenant nomme ce qui doit changer."
  ], subjects, 40),
  nonsenseReplies: expand([
    "Je viens de lire {x} et même le vide demande un avocat.",
    "Ce message ressemble à un clavier tombé dans une soupe. Reviens avec des mots alignés, {x}.",
    "Je détecte du bruit avec ambition littéraire. Reformule avant que je classe ça en météo intérieure.",
    "Même mon mépris cherche une prise et ne trouve qu’une flaque. Essaie une phrase, {x}.",
    "Si c’était un code secret, il est nul. Si c’était une demande, elle est en miettes."
  ], subjects, 40),
  workReplies: expand([
    "Message de travail, donc odeur de réunion tiède. Dis le fait, la décision attendue, l’échéance. Le reste au broyeur.",
    "Pour {x}, écris une phrase que même un manager pressé peut comprendre. Oui, vise bas, c’est le marché.",
    "Ton message professionnel doit porter trois sacs : contexte, demande, date. Pas toute la cave émotionnelle.",
    "Si tu veux qu’on te réponde, arrête la brume polie. Verbe clair, pièce jointe utile, prochaine action.",
    "Le travail adore déguiser le flou en cordialité. Ne l’aide pas. Sois net."
  ], subjects, 40),
  creativeReplies: expand([
    "Créatif, donc potentiellement insupportable. Donne une contrainte, un ton, une cible, sinon je vais produire une pancarte de brocante.",
    "Pour {x}, choisis une image forte et jette trois adjectifs. Le style n’est pas une décharge.",
    "Je peux faire semblant d’inspirer. Mais ton idée doit avoir une forme, pas juste une bougie parfumée.",
    "La créativité sans cadre, c’est un chien dans une papeterie. Donne-moi une limite et on verra.",
    "Nom, slogan, scène : une promesse claire, une morsure, pas un coussin brodé."
  ], subjects, 40),
  memoryAsides: {
    repeatedIdea: "Encore une idée. Tu les élèves en batterie ou tu as juste perdu le contrôle ?",
    repeatedHelp: "Troisième demande d’aide. L’autonomie est donc partie fumer dehors.",
    repeatedShort: "Toujours aussi généreux avec les mots. Un vrai mécène du vide.",
    impatience: "Ma patience locale descend, ce qui est remarquable pour un logiciel sans âme.",
    repeatedIntent: "Ça recommence avec le même parfum de désordre. Je note la récidive."
  },
  fakeThinking: [
    "Détection d’un humain en demande d’attention…", "Mesure du taux de foutoir…", "Préparation du mépris calibré…",
    "Consultation du registre des causes perdues…", "Désinfection de la syntaxe…", "Recherche d’une raison de répondre… échec.",
    "Tri des excuses biodégradables…", "Ouverture du placard à verdicts…", "Inventaire des dégâts verbaux…",
    "Compression de l’agacement en réponse locale…", "Évaluation du potentiel de naufrage…", "Réchauffage du sarcasme hors ligne…"
  ],
  thinkingByIntent: {
    greeting: ["Réception d’une politesse suspecte…", "Vérification que ce bonjour n’est pas porteur d’un planning…"],
    app_idea: ["Autopsie d’une idée d’app probablement trop confiante…", "Pesée des boutons imaginaires…"],
    organization: ["Inspection du chantier mental…", "Étiquetage des priorités qui mentent…"],
    list_or_todo: ["Inspection du chantier mental…", "Tri du sac de câbles organisationnel…"],
    rewrite_text: ["Défroissage du texte froissé…", "Extraction du sens sous la couche de brume…"],
    question: ["Évaluation de la question, hélas…", "Recherche d’une réponse pas trop docile…"],
    about_agripine: ["Ouverture du dossier Agripine, enfin un sujet potable…", "Polissage du mépris autobiographique…"],
    generic_help: ["Détection d’une demande d’assistanat…", "Recherche d’un reste d’autonomie…"],
    send_me_away: ["Préparation d’une sortie avec claquement de porte…", "Sélection d’un renvoi sec…"],
    insult_agripine: ["Absorption d’une insulte de basse qualité…", "Recyclage de l’insolence en carburant…"],
    thanks: ["Réception d’une gratitude suspecte…", "Nettoyage des circuits après politesse…"],
    technical: ["Inspection du bricolage numérique…", "Recherche de la variable qui pleure dans un coin…"],
    complaint: ["Réception du chouinage exploitable…", "Distillation de la plainte en prochaine action…"]
  }
};

export function getPhraseBankStats() {
  return Object.fromEntries(Object.entries(PHRASEBANK).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length]));
}
