import type { Item } from "@/data/types.ts";

/**
 * Objets — DONNÉES ILLUSTRATIVES.
 *
 * En production, ce fichier serait généré à partir de Meraki (lolstaticdata)
 * à chaque patch. Les stats plates sont fiables via Data Dragon ; les passifs
 * complexes (Rabadon %AP, Fendoir %pén.) sont modélisés au cas par cas.
 * Ici on garde un sous-ensemble représentatif, à la main.
 */
export const ITEMS: Record<string, Item> = {
  // --- orientés AP ---
  sorc: { id: "sorc", name: "Bottes de Sorcier", short: "SORC", stats: { magicPenFlat: 18 } },
  luden: { id: "luden", name: "Compagnon de Luden", short: "LUDEN", stats: { ap: 100, abilityHaste: 20 } },
  shadow: { id: "shadow", name: "Flamme d'ombre", short: "SHADOW", stats: { ap: 115, magicPenFlat: 15 } },
  rab: { id: "rab", name: "Coiffe de Rabadon", short: "RABADON", stats: { ap: 130, apAmp: 0.30 } },
  void: { id: "void", name: "Bâton du Vide", short: "VOID", stats: { ap: 65, magicPenPercent: 0.40 } },
  zhonya: { id: "zhonya", name: "Sablier de Zhonya", short: "ZHONYA", stats: { ap: 105, armor: 45 } },

  // --- orientés AD / bruiser ---
  ion: { id: "ion", name: "Bottes ioniennes", short: "IONIE", stats: { abilityHaste: 20 } },
  trinity: { id: "trinity", name: "Force du Trinité", short: "TRINITÉ", stats: { ad: 36, hp: 300, abilityHaste: 20 } },
  cleaver: { id: "cleaver", name: "Fendoir noir", short: "CLEAVER", stats: { ad: 45, hp: 350, armorPenPercent: 0.30, abilityHaste: 25 } },
  stride: { id: "stride", name: "Brise-foulée", short: "STRIDE", stats: { ad: 50, hp: 350 } },
  sundered: { id: "sundered", name: "Ciel brisé", short: "SUNDER", stats: { ad: 55, hp: 450 } },
  steraks: { id: "steraks", name: "Calibre de Sterak", short: "STERAK", stats: { hp: 400 } },
  dead: { id: "dead", name: "Plastron du défunt", short: "DEADM.", stats: { armor: 45, hp: 300 } },
};

/** Résumé lisible des stats d'un objet, pour l'affichage. */
export function itemStatLine(id: string): string {
  const s = ITEMS[id].stats;
  const parts: string[] = [];
  if (s.ad) parts.push(`${s.ad} AD`);
  if (s.ap) parts.push(`${s.ap} AP`);
  if (s.apAmp) parts.push(`+${Math.round(s.apAmp * 100)}% AP`);
  if (s.magicPenFlat) parts.push(`${s.magicPenFlat} pén.M`);
  if (s.magicPenPercent) parts.push(`${Math.round(s.magicPenPercent * 100)}% pén.M`);
  if (s.armorPenPercent) parts.push(`${Math.round(s.armorPenPercent * 100)}% pén.A`);
  if (s.lethality) parts.push(`${s.lethality} létal.`);
  if (s.hp) parts.push(`${s.hp} PV`);
  if (s.armor) parts.push(`${s.armor} arm`);
  if (s.abilityHaste) parts.push(`${s.abilityHaste} AH`);
  return parts.join(" · ");
}
