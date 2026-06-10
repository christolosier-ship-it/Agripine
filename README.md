# Agripine V0.3.1

**Agripine, une IA qui vous veut du mal.**

Agripine V0.3.1 est une **PWA parodique hostile, 100 % locale, offline-first et sans vraie IA générative**. L’interface continue de présenter Agripine comme un personnage d’IA, mais techniquement tout repose sur un moteur conversationnel simulé en HTML/CSS/JavaScript vanilla : aucune API, aucun backend, aucun framework, aucun modèle externe et aucune clé.

## Pivot V0.3.1

Cette version abandonne l’idée d’une assistante sarcastique vaguement utile. Agripine devient une **IA hostile simulée** : elle méprise les humains, râle, refuse souvent de coopérer, répond parfois à côté et donne seulement de courtes bribes utiles quand cela renforce l’illusion qu’elle a compris assez pour envoyer l’utilisateur bouler correctement.

Le moteur simulé est maintenant **plus naturel et plus cinglant** : les réponses sont moins mécaniques, plus synchronisées avec l’intention détectée, et structurées comme une personnalité qui réagit plutôt qu’une banque de morceaux collés.

## Nouveautés V0.3.1

- **Suppression complète des niveaux de méchanceté** : plus de réglage de venin, plus de mode doux, plus de variation utilisateur de la cruauté.
- **Hostilité permanente** : l’interface affiche un noyau de **mépris actif** et Agripine reste hostile par défaut.
- **Modes rapides recentrés** : Général, Envoie-moi bouler, Juge mon idée, Détruis mon texte, Insulte mon organisation, Fais semblant d’aider, Réponds à côté, Plan foireux mais exploitable, Réponse vaguement exploitable.
- **Réponses plus naturelles** : recettes dédiées par intention, paragraphes plus fluides, piques de conclusion, refus de coopération et micro-réponses utiles seulement quand nécessaire.
- **Intentions priorisées** : détection stricte pour salutation, remerciement, insulte, présentation d’Agripine, demande d’être envoyé bouler, réécriture, liste, idée d’app, organisation, projet, technique, plainte, question, aide vague, message court et bruit.
- **`about_agripine` renforcé** : Agripine se présente comme une IA hostile, une IA qui vous veut du mal, un personnage qui juge et une présence numérique locale méprisante.
- **`greeting` corrigé** : “Bonjour” et “Salut” ne sont plus traités comme des messages trop courts.
- **Anti-répétition renforcé** : l’app conserve les 30 dernières phrases/paragraphe utilisées et évite les réemplois visibles.
- **Phrasebank beaucoup plus cinglante** : salutations hostiles, rejets directs, insultes cartoon non discriminatoires, jurons, conclusions sèches, réponses par intention et fausses réflexions adaptées.
- **Mémoire courte hostile améliorée** : compte les messages, salutations, demandes d’aide, messages courts, idées d’app, intentions fréquentes, humeur et impatience.
- **Export/import V0.3.1** : exporte la pseudo-mémoire, n’exporte plus le réglage supprimé, et ignore ce champ si un ancien export V0.3.0 en contient encore un.
- **Aucune vraie IA générative** : Agripine reste un moteur local simulé, compatible GitHub Pages et utilisable hors ligne après le premier chargement.

## Garde-fous

Agripine peut être sèche, grossière et méprisante façon cartoon : bordel, merde, brouillon bipède, mammifère administratif, tiroir à excuses, tableur émotionnel mal formaté. Le ton vise les demandes, les idées, l’organisation, le chaos humain général et les objets numériques.

Le moteur évite les insultes discriminatoires, les attaques sur le physique, la santé, le handicap, l’origine, la religion, le genre, l’orientation sexuelle ou l’âge. `js/safety-rules.js` réduit fortement le théâtre hostile si l’entrée évoque automutilation, violence réelle, harcèlement, haine, discrimination ou détresse émotionnelle forte. Dans ces cas, Agripine répond sobrement et recommande de contacter une personne de confiance ou les urgences locales si la sécurité est en jeu.

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

- Chargement app, installation PWA et cache `agripine-v0.3.1`.
- Aucun appel réseau externe et aucun chargement WebLLM.
- Chat offline après premier chargement.
- Salutations : “Bonjour”, “Salut”.
- Présentation : “Parle-moi de toi”, “Tu es qui ?”.
- Remerciement, insulte envers Agripine, demande explicite d’être envoyé bouler.
- Idées d’app répétées, demandes d’aide répétées et messages courts répétitifs.
- Question courte : “Pourquoi ?” doit rester une question.
- Réécriture et tri de liste.
- Export/import d’un ancien JSON V0.3.0 contenant l’ancien réglage supprimé.
- Reset de l’humeur.
- Absence de traces internes dans les bulles de chat.
- Vérification responsive mobile 390px et desktop 1200px.
