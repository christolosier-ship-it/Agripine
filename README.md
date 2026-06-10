# AGRIPINE — V0.1.0

**Slogan :** _Une IA qui vous veut du mal !_

Agripine est une anti-assistante conversationnelle locale : sarcastique, acide, hostile façon cartoon, mais utile et sécurisée. Elle juge les idées, reformule des textes, trie des listes, critique l'organisation et transforme les demandes floues en plans d'action.

## Fonctionnalités V0.1

- Application **HTML/CSS/JS vanilla** sans framework, backend, API externe ni clé.
- PWA installable avec service worker et cache offline après un premier chargement.
- Moteur local simulé basé sur mots-clés et templates intelligents.
- Modes rapides : jugement d'idée, réécriture, tri de liste, critique d'organisation, plan d'action, mode presque poli.
- Réglage du **niveau de venin** de 1 à 5, sauvegardé localement.
- Historique de conversation, mode actif, niveau de venin et dernière utilisation conservés dans `localStorage`.
- Export et import JSON de l'historique.
- Garde-fous centralisés dans `js/safety-rules.js`.

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

## Limites de la V0.1

- Agripine **n'intègre aucun vrai modèle IA**.
- Les réponses sont générées par un moteur fallback local déterministe et semi-aléatoire.
- L'analyse du texte reste volontairement simple : mots-clés, modes actifs et templates.
- Le service worker fournit un offline basique, pas une synchronisation avancée.
- Les garde-fous sont centralisés mais ne remplacent pas une vraie couche de modération avancée.

## Roadmap V0.2 — WebLLM

La configuration prépare une future intégration WebLLM dans `js/config.js` via `futureModelConfig` :

- `enabled: false` en V0.1 ;
- `provider: "webllm"` ;
- `defaultModel: null` ;
- aucune dépendance, aucun CDN et aucun téléchargement de modèle pour l'instant.

Objectifs V0.2 envisagés :

- Ajouter un moteur WebLLM local optionnel.
- Conserver le fallback V0.1 comme secours offline léger.
- Étendre les garde-fous de ton avant et après génération.
- Ajouter un panneau de paramètres modèle et mémoire locale.

## Données locales

Toutes les données restent dans le navigateur de l'utilisateur via `localStorage` :

- historique ;
- mode actif ;
- niveau de venin ;
- date de dernière utilisation.

Aucune donnée n'est envoyée à un serveur. Agripine juge localement, ce qui est déjà bien assez humiliant.
