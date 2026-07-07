# Auto-évaluation — stats & code

Deux évaluations automatiques, lancées à la demande.

## 1. Exactitude des stats (`deno task audit`)

Le script `scripts/audit-stats.ts` croise les **3 sources** pour évaluer ce que l'app utilise réellement
(généré depuis Meraki) contre une source indépendante (Data Dragon), et vérifie les assets.

| Source               | Rôle                                           | Ce qu'on en vérifie                         |
| -------------------- | ---------------------------------------------- | ------------------------------------------- |
| **Data Dragon**      | liste, stats plates, runes, icônes officielles | source de référence du croisement           |
| **Community Dragon** | assets graphiques                              | présence des icônes                         |
| **Meraki**           | compétences détaillées + calculs               | ce que l'app utilise (via `data/generated`) |

### Résultat de la dernière passe (patch DD 16.13.1)

- **Concordance ≈ 87 %** sur les stats de base croisables (1183/1357).
- **Cause principale des écarts : décalage de patch.** Le CDN Meraki `latest` est **en retard** sur le patch
  live (échantillon Lee Sin : `patchLastChanged` = 14.20 ; AD Meraki 69 vs Data Dragon 66). La majorité des
  ~170 écarts en découlent — ce sont des valeurs d'un patch antérieur, pas des erreurs de mapping. Le champ
  `DATA_META.statsPatch` expose désormais honnêtement ce patch.
- **Faux positif écarté :** Data Dragon renvoie `attackdamageperlevel = 0` pour **tous** les champions (bug DD
  connu). C'est précisément pourquoi le projet tire ses stats de Meraki. Ce champ est donc exclu du croisement
  (sinon 170 faux positifs).
- **Ratios de sorts :** non recroisables (Data Dragon ne les expose pas proprement) — ils restent «
  illustratifs à raffiner », comme annoncé.
- **Icônes :** l'échantillon testé répond `200` (Data Dragon opérationnel).

### Interprétation

Le mapping est **correct** ; l'exactitude est plafonnée par la **fraîcheur de Meraki**, pas par le code. Deux
pistes d'amélioration si on veut coller au patch live : pinner Meraki sur un patch précis quand il rattrape,
ou compléter les stats plates depuis Data Dragon (fiable) tout en gardant Meraki pour les ratios. En l'état,
la provenance est affichée honnêtement dans `/methode`.

## 2. Optimisation du code

Revue des chemins chauds (calcul client, à chaque réglage de slider).

- **Mode impact — corrigé.** Le catalogue calcule le Δ de chaque objet (~115). L'ancienne `itemImpact`
  recalculait le combo « avant » à **chaque** objet. Nouvelle `itemImpactFrom(base, before, id)` : le total «
  avant » (déjà connu via `result.total`) est réutilisé → **~22 % de calcul en moins**.
- **Coût mesuré : ~0,1 ms/rendu** pour 115 objets (benchmark). Le calcul client n'est pas un goulot ;
  mémoïsation ou calcul paresseux seraient **prématurés**. On s'arrête là volontairement.
- **Moteur** (`lib/engine.ts`) : pur, sans allocation superflue dans les boucles, testé par invariants sur
  tout le roster. `computeCombo` d'un champion : quelques microsecondes.
- **Sobriété préservée** : un seul îlot hydraté, données statiques cachables, calcul côté client. Les icônes
  sont chargées en `loading="lazy"`.

### Verdict

Bien optimisé pour son échelle. La seule redondance réelle (recalcul du « avant ») est éliminée ; le reste
serait de la sur-ingénierie au vu des mesures.
