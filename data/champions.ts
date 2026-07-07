import type { Champion } from "@/data/types.ts";
import { GENERATED_CHAMPIONS } from "@/data/generated/champions.gen.ts";

/**
 * Champions — roster complet généré depuis Meraki + Data Dragon.
 *
 * >>> ON N'ÉDITE PLUS CE FICHIER À LA MAIN. <<<
 * Les données brutes sont dans data/generated/champions.gen.ts (régénérées par
 * `deno task data`). Les réglages de théorycraft — étagères d'objets, rune par
 * défaut, ordre de compétences, corrections de ratios — vivent dans
 * data/overrides.ts et sont appliqués au moment de la génération.
 *
 * Ajouter/affiner un champion = éditer data/overrides.ts puis `deno task data`.
 * Voir docs/adding-a-champion.md.
 */
export const CHAMPIONS: Record<string, Champion> = GENERATED_CHAMPIONS;

/** Liste ordonnée (alphabétique), pratique pour le roster. */
export const CHAMPION_LIST = Object.values(CHAMPIONS);

/** Slugs disponibles (pour valider une route /lab/[champion]). */
export const CHAMPION_IDS = Object.keys(CHAMPIONS);
