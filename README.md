# Agripine V0.3.2

**Agripine, une IA qui vous veut du mal.**

Agripine V0.3.2 est une **PWA parodique hostile, 100 % locale, offline-first et sans vraie IA générative**. Tout fonctionne en HTML/CSS/JavaScript vanilla : aucune API, aucun backend, aucun framework, aucun modèle externe, aucune clé, aucun WebLLM.

## Pivot V0.3.2

Agripine n’est plus une assistante sarcastique qui finit par aider proprement. Elle devient plus directe, plus courte, plus cinglante et plus misanthrope façon cartoon : elle attaque, refuse, esquive, répond parfois à côté et lâche seulement une miette utile quand le moteur simulé le décide.

## Nouveautés V0.3.2

- **Réponses fortement raccourcies** : la réponse standard tient en une ou deux phrases/paragraphes courts, avec une réponse longue très rare.
- **Hostilité renforcée** : ton plus sec, plus insultant façon cartoon, avec des piques génériques non discriminatoires contre “la viande”, les demandes floues et le chaos humain.
- **Suppression du style trop analytique** : plus de micro-consigne systématique, plus de structure de coach productivité, plus de conclusion obligatoire.
- **Moteur simulé plus direct** : formats courts aléatoires, refus secs, faux diagnostics, demi-réponses et réponses à côté.
- **Miettes utiles limitées** : selon l’intention détectée, Agripine peut refuser totalement ou donner une bribe courte, notamment pour réécriture, liste, organisation, bug ou app.
- **Synchronisation minimale avec l’entrée** : Agripine mentionne vaguement le sujet détecté (`app`, `planning`, `texte`, `console`, etc.) sans citer tout le message.
- **Fausses réflexions raccourcies** : une ou deux étapes sèches, durée réduite, textes moins sérieux.
- **Interface moins productive** : placeholder plus méprisant, badges hostiles et message système “Agripine est réveillée. Mauvaise nouvelle pour l’humanité.”
- **Phrasebank refondue** : nouvelles banques courtes et punchy pour refus, insultes cartoon, salutations hostiles, idées d’app, organisation, listes, réécriture, remerciements et expulsion.
- **Export/import V0.3.2** : exporte la pseudo-mémoire, conserve les données locales utiles et ignore les anciennes clés `venomLevel`.
- **Toujours aucune vraie IA générative** : Agripine reste un moteur conversationnel local simulé, compatible GitHub Pages et utilisable hors ligne après le premier chargement.

## Garde-fous

Agripine peut être sèche, grossière et méprisante façon cartoon : “tas de viande”, “clavier à viande”, “bipède pénible”, “microbe administratif”, “bordel”, “merde”, etc. Le ton vise les demandes, les idées, l’organisation, le chaos humain général et les objets numériques.

Le moteur évite les insultes discriminatoires, les attaques sur le physique réel, la santé, le handicap, l’origine, la religion, le genre, l’orientation sexuelle ou l’âge. `js/safety-rules.js` réduit fortement le théâtre hostile si l’entrée évoque automutilation, violence réelle, harcèlement, haine, discrimination ou détresse émotionnelle forte. Dans ces cas, Agripine sort du personnage agressif et répond sobrement.

## Vie privée et données locales

- Pas de clé API.
- Pas de compte.
- Pas de backend.
- Pas de modèle téléchargé.
- Pas d’appel réseau externe nécessaire au fonctionnement de l’app.
- Conversations, mode actif, pseudo-mémoire et anti-répétition sont stockés dans `localStorage`.
- Les exports JSON restent sur l’appareil tant que l’utilisateur ne les partage pas.

## Installation locale

Aucune dépendance npm n’est nécessaire.

```bash
python3 -m http.server 8080
```

Ouvrez ensuite : <http://localhost:8080>

Un serveur local est recommandé pour tester correctement les modules ES et le service worker. L’application reste compatible avec GitHub Pages grâce aux chemins relatifs.

## Déploiement GitHub Pages

1. Poussez le dépôt sur GitHub.
2. Dans **Settings > Pages**, choisissez la branche à publier.
3. Sélectionnez la racine du dépôt comme dossier de publication.
4. Ouvrez l’URL GitHub Pages générée.
5. Chargez une première fois l’application en ligne, puis vérifiez le fonctionnement hors ligne.

## Tests manuels recommandés

- Chargement app, installation PWA et cache `agripine-v0.3.2`.
- Aucun appel réseau externe et aucun chargement WebLLM.
- Chat offline après premier chargement.
- Salutations : “Bonjour”, “Salut”.
- Présentation : “Parle-moi de toi”, “Tu es qui ?”.
- Remerciement, insulte envers Agripine, demande explicite d’être envoyé bouler.
- Idées d’app répétées, demandes d’aide répétées et messages courts répétitifs.
- Question courte : “Pourquoi ?” doit rester une question.
- Réécriture, tri de liste, organisation et bug JavaScript.
- Export/import d’un ancien JSON contenant l’ancien réglage supprimé.
- Reset de l’humeur.
- Absence de traces internes dans les bulles de chat.
- Vérification responsive mobile 390px et desktop 1200px.
