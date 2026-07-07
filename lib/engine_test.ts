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
  const s = {
    baseAD: 0,
    bonusAD: 0,
    totalAD: 0,
    ap: 0,
    magicPenFlat: 0,
    magicPenPct: 0,
    lethality: 0,
    armorPenPct: 0,
  };
  assertEquals(damageMultiplier("true", s, TARGET), 1);
  assert(damageMultiplier("physical", s, TARGET) < 1);
});

Deno.test("plus d'objets => plus de dégâts", () => {
  const few = computeCombo(input("ahri", ["sorcerersshoes", "ludensecho"])).total;
  const many =
    computeCombo(input("ahri", ["sorcerersshoes", "ludensecho", "rabadonsdeathcap", "shadowflame"])).total;
  assert(many > few, "un build plus fourni doit taper plus fort");
});

Deno.test("Darius : l'ultime est du vrai dégât et pose un seuil d'exécution", () => {
  const res = computeCombo(input("darius", ["ionianbootsoflucidity", "stridebreaker", "blackcleaver"]));
  assert(res.execHP > 0, "execHP doit être renseigné pour Darius");
  const rLine = res.lines.find((l) => l.key === "R");
  assertEquals(rLine?.type, "true");
});

Deno.test("couper la rune réduit (ou n'augmente pas) le combo", () => {
  const withRune = computeCombo(input("ahri", ["ludensecho"], { runeOn: true })).total;
  const without = computeCombo(input("ahri", ["ludensecho"], { runeOn: false })).total;
  assert(withRune >= without);
});

// --- Invariants sur TOUT le roster généré (filet de sécurité du pipeline). ---

Deno.test("roster : chaque champion se calcule sans planter, à tous les niveaux", () => {
  for (const id of Object.keys(CHAMPIONS)) {
    for (const level of [1, 6, 11, 18]) {
      const res = computeCombo(input(id, CHAMPIONS[id].shelf.slice(0, 3), { level }));
      assert(Number.isFinite(res.total), `total non fini pour ${id} niv ${level}`);
      assert(res.total >= 0, `total négatif pour ${id} niv ${level}`);
    }
  }
});

Deno.test("roster : chaque objet d'étagère existe dans data/items.ts", () => {
  for (const c of Object.values(CHAMPIONS)) {
    for (const itemId of c.shelf) {
      assert(ITEMS[itemId], `étagère de ${c.id} référence un objet inconnu : ${itemId}`);
    }
  }
});

Deno.test("roster : la keystone de chaque champion est modélisée", () => {
  for (const c of Object.values(CHAMPIONS)) {
    assert(RUNES[c.keystone], `keystone inconnue pour ${c.id} : ${c.keystone}`);
  }
});

Deno.test("rangs manuels : un rang de Q plus élevé => plus de dégâts", () => {
  const low = computeCombo(input("ahri", ["ludensecho"], { ranks: { Q: 1, W: 0, E: 0, R: 0 } })).total;
  const high = computeCombo(input("ahri", ["ludensecho"], { ranks: { Q: 5, W: 0, E: 0, R: 0 } })).total;
  assert(high > low, "monter le rang de Q doit augmenter les dégâts");
});

Deno.test("rangs manuels : un sort au rang 0 n'apparaît pas dans le combo", () => {
  const res = computeCombo(input("ahri", ["ludensecho"], { ranks: { Q: 0, W: 0, E: 0, R: 0 } }));
  assertEquals(res.lines.find((l) => l.key === "Q"), undefined);
});

Deno.test("keystone au choix : override change la rune appliquée", () => {
  // Ahri par défaut = electro (ligne ✦). Forcer conqueror retire cette ligne.
  const electro = computeCombo(input("ahri", ["ludensecho"], { keystoneId: "electrocute" }));
  const conq = computeCombo(input("ahri", ["ludensecho"], { keystoneId: "conqueror" }));
  assert(electro.lines.some((l) => l.key === "✦"), "electro doit poser une ligne de burst");
  assert(!conq.lines.some((l) => l.key === "✦"), "conquérant ne pose pas de ligne electro");
});

Deno.test("champion manuel (Locke) est présent et se calcule", () => {
  assert(CHAMPIONS.locke, "Locke doit être dans le roster");
  const res = computeCombo(input("locke", ["ludensecho", "rabadonsdeathcap"]));
  assert(res.total > 0, "le combo de Locke doit produire des dégâts");
});
