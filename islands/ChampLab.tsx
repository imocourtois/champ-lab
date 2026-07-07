/** @jsxImportSource preact */
import { useState } from "preact/hooks";
import type { AbilityKey, Champion, DamageType, IncludeMap } from "@/data/types.ts";
import { ITEMS, itemStatLine } from "@/data/items.ts";
import { RUNES } from "@/data/runes.ts";
import {
  abilityRaw,
  type ComboInput,
  computeCombo,
  damageByType,
  damageMultiplier,
  itemImpact,
  rankOf,
} from "@/lib/engine.ts";

const AB_KEYS: AbilityKey[] = ["Q", "W", "E", "R"];
const MAX_ITEMS = 6;

const PRESETS: Record<string, { armor: number; mr: number; hpMax: number }> = {
  squishy: { armor: 55, mr: 40, hpMax: 1900 },
  bruiser: { armor: 120, mr: 70, hpMax: 2900 },
  tank: { armor: 220, mr: 130, hpMax: 3900 },
};

const fr = (n: number) => Math.round(n).toLocaleString("fr-FR");
const tyLabel = (
  t: DamageType,
) => ({ magic: "MAGIQUE", physical: "PHYSIQUE", true: "VRAI", util: "UTIL" }[t]);
/** token de classe CSS : "physical" -> "phys" (les autres inchangés) */
const tyTok = (t: string) => (t === "physical" ? "phys" : t);

function Pips({ rank, max }: { rank: number; max: number }) {
  return (
    <div class="pips">
      {Array.from({ length: max }, (_, i) => <span key={i} class={`pip${i < rank ? " on" : ""}`}></span>)}
    </div>
  );
}

