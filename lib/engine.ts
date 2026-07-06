/**
 * Moteur de théorycraft — pur, typé, sans dépendance framework.
 *
 * Tout le calcul de dégâts vit ici. Aucune donnée en dur : on reçoit un
 * champion + un contexte, on renvoie des chiffres. Testé dans engine_test.ts.
 *
 * Modèle (simplifié mais cohérent) :
 *   stat(N)   = base + croissance * (N-1) * (0.7025 + 0.0175*(N-1))
 *   dégâts    = base[rang] + Σ(ratio * stat correspondante)
 *   effectif  = dégâts * 100 / (100 + résistance après pénétration)
 *   vrai      = ignore les résistances
 */

import type {
  AbilityKey,
  Champion,
  DamageLine,
  DamageType,
  IncludeMap,
  Item,
  RuneDef,
  TargetProfile,
} from "@/data/types.ts";

/** Croissance d'une stat par niveau (formule officielle de League). */
export function growth(base: number, perLevel: number, level: number): number {
  return base + perLevel * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

/** Empilement multiplicatif de plusieurs sources de pénétration en %. */
export function stackPercent(values: Array<number | undefined>): number {
  return 1 - values.reduce<number>((acc, p) => acc * (1 - (p ?? 0)), 1);
}

/** Rang effectif d'un sort au niveau donné, déduit de l'ordre de compétences. */
export function rankOf(champion: Champion, key: AbilityKey, level: number): number {
  let points = 0;
  for (let i = 0; i < level && i < champion.skillOrder.length; i++) {
    if (champion.skillOrder[i] === key) points++;
  }
  return Math.min(points, champion.abilities[key].maxRank);
}

/** Stats dérivées à partir du champion, du niveau, du build et de la rune. */
export interface DerivedStats {
  baseAD: number;
  bonusAD: number;
  totalAD: number;
  ap: number;
  magicPenFlat: number;
  magicPenPct: number;
  lethality: number;
  armorPenPct: number;
}

export function computeStats(
  champion: Champion,
  level: number,
  itemIds: string[],
  items: Record<string, Item>,
  runes: Record<string, RuneDef>,
  runeOn: boolean,
): DerivedStats {
  const stats = itemIds.map((id) => items[id].stats);
  const baseAD = growth(champion.base.ad, champion.base.adPerLevel, level);

  let bonusAD = stats.reduce((a, s) => a + (s.ad ?? 0), 0);
  const flatAP = stats.reduce((a, s) => a + (s.ap ?? 0), 0);
  const apAmp = stats.reduce((a, s) => a + (s.apAmp ?? 0), 0);

  // Rune Conquérant : +AD adaptatif à pleins stacks (le soin n'est pas modélisé).
  const keystone = runes[champion.keystone];
  if (runeOn && keystone?.kind === "conqueror") bonusAD += 12;

  return {
    baseAD,
    bonusAD,
    totalAD: baseAD + bonusAD,
    ap: flatAP * (1 + apAmp),
    magicPenFlat: stats.reduce((a, s) => a + (s.magicPenFlat ?? 0), 0),
    magicPenPct: stackPercent(stats.map((s) => s.magicPenPercent)),
    lethality: stats.reduce((a, s) => a + (s.lethality ?? 0), 0),
    armorPenPct: stackPercent(stats.map((s) => s.armorPenPercent)),
  };
}

/** Multiplicateur de dégâts effectifs selon le type et les résistances de la cible. */
export function damageMultiplier(type: DamageType, s: DerivedStats, t: TargetProfile): number {
  if (type === "true") return 1;
  if (type === "magic") {
    const mr = Math.max(0, t.mr * (1 - s.magicPenPct) - s.magicPenFlat);
    return 100 / (100 + mr);
  }
  // physical
  const armor = Math.max(0, t.armor * (1 - s.armorPenPct) - s.lethality);
  return 100 / (100 + armor);
}

/** Dégâts bruts d'un sort (avant résistances). */
export function abilityRaw(champion: Champion, key: AbilityKey, level: number, s: DerivedStats): number {
  const ability = champion.abilities[key];
  if (ability.type === "util") return 0;
  const rank = rankOf(champion, key, level);
  const r = ability.ratios;
  return (ability.base[rank - 1] ?? 0) +
    (r.ap ?? 0) * s.ap +
    (r.totalAd ?? 0) * s.totalAD +
    (r.bonusAd ?? 0) * s.bonusAD;
}

export interface ComboInput {
  champion: Champion;
  level: number;
  itemIds: string[];
  items: Record<string, Item>;
  runes: Record<string, RuneDef>;
  runeOn: boolean;
  target: TargetProfile;
  bleedStacks: number;
  include: IncludeMap;
}

export interface ComboResult {
  stats: DerivedStats;
  lines: DamageLine[];
  /** dégâts effectifs totaux du combo (mitigés) */
  total: number;
  /** dégâts vrais de l'ultime de Darius — seuil d'exécution (0 sinon) */
  execHP: number;
}

/** Calcule le combo complet : lignes de dégâts, total, seuil d'exécution. */
export function computeCombo(input: ComboInput): ComboResult {
  const { champion, level, itemIds, items, runes, runeOn, target, bleedStacks, include } = input;
  const stats = computeStats(champion, level, itemIds, items, runes, runeOn);
  const lines: DamageLine[] = [];

  const keys: AbilityKey[] = ["Q", "W", "E", "R"];
  for (const key of keys) {
    const ability = champion.abilities[key];
    if (ability.type === "util") continue;
    if (!include[key]) continue;
    let dmg = abilityRaw(champion, key, level, stats) * damageMultiplier(ability.type, stats, target);
    // L'ultime de Darius gagne en dégâts par stack d'hémorragie.
    if (key === "R" && champion.hasBleed) dmg *= 1 + 0.15 * bleedStacks;
    lines.push({ key, name: ability.name, type: ability.type, damage: dmg });
  }

  // Saignement (Hémorragie) : DoT physique sur les stacks accumulés.
  if (champion.hasBleed && include.bleed) {
    const raw = 6 * level + stats.bonusAD;
    lines.push({
      key: "P",
      name: `Hémorragie ×${bleedStacks}`,
      type: "physical",
      damage: raw * damageMultiplier("physical", stats, target),
    });
  }

  // Rune Électrocution : burst adaptatif après 3 sorts.
  const keystone = runes[champion.keystone];
  if (runeOn && keystone?.kind === "electro" && include.rune) {
    const raw = 30 + (150 * (level - 1)) / 17 + 0.1 * stats.ap + 0.25 * stats.bonusAD;
    lines.push({
      key: "✦",
      name: "Électrocution",
      type: "magic",
      damage: raw * damageMultiplier("magic", stats, target),
    });
  }

  const total = lines.reduce((a, l) => a + l.damage, 0);
  const rLine = lines.find((l) => l.key === "R");
  const execHP = champion.hasBleed && rLine ? rLine.damage : 0;

  return { stats, lines, total, execHP };
}

/** Répartition des dégâts par type (pour la barre du readout). */
export function damageByType(lines: DamageLine[]): Record<"magic" | "physical" | "true", number> {
  const out = { magic: 0, physical: 0, true: 0 };
  for (const l of lines) {
    if (l.type === "magic" || l.type === "physical" || l.type === "true") out[l.type] += l.damage;
  }
  return out;
}

/**
 * Impact marginal d'un objet sur le combo actuel (LA fonction signature).
 * Renvoie la différence de dégâts totaux si on ajoutait cet objet au build.
 */
export function itemImpact(base: ComboInput, itemId: string): number {
  if (base.itemIds.includes(itemId)) return 0;
  const before = computeCombo(base).total;
  const after = computeCombo({ ...base, itemIds: [...base.itemIds, itemId] }).total;
  return after - before;
}
