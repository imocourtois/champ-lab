import type { RuneDef } from "@/data/types.ts";
import { GENERATED_RUNES } from "@/data/generated/runes.gen.ts";

/**
 * Runes keystone — générées depuis Data Dragon (`deno task data`).
 *
 * Chaque rune a un `kind` : "electro"/"conqueror" sont modélisées dans
 * lib/engine.ts (elles pilotent le calcul), "none" = visible mais neutre.
 * En modéliser une nouvelle = ajouter son id Data Dragon à RUNE_KIND dans le
 * pipeline, coder son cas dans lib/engine.ts, et ajouter un invariant.
 *
 * >>> Ne pas éditer data/generated/runes.gen.ts à la main. <<<
 */
export const RUNES: Record<string, RuneDef> = GENERATED_RUNES;

/** Liste ordonnée (modélisées d'abord), pratique pour le sélecteur. */
export const RUNE_LIST = Object.values(RUNES);

/**
 * Ids des runes modélisées, par comportement. Sert de valeur par défaut de
 * `keystone` sur les champions (voir data/overrides.ts).
 */
export const KEYSTONE_BY_KIND = {
  electro: RUNE_LIST.find((r) => r.kind === "electro")?.id ?? "electrocute",
  conqueror: RUNE_LIST.find((r) => r.kind === "conqueror")?.id ?? "conqueror",
} as const;
