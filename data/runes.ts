import type { RuneDef } from "@/data/types.ts";

/**
 * Runes keystone — DONNÉES ILLUSTRATIVES.
 *
 * Chaque rune a un `kind` qui pointe vers son comportement, modélisé
 * explicitement dans lib/engine.ts (les runes ne sont pas des stats plates :
 * chacune est un petit système à coder). En ajouter une = ajouter un `kind`
 * et son cas dans le moteur.
 */
export const RUNES: Record<string, RuneDef> = {
  electro: {
    id: "electro",
    name: "Électrocution",
    description: "keystone · dégâts de burst après 3 sorts/attaques",
    kind: "electro",
  },
  conqueror: {
    id: "conqueror",
    name: "Conquérant",
    description: "keystone · +AD adaptatif à pleins stacks + soin",
    kind: "conqueror",
  },
};
