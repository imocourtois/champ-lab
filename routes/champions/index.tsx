import { define } from "@/utils.ts";
import { CHAMPION_LIST } from "@/data/champions.ts";

// Quelques emplacements "à venir" pour matérialiser la portée du roster complet.
const COMING = ["Yasuo", "Lux", "Zed", "Jinx", "Lee Sin", "Katarina", "Ekko", "Vi"];

export default define.page(function Champions() {
  return (
    <main>
      <div class="divider">
        &gt;<b>ROSTER</b>&lt;
      </div>

      <p class="page-lede">
        Choisis un champion pour ouvrir son labo. Deux champions sont câblés en démo (données illustratives).
        Le reste s'ajoute <a href="/methode">fichier par fichier</a>, par la communauté.
      </p>

      <section class="roster">
        {CHAMPION_LIST.map((c) => (
          <a href={`/lab/${c.id}`} class="rtile">
            <div class="pface">
              <span class="init">{c.initial}</span>
            </div>
            <div class="rt-name">{c.name}</div>
            <div class="rt-sub">{c.adaptive}</div>
            <span class={`rt-badge ${c.adaptive === "AP" ? "ap" : "ad"}`}>PRÊT</span>
          </a>
        ))}

        {COMING.map((name) => (
          <div class="rtile locked" aria-disabled="true">
            <div class="pface muted">
              <span class="init">{name[0]}</span>
            </div>
            <div class="rt-name">{name}</div>
            <div class="rt-sub">à venir</div>
            <span class="rt-badge soon">◍</span>
          </div>
        ))}
      </section>
    </main>
  );
});
