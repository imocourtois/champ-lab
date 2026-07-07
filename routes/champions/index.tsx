import { define } from "@/utils.ts";
import { CHAMPION_LIST } from "@/data/champions.ts";
import { DATA_META } from "@/data/generated/meta.gen.ts";

export default define.page(function Champions() {
  return (
    <main>
      <div class="divider">
        &gt;<b>ROSTER</b>&lt;
      </div>

      <p class="page-lede">
        Choisis un champion pour ouvrir son labo. Le roster complet est généré depuis{" "}
        <a href="/methode">Meraki + Data Dragon</a> (patch {DATA_META.patch}) — {DATA_META.champions}{" "}
        champions. Les stats plates et ratios sont réels ; les mécaniques de kit vraiment complexes s'affinent
        {" "}
        <a href="/methode">fichier par fichier</a>.
      </p>

      <section class="roster">
        {CHAMPION_LIST.map((c) => (
          <a href={`/lab/${c.id}`} class="rtile">
            <div class="pface">
              <span class="init">{c.initial}</span>
              {c.portrait && (
                <img
                  class="pimg"
                  src={c.portrait}
                  alt={c.name}
                  loading="lazy"
                  width={74}
                  height={74}
                />
              )}
            </div>
            <div class="rt-name">{c.name}</div>
            <div class="rt-sub">{c.adaptive}</div>
            <span class={`rt-badge ${c.adaptive === "AP" ? "ap" : "ad"}`}>PRÊT</span>
          </a>
        ))}
      </section>
    </main>
  );
});
