/**
 * Tests du moteur. Lancer : `deno task test`.
 *
 * On teste des invariants (monotonie, mitigation, exécution), pas des chiffres
 * exacts — les valeurs sont illustratives et bougeront avec les patchs.
 */

import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { computeCombo, damageMultiplier, growth, rankOf, stackPercent } from "@/lib/engine.ts";
import { CHAMPIONS } from "@/data/champions.ts";
import { ITEMS } from "@/data/items.ts";
import { RUNES } from "@/data/runes.ts";
import type { ComboInput } from "@/lib/engine.ts";
import type { IncludeMap, TargetProfile } from "@/data/types.ts";

const ALL_IN: IncludeMap = { Q: true, W: true, E: true, R: true, bleed: true, rune: true };
const TARGET: TargetProfile = { armor: 60, mr: 40, hpMax: 2000, hpCur: 2000 };

function input(champId: string, itemIds: string[], overrides: Partial<ComboInput> = {}): ComboInput {
  return {
    champion: CHAMPIONS[champId],
    level: 11,
    itemIds,
    items: ITEMS,
    runes: RUNES,
    runeOn: true,
    target: TARGET,
    bleedStacks: 5,
    include: ALL_IN,
    ...overrides,
  };
}

Deno.test("growth: niveau 1 = base", () => {
  assertAlmostEquals(growth(100, 10, 1), 100);
});

Deno.test("growth: croissant avec le niveau", () => {
  assert(growth(100, 10, 18) > growth(100, 10, 5));
});

Deno.test("stackPercent: empilement multiplicatif", () => {
  // 40% puis 40% ne font pas 80%
  assertAlmostEquals(stackPercent([0.4, 0.4]), 0.64);
});

Deno.test("rankOf: respecte l'ordre et le rang max", () => {
  const ahri = CHAMPIONS.ahri;
  assertEquals(rankOf(ahri, "Q", 1), 1);
  assertEquals(rankOf(ahri, "R", 5), 0); // ultime indisponible avant 6
  assert(rankOf(ahri, "R", 11) >= 2);
  assert(rankOf(ahri, "Q", 18) <= ahri.abilities.Q.maxRank);
});

Deno.test("mitigation: l'armure réduit les dégâts physiques", () => {
  const s = { baseAD: 0, bonusAD: 0, totalAD: 0, ap: 0, magicPenFlat: 0, magicPenPct: 0, lethality: 0, armorPenPct: 0 };
  assertEquals(damageMultiplier("true", s, TARGET), 1);
  assert(damageMultiplier("physical", s, TARGET) < 1);
});

Deno.test("plus d'objets => plus de dégâts", () => {
  const few = computeCombo(input("ahri", ["sorc", "luden"])).total;
  const many = computeCombo(input("ahri", ["sorc", "luden", "rab", "shadow"])).total;
  assert(many > few, "un build plus fourni doit taper plus fort");
});

Deno.test("Darius : l'ultime est du vrai dégât et pose un seuil d'exécution", () => {
  const res = computeCombo(input("darius", ["ion", "stride", "cleaver"]));
  assert(res.execHP > 0, "execHP doit être renseigné pour Darius");
  const rLine = res.lines.find((l) => l.key === "R");
  assertEquals(rLine?.type, "true");
});

Deno.test("couper la rune réduit (ou n'augmente pas) le combo", () => {
  const withRune = computeCombo(input("ahri", ["luden"], { runeOn: true })).total;
  const without = computeCombo(input("ahri", ["luden"], { runeOn: false })).total;
  assert(withRune >= without);
});
