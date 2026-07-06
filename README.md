# CHAMP LAB

> Vois ce que tes runes et tes objets font **vraiment** — champion par champion.

Les sites de stats (OP.GG, U.GG, Mobalytics…) sont des agrégateurs : ils te disent **quoi** builder parce que
la masse le build. Aucun ne te montre ce qu'un objet ou une rune change **mécaniquement** sur un champion
précis, contre une cible précise.

**CHAMP LAB** est un labo de théorycraft par champion : un simulateur de dégâts pédagogique.

- **Mode impact** — chaque objet affiche en direct le Δ (gain de dégâts) qu'il ajoute à _ton_ combo, sur _ta_
  cible.
- **Breakpoints** — les seuils qui décident d'un kill : « ton combo tue en dessous de X PV », « l'ultime
  exécute à ≤ Y ».
- **Sobre par conception** — calcul côté client sur données statiques versionnées par patch, îlots Fresh (≈ 0
  JS ailleurs), esthétique 100% CSS.

---

## ⚠ Statut

Version **0.1 — preuve de concept**. Les données sont **illustratives** et écrites à la main pour **deux
champions** (Ahri, Darius). Le pipeline de données réel (Meraki) n'est pas encore branché. Voir
[Sources de données](#sources-de-données).

Autrement dit : l'architecture et l'app tournent ; la donnée exacte de chaque champion, c'est le travail
continu de la communauté.

---

## Démarrage

Prérequis : [Deno](https://deno.com) **2.x**.

```bash
deno task dev      # serveur de dev + rechargement à chaud
deno task check    # deno fmt --check && deno lint && deno check
deno task test     # tests du moteur
deno task build    # build de production (génère _fresh/)
deno task start    # lance le build de production
```

Puis ouvre l'URL affichée dans le terminal.

> **Note versions.** Fresh évolue vite (Fresh 2.x). Les fichiers d'amorçage — `deno.json`, `dev.ts`,
> `main.ts`, `utils.ts` — ciblent Fresh 2.x en mode _Builder_. Si l'API a bougé chez toi, régénère une base
> propre avec l'initialiseur officiel puis recopie les dossiers `routes/`, `islands/`, `components/`, `lib/`,
> `data/`, `static/` :
>
> ```bash
> deno run -Ar jsr:@fresh/init .
> ```

---

## Structure

```
champ-lab/
├── data/                 # DONNÉES (typées, contribuables)
│   ├── types.ts          #   interfaces du domaine
│   ├── champions.ts      #   >>> ajouter un champion = ajouter un objet ici
│   ├── items.ts          #   objets + stats
│   └── runes.ts          #   runes keystone
├── lib/
│   ├── engine.ts         # MOTEUR pur & typé (aucune donnée en dur)
│   └── engine_test.ts    #   tests d'invariants
├── islands/
│   └── ChampLab.tsx      # le SEUL îlot hydraté : tout l'interactif
├── components/
│   └── Chrome.tsx        # barre HUD, nav, pied (composants serveur)
├── routes/               # routing par fichiers (Fresh)
│   ├── _app.tsx          #   coquille HTML
│   ├── _layout.tsx       #   chrome partagé
│   ├── index.tsx         #   accueil
│   ├── champions/index.tsx  # roster
│   ├── lab/[champion].tsx   # labo d'un champion
│   ├── lab/index.tsx        # redirige vers le premier champion
│   └── methode.tsx          # sources, éco, légal
├── static/styles.css     # design system, 100% CSS
├── deno.json             # dépendances + tâches
├── dev.ts / main.ts      # entrées dev / prod
└── utils.ts              # helper `define`
```

## Comment marche le moteur

`lib/engine.ts` ne contient **aucune donnée** : il reçoit un champion + un contexte (niveau, build, rune,
cible) et renvoie des dégâts. Modèle simplifié mais cohérent :

```
stat(N)   = base + croissance * (N-1) * (0.7025 + 0.0175*(N-1))
dégâts    = base[rang] + Σ(ratio * stat correspondante)
effectif  = dégâts * 100 / (100 + résistance après pénétration)   // "vrai" ignore les résistances
```

Les pénétrations en % s'empilent multiplicativement. La fonction signature est `itemImpact()` : la différence
de dégâts totaux si on ajoutait un objet au build — c'est le **mode impact**.

## Ajouter un champion

C'est le geste central du projet. Résumé : copie un objet existant dans `data/champions.ts`, remplis les stats
et coefficients (depuis Meraki), lance `deno task test`. Guide détaillé :
**[docs/adding-a-champion.md](docs/adding-a-champion.md)**.

Les interactions vraiment complexes (passifs d'objets, effets de runes, particularités de kit) se modélisent
au cas par cas dans `lib/engine.ts` — c'est assumé : chaque cas devient un bout de code relisible en PR, et la
maintenance du patch se répartit.

## Sources de données

Data Dragon (Riot) est fiable pour les stats plates mais peu exploitable pour les coefficients de sorts. La
source de référence est **[Meraki / lolstaticdata](https://github.com/meraki-analytics/lolstaticdata)**, à
rafraîchir par patch.

**Honnêteté :** les valeurs de ce repo sont saisies à la main et illustratives. Brancher un vrai pipeline
Meraki (fichiers versionnés par patch, cachés agressivement) est le premier gros chantier — idéal pour une
première contribution.

## Sobriété

Choix alignés sur l'éco-conception (esprit RGESN / loi REEN) : îlots Fresh (la plupart des pages n'envoient
aucun JS), données statiques cachables par patch, aucun backend qui agrège des parties en direct, esthétique
sans images, calcul côté client.

## Contribuer

Voir **[CONTRIBUTING.md](CONTRIBUTING.md)**. En bref : `deno task check` doit passer, la donnée va dans
`data/`, chaque champion/objet/rune est une config relisible.

## Légal

CHAMP LAB n'est ni approuvé par Riot Games ni affilié à Riot Games. League of Legends et Riot Games sont des
marques de Riot Games, Inc. Tout usage de l'API Riot est soumis aux Developer Policies de Riot.

## Licence

[MIT](LICENSE).
