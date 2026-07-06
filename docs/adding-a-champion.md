# Ajouter un champion

Le geste central du projet. Le moteur est data-driven : dans la majorité des cas, **tu n'ajoutes qu'un objet**
dans `data/champions.ts`.

## 1. Copier un gabarit

Ouvre `data/champions.ts` et copie l'objet `ahri` (champion AP) ou `darius` (champion AD, avec exécution +
saignement) selon ce qui ressemble le plus au tien.

```ts
export const CHAMPIONS: Record<string, Champion> = {
  // …existant…

  monchamp: {
    id: "monchamp",
    name: "MonChamp",
    title: "le Titre",
    initial: "M", // lettre du portrait placeholder
    adaptive: "AP", // "AP" ou "AD"
    // hasBleed: true,       // uniquement si le kit a un DoT/exécution type Darius
    base: {
      ad: 55,
      adPerLevel: 3,
      hp: 600,
      hpPerLevel: 100,
      armor: 22,
      armorPerLevel: 4.5,
      mr: 30,
      mrPerLevel: 1.3,
    },
    // ordre de compétences sur 18 niveaux (sert à déduire le rang de chaque sort)
    skillOrder: ["Q", "W", "E", "Q", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W", "R", "W", "W"],
    abilities: {
      Q: { name: "Sort Q", type: "magic", maxRank: 5, base: [80, 120, 160, 200, 240], ratios: { ap: 0.7 } },
      W: { name: "Sort W", type: "magic", maxRank: 5, base: [60, 90, 120, 150, 180], ratios: { ap: 0.4 } },
      E: { name: "Sort E", type: "util", maxRank: 5, base: [0], ratios: {} },
      R: { name: "Sort R", type: "magic", maxRank: 3, base: [150, 250, 350], ratios: { ap: 0.8 } },
    },
    shelf: ["sorc", "luden", "shadow", "rab", "void", "zhonya"], // objets proposés (ids de data/items.ts)
    keystone: "electro", // id de data/runes.ts
  },
};
```

Le champion apparaît automatiquement dans le roster et à l'URL `/lab/monchamp`.

## 2. Remplir les valeurs

Depuis **[Meraki / lolstaticdata](https://github.com/meraki-analytics/lolstaticdata)** (ou le wiki en
attendant) :

- **`base`** — stats de base au niveau 1 et croissance par niveau.
- **`abilities[key]`** :
  - `type` : `"magic"`, `"physical"`, `"true"`, ou `"util"` (sort sans dégâts direct).
  - `base` : dégâts par rang, `base[0]` = rang 1. Un `"util"` peut valoir `[0]`.
  - `ratios` : `ap`, `totalAd` (AD total), `bonusAd` (AD des objets/runes). Mets seulement ceux qui
    s'appliquent.
- **`skillOrder`** : 18 entrées `"Q"|"W"|"E"|"R"`. Le rang d'un sort au niveau N = nombre d'occurrences avant
  N (plafonné à `maxRank`).

## 3. Cas complexes → moteur

Si le champion a une mécanique que le modèle générique ne couvre pas (passif conditionnel, dégâts % PV cible,
cumul spécifique…), modélise-la dans `lib/engine.ts` :

- ajoute un champ optionnel dans les types si nécessaire (ex. `hasBleed`),
- gère le cas dans `computeCombo()`,
- **ajoute un invariant** dans `lib/engine_test.ts`.

Garde ces cas isolés et commentés : c'est ce qui rend le patch mensuel relisible en PR.

## 4. Vérifier

```bash
deno task test
deno task check
```

Les tests valident des invariants (plus d'objets ⇒ plus de dégâts, l'armure réduit le physique, l'ultime «
vrai » ignore les résistances…), pas des chiffres exacts.

## 5. PR

Un champion par PR. Indique le patch de référence des valeurs dans la description. Merci !
