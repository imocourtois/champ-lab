import type { Champion } from "@/data/types.ts";

/**
 * Champions — DONNÉES ILLUSTRATIVES (2 champions "seed").
 *
 * >>> AJOUTER UN CHAMPION = AJOUTER UN OBJET ICI. <<<
 * C'est tout le principe : le moteur est data-driven, la maintenance à chaque
 * patch se répartit fichier par fichier. Voir docs/adding-a-champion.md.
 *
 * Les chiffres (base, coefficients) proviendraient de Meraki par patch.
 */
export const CHAMPIONS: Record<string, Champion> = {
  ahri: {
    id: "ahri",
    name: "Ahri",
    title: "Renard à neuf queues",
    initial: "A",
    adaptive: "AP",
    base: {
      ad: 53, adPerLevel: 3,
      hp: 590, hpPerLevel: 104,
      armor: 21, armorPerLevel: 4.7,
      mr: 30, mrPerLevel: 1.3,
    },
    // max Q > E > W, ultime aux niveaux 6/11/16
    skillOrder: ["Q", "W", "E", "Q", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W", "R", "W", "W"],
    abilities: {
      Q: { name: "Orbe trompeur", type: "magic", maxRank: 5, base: [80, 125, 170, 215, 260], ratios: { ap: 0.9 } },
      W: { name: "Feux follets", type: "magic", maxRank: 5, base: [50, 75, 100, 125, 150], ratios: { ap: 0.3 } },
      E: { name: "Charme", type: "magic", maxRank: 5, base: [80, 110, 140, 170, 200], ratios: { ap: 0.6 } },
      R: { name: "Ruée spirituelle", type: "magic", maxRank: 3, base: [180, 270, 360], ratios: { ap: 1.05 } },
    },
    shelf: ["sorc", "luden", "shadow", "rab", "void", "zhonya"],
    keystone: "electro",
  },

  darius: {
    id: "darius",
    name: "Darius",
    title: "Main de Noxus",
    initial: "D",
    adaptive: "AD",
    hasBleed: true,
    base: {
      ad: 64, adPerLevel: 5,
      hp: 652, hpPerLevel: 100,
      armor: 39, armorPerLevel: 5.2,
      mr: 32, mrPerLevel: 2.05,
    },
    // max Q > W > E, ultime aux niveaux 6/11/16
    skillOrder: ["Q", "E", "W", "Q", "Q", "R", "Q", "W", "Q", "W", "R", "W", "W", "E", "E", "R", "E", "E"],
    abilities: {
      Q: { name: "Décimation", type: "physical", maxRank: 5, base: [50, 80, 110, 140, 170], ratios: { totalAd: 1.0 } },
      W: { name: "Coup estropiant", type: "physical", maxRank: 5, base: [0, 0, 0, 0, 0], ratios: { totalAd: 1.0, bonusAd: 0.6 } },
      E: { name: "Saisie", type: "util", maxRank: 5, base: [0], ratios: {} },
      R: { name: "Guillotine noxienne", type: "true", maxRank: 3, base: [100, 200, 300], ratios: { bonusAd: 0.75 } },
    },
    shelf: ["ion", "stride", "cleaver", "sundered", "trinity", "steraks", "dead"],
    keystone: "conqueror",
  },
};

/** Liste ordonnée, pratique pour le roster. */
export const CHAMPION_LIST = Object.values(CHAMPIONS);

/** Slugs disponibles (pour valider une route /lab/[champion]). */
export const CHAMPION_IDS = Object.keys(CHAMPIONS);
