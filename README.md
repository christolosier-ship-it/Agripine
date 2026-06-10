# AGRIPINE — V0.2.0

**Slogan :** _Une IA qui vous veut du mal !_

Agripine est une IA conversationnelle locale, sarcastique et utile, qui tourne dans le navigateur avec WebLLM. La V0.2.0 supprime le fallback conversationnel comme mode utilisateur : si le cerveau WebLLM n'est pas prêt, Agripine ne fait pas semblant.

## Ce qui change en V0.2.0

- WebLLM est intégré et chargé automatiquement au démarrage.
- Agripine utilise un vrai modèle local dans le navigateur, sans backend Agripine.
- Le fallback conversationnel V0.1.1 n'est plus utilisé pour répondre aux conversations.
- WebGPU est détecté avant le chargement du modèle.
- Un écran de chargement affiche le modèle, le statut et la progression quand WebLLM la fournit.
- Un choix de modèle existe dans **Options > Cerveau local** : c'est un choix de cerveau, pas un interrupteur d'IA.
- Un écran de diagnostic bloquant apparaît si WebGPU est absent ou si WebLLM échoue.
- Le service worker a été corrigé : il cache uniquement l'app shell local et ne met pas en cache automatiquement les CDN, WebLLM, Hugging Face ou les gros fichiers modèle.

## Fonctionnalités

- Application **HTML/CSS/JS vanilla** sans framework et sans build step obligatoire.
- PWA installable compatible GitHub Pages.
- WebLLM chargé côté navigateur via import ESM dynamique configuré dans `js/config.js`.
- Modèle par défaut : `Llama-3.2-1B-Instruct-q4f16_1-MLC`.
- Modèles disponibles : Llama 3.2 1B, Llama 3.2 3B et Phi 3.5 mini.
- Modes rapides : général, jugement d'idée, réécriture, tri de liste, critique d'organisation, plan d'action, mode presque poli.
- Niveau de venin de 1 à 5, utilisé pour adapter la température et le ton.
- Historique, mode actif, niveau de venin et modèle choisi conservés localement.
- Export/import JSON compatible avec V0.1.0, V0.1.1 et V0.2.0.
- Garde-fous avant génération et assainissement de la sortie après génération.

## Chargement WebLLM

Au démarrage, Agripine :

1. initialise l'interface ;
2. charge les réglages locaux ;
3. vérifie `navigator.gpu` ;
4. importe WebLLM depuis l'URL configurée ;
5. charge le modèle sélectionné ou le modèle par défaut ;
6. active le chat uniquement quand le statut du modèle est `ready`.

Le premier chargement peut être long, car le modèle est téléchargé depuis une ressource externe. Ensuite, le navigateur et WebLLM peuvent conserver les fichiers dans leurs mécanismes de cache internes. Le cache PWA Agripine ne stocke pas ces gros fichiers.

## Vie privée et données locales

- Pas de clé API.
- Pas d'abonnement.
- Pas de compte.
- Pas de backend Agripine.
- Les conversations et réglages sont stockés dans `localStorage`.
- Les fichiers modèle sont gérés par le navigateur/WebLLM, pas par le service worker Agripine.

## Limites

- La compatibilité WebGPU varie selon navigateur, système et matériel.
- Si WebGPU est indisponible, Agripine V0.2.0 ne peut pas fonctionner comme vraie IA locale.
- Les performances dépendent fortement de la RAM, du GPU et du modèle choisi.
- Les modèles légers peuvent être limités en français ou sur des demandes longues.
- Si le modèle n'a pas déjà été mis en cache par le navigateur/WebLLM, le chat IA peut ne pas fonctionner offline même si l'app shell s'ouvre.

## Installation locale

Aucune dépendance npm n'est nécessaire.

```bash
# Depuis la racine du projet
python3 -m http.server 8080
```

Ouvrez ensuite : <http://localhost:8080>

> L'ouverture directe de `index.html` peut fonctionner selon le navigateur, mais un petit serveur local est recommandé pour tester correctement les modules ES, WebLLM et le service worker.

## Déploiement GitHub Pages

1. Poussez le dépôt sur GitHub.
2. Dans **Settings > Pages**, choisissez la branche à publier.
3. Sélectionnez la racine du dépôt comme dossier de publication.
4. Ouvrez l'URL GitHub Pages générée.

Les chemins sont relatifs (`./`) pour fonctionner à la racine d'un domaine ou dans un sous-chemin GitHub Pages.

## Tests manuels recommandés

- Démarrage : écran WebLLM visible, progression visible, chat désactivé, modèle prêt, chat activé.
- WebLLM : réponse réelle, streaming, tous les modes rapides, venin 1 à 5.
- Erreurs : WebGPU absent, import WebLLM impossible, modèle invalide, diagnostic visible, aucune réponse fallback.
- Stockage : historique conservé, modèle sélectionné conservé, export JSON, import V0.1.1 et V0.2.0, effacement local.
- PWA : app shell offline après premier chargement, absence de cache automatique cross-origin.
- Responsive : mobile 390px et desktop 1200px.
