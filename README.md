# AGRIPINE — V0.1.1

**Slogan :** _Une IA qui vous veut du mal !_

Agripine est une anti-assistante conversationnelle locale : sarcastique, acide, hostile façon cartoon, mais utile et sécurisée. Elle juge les idées, reformule des textes, trie des listes, critique l'organisation et transforme les demandes floues en plans d'action.

## Fonctionnalités

- Application **HTML/CSS/JS vanilla** sans framework, backend, API externe ni clé.
- PWA installable avec service worker et cache offline après un premier chargement.
- Moteur local simulé basé sur mots-clés et templates intelligents.
- Modes rapides : général, jugement d'idée, réécriture, tri de liste, critique d'organisation, plan d'action, mode presque poli.
- Réglage du **niveau de venin** de 1 à 5, sauvegardé localement.
- Historique de conversation, mode actif, niveau de venin et dernière utilisation conservés dans `localStorage`.
- Export et import JSON de l'historique et des réglages simples.
- Garde-fous centralisés dans `js/safety-rules.js`.

## Correctifs V0.1.1

- Interface principale fortement compactée pour mobile : header réduit, barre d'état compacte et conversation prioritaire.
- Nouveau panneau **Options** repliable contenant les modes, le venin complet, l'import/export, la version, la zone WebLLM désactivée et la suppression locale.
- Retour au mode **Général** désormais accessible depuis les modes.
- Correction du faux positif sécurité sur des phrases neutres comme “Quel genre d'app on peut faire ?”.
- Détection sécurité plus ciblée sur les demandes explicites de violence, harcèlement, automutilation, haine ou discrimination.
- Parsing du mode “Trie cette liste” amélioré : virgules, points-virgules, puces, retours ligne et listes numérotées.
- Mode “Réécris ce texte” amélioré : nettoyage des préfixes, espaces, ponctuation, capitalisation et structure simple si le texte ressemble à un mail.
- Export JSON enrichi avec `settings.venomLevel`, `settings.activeMode`, `exportedAt` et `version`.
- Import compatible avec l'ancien format V0.1.0 contenant uniquement `messages` et le nouveau format V0.1.1 contenant `messages` + `settings`.
- Préparation WebLLM V0.2 conservée, toujours désactivée : aucun CDN, aucun paquet et aucun modèle téléchargé.

## Installation locale

Aucune dépendance npm n'est nécessaire.

```bash
# Depuis la racine du projet
python3 -m http.server 8080
```

Ouvrez ensuite : <http://localhost:8080>

> L'ouverture directe de `index.html` peut fonctionner selon le navigateur, mais un petit serveur local est recommandé pour tester correctement les modules ES et le service worker.

## Déploiement GitHub Pages

1. Poussez le dépôt sur GitHub.
2. Dans **Settings > Pages**, choisissez la branche à publier.
3. Sélectionnez la racine du dépôt comme dossier de publication.
4. Ouvrez l'URL GitHub Pages générée.

Les chemins sont relatifs (`./`) pour fonctionner à la racine d'un domaine ou dans un sous-chemin GitHub Pages.

## Limites de la V0.1.1

- Agripine **n'intègre aucun vrai modèle IA**.
- Les réponses sont générées par un moteur fallback local déterministe et semi-aléatoire.
- L'analyse du texte reste volontairement simple : mots-clés, modes actifs et templates.
- Le service worker fournit un offline basique, pas une synchronisation avancée.
- Les garde-fous sont centralisés mais ne remplacent pas une vraie couche de modération avancée.

## Roadmap V0.2 — WebLLM

La configuration prépare une future intégration WebLLM dans `js/config.js` via `futureModelConfig` :

- `enabled: false` en V0.1.1 ;
- `provider: "webllm"` ;
- `defaultModel: null` ;
- aucune dépendance, aucun CDN et aucun téléchargement de modèle pour l'instant.

Objectifs V0.2 envisagés :

- Ajouter un moteur WebLLM local optionnel.
- Conserver le fallback V0.1.1 comme secours offline léger.
- Étendre les garde-fous de ton avant et après génération.
- Ajouter un panneau de paramètres modèle et mémoire locale.

## Données locales

Toutes les données restent dans le navigateur de l'utilisateur via `localStorage` :

- historique ;
- mode actif ;
- niveau de venin ;
- date de dernière utilisation.

Aucune donnée n'est envoyée à un serveur. Agripine juge localement, ce qui est déjà bien assez humiliant.