export default function ChampLab({ champion }: { champion: Champion }) {
  const [level, setLevel] = useState(11);
  const [itemIds, setItemIds] = useState<string[]>(champion.shelf.slice(0, 2));
  const [runeOn, setRuneOn] = useState(true);
  const [impact, setImpact] = useState(true);
  const [bleed, setBleed] = useState(5);
  const [target, setTarget] = useState({ armor: 60, mr: 40, hpMax: 2000, hpCur: 2000 });
  const [include, setInclude] = useState<IncludeMap>({
    Q: true,
    W: true,
    E: true,
    R: true,
    bleed: true,
    rune: true,
  });

  const base: ComboInput = {
    champion,
    level,
    itemIds,
    items: ITEMS,
    runes: RUNES,
    runeOn,
    target,
    bleedStacks: bleed,
    include,
  };
  const result = computeCombo(base);
  const byType = damageByType(result.lines);
  const totalDmg = result.total || 1;
  const keystone = RUNES[champion.keystone];

  // --- mutations d'état ---
  const addItem = (id: string) => {
    if (itemIds.length < MAX_ITEMS && !itemIds.includes(id)) setItemIds([...itemIds, id]);
  };
  const removeItem = (i: number) => setItemIds(itemIds.filter((_, idx) => idx !== i));
  const patchTarget = (p: Partial<typeof target>) =>
    setTarget((t) => {
      const next = { ...t, ...p };
      if (next.hpCur > next.hpMax) next.hpCur = next.hpMax;
      return next;
    });
  const applyPreset = (k: string) => {
    const p = PRESETS[k];
    setTarget({ ...p, hpCur: p.hpMax });
  };
  const toggleInclude = (k: keyof IncludeMap) => setInclude((m) => ({ ...m, [k]: !m[k] }));

  // --- valeurs dérivées pour l'affichage ---
  const abDamage = (key: AbilityKey): number | null => {
    const ab = champion.abilities[key];
    if (ab.type === "util") return null;
    let d = abilityRaw(champion, key, level, result.stats) *
      damageMultiplier(ab.type, result.stats, target);
    if (key === "R" && champion.hasBleed) d *= 1 + 0.15 * bleed;
    return d;
  };
  const runeLine = result.lines.find((l) => l.key === "✦");
  const runeContrib = !runeOn
    ? "OFF"
    : keystone.kind === "electro"
    ? `+${fr(runeLine?.damage ?? 0)}`
    : "+12 AD";

  const curHP = Math.min(target.hpCur, target.hpMax);
  const remain = curHP - result.total;
  const kill = remain <= 0;

  const includedAbilityKeys = AB_KEYS.filter((k) => champion.abilities[k].type !== "util" && include[k]);

  return (
    <div class="lab">
      <div class="grid">
        {/* COL 1 — champion + sorts */}
        <div class="col">
          <div class="panel">
            <div class="phead">
              <span class="tag">CHAMPION</span>
              <span class="st">niv {level}</span>
            </div>
            <div class="pbody">
              <div class="portrait">
                <div class="pface">
                  <span class="init">{champion.initial}</span>
                  {champion.portrait && (
                    <img
                      class="pimg"
                      src={champion.portrait}
                      alt={champion.name}
                      loading="lazy"
                      width={74}
                      height={74}
                    />
                  )}
                </div>
                <div class="pmeta">
                  <div class="name">{champion.name}</div>
                  <div class="sub">{champion.title}</div>
                  <div class="adaptbadge">ADAPTATIF · {champion.adaptive}</div>
                </div>
              </div>
              <div class="field">
                <div class="flabel">
                  <span>NIVEAU</span>
                  <span class="v">{level}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={18}
                  value={level}
                  onInput={(e) => setLevel(+e.currentTarget.value)}
                />
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="phead">
              <span class="tag">SORTS</span>
              <span class="st">dégâts effectifs</span>
            </div>
            <div class="pbody" style="padding-top:8px">
              <div class="abhead">
                <span>SORT</span>
                <span>vs CIBLE ↓</span>
              </div>
              {AB_KEYS.map((key) => {
                const ab = champion.abilities[key];
                const rank = rankOf(champion, key, level);
                if (ab.type === "util") {
                  return (
                    <div class="ab util">
                      <div class="abkey">{key}</div>
                      <div class="abmid">
                        <div class="an">{ab.name}</div>
                        <Pips rank={rank} max={ab.maxRank} />
                      </div>
                      <div class="abr">
                        <div class="ty" style="color:var(--dim)">UTILITAIRE</div>
                      </div>
                    </div>
                  );
                }
                const dmg = abDamage(key);
                const on = include[key];
                return (
                  <div class="ab">
                    <div class="abkey">{key}</div>
                    <div class="abmid">
                      <div class="an">{ab.name}</div>
                      <Pips rank={rank} max={ab.maxRank} />
                    </div>
                    <div class="abr" style="display:flex;align-items:center;gap:6px;justify-content:flex-end">
                      <div>
                        <div class={`dmg c-${tyTok(ab.type)}`}>{on ? fr(dmg ?? 0) : "—"}</div>
                        <div class={`ty c-${tyTok(ab.type)}`}>
                          <span class={`dot b-${tyTok(ab.type)}`}></span>
                          {tyLabel(ab.type)}
                        </div>
                      </div>
                      <button
                        type="button"
                        class="abinc"
                        aria-label={`inclure ${key} dans le combo`}
                        aria-pressed={on}
                        onClick={() => toggleInclude(key)}
                      >
                        <span class={`chk${on ? " on" : ""}`}></span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COL 2 — build + rune */}
        <div class="panel">
          <div class="phead">
            <span class="tag">BUILD</span>
            <button
              type="button"
              class="impacttoggle"
              aria-pressed={impact}
              onClick={() => setImpact(!impact)}
            >
              <span>MODE IMPACT</span>
              <span class={`chk${impact ? " on" : ""}`}></span>
            </button>
          </div>
          <div class="pbody">
            <div class="slots">
              {Array.from({ length: MAX_ITEMS }, (_, i) => {
                const id = itemIds[i];
                if (id) {
                  return (
                    <button
                      type="button"
                      key={i}
                      class="slot full"
                      title={ITEMS[id].name}
                      onClick={() => removeItem(i)}
                    >
                      <span class="rm">✕</span>
                      <span class="code">{ITEMS[id].short}</span>
                      <span class="glyph">{itemStatLine(id).split(" · ")[0]}</span>
                    </button>
                  );
                }
                return (
                  <div key={i} class="slot">
                    <span class="plus">+</span>
                  </div>
                );
              })}
            </div>

            <div class="shelfhead">
              OBJETS — {impact
                ? <span style="color:var(--green)">Δ = gain sur ton combo actuel</span>
                : <span style="color:var(--dim)">active le MODE IMPACT pour voir les Δ</span>}
            </div>

            <div class="shelf">
              {champion.shelf.map((id) => {
                const equipped = itemIds.includes(id);
                let delta = null;
                if (impact && !equipped) {
                  const diff = itemImpact(base, id);
                  const cls = diff > 0.5 ? "pos" : diff < -0.5 ? "neg" : "zero";
                  delta = <span class={`delta ${cls}`}>{diff > 0 ? "+" : ""}{fr(diff)}</span>;
                } else if (equipped) {
                  delta = <span class="delta zero">équipé</span>;
                }
                return (
                  <button
                    type="button"
                    key={id}
                    class={`chip${equipped ? " equipped" : ""}`}
                    disabled={equipped}
                    onClick={() => addItem(id)}
                  >
                    <span class="code">{ITEMS[id].short}</span>
                    <span class="nm">{ITEMS[id].name}</span>
                    <span class="stats">{itemStatLine(id)}</span>
                    {delta}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              class={`rune${runeOn ? "" : " off"}${champion.adaptive === "AD" ? " ad" : ""}`}
              aria-pressed={runeOn}
              onClick={() => {
                setRuneOn(!runeOn);
                setInclude((m) => ({ ...m, rune: !runeOn }));
              }}
            >
              <div class="l">
                <div class="rr"></div>
                <div>
                  <div class="rn">{keystone.name}</div>
                  <div class="rc">{keystone.description}</div>
                </div>
              </div>
              <div class="contrib">{runeContrib}</div>
            </button>
          </div>
        </div>

        {/* COL 3 — cible */}
        <div class="panel">
          <div class="phead">
            <span class="tag enemytag">CIBLE</span>
            <span class="st">profil défensif</span>
          </div>
          <div class="pbody">
            <div class="presets">
              {Object.keys(PRESETS).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => applyPreset(k)}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
            <div class="field">
              <div class="flabel">
                <span>ARMURE</span>
                <span class="v">{target.armor}</span>
              </div>
              <input
                type="range"
                class="en"
                min={0}
                max={350}
                value={target.armor}
                onInput={(e) => patchTarget({ armor: +e.currentTarget.value })}
              />
            </div>
            <div class="field">
              <div class="flabel">
                <span>RÉSIST. MAGIE</span>
                <span class="v">{target.mr}</span>
              </div>
              <input
                type="range"
                class="en"
                min={0}
                max={250}
                value={target.mr}
                onInput={(e) => patchTarget({ mr: +e.currentTarget.value })}
              />
            </div>
            <div class="field">
              <div class="flabel">
                <span>PV MAX</span>
                <span class="v">{fr(target.hpMax)}</span>
              </div>
              <input
                type="range"
                class="en"
                min={600}
                max={4500}
                step={50}
                value={target.hpMax}
                onInput={(e) => patchTarget({ hpMax: +e.currentTarget.value })}
              />
            </div>
            <div class="field">
              <div class="flabel">
                <span>PV ACTUELS</span>
                <span class="v">{fr(curHP)}</span>
              </div>
              <input
                type="range"
                class="en"
                min={0}
                max={target.hpMax}
                step={25}
                value={curHP}
                onInput={(e) => patchTarget({ hpCur: +e.currentTarget.value })}
              />
            </div>
            {champion.hasBleed && (
              <div class="field">
                <div class="flabel">
                  <span>STACKS HÉMORRAGIE</span>
                  <span class="v">{bleed}</span>
                </div>
                <input
                  type="range"
                  class="en"
                  min={0}
                  max={5}
                  value={bleed}
                  onInput={(e) => setBleed(+e.currentTarget.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* READOUT */}
      <div class="readout">
        <span class="ck tl"></span>
        <span class="ck tr"></span>
        <span class="ck bl"></span>
        <span class="ck br"></span>
        <div class="rgrid">
          <div class="combobox">
            <div class="cl">COMBO — DÉGÂTS EFFECTIFS</div>
            <div class="cv">{fr(result.total)}</div>
            <div class="cs">
              {includedAbilityKeys.join(" + ")}
              {champion.hasBleed && include.bleed ? " + saignement" : ""}
              {runeOn && keystone.kind === "electro" && include.rune ? " + rune" : ""} inclus
            </div>
          </div>
          <div class="rright">
            <div>
              <div class="tybar">
                {(["physical", "magic", "true"] as const).map((t) =>
                  byType[t] > 0
                    ? <i key={t} class={`b-${tyTok(t)}`} style={`width:${(byType[t] / totalDmg) * 100}%`}></i>
                    : null
                )}
              </div>
              <div class="tylegend" style="margin-top:8px">
                {(["physical", "magic", "true"] as const).filter((t) => byType[t] > 0).map((t) => (
                  <span key={t}>
                    <span class={`dot b-${tyTok(t)}`}></span>
                    {tyLabel(t)} {fr(byType[t])}
                  </span>
                ))}
              </div>
            </div>
            <div class="bp">
              <div class="bpline">
                <span class="lead">COMBO TUE SI</span> PV cible ≤ <b>{fr(result.total)}</b>
              </div>
              {champion.hasBleed && result.execHP > 0 && (
                <div class="bpline exec">
                  <span class="lead">EXÉCUTION (R)</span> <span class="c-true">vrai</span> si PV ≤{" "}
                  <b>{fr(result.execHP)}</b>
                </div>
              )}
            </div>
            <div class="hpwrap">
              <div class="hplabel">
                <span>PV actuels {fr(curHP)} / {fr(target.hpMax)}</span>
                <span>
                  {kill
                    ? `combo ${fr(result.total)} → excès ${fr(-remain)}`
                    : `combo ${fr(result.total)} → reste ${fr(remain)}`}
                </span>
              </div>
              <div class={`hpbar${kill ? " kill" : ""}`}>
                <div class="hpfill" style={`width:${(curHP / target.hpMax) * 100}%`}></div>
                <div
                  class="hpdmg"
                  style={`right:${100 - (curHP / target.hpMax) * 100}%;width:${
                    (Math.min(result.total, curHP) / target.hpMax) * 100
                  }%`}
                >
                </div>
                <div class="hpstate">{kill ? "CIBLE ÉLIMINÉE" : ""}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
