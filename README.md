<div align="center">
  <img src="./assets/icon.svg" alt="Agripine logo" width="96" height="96" />

# Agripine

**Une IA parodique locale qui vous veut du mal, sans serveur, sans compte et sans vraie IA générative.**

[![Version](https://img.shields.io/badge/version-V0.3.2-a7f73a?style=flat-square)](#version-actuelle)
[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=000)](./app.js)
[![Offline first](https://img.shields.io/badge/PWA-Offline--first-9e73ff?style=flat-square)](./service-worker.js)
[![No dependencies](https://img.shields.io/badge/Dependencies-None-151922?style=flat-square)](#stack-technique)

[Présentation](#présentation) · [Fonctionnalités](#fonctionnalités) · [Démarrage](#démarrage-rapide) · [Architecture](#architecture)

</div>

## Présentation

Agripine est une PWA conversationnelle parodique qui imite une assistante hostile, sèche et volontairement peu serviable. Elle analyse localement quelques intentions, choisit des fragments de réponse, entretient une pseudo-mémoire et adapte son humeur sans appeler de modèle externe.

Le projet fonctionne entièrement dans le navigateur avec du HTML, du CSS et des modules JavaScript natifs. Il ne nécessite ni framework, ni dépendance, ni clé API, ni backend.

> [!NOTE]
> Agripine n’utilise aucune IA générative. Son comportement repose sur un moteur conversationnel simulé, des règles locales, des banques de phrases et une sélection pseudo-aléatoire.

## Fonctionnalités

- Conversation entièrement locale, sans compte ni serveur.
- Réponses courtes, hostiles et volontairement imparfaites.
- Détection légère d’intentions et de sujets.
- Neuf modes de réponse, du jugement d’idée au plan volontairement bancal.
- Pseudo-mémoire locale : humeur, sujets récents, intentions et répétitions.
- Historique, mode actif et mémoire conservés dans `localStorage`.
- Import et export JSON des conversations et réglages compatibles.
- Garde-fous dédiés pour les sujets sensibles, avec sortie du personnage hostile.
- Interface responsive avec faux écran de démarrage et fausses étapes de réflexion.
- Installation PWA et fonctionnement hors ligne après le premier chargement.
- Aucun téléchargement de modèle et aucun appel réseau externe requis par l’application.

> [!WARNING]
> Agripine utilise un humour agressif et des insultes génériques façon cartoon. Le projet vise le divertissement et ne doit pas être utilisé comme assistant fiable, outil médical, soutien psychologique ou source de conseil professionnel.

## Modes disponibles

| Mode | Comportement |
| --- | --- |
| Général | Hostilité par défaut, vaguement adaptée à la demande |
| Envoie-moi bouler | Refus sec et porte qui claque |
| Juge mon idée | Verdict mordant avec une petite piste utile |
| Détruis mon texte | Critique puis amélioration minimale |
| Insulte mon organisation | Lecture d’un planning comme une scène de crime |
| Fais semblant d’aider | Refus théâtral avec limitation des dégâts |
| Réponds à côté | Esquive et bribe exploitable |
| Plan foireux mais exploitable | Plan minimal, grinçant et utilisable |
| Réponse vaguement exploitable | Réponse plus lisible, sans devenir aimable |

## Démarrage rapide

Clonez le dépôt, puis lancez un serveur HTTP local :

```bash
git clone https://github.com/christolosier-ship-it/Agripine.git
cd Agripine
python3 -m http.server 8080
```

Ouvrez ensuite `http://localhost:8080`.

> [!IMPORTANT]
> Un serveur local est recommandé. Les modules ES et le service worker ne sont pas testés correctement en ouvrant simplement `index.html` depuis le système de fichiers.

## Installation de la PWA

1. Ouvrez l’application depuis une adresse HTTPS ou `localhost`.
2. Utilisez l’option **Installer l’application** du navigateur.
3. Chargez l’application une première fois en ligne.
4. Coupez le réseau et vérifiez que l’interface reste disponible.

Le service worker met en cache l’ensemble du shell applicatif et supprime automatiquement les anciens caches lors d’un changement de version.

## Vie privée et stockage local

Agripine ne transmet aucune conversation à un service distant. Les données suivantes restent dans le navigateur :

- historique des messages ;
- mode actif ;
- pseudo-mémoire et humeur ;
- fragments récents utilisés pour limiter les répétitions.

L’export produit un fichier JSON local. Rien n’est partagé tant que l’utilisateur ne transmet pas lui-même ce fichier.

> [!TIP]
> Le bouton **Effacer toutes les données locales** supprime l’historique, la mémoire, le mode actif et les anciennes clés de stockage compatibles.

## Garde-fous

Le module `js/safety-rules.js` détecte plusieurs catégories sensibles : automutilation, violence réelle, harcèlement, discrimination et détresse émotionnelle forte.

Lorsqu’un signal est détecté, Agripine réduit ou abandonne son personnage hostile et fournit une réponse plus sobre. Ces règles restent simples et lexicales : elles ne remplacent pas une modération robuste ni une aide professionnelle.

## Architecture

```text
Agripine/
├── assets/
│   └── icon.svg                # Icône et identité visuelle
├── js/
│   ├── chat-ui.js              # Rendu de l’interface et états visuels
│   ├── config.js               # Version, limites et état par défaut
│   ├── modes.js                # Définition des neuf modes
│   ├── phrasebank.js           # Banques de fragments hostiles
│   ├── safety-rules.js         # Détection des sujets sensibles
│   ├── simulated-ai-engine.js  # Analyse et génération simulée
│   └── storage.js              # Persistance, import et export JSON
├── app.js                      # Orchestration principale
├── index.html                  # Structure de l’application
├── manifest.webmanifest        # Métadonnées PWA
├── service-worker.js           # Cache offline-first
├── style.css                   # Interface responsive
└── README.md                   # Documentation du projet
```

Le flux principal reste volontairement léger :

```text
Saisie utilisateur
      ↓
Analyse locale de l’intention et de la sécurité
      ↓
Mise à jour de la pseudo-mémoire
      ↓
Sélection du mode, de la structure et des fragments
      ↓
Réponse simulée puis sauvegarde dans localStorage
```

## Stack technique

| Élément | Utilisation |
| --- | --- |
| HTML5 | Structure de l’application et accessibilité de base |
| CSS3 | Interface responsive, thème sombre et animations |
| JavaScript ES Modules | Orchestration et séparation des responsabilités |
| Local Storage API | Historique, réglages et pseudo-mémoire |
| Cache API | Stockage du shell applicatif |
| Service Worker API | Installation et fonctionnement hors ligne |
| File API | Import des sauvegardes JSON |
| Blob API | Export local des conversations |
| Web App Manifest | Installation en mode autonome |

## Personnalisation

Les principaux points d’extension sont répartis par responsabilité :

- `js/phrasebank.js` pour enrichir le vocabulaire et les formats de réponse ;
- `js/modes.js` pour ajouter ou modifier les modes ;
- `js/simulated-ai-engine.js` pour ajuster l’analyse, l’aléatoire et la pseudo-mémoire ;
- `js/safety-rules.js` pour renforcer les garde-fous ;
- `js/config.js` pour la version, les limites et les clés de stockage ;
- `style.css` pour l’identité visuelle.

Après toute modification des fichiers mis en cache, mettez à jour `CACHE_NAME` dans `service-worker.js` afin de forcer le renouvellement du cache installé.

## Déploiement sur GitHub Pages

1. Ouvrez **Settings** → **Pages** dans le dépôt.
2. Sélectionnez **Deploy from a branch**.
3. Choisissez la branche à publier et le dossier `/root`.
4. Enregistrez la configuration.
5. Ouvrez l’URL générée une première fois en ligne pour initialiser le cache.

Le projet utilise uniquement des chemins relatifs et ne nécessite aucune étape de build ni variable d’environnement.

## Version actuelle

La branche par défaut correspond à **Agripine V0.3.2**. Cette version privilégie les réponses très courtes, l’hostilité cartoon, les refus secs et les miettes utiles occasionnelles, tout en conservant les garde-fous et la compatibilité avec les anciennes sauvegardes.
