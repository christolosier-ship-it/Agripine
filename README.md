# AGRIPINE — V0.2.1

**Slogan :** _Une IA qui vous veut du mal !_

Agripine est une IA conversationnelle locale, sarcastique et utile, qui tourne dans le navigateur avec WebLLM. La V0.2.1 est une version de stabilisation : WebLLM reste obligatoire, aucun fallback conversationnel n'est réintroduit, et l'inférence est réduite/diagnostiquée pour limiter les crashs WebGPU, mémoire ou worker pendant la génération.

## Ce qui change en V0.2.1

- WebLLM reste obligatoire au démarrage : Agripine ne répond jamais avec une fausse IA de secours.
- La génération passe en **non-streaming par défaut** pour stabiliser les navigateurs mobiles.
- Les paramètres sont réduits : `maxAssistantTokens` à 180, historique modèle limité à 4 messages, message utilisateur limité à 1200 caractères.
- WebLLM est déplacé dans un **Web Worker** local (`workers/webllm-worker.js`) via `CreateWebWorkerMLCEngine`.
- Un watchdog détecte les redémarrages pendant génération et signale un probable crash navigateur/WebGPU/mémoire.
- Les diagnostics techniques deviennent exportables en JSON.
- Les modèles lourds 3B/Phi mini sont marqués expérimentaux/desktop/lourds et protégés par confirmation.
- Le service worker utilise le cache `agripine-v0.2.1`, cache uniquement l'app shell local et laisse CDN/WebLLM/Hugging Face/modèles en fetch direct.

## Fonctionnalités

- Application **HTML/CSS/JS vanilla** sans framework et sans build step obligatoire.
- PWA installable compatible GitHub Pages.
- WebLLM chargé côté navigateur via import ESM dynamique configuré dans `js/config.js`.
- Modèle par défaut et recommandé : `Llama-3.2-1B-Instruct-q4f16_1-MLC`.
- Modèles lourds disponibles uniquement avec avertissement : Llama 3.2 3B et Phi 3.5 mini.
- Modes rapides : général, jugement d'idée, réécriture, tri de liste, critique d'organisation, plan d'action, mode presque poli.
- Niveau de venin de 1 à 5, utilisé pour adapter la température et le ton.
- Historique, mode actif, niveau de venin et modèle choisi conservés localement.
- Export/import JSON compatible avec V0.1.0, V0.1.1, V0.2.0 et V0.2.1.
- Garde-fous avant génération et assainissement de la sortie après génération.

## Chargement et génération WebLLM

Au démarrage, Agripine :

1. initialise l'interface ;
2. charge les réglages locaux ;
3. vérifie `navigator.gpu` ;
4. importe WebLLM depuis l'URL configurée ;
5. crée un Web Worker local ;
6. charge le modèle sélectionné ou le modèle par défaut via `CreateWebWorkerMLCEngine` ;
7. active le chat uniquement quand le statut du modèle est `ready`.

En V0.2.1, le streaming est désactivé volontairement. La génération appelle WebLLM avec `stream: false`, `max_tokens: 180`, `top_p: 0.85` et un historique compact pour éviter les mises à jour DOM par token et réduire la pression mémoire.

Si l'application redémarre pendant une génération, c'est très probablement un crash navigateur/WebGPU/mémoire ou worker, pas une erreur JavaScript classique : le navigateur tue la page avant que `catch` puisse s'exécuter. Le watchdog local conserve alors les métadonnées de génération dans le diagnostic technique.

## Diagnostic technique

Dans **Options > Diagnostic technique**, Agripine affiche notamment :

- statut et modèle WebLLM ;
- présence WebGPU ;
- streaming activé/désactivé ;
- limites `maxAssistantTokens`, `maxHistoryMessagesForModel`, `maxUserMessageLength` ;
- dernier crash suspect ;
- dernier événement debug ;
- `userAgent`.

Le bouton **Exporter diagnostic JSON** produit un fichier contenant la version app, la configuration WebLLM utile, l'état modèle, l'indice de crash, le debug log, le `userAgent` et un timestamp.

## Vie privée et données locales

- Pas de clé API.
- Pas d'abonnement.
- Pas de compte.
- Pas de backend Agripine.
- Les conversations, réglages et diagnostics sont stockés dans `localStorage`.
- Les fichiers modèle sont gérés par le navigateur/WebLLM, pas par le service worker Agripine.

## Limites

- La compatibilité WebGPU varie selon navigateur, système et matériel.
- Si WebGPU est indisponible, Agripine V0.2.1 ne peut pas fonctionner comme vraie IA locale.
- Les performances dépendent fortement de la RAM, du GPU et du modèle choisi.
- Les modèles lourds peuvent faire planter le navigateur, surtout sur mobile.
- Les modèles légers peuvent être limités en français ou sur des demandes longues.
- Si le modèle n'a pas déjà été mis en cache par le navigateur/WebLLM, le chat IA peut ne pas fonctionner offline même si l'app shell s'ouvre.

## Installation locale

Aucune dépendance npm n'est nécessaire.

```bash
# Depuis la racine du projet
python3 -m http.server 8080
```

Ouvrez ensuite : <http://localhost:8080>

> L'ouverture directe de `index.html` peut fonctionner selon le navigateur, mais un petit serveur local est recommandé pour tester correctement les modules ES, Web Workers, WebLLM et le service worker.

## Déploiement GitHub Pages

1. Poussez le dépôt sur GitHub.
2. Dans **Settings > Pages**, choisissez la branche à publier.
3. Sélectionnez la racine du dépôt comme dossier de publication.
4. Ouvrez l'URL GitHub Pages générée.

Les chemins sont relatifs (`./`) pour fonctionner à la racine d'un domaine ou dans un sous-chemin GitHub Pages.

## Tests manuels recommandés

- Base : démarrage app, modèle chargé, chat actif, UX mobile conservée, options conservées.
- Génération : envoyer “Bonjour”, une phrase simple, tester Général, Juge mon idée, Réécris et Plan d'action, vérifier qu'aucune relance app n'est provoquée.
- Stabilité : vérifier `useStreaming: false`, `maxAssistantTokens: 180`, historique limité, aucune mise à jour DOM par token, worker WebLLM utilisé.
- Watchdog : simuler une phase `generating` dans `localStorage`, recharger, vérifier l'avertissement et l'export diagnostic.
- Erreurs : WebGPU absent, modèle invalide, CDN WebLLM indisponible, worker impossible, mémoire insuffisante catchable, aucun fallback conversationnel.
- Service worker : cache `agripine-v0.2.1`, worker local dans l'app shell, pas de cache cross-origin, app shell offline OK.
- Responsive : mobile 390px et desktop 1200px.
