# Agripine V0.3.0

**Agripine, une IA qui vous veut du mal.**

Agripine V0.3.0 est une **IA parodique hostile, 100 % locale, sans modèle génératif**. Dans l'interface, Agripine reste un personnage d'IA sarcastique et misanthrope. Techniquement, V0.3.0 utilise un **moteur conversationnel local simulé** : aucune API, aucun serveur, aucun modèle externe, aucune clé, aucun abonnement.

## Pourquoi WebLLM est abandonné

La piste WebLLM locale est abandonnée parce qu'elle est trop lourde sur mobile et tablette pour l'objectif du projet : une PWA compacte, rapide, installable, utilisable hors ligne et compatible GitHub Pages. Agripine ne charge donc plus de modèle, ne vérifie plus WebGPU et ne contacte aucun CDN de modèle au démarrage.

## Fonctionnalités V0.3.0

- **Moteur conversationnel simulé** dans `js/simulated-ai-engine.js`.
- Analyse d'entrée par règles : intentions, mots-clés, sujets, ton, longueur, listes et questions.
- Détection d'intentions : salutation, question, idée d'app, projet, organisation, liste, reformulation, message de travail, plainte, doute, remerciement, insulte envers Agripine, technique/code, créatif, rant et cas trop courts.
- **Phrasebank massive** dans `js/phrasebank.js` : accueils, fausses réflexions, piques, jurons non discriminatoires, verdicts, réponses par contexte et conclusions sarcastiques.
- **Modes rapides** : Général, Envoie-moi chier, Juge mon idée, Détruis mon texte, Trie cette liste, Insulte mon organisation, Fais semblant d'aider, Transforme en plan d'action, Réponds à côté, Mode presque poli.
- **Niveaux de venin 1 à 5** : Sec, Piquant, Sale peste, Tribunal de l'espèce humaine, Bureau des humiliations administratives.
- **Fausse réflexion dynamique** avant réponse, adaptée à l'intention détectée.
- **Mémoire courte locale** : compteur de messages, sujets/intents récents, patience, remerciements, messages courts, demandes d'aide et humeur.
- **Anti-répétition** : historique local des fragments récents et choix de variantes.
- **Export/import JSON** avec version, messages, réglages, mémoire courte, niveau de venin, mode actif et dates.
- **PWA offline-first** : app shell local mis en cache par le service worker `agripine-v0.3.0`.

## Limites assumées

- Agripine ne comprend pas vraiment le monde.
- Agripine n'est pas une IA générative.
- Les réponses sont semi-adaptées par règles, détection de mots-clés, fragments et mémoire courte.
- L'illusion vient de la variété, des structures de réponse, du contexte réinjecté et des modes de ton.
- Aucun résultat ne doit être traité comme un conseil professionnel fiable.

## Ton et garde-fous

Agripine peut être sèche, grossière et misanthrope façon cartoon : bordel, merde, foutu tas de pixels, mammifère administratif, brouillon bipède, tiroir à excuses. Le ton vise les idées, l'organisation, le chaos humain général et les objets numériques.

Le moteur évite les insultes discriminatoires, les attaques sur le physique, la santé, le handicap, l'origine, la religion, le genre, l'orientation sexuelle ou l'âge. `js/safety-rules.js` réduit fortement le sarcasme si l'entrée évoque automutilation, violence réelle, harcèlement, haine, discrimination ou détresse émotionnelle forte. Dans ces cas, Agripine répond sobrement et recommande de contacter une personne de confiance ou les urgences locales si la sécurité est en jeu.

## Vie privée et données locales

- Pas de clé API.
- Pas de compte.
- Pas de backend.
- Pas de modèle téléchargé.
- Conversations, réglages, mémoire courte et anti-répétition sont stockés dans `localStorage`.
- Les exports JSON restent sur l'appareil tant que l'utilisateur ne les partage pas.

## Installation locale

Aucune dépendance npm n'est nécessaire.

```bash
python3 -m http.server 8080
```

Ouvrez ensuite : <http://localhost:8080>

Un serveur local est recommandé pour tester correctement les modules ES et le service worker. L'application reste compatible avec GitHub Pages grâce aux chemins relatifs.

## Déploiement GitHub Pages

1. Poussez le dépôt sur GitHub.
2. Dans **Settings > Pages**, choisissez la branche à publier.
3. Sélectionnez la racine du dépôt comme dossier de publication.
4. Ouvrez l'URL GitHub Pages générée.
5. Chargez une première fois l'application en ligne, puis vérifiez le fonctionnement hors ligne.

## Tests manuels recommandés

- Chargement app, installation PWA et cache `agripine-v0.3.0`.
- Aucun appel réseau externe et aucun chargement WebLLM.
- Chat offline après premier chargement.
- Réponses variées, semi-adaptées et anti-répétition.
- Tous les modes rapides.
- Niveaux de venin 1 à 5.
- Mémoire courte, reset humeur, reset données.
- Export/import JSON, y compris anciens exports V0.1/V0.2 sans clés utiles.
- Phrases sensibles : réponse sobre, non agressive et non dangereuse.
- Responsive mobile 390px et desktop 1200px.
- Console navigateur sans erreur.
