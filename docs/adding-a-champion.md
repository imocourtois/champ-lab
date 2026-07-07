# Ajouter / affiner un champion

Le roster de base (≈ 170 champions) est **généré** depuis Meraki + Data Dragon par `deno task data` et vit
dans `data/generated/` — **on ne l'édite pas à la main**. La contribution consiste donc surtout à **affiner**
un champion dont une mécanique n'est pas bien couverte par le modèle générique.

Trois niveaux, du plus simple au plus profond.

## 0. Régénérer les données (le point de départ)

```bash
deno task data          # patch courant (Data Dragon "latest")
deno task data -- 15.24.1   # patch figé
```

Cela réécrit `data/generated/champions.gen.ts`, `items.gen.ts` et `meta.gen.ts`, puis les formate. Le pipeline
extrait ce que le moteur sait modéliser : stats de base, ratios `ap` / `totalAd` / `bonusAd`, stats plates
d'objets. Le reste (passifs conditionnels, dégâts en % PV…) n'est pas deviné.

## 1. Affiner via `data/overrides.ts` (le cas courant)

C'est ici qu'on ajuste un champion **sans toucher au généré**. Ajoute une entrée dans `CHAMPION_OVERRIDES` :

```ts
export const CHAMPION_OVERRIDES: Record<string, ChampionOverride> = {
  // …existant…

  monchamp: {
    // adaptive: "AP",          // force AP/AD si Meraki se trompe
    // hasBleed: true,          // active un DoT/exécution type Darius
    keystone: "electro", // rune keystone par défaut (id de data/runes.ts)
    // ordre de montée des sorts (18 entrées) : déduit le rang au niveau N
    skillOrder: ["Q", "W", "E", "Q", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W", "R", "W", "W"],
    // étagère d'objets recommandés (ids de data/items.ts, tels que slugifiés)
    shelf: ["sorcerersshoes", "ludensecho", "shadowflame", "rabadonsdeathcap", "voidstaff"],
    abilities: {
      // corrige un ratio ou un type mal déduit par le pipeline :
      Q: { ratios: { ap: 0.75 } },
      R: { type: "true" },
    },
  },
};
```

Tout est optionnel : un champ absent garde la valeur générée. Puis relance `deno task data` (les overrides
sont appliqués à la génération).

> **Trouver le bon `id`.** Le slug est le nom Data Dragon en minuscules sans caractères spéciaux : `Lee Sin` →
> `leesin`, `Kai'Sa` → `kaisa`. Idem pour les ids d'objets de l'étagère.

## 2. Ajouter un objet à l'étagère

Si l'objet voulu n'existe pas encore dans `data/generated/items.gen.ts`, c'est qu'il a été filtré (le pipeline
ne garde que les légendaires/bottes portant une stat modélisée). Deux leviers dans `data/overrides.ts` :

- `ITEM_WHITELIST` — force l'inclusion d'un objet même sans stat plate exploitable.
- `ITEM_OVERRIDES` — réinjecte un passif que le moteur sait modéliser mais que Meraki ne donne pas en stat
  plate (ex. Rabadon `apAmp: 0.30`, Fendoir noir `armorPenPercent: 0.30`) et fige un libellé court.

## 3. Cas complexes → moteur

Si le champion a une mécanique que le modèle générique ne couvre pas (passif conditionnel, dégâts % PV cible,
cumul spécifique…), modélise-la dans `lib/engine.ts` :

- ajoute un champ optionnel dans les types si nécessaire (ex. `hasBleed`),
- gère le cas dans `computeCombo()`,
- **ajoute un invariant** dans `lib/engine_test.ts`.

Garde ces cas isolés et commentés : c'est ce qui rend le patch mensuel relisible en PR.

## 4. Vérifier

```bash
deno task test    # invariants moteur + invariants sur TOUT le roster
deno task check   # fmt + lint + types
```

Les tests valident des invariants (plus d'objets ⇒ plus de dégâts, l'armure réduit le physique, l'ultime «
vrai » ignore les résistances, chaque champion se calcule sans planter, chaque étagère référence un objet
existant…), pas des chiffres exacts.

## 5. PR

Un champion (ou un lot cohérent d'affinages) par PR. Indique le patch de référence dans la description. Merci
!
